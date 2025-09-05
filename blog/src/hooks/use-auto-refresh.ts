import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from './use-auth';

/**
 * Hook to handle automatic token refresh
 * This monitors API errors and triggers refresh when needed
 */
export const useAutoRefresh = () => {
  const queryClient = useQueryClient();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Set up automatic refresh before token expires
    const scheduleRefresh = () => {
      // Clear any existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Schedule refresh 1 minute before token expires (14 minutes for 15-minute tokens)
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          // Try to refresh silently
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (response.ok) {
            // Refresh successful - invalidate user query to get fresh data
            queryClient.invalidateQueries({ queryKey: authKeys.me() });
            // Schedule next refresh
            scheduleRefresh();
          } else {
            // Refresh failed - user will be logged out on next API call
            console.warn('Silent token refresh failed');
          }
        } catch (error) {
          console.warn('Silent token refresh error:', error);
        }
      }, 14 * 60 * 1000); // 14 minutes
    };

    // Start the refresh cycle when user is authenticated
    const userQuery = queryClient.getQueryData(authKeys.me());
    if (userQuery) {
      scheduleRefresh();
    }

    // Clean up on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [queryClient]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
};
