import { QueryClient, useQuery } from '@tanstack/react-query';
import { getPostStats, getRecentPosts } from '@/lib/api/posts-dashboard';
import type { PostListItem, PostStats } from '@/lib/types/posts-dashboard';

export const recentPostsLimit = 5;
export const postStatsStaleTime = 30_000;
// Query keys
export const postStatsKeys = {
  all: ['dashboard', 'posts', 'stats'] as const,
  list: () => [...postStatsKeys.all, 'list'] as const,
  detail: (limit: number) => [...postStatsKeys.all, 'detail', limit] as const,
};


export function usePostStats() {
  return useQuery<PostStats>({
    queryKey: postStatsKeys.list(),
    queryFn: getPostStats,
    staleTime: postStatsStaleTime,
  });
}

export function useRecentPosts(limit = recentPostsLimit) {
  return useQuery<PostListItem[]>({
    queryKey: postStatsKeys.detail(limit),
    queryFn: () => getRecentPosts(limit),
    staleTime: postStatsStaleTime,
  });
}

export const createDashboardInvalidator = (queryClient: QueryClient) => {
  const invalidateStats: () => Promise<void> = () =>
    queryClient.invalidateQueries({ queryKey: postStatsKeys.list() });
  const invalidateRecent: (limit?: number) => Promise<void> = (limit: number = recentPostsLimit) =>
    queryClient.invalidateQueries({ queryKey: postStatsKeys.detail(limit) });

  return {
    stats: invalidateStats,
    recent: invalidateRecent,
    all: async (limit: number = recentPostsLimit): Promise<void> => {
      await Promise.all([invalidateStats(), invalidateRecent(limit)]);
    },
  };
};

