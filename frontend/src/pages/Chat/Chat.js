import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSocket } from '../../contexts/SocketContext';
import { fetchMessages, sendMessage, clearMessages } from '../../store/slices/messagesSlice';
import {
  PaperAirplaneIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Chat = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { user } = useSelector((state) => state.auth);
  const { messages, isLoading } = useSelector((state) => state.messages);
  
  const [messageText, setMessageText] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('general');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const chatRooms = [
    { id: 'general', name: 'General Discussion', description: 'Open discussion for all topics' },
    { id: 'study-groups', name: 'Study Groups', description: 'Form and join study groups' },
    { id: 'homework-help', name: 'Homework Help', description: 'Get help with assignments' },
    { id: 'book-reviews', name: 'Book Reviews', description: 'Discuss and review books' },
    { id: 'tech-talk', name: 'Tech Talk', description: 'Technology discussions' },
    { id: 'announcements', name: 'Announcements', description: 'Important announcements' },
  ];

  useEffect(() => {
    if (socket && socket.connected && user) {
      console.log('Setting up socket listeners for room:', selectedRoom);
      
      // Join the selected room
      socket.emit('join-room', { room: selectedRoom, user: user._id });

      // Listen for new messages
      socket.on('new-message', (message) => {
        dispatch(fetchMessages({ room: selectedRoom }));
      });

      // Listen for online users
      socket.on('room-users', (users) => {
        setOnlineUsers(users.filter(u => u._id !== user._id));
      });

      // Listen for typing events
      socket.on('user-typing', ({ userId, isTyping: typing }) => {
        if (userId !== user._id) {
          setTypingUsers(prev => 
            typing 
              ? [...prev.filter(id => id !== userId), userId]
              : prev.filter(id => id !== userId)
          );
        }
      });

      return () => {
        socket.off('new-message');
        socket.off('room-users');
        socket.off('user-typing');
      };
    }
  }, [socket, user, selectedRoom, dispatch]);

  useEffect(() => {
    // Fetch messages for the selected room
    dispatch(fetchMessages({ room: selectedRoom }));
  }, [dispatch, selectedRoom]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;

    try {
      const messageData = {
        room: selectedRoom,
        message: messageText.trim(),
      };

      await dispatch(sendMessage(messageData)).unwrap();
      setMessageText('');
      
      // Emit message via socket
      if (socket) {
        socket.emit('send-message', {
          ...messageData,
          sender: user._id,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);

    if (socket && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { room: selectedRoom, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && isTyping) {
        setIsTyping(false);
        socket.emit('typing', { room: selectedRoom, isTyping: false });
      }
    }, 1000);
  };

  const handleRoomChange = (roomId) => {
    setSelectedRoom(roomId);
    dispatch(clearMessages());
  };

  const filteredMessages = (messages || []).filter(message =>
    message.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Debug: Log current state
  console.log('Chat Component Debug:', {
    user: user ? { id: user.id, name: user.name } : 'No user',
    socket: socket ? 'Connected' : 'Not connected',
    messages: messages?.length || 0,
    isLoading,
    selectedRoom
  });

  // Early return for debugging
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Debug:</strong> No user found. Please make sure you're logged in.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen max-h-[calc(100vh-8rem)]">
        {/* Sidebar - Rooms & Users */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Chat Rooms</h2>
          </div>
          
          {/* Chat Rooms */}
          <div className="overflow-y-auto h-1/2">
            {chatRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomChange(room.id)}
                className={`w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                  selectedRoom === room.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                }`}
              >
                <div className="font-medium text-gray-900">{room.name}</div>
                <div className="text-sm text-gray-500 truncate">{room.description}</div>
              </button>
            ))}
          </div>

          {/* Online Users */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-sm font-medium text-gray-900">
                Online ({onlineUsers.length})
              </h3>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {onlineUsers.map((user) => (
                <div key={user._id} className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <img
                    src={user.avatar || '/api/placeholder/32/32'}
                    alt={user.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-sm text-gray-700 truncate">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {chatRooms.find(room => room.id === selectedRoom)?.name}
              </h2>
              <p className="text-sm text-gray-500">
                {chatRooms.find(room => room.id === selectedRoom)?.description}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Debug Info */}
            <div className="bg-blue-50 p-2 text-xs text-blue-800 rounded">
              Debug: {messages?.length || 0} messages, {filteredMessages.length} filtered, Room: {selectedRoom}, Socket: {socket ? 'Connected' : 'Disconnected'}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner size="medium" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <>
                {filteredMessages.map((message, index) => {
                  const showDate = index === 0 || 
                    formatDate(message.createdAt) !== formatDate(filteredMessages[index - 1].createdAt);
                  
                  const isOwnMessage = message.sender?._id === user?._id;
                  
                  return (
                    <div key={message._id}>
                      {showDate && (
                        <div className="text-center mb-4">
                          <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                          {!isOwnMessage && (
                            <div className="flex items-center mb-1">
                              <img
                                src={message.sender?.avatar || '/api/placeholder/24/24'}
                                alt={message.sender?.name}
                                className="w-6 h-6 rounded-full mr-2"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {message.sender?.name || 'Unknown User'}
                              </span>
                            </div>
                          )}
                          
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                          </div>
                          
                          <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex items-center text-gray-500 text-sm">
                    <div className="flex space-x-1 mr-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    Someone is typing...
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={messageText}
                onChange={handleTyping}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={!user}
              />
              <button
                type="submit"
                disabled={!messageText.trim() || !user}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
