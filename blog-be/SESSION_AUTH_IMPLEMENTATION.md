# Session-Based Authentication Implementation

## Overview
This implementation provides immediate token invalidation using Redis sessions. When a user logs out, their session is deleted from Redis, making all tokens with that session ID immediately invalid.

## Architecture

### Token & Session Model

#### Login Process
1. Generate `sessionId` (UUID) and store in Redis: `auth:sess:${sessionId} = { userId, userAgent?, ipAddress?, createdAt }`
2. Create access token with claims: `{ sub: userId, sid: sessionId, jti: accessJti, email, role, type: 'access' }`
3. Create refresh token with claims: `{ sub: userId, sid: sessionId, jti: refreshJti, email, role, type: 'refresh' }`
4. Store refresh token mapping: `auth:refresh:${refreshJti} = { userId, sessionId }`
5. Return tokens as httpOnly cookies

#### Token Validation (Access)
1. Extract `sid` from token payload
2. Check if session exists: `EXISTS auth:sess:${sid}`
3. If session doesn't exist → `401 Session revoked`
4. Optional: Check token denylist: `auth:block:${jti}`
5. Validate user is still active

#### Refresh Process
1. Validate refresh token and session exist
2. Generate new token pair with same `sessionId`
3. Rotate refresh token (delete old, store new)
4. Extend session TTL

#### Logout Process
1. Extract `sessionId` from access/refresh token
2. Delete session: `DEL auth:sess:${sessionId}`
3. Delete refresh token: `DEL auth:refresh:${refreshJti}`
4. Optional: Add access token to denylist with remaining TTL
5. Clear cookies

## Key Files Modified

### 1. JWT Payload Interface (`token.util.ts`)
```typescript
export interface JwtPayload {
  sub: string;      // userId
  email: string;
  role: string;
  type: 'access' | 'refresh';
  sid: string;      // sessionId - NEW
  jti?: string;     // JWT ID
}

export interface SessionData {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}
```

### 2. Auth Configuration (`auth.config.ts`)
Added session prefix:
```typescript
auth: {
  sessionPrefix: 'auth:sess:',
  refreshPrefix: 'auth:refresh:',
  blockedPrefix: 'auth:block:',
  // ... other config
}
```

### 3. AuthService Session Management
- `createSession()` - Create new Redis session
- `validateSession()` - Check if session exists
- `deleteSession()` - Remove session (logout)
- `blockAccessToken()` - Add token to denylist

### 4. JWT Access Strategy (`jwt-access.strategy.ts`)
Primary validation checks session exists:
```typescript
const sessionExists = await this.redis.exists(`${sessionPrefix}${payload.sid}`);
if (!sessionExists) {
  throw new UnauthorizedException('Session revoked');
}
```

### 5. JWT Refresh Strategy (`jwt-refresh.strategy.ts`)
Validates both refresh token mapping and session existence.

### 6. Auth Controller Updates
- Login: Pass user-agent and IP for session creation
- Refresh: Include sessionId in refresh call
- Logout: Extract sessionId and use session-based logout

### 7. Redis Service Extensions
Added methods:
- `exists(key)` - Check if key exists
- `expire(key, ttl)` - Update TTL for existing key

## Environment Variables

```env
# JWT Configuration
JWT_ACCESS_SECRET=your-access-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES=7d

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=optional

# Auth Prefixes
AUTH_SESSION_PREFIX=auth:sess:
AUTH_REFRESH_PREFIX=auth:refresh:
AUTH_BLOCKED_PREFIX=auth:block:
AUTH_RESET_PREFIX=auth:reset:

# Security
BCRYPT_SALT_ROUNDS=10
LOGIN_MAX_ATTEMPTS=5
LOGIN_WINDOW_MIN=15
```

## Testing Steps

### 1. Login and Get Token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}' \
  -c cookies.txt
```

### 2. Access Protected Route
```bash
curl -X GET http://localhost:3000/auth/me \
  -b cookies.txt
```
Expected: `200 OK` with user data

### 3. Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -b cookies.txt
```
Expected: `200 OK` with `{"success": true}`

### 4. Try Protected Route Again
```bash
curl -X GET http://localhost:3000/auth/me \
  -b cookies.txt
```
Expected: `401 Unauthorized` with "Session revoked"

### 5. Try Refresh After Logout
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -b cookies.txt
```
Expected: `401 Unauthorized`

## Key Benefits

1. **Immediate Invalidation**: Logout instantly revokes all tokens with that session
2. **Stateful Security**: Redis session provides centralized control
3. **Multi-device Support**: Each login creates separate session
4. **Graceful Degradation**: Fallback to token denylist if needed
5. **User Context**: Sessions can store additional metadata

## Edge Cases Handled

- Expired access token with valid refresh → validates session exists
- Multiple devices → separate sessions per login
- Token without session ID → rejected
- Session deleted but tokens not expired → rejected
- Malformed tokens → proper error handling

## Future Enhancements

1. **Logout All Devices**: Add endpoint to delete all user sessions
2. **Session Management**: List active sessions with device info
3. **Suspicious Activity**: Track session patterns for security
4. **Session Limits**: Maximum concurrent sessions per user
