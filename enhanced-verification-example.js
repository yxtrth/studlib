// Add to User model in backend
const userSchema = new mongoose.Schema({
  // ... existing fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date
});

// Enhanced ProtectedRoute with verification check
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../UI/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false, requireVerification = true }) => {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // New verification check
  if (requireVerification && !user?.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
