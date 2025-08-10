import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../../contexts/SocketContext';

const ChatDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const socket = useSocket();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { messages, isLoading, error } = useSelector((state) => state.messages);

  useEffect(() => {
    const debug = {
      // Authentication status
      isAuthenticated,
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
      
      // Socket status
      socketConnected: socket?.connected || false,
      socketId: socket?.id || 'No socket',
      
      // Environment variables
      apiUrl: process.env.REACT_APP_API_URL,
      nodeEnv: process.env.NODE_ENV,
      
      // Redux state
      messagesCount: messages?.length || 0,
      isLoading,
      error,
      
      // Browser info
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    setDebugInfo(debug);
  }, [socket, user, isAuthenticated, messages, isLoading, error]);

  const testSocketConnection = () => {
    if (socket) {
      console.log('Testing socket connection...');
      socket.emit('test-connection', { message: 'Hello from chat debugger' });
    } else {
      console.log('No socket available');
    }
  };

  const testApiCall = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('API Response:', response.status, await response.text());
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Chat Debugger</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Debug Info */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          
          {/* Test Buttons */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Test Functions</h2>
            <div className="space-y-3">
              <button
                onClick={testSocketConnection}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Test Socket Connection
              </button>
              
              <button
                onClick={testApiCall}
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Test API Call
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
        
        {/* Console Output */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check the debug information above for any obvious issues</li>
            <li>Click "Test Socket Connection" and check browser console</li>
            <li>Click "Test API Call" and check browser console</li>
            <li>Open browser Developer Tools → Console to see detailed errors</li>
            <li>Open Developer Tools → Network tab to see failed requests</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ChatDebugger;
