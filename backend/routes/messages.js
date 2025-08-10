const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// @desc    Get conversations list
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all conversations for the user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ],
          isDeleted: false
        }
      },
      {
        $addFields: {
          otherUserId: {
            $cond: {
              if: { $eq: ['$senderId', userId] },
              then: '$receiverId',
              else: '$senderId'
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$receiverId', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.isActive': true
        }
      },
      {
        $project: {
          user: {
            _id: '$user._id',
            name: '$user.name',
            avatar: '$user.avatar',
            lastSeen: '$user.lastSeen'
          },
          lastMessage: {
            _id: '$lastMessage._id',
            message: '$lastMessage.message',
            messageType: '$lastMessage.messageType',
            isRead: '$lastMessage.isRead',
            createdAt: '$lastMessage.createdAt',
            senderId: '$lastMessage.senderId'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get messages between two users
// @route   GET /api/messages/:userId
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const currentUserId = req.user._id;

    // Verify the other user exists
    const otherUser = await User.findById(userId).select('name avatar');
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate conversation ID
    const conversationId = Message.generateConversationId(currentUserId, userId);

    // Get messages
    const messages = await Message.find({
      conversationId,
      isDeleted: false
    })
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        receiverId: currentUserId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    const total = await Message.countDocuments({
      conversationId,
      isDeleted: false
    });

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      otherUser
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Send message
// @route   POST /api/messages
// @access  Private
router.post('/', [
  protect,
  uploadSingle,
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver ID is required'),
  body('message')
    .if((value, { req }) => !req.file)
    .notEmpty()
    .withMessage('Message content is required when no file is attached')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.isActive) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Cannot send message to self
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    // Generate conversation ID
    const conversationId = Message.generateConversationId(senderId, receiverId);

    // Prepare message data
    const messageData = {
      senderId,
      receiverId,
      message: message || '',
      conversationId,
      messageType: 'text'
    };

    // Handle file attachment
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file, 'student-library/messages');
        messageData.attachment = {
          public_id: uploadResult.public_id,
          url: uploadResult.url,
          filename: req.file.originalname,
          fileSize: req.file.size
        };

        // Determine message type based on file
        if (req.file.mimetype.startsWith('image/')) {
          messageData.messageType = 'image';
          messageData.message = messageData.message || 'Image';
        } else {
          messageData.messageType = 'file';
          messageData.message = messageData.message || req.file.originalname;
        }
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload file' });
      }
    }

    // Create message
    const newMessage = await Message.create(messageData);
    await newMessage.populate('senderId', 'name avatar');
    await newMessage.populate('receiverId', 'name avatar');

    // Emit real-time message via Socket.IO
    const io = req.app.get('io');
    io.emit('newMessage', {
      receiverId,
      message: newMessage
    });

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Edit message
// @route   PUT /api/messages/:messageId
// @access  Private
router.put('/:messageId', [
  protect,
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { messageId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const messageDoc = await Message.findById(messageId);

    if (!messageDoc) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (messageDoc.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    // Check if message is not deleted
    if (messageDoc.isDeleted) {
      return res.status(400).json({ message: 'Cannot edit deleted message' });
    }

    // Edit message
    await messageDoc.editMessage(message);
    await messageDoc.populate('senderId', 'name avatar');
    await messageDoc.populate('receiverId', 'name avatar');

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    io.emit('messageEdited', {
      messageId,
      message: messageDoc
    });

    res.json({
      success: true,
      message: messageDoc
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete message
// @route   DELETE /api/messages/:messageId
// @access  Private
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const messageDoc = await Message.findById(messageId);

    if (!messageDoc) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (messageDoc.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    // Soft delete message
    await messageDoc.deleteMessage();

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    io.emit('messageDeleted', {
      messageId
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
// @access  Private
router.put('/read/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Generate conversation ID
    const conversationId = Message.generateConversationId(currentUserId, userId);

    // Mark all unread messages as read
    const result = await Message.updateMany(
      {
        conversationId,
        receiverId: currentUserId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} messages marked as read`
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
router.get('/unread/count', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false,
      isDeleted: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Room-based messaging endpoints for chat feature

// @desc    Get messages for a specific room
// @route   GET /api/messages/room/:roomId
// @access  Private
router.get('/room/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    console.log(`Getting messages for room: ${roomId}, page: ${page}`);

    // Create a simple room message structure using the Message model
    // We'll use a special format where receiverId is the room name
    const messages = await Message.find({
      receiverId: roomId, // Use receiverId as room identifier
      conversationId: `room_${roomId}`, // Special conversation ID for rooms
      isDeleted: false
    })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({
      receiverId: roomId,
      conversationId: `room_${roomId}`,
      isDeleted: false
    });

    console.log(`Found ${messages.length} messages for room ${roomId}`);

    res.json({
      success: true,
      messages: messages.reverse(), // Show oldest first
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      room: roomId
    });
  } catch (error) {
    console.error('Get room messages error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Send message to a room
// @route   POST /api/messages/room
// @access  Private
router.post('/room', [
  protect,
  body('room')
    .notEmpty()
    .withMessage('Room ID is required'),
  body('message')
    .notEmpty()
    .withMessage('Message content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { room, message } = req.body;
    const senderId = req.user._id;

    // Create room message
    const messageData = {
      senderId,
      receiverId: room, // Use room name as receiverId
      message,
      conversationId: `room_${room}`,
      messageType: 'text',
      isRead: true // Room messages are always "read"
    };

    const newMessage = await Message.create(messageData);
    await newMessage.populate('senderId', 'name avatar');

    // Emit real-time message via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('room-message', {
        room,
        message: newMessage
      });
    }

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Send room message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
