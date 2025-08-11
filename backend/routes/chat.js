const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Message = require('../models/Message');
const { body, validationResult } = require('express-validator');

// @desc    Get all verified users for chat directory
// @route   GET /api/chat/users
// @access  Private (verified users only)
router.get('/users', protect, async (req, res) => {
  try {
    // Only show verified users
    const users = await User.find({
      isEmailVerified: true,
      isActive: true,
      _id: { $ne: req.user._id } // Exclude current user
    })
    .select('name email avatar bio department studentId onlineStatus lastSeenInChat joinDate')
    .sort({ name: 1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @desc    Get global chat messages
// @route   GET /api/chat/global
// @access  Private (verified users only)
router.get('/global', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      chatType: 'global',
      isDeleted: false
    })
    .populate('sender', 'name avatar onlineStatus')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

    // Reverse to show oldest first
    messages.reverse();

    res.json({
      success: true,
      messages,
      pagination: {
        current: page,
        limit,
        hasMore: messages.length === limit
      }
    });
  } catch (error) {
    console.error('❌ Error fetching global messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// @desc    Get direct messages between two users
// @route   GET /api/chat/direct/:userId
// @access  Private (verified users only)
router.get('/direct/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      chatType: 'direct',
      isDeleted: false,
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    })
    .populate('sender', 'name avatar onlineStatus')
    .populate('recipient', 'name avatar onlineStatus')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

    // Reverse to show oldest first
    messages.reverse();

    res.json({
      success: true,
      messages,
      pagination: {
        current: page,
        limit,
        hasMore: messages.length === limit
      }
    });
  } catch (error) {
    console.error('❌ Error fetching direct messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// @desc    Send a message (global or direct)
// @route   POST /api/chat/send
// @access  Private (verified users only)
router.post('/send', [
  protect,
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content is required and must be under 1000 characters'),
  body('chatType').isIn(['global', 'direct']).withMessage('Chat type must be global or direct'),
  body('recipient').optional().isMongoId().withMessage('Recipient must be a valid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, chatType, recipient } = req.body;

    // Validate direct message requirements
    if (chatType === 'direct' && !recipient) {
      return res.status(400).json({
        success: false,
        message: 'Recipient is required for direct messages'
      });
    }

    // Check if recipient exists (for direct messages)
    if (chatType === 'direct') {
      const recipientUser = await User.findById(recipient);
      if (!recipientUser || !recipientUser.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Recipient not found or not verified'
        });
      }
    }

    // Create message
    const messageData = {
      sender: req.user._id,
      content: content.trim(),
      chatType,
      messageType: 'text'
    };

    if (chatType === 'direct') {
      messageData.recipient = recipient;
    } else {
      messageData.room = 'general'; // Default global room
    }

    const message = await Message.create(messageData);
    
    // Populate sender info for response
    await message.populate('sender', 'name avatar onlineStatus');
    if (chatType === 'direct') {
      await message.populate('recipient', 'name avatar onlineStatus');
    }

    res.status(201).json({
      success: true,
      message,
      info: chatType === 'global' ? 'Message sent to global chat' : 'Direct message sent'
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// @desc    Update user online status
// @route   PUT /api/chat/status
// @access  Private (verified users only)
router.put('/status', [
  protect,
  body('status').isIn(['online', 'offline', 'away']).withMessage('Status must be online, offline, or away')
], async (req, res) => {
  try {
    const { status } = req.body;
    
    await User.findByIdAndUpdate(req.user._id, {
      onlineStatus: status,
      lastSeenInChat: Date.now()
    });

    res.json({
      success: true,
      message: `Status updated to ${status}`
    });
  } catch (error) {
    console.error('❌ Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status'
    });
  }
});

// @desc    Get user's conversation list
// @route   GET /api/chat/conversations
// @access  Private (verified users only)
router.get('/conversations', protect, async (req, res) => {
  try {
    // Get all users the current user has had conversations with
    const conversations = await Message.aggregate([
      {
        $match: {
          chatType: 'direct',
          isDeleted: false,
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      {
        $addFields: {
          otherUser: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$recipient',
              '$sender'
            ]
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $first: '$content' },
          lastMessageTime: { $first: '$createdAt' },
          lastSender: { $first: '$sender' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          user: {
            _id: '$userInfo._id',
            name: '$userInfo.name',
            avatar: '$userInfo.avatar',
            onlineStatus: '$userInfo.onlineStatus'
          },
          lastMessage: 1,
          lastMessageTime: 1,
          isFromCurrentUser: { $eq: ['$lastSender', req.user._id] }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
});

module.exports = router;
