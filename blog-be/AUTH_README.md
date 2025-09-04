# Authentication Module

A complete, production-ready authentication system for NestJS with JWT access/refresh tokens, Redis-backed sessions, and password reset functionality.

## Features

- ✅ JWT Access & Refresh Tokens
- ✅ Redis-backed session management
- ✅ Password hashing with bcryptjs
- ✅ Rate limiting for login attempts
- ✅ Password reset with secure tokens
- ✅ User registration and validation
- ✅ Swagger/OpenAPI documentation
- ✅ TypeScript support with strict typing
- ✅ Integration with existing Users module

## Environment Variables

Create a `.env` file in the `blog-be` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/blog_cms?schema=public"

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES=7d

# Auth Configuration
AUTH_REFRESH_PREFIX=auth:refresh:
AUTH_RESET_PREFIX=auth:reset:
BCRYPT_SALT_ROUNDS=10
LOGIN_MAX_ATTEMPTS=5
LOGIN_WINDOW_MIN=15
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | Refresh Token |
| POST | `/auth/logout` | Logout user | Refresh Token |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| GET | `/auth/me` | Get current user profile | Access Token |

## Usage Examples

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "avatarUrl": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Login User

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Current User Profile

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "avatarUrl": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. Refresh Access Token

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN"
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. Forgot Password

```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Response:**
```json
{
  "success": true
}
```

### 6. Reset Password

```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456ghi789",
    "password": "NewSecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true
}
```

### 7. Logout

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN"
```

**Response:**
```json
{
  "success": true
}
```

## Security Features

### Password Requirements
- Minimum 8 characters, maximum 72 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character

### Rate Limiting
- Maximum 5 login attempts per email
- 15-minute lockout window after max attempts
- Tracked in Redis with automatic expiration

### Token Security
- Access tokens: 15 minutes (configurable)
- Refresh tokens: 7 days (configurable)
- Refresh tokens stored in Redis with TTL
- Token rotation on refresh for enhanced security

### Password Reset
- Secure random tokens (32 bytes)
- 30-minute expiration
- One-time use (deleted after successful reset)

## Redis Key Structure

```
auth:refresh:{jti} -> userId (TTL: 7 days)
auth:reset:{token} -> userId (TTL: 30 minutes)
auth:login:{email} -> attempt_count (TTL: 15 minutes)
```

## Frontend Integration

### Login Flow
1. User submits login form
2. Call `POST /auth/login` with email/password
3. Store both tokens securely (httpOnly cookies recommended)
4. Use access token for API requests
5. Refresh token when access token expires

### Registration Flow
1. User submits registration form
2. Call `POST /auth/register` with user data
3. Auto-login user after successful registration
4. Store tokens as in login flow

### Password Reset Flow
1. User requests password reset
2. Call `POST /auth/forgot-password` with email
3. Send reset link via email (TODO: implement email service)
4. User clicks link with token
5. Call `POST /auth/reset-password` with token and new password

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid credentials or expired tokens
- `409 Conflict`: Email already exists
- `429 Too Many Requests`: Rate limit exceeded (handled by rate limiting)

## Testing

### Test with cURL

1. **Start the application:**
   ```bash
   npm run start:dev
   ```

2. **Register a test user:**
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"TestPass123!"}'
   ```

3. **Login:**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"TestPass123!"}'
   ```

4. **Test protected endpoint:**
   ```bash
   curl -X GET http://localhost:3000/auth/me \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Test with Swagger UI

Visit `http://localhost:3000/api` to access the interactive Swagger documentation.

## Dependencies

The auth module uses these packages (already in package.json):
- `@nestjs/jwt` - JWT token handling
- `@nestjs/passport` - Authentication strategies
- `passport-jwt` - JWT strategy for Passport
- `bcryptjs` - Password hashing
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation
- `ioredis` - Redis client
- `@nestjs/cache-manager` - Cache management

## Production Considerations

1. **Environment Variables**: Use strong, unique secrets for JWT tokens
2. **HTTPS**: Always use HTTPS in production
3. **Cookie Security**: Use httpOnly, secure, sameSite cookies for tokens
4. **Rate Limiting**: Consider implementing global rate limiting
5. **Email Service**: Implement email service for password reset
6. **Logging**: Add comprehensive logging for security events
7. **Monitoring**: Monitor failed login attempts and suspicious activity

## File Structure

```
src/auth/
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   ├── refresh.dto.ts
│   ├── forgot-password.dto.ts
│   └── reset-password.dto.ts
├── guards/
│   ├── jwt-access.guard.ts
│   └── jwt-refresh.guard.ts
├── strategies/
│   ├── jwt-access.strategy.ts
│   └── jwt-refresh.strategy.ts
├── auth.controller.ts
├── auth.service.ts
└── auth.module.ts

src/common/
├── decorators/
│   └── current-user.decorator.ts
└── utils/
    ├── password.util.ts
    └── token.util.ts

src/config/
└── auth.config.ts
```

## Integration with Frontend

The auth module is designed to work seamlessly with your existing frontend login/register/forgot/reset pages. The API responses match the expected data structures for your React components.

For the frontend integration, you'll need to:
1. Update API calls to use the new auth endpoints
2. Handle token storage and refresh logic
3. Implement proper error handling for auth failures
4. Add loading states for async operations
