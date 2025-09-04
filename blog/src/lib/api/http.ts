import axios, { AxiosError, AxiosResponse } from 'axios';
import { refreshAccessToken } from '../auth/token';
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

    // Handle 401 errors with logout and redirect
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Don't call logout if the request itself is the logout API or if we're on login page
      const isLogoutRequest = originalRequest.url?.includes('/auth/logout');
      const isOnLoginPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/login');
      
      if (!isLogoutRequest && !isOnLoginPage) {
        try {
          // Call logout API to clear server-side session
          await logout();
        } catch (logoutError) {
          // Logout failed, but we still need to redirect
          console.error('Logout failed:', logoutError);
        }
        // Always redirect to login page on 401
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
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
