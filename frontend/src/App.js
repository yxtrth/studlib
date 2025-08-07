import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './store/slices/authSlice';
import SocketProvider from './contexts/SocketContext';

// Components
import Navbar from './components/Layout/Navbar';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import BooksList from './pages/Books/BooksList';
import BookDetail from './pages/Books/BookDetail';
import VideosList from './pages/Videos/VideosList';
import VideoDetail from './pages/Videos/VideoDetail';
import Chat from './pages/Chat/Chat';
import Profile from './pages/Profile';
import AdminPanel from './pages/Admin/AdminPanel';

// Main App Content
function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />
              } 
            />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/books" element={
              <ProtectedRoute>
                <BooksList />
              </ProtectedRoute>
            } />
            
            <Route path="/books/:id" element={
              <ProtectedRoute>
                <BookDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/videos" element={
              <ProtectedRoute>
                <VideosList />
              </ProtectedRoute>
            } />
            
            <Route path="/videos/:id" element={
              <ProtectedRoute>
                <VideoDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/chat" element={
              <ProtectedRoute>
                <SocketProvider>
                  <Chat />
                </SocketProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/chat/:userId" element={
              <ProtectedRoute>
                <SocketProvider>
                  <Chat />
                </SocketProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/*" element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

// Root App Component
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
