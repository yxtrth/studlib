import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Queue to store requests that failed due to token expiry
let refreshQueue = [];
let isRefreshing = false;

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Required for cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Process queued requests with new token
const processQueue = (error, token = null) => {
    refreshQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    refreshQueue = [];
};

// Refresh access token
const refreshAccessToken = async () => {
    try {
        const response = await api.post('/auth/refresh-token');
        return response.data.accessToken;
    } catch (error) {
        throw error;
    }
};

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is not 401 or request already retried, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // If token refresh already in progress, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshQueue.push({ resolve, reject });
            })
                .then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch(err => Promise.reject(err));
        }

        // Start token refresh process
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();
            localStorage.setItem('accessToken', newToken);
            
            // Update authorization header
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            
            // Process queued requests
            processQueue(null, newToken);
            
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            
            // Clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

// API request methods
export const apiClient = {
    get: (url, config = {}) => api.get(url, { ...config }),
    post: (url, data = {}, config = {}) => api.post(url, data, { ...config }),
    put: (url, data = {}, config = {}) => api.put(url, data, { ...config }),
    delete: (url, config = {}) => api.delete(url, { ...config }),
    
    // Auth specific methods
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data;
    },
    
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
        }
        return response.data;
    },
    
    logout: async () => {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('accessToken');
        } finally {
            window.location.href = '/login';
        }
    }
};

export default apiClient;
