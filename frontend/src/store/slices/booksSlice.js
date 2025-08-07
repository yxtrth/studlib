import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  books: [],
  currentBook: null,
  categories: [],
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
    sort: 'createdAt',
    order: 'desc',
  },
};

// Async thunks
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/books', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch books';
      return rejectWithValue(message);
    }
  }
);

export const fetchBookById = createAsyncThunk(
  'books/fetchBookById',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/books/${bookId}`);
      return response.data.book;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch book';
      return rejectWithValue(message);
    }
  }
);

export const searchBooks = createAsyncThunk(
  'books/searchBooks',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await axios.get('/books', { params: searchParams });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to search books';
      return rejectWithValue(message);
    }
  }
);

export const createBook = createAsyncThunk(
  'books/createBook',
  async (bookData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(bookData).forEach(key => {
        if (bookData[key] !== undefined && bookData[key] !== null) {
          formData.append(key, bookData[key]);
        }
      });

      const response = await axios.post('/books', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.book;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create book';
      return rejectWithValue(message);
    }
  }
);

export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ bookId, bookData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(bookData).forEach(key => {
        if (bookData[key] !== undefined && bookData[key] !== null) {
          formData.append(key, bookData[key]);
        }
      });

      const response = await axios.put(`/books/${bookId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.book;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update book';
      return rejectWithValue(message);
    }
  }
);

export const deleteBook = createAsyncThunk(
  'books/deleteBook',
  async (bookId, { rejectWithValue }) => {
    try {
      await axios.delete(`/books/${bookId}`);
      return bookId;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete book';
      return rejectWithValue(message);
    }
  }
);

export const addBookReview = createAsyncThunk(
  'books/addBookReview',
  async ({ bookId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/books/${bookId}/review`, reviewData);
      return response.data.book;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add review';
      return rejectWithValue(message);
    }
  }
);

export const toggleBookFavorite = createAsyncThunk(
  'books/toggleFavorite',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/users/favorites/books/${bookId}`);
      return { bookId, isFavorite: response.data.isFavorite };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to toggle favorite';
      return rejectWithValue(message);
    }
  }
);

export const rateBook = createAsyncThunk(
  'books/rateBook',
  async ({ bookId, rating }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/books/${bookId}/rate`, { rating });
      return response.data.book;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to rate book';
      return rejectWithValue(message);
    }
  }
);

export const addBookToFavorites = createAsyncThunk(
  'books/addToFavorites',
  async (bookId, { rejectWithValue }) => {
    try {
      await axios.post(`/users/favorites/books/${bookId}`);
      return { bookId, isFavorite: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add to favorites';
      return rejectWithValue(message);
    }
  }
);

export const removeBookFromFavorites = createAsyncThunk(
  'books/removeFromFavorites',
  async (bookId, { rejectWithValue }) => {
    try {
      await axios.delete(`/users/favorites/books/${bookId}`);
      return { bookId, isFavorite: false };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to remove from favorites';
      return rejectWithValue(message);
    }
  }
);

export const fetchFavoriteBooks = createAsyncThunk(
  'books/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/users/favorites/books');
      return response.data.favoriteBooks;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch favorites';
      return rejectWithValue(message);
    }
  }
);

export const downloadBook = createAsyncThunk(
  'books/downloadBook',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/books/${bookId}/download`);
      return response.data.downloadUrl;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to download book';
      return rejectWithValue(message);
    }
  }
);

// Create slice
const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentBook: (state) => {
      state.currentBook = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch books
      .addCase(fetchBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload.books;
        state.categories = action.payload.categories;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
        state.error = null;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch book by ID
      .addCase(fetchBookById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBook = action.payload;
        state.error = null;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Search books
      .addCase(searchBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload.books;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
        state.error = null;
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create book
      .addCase(createBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books.unshift(action.payload);
        state.error = null;
      })
      .addCase(createBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update book
      .addCase(updateBook.fulfilled, (state, action) => {
        const index = state.books.findIndex(book => book._id === action.payload._id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
        if (state.currentBook && state.currentBook._id === action.payload._id) {
          state.currentBook = action.payload;
        }
      })
      
      // Delete book
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.books = state.books.filter(book => book._id !== action.payload);
        if (state.currentBook && state.currentBook._id === action.payload) {
          state.currentBook = null;
        }
      })
      
      // Add review
      .addCase(addBookReview.fulfilled, (state, action) => {
        if (state.currentBook && state.currentBook._id === action.payload._id) {
          state.currentBook = action.payload;
        }
      })
      
      // Toggle favorite
      .addCase(toggleBookFavorite.fulfilled, (state, action) => {
        const { bookId, isFavorite } = action.payload;
        if (state.currentBook && state.currentBook._id === bookId) {
          state.currentBook.isFavorite = isFavorite;
        }
      })
      
      // Rate book
      .addCase(rateBook.fulfilled, (state, action) => {
        if (state.currentBook && state.currentBook._id === action.payload._id) {
          state.currentBook = action.payload;
        }
      })
      
      // Add to favorites
      .addCase(addBookToFavorites.fulfilled, (state, action) => {
        const { bookId } = action.payload;
        if (state.currentBook && state.currentBook._id === bookId) {
          state.currentBook.isFavorite = true;
        }
      })
      
      // Remove from favorites
      .addCase(removeBookFromFavorites.fulfilled, (state, action) => {
        const { bookId } = action.payload;
        if (state.currentBook && state.currentBook._id === bookId) {
          state.currentBook.isFavorite = false;
        }
      })
      
      // Fetch favorites
      .addCase(fetchFavoriteBooks.fulfilled, (state, action) => {
        state.favorites = action.payload;
      });
  },
});

export const { clearError, setFilters, clearCurrentBook } = booksSlice.actions;

export default booksSlice.reducer;
