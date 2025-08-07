import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  users: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
  onlineUsers: new Set(),
  typingUsers: new Set(),
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/messages/conversations');
      return response.data.conversations;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch conversations';
      return rejectWithValue(message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/messages/${userId}`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch messages';
      return rejectWithValue(message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(messageData).forEach(key => {
        if (messageData[key] !== undefined && messageData[key] !== null) {
          formData.append(key, messageData[key]);
        }
      });

      const response = await axios.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.message;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to send message';
      return rejectWithValue(message);
    }
  }
);

export const editMessage = createAsyncThunk(
  'messages/editMessage',
  async ({ messageId, message }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/messages/${messageId}`, { message });
      return response.data.message;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to edit message';
      return rejectWithValue(message);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await axios.delete(`/messages/${messageId}`);
      return messageId;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete message';
      return rejectWithValue(message);
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/messages/read/${userId}`);
      return { userId, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to mark messages as read';
      return rejectWithValue(message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'messages/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/messages/unread/count');
      return response.data.unreadCount;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch unread count';
      return rejectWithValue(message);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'messages/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/users', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch users';
      return rejectWithValue(message);
    }
  }
);

// Create slice
const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action) => {
      const index = state.messages.findIndex(msg => msg._id === action.payload._id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    removeMessage: (state, action) => {
      state.messages = state.messages.filter(msg => msg._id !== action.payload);
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = new Set(action.payload);
    },
    addOnlineUser: (state, action) => {
      state.onlineUsers.add(action.payload);
    },
    removeOnlineUser: (state, action) => {
      state.onlineUsers.delete(action.payload);
    },
    setTypingUser: (state, action) => {
      const { userId, isTyping } = action.payload;
      if (isTyping) {
        state.typingUsers.add(userId);
      } else {
        state.typingUsers.delete(userId);
      }
    },
    clearMessages: (state) => {
      state.messages = [];
      state.currentConversation = null;
    },
    updateConversation: (state, action) => {
      const { conversation } = action.payload;
      const index = state.conversations.findIndex(conv => conv.user._id === conversation.user._id);
      if (index !== -1) {
        state.conversations[index] = conversation;
      } else {
        state.conversations.unshift(conversation);
      }
      // Sort conversations by last message timestamp
      state.conversations.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.messages = action.payload.messages;
        } else {
          state.messages = [...action.payload.messages, ...state.messages];
        }
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Edit message
      .addCase(editMessage.fulfilled, (state, action) => {
        const index = state.messages.findIndex(msg => msg._id === action.payload._id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
      })
      
      // Delete message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const index = state.messages.findIndex(msg => msg._id === action.payload);
        if (index !== -1) {
          state.messages[index] = {
            ...state.messages[index],
            isDeleted: true,
            message: 'This message was deleted'
          };
        }
      })
      
      // Mark as read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.messages.forEach(msg => {
          if (msg.senderId._id === userId && !msg.isRead) {
            msg.isRead = true;
            msg.readAt = new Date().toISOString();
          }
        });
        
        // Update conversation unread count
        const conversation = state.conversations.find(conv => conv.user._id === userId);
        if (conversation) {
          conversation.unreadCount = 0;
        }
      })
      
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      
      // Fetch users
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
      });
  },
});

export const {
  clearError,
  setCurrentConversation,
  addMessage,
  updateMessage,
  removeMessage,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setTypingUser,
  clearMessages,
  updateConversation,
} = messagesSlice.actions;

export default messagesSlice.reducer;
