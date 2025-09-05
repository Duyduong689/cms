import axios from "axios";
import httpClient from "./http-with-refresh";

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Types from backend
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  authorId?: string;
  tags: string[];
  status: "draft" | "published";
  metaTitle?: string;
  metaDescription?: string;
  openGraphImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  items: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface PostResponse extends Post {}

export interface QueryParams {
  q?: string;
  status?: "draft" | "published";
  page?: number;
  limit?: number;
}

// API functions
export const postsApi = {
  getAll: async (params?: QueryParams) => {
    const data = await httpClient.get<PostsResponse, PostsResponse>("/posts", {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const data = await httpClient.get<Post, PostResponse>(`/posts/${id}`);
    return data;
  },

  create: async (post: Omit<Post, "id" | "createdAt" | "updatedAt">) => {
    const data = await httpClient.post<Post, PostResponse>("/posts", post);
    return data;
  },

  update: async (
    id: string,
    post: Partial<Omit<Post, "id" | "createdAt" | "updatedAt">>
  ) => {
    const data = await httpClient.put<Post>(`/posts/${id}`, post);
    return data;
  },

  delete: async (id: string) => {
    const data = await httpClient.delete<Post>(`/posts/${id}`);
    return data;
  },
};
