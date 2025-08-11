import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  UserIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import UserDirectory from './UserDirectory';

const EnhancedChat = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('global');
  const [globalMessages, setGlobalMessages] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [globalMessages, directMessages]);

  // Load initial data
  useEffect(() => {
    if (user && user.isEmailVerified) {
      loadGlobalMessages();
      loadConversations();
      loadUsers();
    }
  }, [user]);

  const loadGlobalMessages = async () => {
    try {
      const response = await axios.get('/api/chat/global');
      if (response.data.success) {
        setGlobalMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error loading global messages:', error);
    }
  };

  const loadDirectMessages = async (userId) => {
    try {
      const response = await axios.get(`/api/chat/direct/${userId}`);
      if (response.data.success) {
        setDirectMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error loading direct messages:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await axios.get('/api/chat/conversations');
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get('/api/chat/users');
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const messageData = {
        content: message.trim(),
        chatType: activeTab === 'global' ? 'global' : 'direct'
      };

      if (activeTab === 'direct' && activeConversation) {
        messageData.recipient = activeConversation._id;
      }

      const response = await axios.post('/api/chat/send', messageData);
      
      if (response.data.success) {
        const newMessage = response.data.message;
        
        if (activeTab === 'global') {
          setGlobalMessages(prev => [...prev, newMessage]);
        } else {
          setDirectMessages(prev => [...prev, newMessage]);
          loadConversations(); // Refresh conversations
        }
        
        setMessage('');
        toast.success(response.data.info);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = (selectedUser) => {
    setActiveConversation(selectedUser);
    setActiveTab('direct');
    setShowUserDirectory(false);
    loadDirectMessages(selectedUser._id);
  };

  const selectConversation = (conversation) => {
    setActiveConversation(conversation.user);
    setActiveTab('direct');
    loadDirectMessages(conversation.user._id);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString();
  };

  if (!user?.isEmailVerified) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Email Verification Required
        </h3>
        <p className="text-gray-600">
          Please verify your email to access the chat features.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Student Library Chat
          </h2>
          <button
            onClick={() => setShowUserDirectory(true)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Find Users"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-3">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'global'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <UserGroupIcon className="h-4 w-4 inline mr-2" />
            Global Chat
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'direct'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-2" />
            Direct Messages
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex">
        {/* Sidebar for Direct Messages */}
        {activeTab === 'direct' && (
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Conversations</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <button
                    onClick={() => setShowUserDirectory(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                  >
                    Start a conversation
                  </button>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.user._id}
                    onClick={() => selectConversation(conversation)}
                    className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                      activeConversation?._id === conversation.user._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={conversation.user.avatar?.url || '/api/placeholder/40/40'}
                          alt={conversation.user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          conversation.user.onlineStatus === 'online' ? 'bg-green-400' :
                          conversation.user.onlineStatus === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.isFromCurrentUser ? 'You: ' : ''}
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'global' ? (
              globalMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <UserGroupIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Welcome to the global chat!</p>
                  <p className="text-sm">Start a conversation with everyone.</p>
                </div>
              ) : (
                globalMessages.map((msg, index) => (
                  <div key={msg._id} className="flex space-x-3">
                    <img
                      src={msg.sender?.avatar?.url || '/api/placeholder/32/32'}
                      alt={msg.sender?.name || 'User'}
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {msg.sender?.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${
                        msg.messageType === 'system' 
                          ? 'text-blue-600 italic' 
                          : 'text-gray-700'
                      }`}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))
              )
            ) : (
              activeConversation ? (
                directMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation with {activeConversation.name}</p>
                  </div>
                ) : (
                  directMessages.map((msg) => (
                    <div key={msg._id} className={`flex ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender._id === user.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender._id === user.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {(activeTab === 'global' || activeConversation) && (
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    activeTab === 'global' 
                      ? 'Type a message to everyone...' 
                      : `Message ${activeConversation?.name}...`
                  }
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          onStartConversation={startConversation}
          onClose={() => setShowUserDirectory(false)}
        />
      )}
    </div>
  );
};

export default EnhancedChat;
