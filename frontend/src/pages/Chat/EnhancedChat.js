import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSocket } from '../../contexts/SocketContext';
import { fetchMessages, sendMessage, clearMessages } from '../../store/slices/messagesSlice';
import UserDirectory from '../../components/Chat/UserDirectory';
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  HashtagIcon,
  UserIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const EnhancedChat = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { user } = useSelector((state) => state.auth);
  const { messages, isLoading } = useSelector((state) => state.messages);
  
  const [messageText, setMessageText] = useState('');
  const [chatMode, setChatMode] = useState('group'); // 'group' or 'direct'
  const [selectedRoom, setSelectedRoom] = useState('general');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [chatStats, setChatStats] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const chatRooms = [
    { 
      id: 'general', 
      name: 'General Discussion', 
      description: 'Open discussion for all topics',
      icon: '💬',
      members: 0
    },
    { 
      id: 'study-groups', 
      name: 'Study Groups', 
      description: 'Form and join study groups',
      icon: '📚',
      members: 0
    },
    { 
      id: 'homework-help', 
      name: 'Homework Help', 
      description: 'Get help with assignments',
      icon: '❓',
      members: 0
    },
    { 
      id: 'book-reviews', 
      name: 'Book Reviews', 
      description: 'Discuss and review books',
      icon: '📖',
      members: 0
    },
    { 
      id: 'tech-talk', 
      name: 'Tech Talk', 
      description: 'Technology discussions',
      icon: '💻',
      members: 0
    },
    { 
      id: 'random', 
      name: 'Random Chat', 
      description: 'Casual conversations',
      icon: '🎲',
      members: 0
    },
  ];

  // Initialize user in global chat on component mount
  useEffect(() => {
    if (user && user.isEmailVerified) {
      initializeUserInGlobalChat();
      fetchChatStats();
    }
  }, [user]);

  // Socket setup
  useEffect(() => {
    if (socket && socket.connected && user) {
      console.log('Setting up enhanced socket listeners');
      
      if (chatMode === 'group' && selectedRoom) {
        // Join the selected room
        socket.emit('join-room', { room: selectedRoom, user: user._id });
      } else if (chatMode === 'direct' && selectedConversation) {
        // Join direct conversation
        socket.emit('join-conversation', { 
          conversationId: selectedConversation.conversationId, 
          user: user._id 
        });
      }

      // Listen for new messages
      socket.on('new-message', (message) => {
        if (chatMode === 'group' && message.room === selectedRoom) {
          dispatch(fetchMessages({ room: selectedRoom }));
        } else if (chatMode === 'direct' && message.conversationId === selectedConversation?.conversationId) {
          dispatch(fetchMessages({ conversationId: selectedConversation.conversationId }));
        }
      });

      // Listen for online users in rooms
      socket.on('room-users', (users) => {
        setOnlineUsers(users.filter(u => u._id !== user._id));
      });

      // Listen for typing events
      socket.on('user-typing', ({ userId, isTyping: typing, room, conversationId }) => {
        if (userId !== user._id) {
          if ((chatMode === 'group' && room === selectedRoom) || 
              (chatMode === 'direct' && conversationId === selectedConversation?.conversationId)) {
            setTypingUsers(prev => 
              typing 
                ? [...prev.filter(id => id !== userId), userId]
                : prev.filter(id => id !== userId)
            );
          }
        }
      });

      // Listen for user status updates
      socket.on('user-status-update', ({ userId, isOnline, lastSeen }) => {
        // Update conversations list
        setConversations(prev => prev.map(conv => 
          conv.user._id === userId 
            ? { ...conv, user: { ...conv.user, isOnline, lastSeen } }
            : conv
        ));
      });

      return () => {
        socket.off('new-message');
        socket.off('room-users');
        socket.off('user-typing');
        socket.off('user-status-update');
      };
    }
  }, [socket, user, chatMode, selectedRoom, selectedConversation, dispatch]);

  // Fetch messages when chat mode or selection changes
  useEffect(() => {
    if (chatMode === 'group' && selectedRoom) {
      dispatch(fetchMessages({ room: selectedRoom }));
    } else if (chatMode === 'direct' && selectedConversation) {
      dispatch(fetchMessages({ conversationId: selectedConversation.conversationId }));
    }
  }, [dispatch, chatMode, selectedRoom, selectedConversation]);

  // Fetch conversations for direct chat mode
  useEffect(() => {
    if (chatMode === 'direct') {
      fetchConversations();
    }
  }, [chatMode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeUserInGlobalChat = async () => {
    try {
      const response = await fetch('/api/messages/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        console.log('User initialized in global chat');
      }
    } catch (error) {
      console.error('Initialize user error:', error);
    }
  };

  const fetchChatStats = async () => {
    try {
      const response = await fetch('/api/messages/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setChatStats(data.stats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Fetch conversations error:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;

    try {
      let messageData;
      
      if (chatMode === 'group') {
        messageData = {
          room: selectedRoom,
          message: messageText.trim(),
        };
      } else {
        messageData = {
          conversationId: selectedConversation.conversationId,
          receiverId: selectedConversation.user._id,
          message: messageText.trim(),
        };
      }

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
      const typingData = {
        isTyping: true,
        ...(chatMode === 'group' 
          ? { room: selectedRoom } 
          : { conversationId: selectedConversation?.conversationId }
        )
      };
      socket.emit('typing', typingData);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && isTyping) {
        setIsTyping(false);
        const typingData = {
          isTyping: false,
          ...(chatMode === 'group' 
            ? { room: selectedRoom } 
            : { conversationId: selectedConversation?.conversationId }
          )
        };
        socket.emit('typing', typingData);
      }
    }, 1000);
  };

  const handleRoomChange = (roomId) => {
    setSelectedRoom(roomId);
    dispatch(clearMessages());
  };

  const handleConversationChange = (conversation) => {
    setSelectedConversation(conversation);
    dispatch(clearMessages());
  };

  const handleStartConversation = (conversationId, targetUser) => {
    const newConversation = {
      conversationId,
      user: targetUser,
      lastMessage: null,
      unreadCount: 0
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
    setChatMode('direct');
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

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Please login to access chat</strong>
        </div>
      </div>
    );
  }

  if (!user.isEmailVerified) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <strong>Please verify your email to access chat features</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen max-h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Chat Mode Toggle */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setChatMode('group')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chatMode === 'group'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <HashtagIcon className="h-4 w-4" />
                <span>Rooms</span>
              </button>
              <button
                onClick={() => setChatMode('direct')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chatMode === 'direct'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>Direct</span>
              </button>
            </div>
          </div>

          {/* Group Chat Rooms */}
          {chatMode === 'group' && (
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Chat Rooms</h3>
                  <span className="text-xs text-gray-500">{chatRooms.length} rooms</span>
                </div>
                <div className="space-y-2">
                  {chatRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleRoomChange(room.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedRoom === room.id
                          ? 'bg-blue-100 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{room.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {room.name}
                            </p>
                            {selectedRoom === room.id && (
                              <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {room.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Online Users in Current Room */}
              {onlineUsers.length > 0 && (
                <div className="border-t border-gray-200 p-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Online ({onlineUsers.length})
                  </h4>
                  <div className="space-y-2">
                    {onlineUsers.slice(0, 5).map((onlineUser) => (
                      <div key={onlineUser._id} className="flex items-center space-x-2">
                        <div className="relative">
                          <img
                            src={onlineUser.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(onlineUser.name)}&background=6366f1&color=fff&size=64&bold=true`}
                            alt={onlineUser.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
                        </div>
                        <span className="text-xs text-gray-700 truncate">
                          {onlineUser.name}
                        </span>
                      </div>
                    ))}
                    {onlineUsers.length > 5 && (
                      <p className="text-xs text-gray-500">
                        +{onlineUsers.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Direct Messages */}
          {chatMode === 'direct' && (
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Direct Messages</h3>
                  <button
                    onClick={() => setShowUserDirectory(true)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Find users to chat with"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">No conversations yet</p>
                    <button
                      onClick={() => setShowUserDirectory(true)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Find people to chat with
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.conversationId || conversation.user._id}
                        onClick={() => handleConversationChange(conversation)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedConversation?.conversationId === conversation.conversationId
                            ? 'bg-blue-100 border border-blue-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={conversation.user.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.user.name)}&background=6366f1&color=fff&size=64&bold=true`}
                              alt={conversation.user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            {conversation.user.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conversation.user.name}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            
                            {conversation.lastMessage && (
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.lastMessage.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          {chatStats && (
            <div className="border-t border-gray-200 p-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Your Stats
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-gray-900">{chatStats.messagesSent}</div>
                  <div className="text-gray-500">Messages</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{chatStats.directConversations}</div>
                  <div className="text-gray-500">Chats</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {chatMode === 'group' ? (
                  <>
                    <span className="text-xl">
                      {chatRooms.find(room => room.id === selectedRoom)?.icon}
                    </span>
                    <div>
                      <h1 className="text-lg font-semibold text-gray-900">
                        {chatRooms.find(room => room.id === selectedRoom)?.name}
                      </h1>
                      <p className="text-sm text-gray-600">
                        {onlineUsers.length} online
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {selectedConversation ? (
                      <>
                        <div className="relative">
                          <img
                            src={selectedConversation.user.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.user.name)}&background=6366f1&color=fff&size=64&bold=true`}
                            alt={selectedConversation.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {selectedConversation.user.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h1 className="text-lg font-semibold text-gray-900">
                            {selectedConversation.user.name}
                          </h1>
                          <p className="text-sm text-gray-600">
                            {selectedConversation.user.isOnline ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <h1 className="text-lg font-semibold text-gray-900">Direct Messages</h1>
                        <p className="text-sm text-gray-600">Select a conversation to start chatting</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {chatMode === 'direct' && (
                  <button
                    onClick={() => setShowUserDirectory(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Find users to chat with"
                  >
                    <UsersIcon className="h-5 w-5" />
                  </button>
                )}

                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4" style={{ height: 'calc(100vh - 20rem)' }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="large" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {chatMode === 'group' ? '💬' : '👋'}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {chatMode === 'group' 
                      ? `Welcome to ${chatRooms.find(room => room.id === selectedRoom)?.name}!`
                      : selectedConversation 
                        ? `Start chatting with ${selectedConversation.user.name}`
                        : 'Select a conversation to start chatting'
                    }
                  </h3>
                  <p className="text-gray-600">
                    {chatMode === 'group' 
                      ? 'Be the first to send a message in this room.'
                      : selectedConversation
                        ? 'Send a message to break the ice!'
                        : 'Choose someone from your conversations or find new people to chat with.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((message, index) => {
                  const showDate = index === 0 || 
                    formatDate(message.createdAt) !== formatDate(filteredMessages[index - 1].createdAt);
                  const isOwnMessage = message.sender?._id === user._id;
                  const showAvatar = !isOwnMessage && 
                    (index === 0 || filteredMessages[index - 1].sender?._id !== message.sender?._id);

                  return (
                    <div key={message._id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {showAvatar && !isOwnMessage && (
                            <img
                              src={message.sender?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender?.name || 'User')}&background=6366f1&color=fff&size=64&bold=true`}
                              alt={message.sender?.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          
                          <div className={`px-4 py-2 rounded-lg ${
                            isOwnMessage 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {!isOwnMessage && chatMode === 'group' && (
                              <p className="text-xs font-medium mb-1 text-gray-600">
                                {message.sender?.name}
                              </p>
                            )}
                            
                            <p className={`text-sm ${message.messageType === 'system' ? 'italic' : ''}`}>
                              {message.message}
                            </p>
                            
                            <p className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.createdAt)}
                              {message.isEdited && ' (edited)'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span>
                      {typingUsers.length === 1 
                        ? 'Someone is typing...' 
                        : `${typingUsers.length} people are typing...`
                      }
                    </span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          {((chatMode === 'group') || (chatMode === 'direct' && selectedConversation)) && (
            <div className="px-6 py-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={messageText}
                    onChange={handleTyping}
                    placeholder={
                      chatMode === 'group' 
                        ? `Message ${chatRooms.find(room => room.id === selectedRoom)?.name}`
                        : `Message ${selectedConversation?.user.name}`
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={1000}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* User Directory Modal */}
      {showUserDirectory && (
        <UserDirectory
          onStartConversation={handleStartConversation}
          onClose={() => setShowUserDirectory(false)}
        />
      )}
    </div>
  );
};

export default EnhancedChat;
