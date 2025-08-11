// Session timeout middleware for backend
const sessionTimeout = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is older than 24 hours
      const tokenAge = Date.now() / 1000 - decoded.iat;
      if (tokenAge > 24 * 60 * 60) { // 24 hours
        return res.status(401).json({ message: 'Session expired' });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

// Frontend session checker
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const useSessionTimeout = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector(state => state.auth);

  useEffect(() => {
    if (!token || !user) return;

    const checkSession = () => {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const tokenAge = Date.now() / 1000 - tokenData.iat;
      
      if (tokenAge > 24 * 60 * 60) { // 24 hours
        dispatch(logout());
        toast.error('Session expired. Please login again.');
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [token, user, dispatch]);
};
