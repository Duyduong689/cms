# Token Refresh Strategies

## Current Implementation: Manual Refresh

In the current JWT implementation, **the client must manually handle token refresh**. The backend does not automatically refresh tokens.

### Flow:
1. Access token expires (15 minutes)
2. Client gets `401 Unauthorized` from protected routes
3. Client calls `POST /auth/refresh` manually
4. Backend returns new tokens as httpOnly cookies
5. Client retries the original request

## Strategy 1: Automatic Refresh in HTTP Interceptor

This approach automatically refreshes tokens when a 401 is received, without the user noticing.

### Implementation (`http-with-refresh.ts`):

```typescript
// Track refresh state to prevent multiple calls
let isRefreshing = false;
let failedQueue = [];

// In response interceptor
if (error.response?.status === 401 && !originalRequest._retry) {
  if (isRefreshing) {
    // Queue requests while refreshing
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  originalRequest._retry = true;

  try {
    // Attempt refresh
    await httpClient.post('/auth/refresh');
    processQueue(null); // Process queued requests
    return httpClient(originalRequest); // Retry original request
  } catch (refreshError) {
    processQueue(refreshError);
    // Redirect to login
    window.location.href = '/login';
  } finally {
    isRefreshing = false;
  }
}
```

### Pros:
- ✅ Seamless user experience
- ✅ Handles concurrent requests properly
- ✅ Automatic retry of failed requests

### Cons:
- ❌ More complex error handling
- ❌ Potential for infinite loops if misconfigured

## Strategy 2: Proactive Refresh with Timer

Refresh tokens before they expire using a timer.

### Implementation (`use-auto-refresh.ts`):

```typescript
useEffect(() => {
  const scheduleRefresh = () => {
    setTimeout(async () => {
      try {
        await fetch('/auth/refresh', { 
          method: 'POST', 
          credentials: 'include' 
        });
        scheduleRefresh(); // Schedule next refresh
      } catch (error) {
        // Handle refresh failure
      }
    }, 14 * 60 * 1000); // 14 minutes (1 min before expiry)
  };

  if (isAuthenticated) {
    scheduleRefresh();
  }
}, [isAuthenticated]);
```

### Pros:
- ✅ Prevents token expiry
- ✅ Simpler error handling
- ✅ Predictable refresh timing

### Cons:
- ❌ Unnecessary refreshes if user is inactive
- ❌ Requires active tab to work

## Strategy 3: Hybrid Approach (Recommended)

Combine proactive refresh with fallback to reactive refresh.

### Implementation:

```typescript
// 1. Proactive refresh (14 minutes)
const scheduleProactiveRefresh = () => {
  setTimeout(async () => {
    try {
      await refreshToken();
      scheduleProactiveRefresh();
    } catch {
      // Fallback to reactive refresh
    }
  }, 14 * 60 * 1000);
};

// 2. Reactive refresh on 401
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        await refreshToken();
        return axios.request(error.config);
      } catch {
        redirectToLogin();
      }
    }
    return Promise.reject(error);
  }
);
```

## Strategy 4: React Query Integration

Use React Query's built-in retry and error handling.

### Implementation:

```typescript
export const useApiWithRefresh = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['protected-data'],
    queryFn: async () => {
      try {
        return await api.getProtectedData();
      } catch (error) {
        if (error.status === 401) {
          // Try refresh once
          await api.refreshToken();
          return await api.getProtectedData();
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry 401s after refresh attempt
      if (error.status === 401) return false;
      return failureCount < 3;
    },
  });
};
```

## Backend Considerations

### Current Backend Behavior:
- ✅ Returns new tokens on `/auth/refresh`
- ✅ Validates refresh token and session
- ✅ Rotates refresh tokens for security
- ✅ Uses httpOnly cookies (secure)

### What Backend Does NOT Do:
- ❌ Automatic token refresh
- ❌ Sliding window extension
- ❌ Grace period for expired tokens

## Recommended Implementation

For your current setup, I recommend **Strategy 1 (Automatic Refresh in HTTP Interceptor)** because:

1. **Seamless UX**: Users don't notice token refresh
2. **Cookie-based**: Works perfectly with your httpOnly cookies
3. **Session-aware**: Respects your Redis session system
4. **Error handling**: Properly handles refresh failures

### Usage:

Replace your current `http.ts` with `http-with-refresh.ts`:

```typescript
// In your API files
import httpClient from '../lib/api/http-with-refresh';

// All API calls will automatically handle token refresh
export const getPosts = () => httpClient.get('/posts');
export const getUsers = () => httpClient.get('/users');
```

### Configuration:

```env
# Token lifetimes
JWT_ACCESS_EXPIRES=15m   # Short-lived access token
JWT_REFRESH_EXPIRES=7d   # Long-lived refresh token

# The interceptor will automatically refresh when access token expires
```

## Testing the Implementation

Use the provided test scripts to verify token refresh works:

```bash
# Test 1: Normal flow with automatic refresh
curl -c cookies.txt -X POST /auth/login -d '{"email":"user@example.com","password":"password"}'

# Test 2: Wait for token to expire (or manually expire it in Redis)
# Then make a protected request - should auto-refresh and succeed
curl -b cookies.txt -X GET /auth/me

# Test 3: Logout should still work immediately
curl -b cookies.txt -X POST /auth/logout
curl -b cookies.txt -X GET /auth/me  # Should fail with session revoked
```

## Summary

- **Current**: Manual refresh required by client
- **Recommended**: Automatic refresh in HTTP interceptor
- **Benefits**: Seamless UX + secure session-based invalidation
- **Implementation**: Replace `http.ts` with `http-with-refresh.ts`
