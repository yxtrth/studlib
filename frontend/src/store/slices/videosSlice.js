import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  videos: [],
  currentVideo: null,
  categories: [],
  levels: [],
  favorites: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
  filters: {
    search: '',
    category: 'all',
    level: 'all',
    sort: 'createdAt',
    order: 'desc',
  },
};

// Async thunks
export const fetchVideos = createAsyncThunk(
  'videos/fetchVideos',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/videos', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch videos';
      return rejectWithValue(message);
    }
  }
);

export const fetchVideoById = createAsyncThunk(
  'videos/fetchVideoById',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/videos/${videoId}`);
      return response.data.video;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch video';
      return rejectWithValue(message);
    }
  }
);

export const searchVideos = createAsyncThunk(
  'videos/searchVideos',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await axios.get('/videos', { params: searchParams });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to search videos';
      return rejectWithValue(message);
    }
  }
);

export const createVideo = createAsyncThunk(
  'videos/createVideo',
  async (videoData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(videoData).forEach(key => {
        if (videoData[key] !== undefined && videoData[key] !== null) {
          formData.append(key, videoData[key]);
        }
      });

      const response = await axios.post('/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.video;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create video';
      return rejectWithValue(message);
    }
  }
);

export const updateVideo = createAsyncThunk(
  'videos/updateVideo',
  async ({ videoId, videoData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(videoData).forEach(key => {
        if (videoData[key] !== undefined && videoData[key] !== null) {
          formData.append(key, videoData[key]);
        }
      });

      const response = await axios.put(`/videos/${videoId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.video;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update video';
      return rejectWithValue(message);
    }
  }
);

export const deleteVideo = createAsyncThunk(
  'videos/deleteVideo',
  async (videoId, { rejectWithValue }) => {
    try {
      await axios.delete(`/videos/${videoId}`);
      return videoId;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete video';
      return rejectWithValue(message);
    }
  }
);

export const addVideoReview = createAsyncThunk(
  'videos/addVideoReview',
  async ({ videoId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/videos/${videoId}/review`, reviewData);
      return response.data.video;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add review';
      return rejectWithValue(message);
    }
  }
);

export const toggleVideoLike = createAsyncThunk(
  'videos/toggleLike',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/videos/${videoId}/like`);
      return { videoId, isLiked: response.data.isLiked, likeCount: response.data.likeCount };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to toggle like';
      return rejectWithValue(message);
    }
  }
);

export const toggleVideoFavorite = createAsyncThunk(
  'videos/toggleFavorite',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/users/favorites/videos/${videoId}`);
      return { videoId, isFavorite: response.data.isFavorite };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to toggle favorite';
      return rejectWithValue(message);
    }
  }
);

export const fetchFavoriteVideos = createAsyncThunk(
  'videos/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/users/favorites/videos');
      return response.data.favoriteVideos;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch favorites';
      return rejectWithValue(message);
    }
  }
);

export const rateVideo = createAsyncThunk(
  'videos/rateVideo',
  async ({ videoId, rating }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/videos/${videoId}/rate`, { rating });
      return response.data.video;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to rate video';
      return rejectWithValue(message);
    }
  }
);

// Create slice
const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch videos
      .addCase(fetchVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = action.payload.videos;
        state.categories = action.payload.categories;
        state.levels = action.payload.levels;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
        state.error = null;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch video by ID
      .addCase(fetchVideoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentVideo = action.payload;
        state.error = null;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Search videos
      .addCase(searchVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchVideos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = action.payload.videos;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
        state.error = null;
      })
      .addCase(searchVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create video
      .addCase(createVideo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createVideo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos.unshift(action.payload);
        state.error = null;
      })
      .addCase(createVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update video
      .addCase(updateVideo.fulfilled, (state, action) => {
        const index = state.videos.findIndex(video => video._id === action.payload._id);
        if (index !== -1) {
          state.videos[index] = action.payload;
        }
        if (state.currentVideo && state.currentVideo._id === action.payload._id) {
          state.currentVideo = action.payload;
        }
      })
      
      // Delete video
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.videos = state.videos.filter(video => video._id !== action.payload);
        if (state.currentVideo && state.currentVideo._id === action.payload) {
          state.currentVideo = null;
        }
      })
      
      // Add review
      .addCase(addVideoReview.fulfilled, (state, action) => {
        if (state.currentVideo && state.currentVideo._id === action.payload._id) {
          state.currentVideo = action.payload;
        }
      })
      
      // Toggle like
      .addCase(toggleVideoLike.fulfilled, (state, action) => {
        const { videoId, isLiked, likeCount } = action.payload;
        if (state.currentVideo && state.currentVideo._id === videoId) {
          state.currentVideo.isLiked = isLiked;
          state.currentVideo.likeCount = likeCount;
        }
      })
      
      // Toggle favorite
      .addCase(toggleVideoFavorite.fulfilled, (state, action) => {
        const { videoId, isFavorite } = action.payload;
        if (state.currentVideo && state.currentVideo._id === videoId) {
          state.currentVideo.isFavorite = isFavorite;
        }
      })
      
      // Fetch favorites
      .addCase(fetchFavoriteVideos.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      
      // Rate video
      .addCase(rateVideo.fulfilled, (state, action) => {
        if (state.currentVideo && state.currentVideo._id === action.payload._id) {
          state.currentVideo = action.payload;
        }
        const index = state.videos.findIndex(video => video._id === action.payload._id);
        if (index !== -1) {
          state.videos[index] = action.payload;
        }
      });
  },
});

export const { clearError, setFilters, clearCurrentVideo } = videosSlice.actions;

export default videosSlice.reducer;
