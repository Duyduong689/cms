# Authentication Implementation Guide

## Environment Variables

Create a `.env.local` file in the blog directory with:

```env
# API Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# Authentication Mode
# Set to 'true' for Bearer token mode, 'false' for cookie-based auth
NEXT_PUBLIC_USE_BEARER=false
```

## Authentication Modes

### Cookie Mode (Default)
- Backend sets httpOnly cookies
- No client-side token management
- More secure, tokens not accessible via JavaScript
- Set `NEXT_PUBLIC_USE_BEARER=false`

### Bearer Token Mode
- Backend returns access/refresh tokens in response
- Tokens stored in memory only (not localStorage)
- Automatic token refresh on 401 errors
- Set `NEXT_PUBLIC_USE_BEARER=true`

## Setup Instructions

### 1. QueryClient Provider Setup

Add to your root layout (`src/app/layout.tsx`):

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false;
        return failureCount < 3;
      },
    },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### 2. Protected Routes

Move your protected pages under the `(protected)` group:

```
src/app/
├── (auth)/
│   ├── login/
│   └── forgot-password/
├── (protected)/
│   ├── layout.tsx          # Auth guard
│   ├── dashboard/
│   ├── posts/
│   ├── users/
│   └── settings/
└── layout.tsx
```

### 3. Backend Configuration

Ensure your NestJS backend:

1. **Cookie Mode**: Sets `httpOnly` cookies for access/refresh tokens
2. **Bearer Mode**: Returns `{ accessToken, refreshToken }` in login response
3. **CORS**: Allows credentials and your frontend origin
4. **Refresh Endpoint**: Returns `{ accessToken }` for token refresh

## Manual Testing

### Happy Path
1. Register new user → success toast
2. Login → redirect to dashboard
3. Access protected routes → works
4. Logout → redirect to login

### Error Cases
1. Wrong credentials → error toast
2. Invalid email format → Zod validation error
3. Weak password → Zod validation error
4. Network error → generic error message

### Bearer Mode Specific
1. 401 error → automatic token refresh
2. Second 401 → logout and redirect
3. Page refresh → token persists in memory

### Cookie Mode Specific
1. 401 error → logout and redirect
2. Page refresh → session persists via cookies

## API Endpoints

All endpoints expect and return JSON:

- `POST /auth/register` → User object
- `POST /auth/login` → `{ accessToken, refreshToken? }` or sets cookies
- `GET /auth/me` → Current user
- `POST /auth/refresh` → `{ accessToken }` (Bearer mode)
- `POST /auth/logout` → `{ success: true }`
- `POST /auth/forgot-password` → `{ success: true }`
- `POST /auth/reset-password` → `{ success: true }`

## Security Notes

- No passwords stored in localStorage
- Tokens only in memory (Bearer mode) or httpOnly cookies
- Automatic token refresh with retry logic
- CSRF protection via SameSite cookies (recommended)
- Rate limiting handled by backend
