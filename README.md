# Blog CMS Platform

A modern, full-stack blog content management system built with Next.js, NestJS, PostgreSQL, and Redis.

## 🚀 Features

- **Modern Stack**: Next.js 15 frontend with NestJS backend
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for high-performance caching
- **UI Components**: Comprehensive UI kit built with Radix UI and TailwindCSS
- **Type Safety**: Full TypeScript support across frontend and backend
- **Data Fetching**: React Query for efficient data management
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Secure user authentication system
- **Real-time Updates**: Modern real-time features
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA-compliant components

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- Docker (optional, for containerization)

## 🛠️ Tech Stack

### Frontend (blog/)
- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Radix UI Components
- React Query
- React Hook Form
- Zod Validation
- Axios

### Backend (blog-be/)
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- Class Validator
- Swagger/OpenAPI

## 🚦 Getting Started

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd blog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with required environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   For Turbo mode:
   ```bash
   npm run dev:turbo
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd blog-be
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/blog"
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. Run database migrations:
   ```bash
   npm run prisma:migrate:dev
   ```

5. Seed the database (optional):
   ```bash
   npm run prisma:seed
   ```

6. Start the development server:
   ```bash
   npm run start:dev
   ```

## 📁 Project Structure

### Frontend Structure
```
blog/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # Reusable components
│   │   ├── app/      # Application-specific components
│   │   ├── layout/   # Layout components
│   │   └── ui/       # UI components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions and configurations
│   └── providers/    # React context providers
```

### Backend Structure
```
blog-be/
├── src/
│   ├── common/       # Shared modules and utilities
│   │   ├── config/   # Configuration
│   │   ├── prisma/   # Prisma service
│   │   └── redis/    # Redis service
│   └── posts/        # Feature modules
│       ├── dto/      # Data Transfer Objects
│       └── entities/ # Database entities
```

## 🔧 Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend Scripts
- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate:dev` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run test` - Run tests

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
