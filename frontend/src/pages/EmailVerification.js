import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import { EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const EmailVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { userId, email } = location.state || {};

  // Timer for resend button
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Auto-focus next input
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://student-library-backend-o116.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          otp: otpValue
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        dispatch(setCredentials({
          user: data.user,
          token: data.token
        }));

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Invalid verification code');
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (timeLeft > 0) return;

    setIsResending(true);

    try {
      const response = await fetch('https://student-library-backend-o116.onrender.com/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setTimeLeft(60); // 60 seconds cooldown
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        document.getElementById('otp-0')?.focus();
      } else {
        toast.error(data.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!userId || !email) {
    navigate('/register');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <EnvelopeIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-medium text-blue-600">{email}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
          <div>
            <label className="sr-only">Verification Code</label>
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timeLeft > 0 || isResending}
                className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <span className="flex items-center">
                    <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                    Sending...
                  </span>
                ) : timeLeft > 0 ? (
                  `Resend in ${timeLeft}s`
                ) : (
                  'Resend Code'
                )}
              </button>
            </p>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;
