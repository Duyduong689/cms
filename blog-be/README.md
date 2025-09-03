# Blog CMS Backend API

This is the backend API for the Blog CMS built with NestJS, Prisma, and PostgreSQL.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate
```

## Database Setup

1. Make sure you have PostgreSQL running
2. Update the `.env` file with your database connection string
3. Run migrations to create the database schema:

```bash
npm run prisma:migrate:dev
```

## Running the API

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:

```
http://localhost:3001/api
```

## API Endpoints

### Posts

- `GET /posts` - Get all posts with pagination and filtering
- `GET /posts/:id` - Get a post by ID
- `POST /posts` - Create a new post
- `PUT /posts/:id` - Update a post
- `DELETE /posts/:id` - Delete a post

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/cms_blog?schema=public"
PORT=3001
```
