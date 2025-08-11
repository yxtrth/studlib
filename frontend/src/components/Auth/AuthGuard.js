import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthGuard = ({ children, action = 'perform this action' }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    toast.error(`Please login to ${action}`);
    return <Navigate to="/login" replace />;
  }

  if (!user?.isEmailVerified) {
    toast.error('Please verify your email to access this feature');
    return <Navigate to="/verify-email" state={{ userId: user.id, email: user.email }} replace />;
  }

  if (!user?.isActive) {
    toast.error('Your account is deactivated. Please contact support.');
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Usage in components:
// <AuthGuard action="rate books">
//   <RatingComponent />
// </AuthGuard>

export default AuthGuard;
