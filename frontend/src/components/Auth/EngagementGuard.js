import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const EngagementWrapper = ({ children, feature }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="auth-required-overlay">
        <div className="auth-prompt">
          <h3>Login Required</h3>
          <p>You need to login to {feature}.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn btn-primary"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Profile Creation Guard
export const ProfileGuard = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    toast.error('Please login to access profile features');
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Engagement Actions Guard (ratings, favorites, etc)
export const EngagementGuard = ({ children, action }) => {
  return (
    <EngagementWrapper feature={action}>
      {children}
    </EngagementWrapper>
  );
};

export default EngagementWrapper;
