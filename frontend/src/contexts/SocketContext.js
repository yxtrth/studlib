import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import {
  addMessage,
  updateMessage,
  removeMessage,
  addOnlineUser,
  removeOnlineUser,
  setTypingUser,
  updateConversation,
  fetchUnreadCount
} from '../store/slices/messagesSlice';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      // Remove /api from the URL for Socket.IO connection
      const socketURL = process.env.REACT_APP_API_URL 
        ? process.env.REACT_APP_API_URL.replace('/api', '')
        : 'http://localhost:5000';
      
      console.log('Connecting to socket at:', socketURL);
      const newSocket = io(socketURL, {
        auth: {
          userId: user.id
        }
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        
        // Join user room
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Message events
      newSocket.on('newMessage', (data) => {
        const { message } = data;
        dispatch(addMessage(message));
        
        // Update conversation list
        dispatch(updateConversation({
          conversation: {
            user: message.senderId,
            lastMessage: message,
            unreadCount: 1
          }
        }));
        
        // Update unread count
        dispatch(fetchUnreadCount());
      });

      newSocket.on('messageEdited', (data) => {
        const { message } = data;
        dispatch(updateMessage(message));
      });

      newSocket.on('messageDeleted', (data) => {
        const { messageId } = data;
        dispatch(removeMessage(messageId));
      });

      // User presence events
      newSocket.on('userOnline', (userId) => {
        dispatch(addOnlineUser(userId));
      });

      newSocket.on('userOffline', (userId) => {
        dispatch(removeOnlineUser(userId));
      });

      // Typing events
      newSocket.on('userTyping', (data) => {
        const { userId, isTyping } = data;
        dispatch(setTypingUser({ userId, isTyping }));
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user, dispatch]);

  // Socket helper functions
  const sendMessage = (receiverId, message, senderId) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', {
        receiverId,
        message,
        senderId
      });
    }
  };

  const sendTyping = (receiverId, isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', {
        receiverId,
        isTyping
      });
    }
  };

  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('joinRoom', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leaveRoom', roomId);
    }
  };

  const value = {
    socket,
    isConnected,
    sendMessage,
    sendTyping,
    joinRoom,
    leaveRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
