const mongoose = require('mongoose');

const userConnectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Global chat membership (automatic for all users)
  isGlobalChatMember: {
    type: Boolean,
    default: true
  },
  joinedGlobalChatAt: {
    type: Date,
    default: Date.now
  },
  // Direct message connections
  connections: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    lastMessageAt: {
      type: Date
    },
    isBlocked: {
      type: Boolean,
      default: false
    }
  }],
  // Room memberships
  roomMemberships: [{
    roomId: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    }
  }],
  // Chat preferences
  preferences: {
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    allowDirectMessages: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: false
    },
    soundNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes
userConnectionSchema.index({ userId: 1 });
userConnectionSchema.index({ 'connections.userId': 1 });
userConnectionSchema.index({ 'roomMemberships.roomId': 1 });

// Static method to initialize user in global chat
userConnectionSchema.statics.initializeUser = async function(userId) {
  const existing = await this.findOne({ userId });
  
  if (!existing) {
    const newConnection = new this({
      userId,
      isGlobalChatMember: true,
      roomMemberships: [
        {
          roomId: 'general',
          joinedAt: new Date(),
          lastActiveAt: new Date()
        }
      ]
    });
    
    await newConnection.save();
    return newConnection;
  }
  
  return existing;
};

// Method to add connection between two users
userConnectionSchema.methods.addConnection = function(targetUserId) {
  const existingConnection = this.connections.find(
    conn => conn.userId.toString() === targetUserId.toString()
  );
  
  if (!existingConnection) {
    this.connections.push({
      userId: targetUserId,
      connectedAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to join a room
userConnectionSchema.methods.joinRoom = function(roomId) {
  const existingMembership = this.roomMemberships.find(
    membership => membership.roomId === roomId
  );
  
  if (!existingMembership) {
    this.roomMemberships.push({
      roomId,
      joinedAt: new Date(),
      lastActiveAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to update last activity in a room
userConnectionSchema.methods.updateRoomActivity = function(roomId) {
  const membership = this.roomMemberships.find(
    membership => membership.roomId === roomId
  );
  
  if (membership) {
    membership.lastActiveAt = new Date();
    return this.save();
  }
  
  return Promise.resolve(this);
};

module.exports = mongoose.model('UserConnection', userConnectionSchema);
