import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress
} from '@mui/material';
import axios from '../lib/axios';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data from navigation state
  const userEmail = location.state?.email;
  const tempToken = location.state?.tempToken;

  if (!userEmail || !tempToken) {
    navigate('/register');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/verify-otp', {
        otp,
        tempToken
      });

      // Store the access token and user data
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast.success(response.data.message);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const [resending, setResending] = useState(false);

  const handleResendOTP = async () => {
    setResending(true);
    try {
      const response = await axios.post('/api/auth/resend-otp', {
        tempToken
      });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Email Verification
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 3, textAlign: 'center' }}>
            Please enter the verification code sent to<br />
            <strong>{userEmail}</strong>
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Verification Code"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              autoFocus
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify Email'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={handleResendOTP}
              disabled={resending}
              sx={{ mt: 1 }}
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default OTPVerification;
