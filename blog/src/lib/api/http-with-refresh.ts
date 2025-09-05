import axios, { AxiosError, AxiosResponse } from 'axios';
import { logout } from './auth';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_BASE_URL environment variable is required');
}

// Create axios instance
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Always send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - no longer needed for Bearer tokens
httpClient.interceptors.request.use(
  (config) => {
    // Cookies are automatically sent with requests
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwrap data from response
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 errors with automatic token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      // Don't try to refresh on certain routes
      const isAuthRoute = originalRequest.url?.includes('/auth/');
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/login');
      const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');
      const isLogoutRequest = originalRequest.url?.includes('/auth/logout');
      
      // If it's a refresh request that failed, or we're on login page, don't retry
      if (isRefreshRequest || isLogoutRequest || isLoginPage) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          // Retry the original request
          return httpClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        await httpClient.post('/auth/refresh');
        
        // Refresh successful - process the queue and retry original request
        processQueue(null);
        isRefreshing = false;
        
        return httpClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - user needs to login again
        processQueue(refreshError);
        isRefreshing = false;
        
        // Call logout API to clear server-side session if not already on auth routes
        if (!isAuthRoute) {
          try {
            await logout();
          } catch (logoutError) {
            console.error('Logout failed:', logoutError);
          }
          
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Normalize error response
    const normalizedError = {
      message: (error.response?.data as any)?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data,
    };

    return Promise.reject(normalizedError);
  }
);

export default httpClient;
