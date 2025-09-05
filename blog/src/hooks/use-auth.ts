import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  forgotPassword,
  login,
  logout as logoutApi,
  me,
  register,
  resetPassword,
  ResetPasswordRequest
} from "../lib/api/auth";
import { ResetPasswordFormData } from "../lib/validations/auth";

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data: any) => {
      console.log(data, "data");
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast.success("Login successful!");
      router.replace("/");
    },
    onError: (error: any) => {
      toast.error(error.message || "Login failed");
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success("Registration successful! Please check your email to verify your account.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Registration failed");
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast.success("Password reset email sent! Check your inbox.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send reset email");
    },
  });
};

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: ResetPasswordFormData }) =>
      resetPassword(token, data),
    onSuccess: () => {
      toast.success("Password reset successful! You can now login with your new password.");
      router.replace("/login");
    },
    onError: (error: any) => {
      toast.error(error.message || "Password reset failed");
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: me,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      toast.success("Logged out successfully");
      router.replace("/login");
    },
    onError: (error: any) => {
      // Even if logout fails on server, clear local state
      queryClient.clear();
      toast.error(error.message || "Logout failed");
      router.replace("/login");
    },
  });
};
