# Blog CMS Platform

A modern, full-stack blog content management system built with Next.js, NestJS, PostgreSQL, and Redis. Features a complete authentication system, user management, post management, and real-time caching.

## 🚀 Features

### 🔐 Authentication & Security
- **JWT Authentication**: Access and refresh token system with automatic rotation
- **Session Management**: Redis-backed session storage with TTL
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **Rate Limiting**: Login attempt protection and forgot password throttling
- **Password Reset**: Secure token-based password reset with email integration
- **Role-Based Access**: Admin, Staff, and Customer roles with permission controls

### 📝 Content Management
- **Post Management**: Create, edit, delete, and publish blog posts
- **Rich Content**: Support for markdown content with excerpts and metadata
- **SEO Optimization**: Meta titles, descriptions, and Open Graph images
- **Tag System**: Flexible tagging system for content organization
- **Status Management**: Draft and published post states
- **Slug Generation**: Automatic URL-friendly slug creation

### 👥 User Management
- **User CRUD**: Complete user lifecycle management
- **Role Management**: Assign and manage user roles and permissions
- **Status Control**: Enable/disable user accounts
- **Password Management**: Secure password reset and generation
- **Profile Management**: User profile information and avatar support

### ⚡ Performance & Caching
- **Redis Caching**: High-performance caching with TTL management
- **Query Optimization**: Efficient database queries with Prisma
- **Pagination**: Built-in pagination for large datasets
- **Connection Pooling**: Optimized database connections

### 🎨 User Interface
- **Modern Design**: Clean, responsive UI built with TailwindCSS
- **Component Library**: Comprehensive UI kit with Radix UI components
- **Form Validation**: Client and server-side validation with Zod
- **Accessibility**: ARIA-compliant components for screen readers
- **Mobile-First**: Responsive design that works on all devices

### 🔧 Developer Experience
- **TypeScript**: Full type safety across frontend and backend
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Hot Reload**: Fast development with hot module replacement
- **Linting**: ESLint configuration for code quality
- **Database Migrations**: Prisma-based database schema management

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Redis** (v6 or higher)
- **Docker** (optional, for containerization)

## 🛠️ Tech Stack

### Frontend (`blog/`)
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Query** - Data fetching and caching
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Axios** - HTTP client

### Backend (`blog-be/`)
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Modern database ORM
- **PostgreSQL** - Relational database
- **Redis** - In-memory data store
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Class Validator** - DTO validation
- **Swagger** - API documentation
- **Brevo** - Email service integration

## 🚦 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cms
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd blog-be
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/blog_cms"

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600
REDIS_MAX_ITEMS=100

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES=7d

# Auth Configuration
AUTH_SESSION_PREFIX=auth:sess:
AUTH_REFRESH_PREFIX=auth:refresh:
AUTH_RESET_PREFIX=auth:reset:
AUTH_BLOCKED_PREFIX=auth:block:
BCRYPT_SALT_ROUNDS=10
LOGIN_MAX_ATTEMPTS=5
LOGIN_WINDOW_MIN=15
FORGOT_PASSWORD_MAX_ATTEMPTS=5
FORGOT_PASSWORD_WINDOW_MIN=15
RESET_TOKEN_TTL=1800

# Email Configuration (Brevo)
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=your-email@example.com
BREVO_SENDER_NAME=Blog CMS

# App Configuration
APP_ORIGIN=http://localhost:3000
```

Set up the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:dev

# Seed the database (optional)
npm run prisma:seed
```

Start the backend server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
API documentation at `http://localhost:3000/api`

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd blog
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
cp .env.local.example .env.local
```

Configure your `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Start the frontend server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

### Frontend Structure (`blog/`)
```
blog/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group
│   │   │   ├── login/         # Login page
│   │   │   ├── register/      # Registration page
│   │   │   ├── forgot-password/ # Password reset request
│   │   │   └── reset-password/  # Password reset form
│   │   ├── posts/             # Posts management
│   │   ├── users/             # User management
│   │   ├── categories/        # Categories management
│   │   ├── authors/           # Authors management
│   │   ├── settings/          # Settings page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── app/              # Application-specific components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── posts/        # Post-related components
│   │   │   └── users/        # User-related components
│   │   ├── layout/           # Layout components
│   │   │   ├── Sidebar.tsx   # Navigation sidebar
│   │   │   ├── Topbar.tsx    # Top navigation bar
│   │   │   └── AuthenticatedLayout.tsx # Auth layout wrapper
│   │   └── ui/               # Base UI components
│   │       ├── button.tsx    # Button component
│   │       ├── input.tsx     # Input component
│   │       ├── form.tsx      # Form components
│   │       └── ...           # Other UI components
│   ├── hooks/                # Custom React hooks
│   │   ├── use-auth.ts       # Authentication hook
│   │   ├── use-posts.ts      # Posts data hook
│   │   └── use-users.ts      # Users data hook
│   ├── lib/                  # Utility functions
│   │   ├── api/              # API client functions
│   │   ├── auth/             # Auth utilities
│   │   ├── schemas/          # Zod schemas
│   │   └── validations/      # Validation schemas
│   └── providers/            # React context providers
│       └── query-provider.tsx # React Query provider
```

