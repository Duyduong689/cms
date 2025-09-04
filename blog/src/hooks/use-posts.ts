import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Post, QueryParams, postsApi } from "@/lib/api/posts";
import { toast } from "sonner";

// Query keys
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (params: QueryParams) => [...postKeys.lists(), params] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

// Hooks
export function usePosts(params?: QueryParams) {
  return useQuery({
    queryKey: postKeys.list(params || {}),
    queryFn: () => postsApi.getAll(params),
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsApi.getById(id),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      toast.success("Post created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create post");
      console.error("Create post error:", error);
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Post>) =>
      postsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
      toast.success("Post updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update post");
      console.error("Update post error:", error);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete post");
      console.error("Delete post error:", error);
    },
  });
}
