import { http, normalizeError } from './http';
import type { PostListItem, PostStats } from '@/lib/types/posts-dashboard';

export async function getPostStats(): Promise<PostStats> {
  try {
    const data = await http.get<PostStats, PostStats>('/posts/dashboard/stats');
    return data;
  } catch (err) {
    // Fallback example if dedicated endpoint is not available yet:
    // const total = (await http.get<{ meta: { total: number } }>('/posts', { params: { limit: 1 } })).meta.total;
    // const published = (await http.get<{ meta: { total: number } }>('/posts', { params: { status: 'published', limit: 1 } })).meta.total;
    // const drafts = (await http.get<{ meta: { total: number } }>('/posts', { params: { status: 'draft', limit: 1 } })).meta.total;
    // return { posts: total, published, drafts };
    throw normalizeError(err);
  }
}

export async function getRecentPosts(limit = 5): Promise<PostListItem[]> {
  try {
    const data = await http.get<PostListItem[], PostListItem[]>(
      '/posts/dashboard/recent',
      { params: { limit } }
    );
    return data;
  } catch (err) {
    // Fallback example if dedicated endpoint is not available yet:
    // const res = await http.get<{ items: PostListItem[] }>('/posts', {
    //   params: { limit, sort: 'updatedAt', order: 'desc' },
    // } as any);
    // return res.items;
    throw normalizeError(err);
  }
}


