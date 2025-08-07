import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  stats: {
    totalUsers: 0,
    totalBooks: 0,
    totalVideos: 0,
    totalMessages: 0,
    recentUsers: 0,
    topBookCategories: [],
    topVideoCategories: [],
    userGrowthData: [],
  },
  users: [],
  books: [],
  videos: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
};

// Async thunks
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/admin/stats');
      return response.data.stats;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch stats';
      return rejectWithValue(message);
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch users';
      return rejectWithValue(message);
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch all users';
      return rejectWithValue(message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/admin/users/${userId}/status`, { isActive });
      return { userId, isActive, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update user status';
      return rejectWithValue(message);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/admin/users/${userId}/role`, { role });
      return { userId, role, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update user role';
      return rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/admin/users/${userId}`);
      return { userId, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete user';
      return rejectWithValue(message);
    }
  }
);

export const fetchAdminBooks = createAsyncThunk(
  'admin/fetchBooks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/admin/books', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch books';
      return rejectWithValue(message);
    }
  }
);

export const updateBookStatus = createAsyncThunk(
  'admin/updateBookStatus',
  async ({ bookId, isActive }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/admin/books/${bookId}/status`, { isActive });
      return { bookId, isActive, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update book status';
      return rejectWithValue(message);
    }
  }
);

export const fetchAdminVideos = createAsyncThunk(
  'admin/fetchVideos',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/admin/videos', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch videos';
      return rejectWithValue(message);
    }
  }
);

export const updateVideoStatus = createAsyncThunk(
  'admin/updateVideoStatus',
  async ({ videoId, isActive }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/admin/videos/${videoId}/status`, { isActive });
      return { videoId, isActive, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update video status';
      return rejectWithValue(message);
    }
  }
);

// Create slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
        state.error = null;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update user status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const { userId, isActive } = action.payload;
        const user = state.users.find(u => u._id === userId);
        if (user) {
          user.isActive = isActive;
        }
      })
      
      // Update user role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { userId, role } = action.payload;
        const user = state.users.find(u => u._id === userId);
        if (user) {
          user.role = role;
        }
      })
      
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.users = state.users.filter(u => u._id !== userId);
      })
      
      // Fetch books
      .addCase(fetchAdminBooks.fulfilled, (state, action) => {
        state.books = action.payload.books;
      })
      
      // Update book status
      .addCase(updateBookStatus.fulfilled, (state, action) => {
        const { bookId, isActive } = action.payload;
        const book = state.books.find(b => b._id === bookId);
        if (book) {
          book.isActive = isActive;
        }
      })
      
      // Fetch videos
      .addCase(fetchAdminVideos.fulfilled, (state, action) => {
        state.videos = action.payload.videos;
      })
      
      // Update video status
      .addCase(updateVideoStatus.fulfilled, (state, action) => {
        const { videoId, isActive } = action.payload;
        const video = state.videos.find(v => v._id === videoId);
        if (video) {
          video.isActive = isActive;
        }
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
