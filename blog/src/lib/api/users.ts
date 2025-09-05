import { User, UserCreateInput, UserUpdateInput, UserQueryParams, UsersResponse } from "@/lib/schemas/user";
import httpClient from "./http-with-refresh";

// API functions
export const usersApi = {
  getAll: async (params?: UserQueryParams): Promise<UsersResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.q) searchParams.append('q', params.q);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.order) searchParams.append('order', params.order);

    return httpClient.get(`/users?${searchParams.toString()}`) as Promise<UsersResponse>;
  },

  getById: async (id: string): Promise<User> => {
    return httpClient.get(`/users/${id}`) as Promise<User>;
  },

  create: async (userData: UserCreateInput): Promise<User> => {
    return httpClient.post('/users', userData) as Promise<User>;
  },

  update: async (id: string, userData: UserUpdateInput): Promise<User> => {
    return httpClient.patch(`/users/${id}`, userData) as Promise<User>;
  },

  delete: async (id: string): Promise<User> => {
    return httpClient.delete(`/users/${id}`) as Promise<User>;
  },

  toggleStatus: async (id: string): Promise<User> => {
    return httpClient.patch(`/users/${id}/toggle-status`) as Promise<User>;
  },

  resetPassword: async (id: string): Promise<{ success: boolean }> => {
    return httpClient.post(`/users/${id}/reset-password`) as Promise<{ success: boolean }>;
  },
};
