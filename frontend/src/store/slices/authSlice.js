import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://student-library-backend-o116.onrender.com/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Get token from localStorage
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/auth/register', userData);
      
      // Check if response requires verification
      if (response.data.requiresVerification) {
        return {
          requiresVerification: true,
          userId: response.data.userId,
          email: response.data.email,
          message: response.data.message
        };
      }
      
      // Old flow for backward compatibility
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, user };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      
      // Check if verification is required
      if (response.data.requiresVerification) {
        return rejectWithValue({
          requiresVerification: true,
          userId: response.data.userId,
          email: response.data.email,
          message: response.data.message
        });
      }
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, user };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/auth/me');
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to get user';
      return rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== undefined && profileData[key] !== null) {
          formData.append(key, profileData[key]);
        }
      });
      
      const response = await axios.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      return rejectWithValue(message);
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (avatarFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await axios.put('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Avatar upload failed';
      return rejectWithValue(message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await axios.put('/auth/change-password', passwordData);
      return response.data.message;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Password change failed';
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Call logout endpoint
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      // Ignore logout endpoint errors
      console.log('Logout endpoint error:', error);
    }
    
    return null;
  }
);

// Create slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      
      // Set axios header
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Check if verification is required
        if (action.payload.requiresVerification) {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          state.error = null;
        } else {
          // Old flow - direct login
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.error = null;
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
      })
      
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
        // Clear token from localStorage on auth failure
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Upload avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
