import { ForgotPasswordFormData, LoginFormData, ResetPasswordFormData } from '../validations/auth';
import httpClient from './http-with-refresh';

// Response types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  status: 'ACTIVE' | 'DISABLED';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  success: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  status: 'ACTIVE' | 'DISABLED';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSuccessResponse {
  success: boolean;
}

// API functions
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  return httpClient.post('/auth/register', data) as Promise<RegisterResponse>;
};

export const login = async (data: LoginFormData): Promise<LoginResponse> => {
  const response = await httpClient.post('/auth/login', data) as LoginResponse;
  
  // Tokens are now stored in httpOnly cookies automatically
  // No need to manually store them
  
  return response;
};

export const me = async (): Promise<User> => {
  return httpClient.get('/auth/me') as Promise<User>;
};

export const refresh = async (): Promise<{ success: boolean }> => {
  // return httpClient.post('/auth/refresh') as Promise<{ success: boolean }>;
  return { success: true };
};

export const logout = async (): Promise<AuthSuccessResponse> => {
  const response = await httpClient.post('/auth/logout') as AuthSuccessResponse;
  
  // Cookies are cleared by the server automatically
  // No need to manually clear them
  
  return response;
};

export const forgotPassword = async (data: ForgotPasswordFormData): Promise<AuthSuccessResponse> => {
  return httpClient.post('/auth/forgot-password', data) as Promise<AuthSuccessResponse>;
};

export const resetPassword = async (
  token: string,
  data: ResetPasswordFormData
): Promise<AuthSuccessResponse> => {
  return httpClient.post('/auth/reset-password', {
    token,
    ...data,
  }) as Promise<AuthSuccessResponse>;
};