### Backend Structure (`blog-be/`)
```
blog-be/
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── guards/           # Auth guards
│   │   ├── strategies/       # Passport strategies
│   │   ├── mail/             # Email service
│   │   ├── auth.controller.ts # Auth endpoints
│   │   ├── auth.service.ts   # Auth business logic
│   │   └── auth.module.ts    # Auth module
│   ├── users/                # User management module
│   │   ├── dto/              # User DTOs
│   │   ├── users.controller.ts # User endpoints
│   │   ├── users.service.ts  # User business logic
│   │   └── users.module.ts   # User module
│   ├── posts/                # Post management module
│   │   ├── dto/              # Post DTOs
│   │   ├── entities/         # Post entities
│   │   ├── posts.controller.ts # Post endpoints
│   │   ├── posts.service.ts  # Post business logic
│   │   └── posts.module.ts   # Post module
│   ├── common/               # Shared modules
│   │   ├── config/           # Configuration
│   │   ├── decorators/       # Custom decorators
│   │   ├── guards/           # Shared guards
│   │   ├── pagination/       # Pagination utilities
│   │   ├── prisma/           # Database service
│   │   ├── redis/            # Redis service
│   │   └── utils/            # Utility functions
│   ├── config/               # Configuration files
│   │   ├── auth.config.ts    # Auth configuration
│   │   └── cache.config.ts   # Cache configuration
│   ├── app.module.ts         # Root module
│   └── main.ts               # Application entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding
└── dist/                     # Compiled JavaScript
```

## 🔧 Available Scripts

### Frontend Scripts (`blog/`)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run dev:turbo    # Start with Turbo mode
```

### Backend Scripts (`blog-be/`)
```bash
npm run start:dev           # Start development server
npm run build              # Build for production
npm run start:prod         # Start production server
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate:dev # Run database migrations
npm run prisma:studio      # Open Prisma Studio
npm run prisma:seed        # Seed the database
npm run test               # Run tests
```

## 🔐 Authentication System

### Features
- **JWT Tokens**: Access tokens (15min) and refresh tokens (7 days)
- **Session Management**: Redis-backed sessions with automatic cleanup
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Password Reset**: Secure email-based password reset flow
- **Role-Based Access**: Admin, Staff, and Customer roles

### API Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/me` - Get current user profile

## 📊 Database Schema

### Users Table
- `id` - Unique identifier
- `name` - User's full name
- `email` - Email address (unique)
- `passwordHash` - Hashed password
- `role` - User role (ADMIN, STAFF, CUSTOMER)
- `status` - Account status (ACTIVE, DISABLED)
- `avatarUrl` - Profile picture URL
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Posts Table
- `id` - Unique identifier
- `title` - Post title
- `slug` - URL-friendly slug (unique)
- `content` - Post content (markdown)
- `excerpt` - Post summary
- `coverImage` - Cover image URL
- `authorId` - Author user ID
- `tags` - Array of tags
- `status` - Publication status (draft, published)
- `metaTitle` - SEO title
- `metaDescription` - SEO description
- `openGraphImage` - Social media image
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production:

**Backend (.env)**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/blog_cms"

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600
REDIS_MAX_ITEMS=100

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES=7d

# Auth Configuration
AUTH_SESSION_PREFIX=auth:sess:
AUTH_REFRESH_PREFIX=auth:refresh:
AUTH_RESET_PREFIX=auth:reset:
AUTH_BLOCKED_PREFIX=auth:block:
BCRYPT_SALT_ROUNDS=10
LOGIN_MAX_ATTEMPTS=5
LOGIN_WINDOW_MIN=15
FORGOT_PASSWORD_MAX_ATTEMPTS=5
FORGOT_PASSWORD_WINDOW_MIN=15
RESET_TOKEN_TTL=1800

# Email Configuration (Brevo)
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=your-email@example.com
BREVO_SENDER_NAME=Blog CMS

# App Configuration
APP_ORIGIN=http://localhost:3000
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Production Checklist
- [ ] Set strong JWT secrets
- [ ] Configure Redis with password
- [ ] Set up SSL certificates
- [ ] Configure email service
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up CI/CD pipeline

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [NestJS](https://nestjs.com/) - Node.js framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI components
- [React Query](https://tanstack.com/query) - Data fetching
- [Zod](https://zod.dev/) - Schema validation
