import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // First, clean up existing data
  await prisma.post.deleteMany();

  // Sample blog posts data
  const posts = [
    {
      id: randomUUID(),
      title: 'Getting Started with NestJS',
      slug: 'getting-started-with-nestjs',
      content: `NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications. In this post, we'll explore the basics of NestJS and how to get started with your first application.

## What is NestJS?

NestJS is a framework for building efficient, scalable Node.js server-side applications. It uses progressive JavaScript and is built with TypeScript.

## Key Features

1. Dependency Injection
2. Modular Architecture
3. TypeScript Support
4. REST API Support
5. GraphQL Support
6. WebSocket Support

## Getting Started

To get started with NestJS, you'll need Node.js installed on your machine. Then you can create a new project using:

\`\`\`bash
npm i -g @nestjs/cli
nest new my-nest-project
\`\`\``,
      excerpt: 'Learn the basics of NestJS and how to create your first application with this powerful Node.js framework.',
      coverImage: 'https://example.com/images/nestjs-cover.jpg',
      tags: ['NestJS', 'TypeScript', 'Backend', 'Programming'],
      status: 'published',
      metaTitle: 'Getting Started with NestJS - A Comprehensive Guide',
      metaDescription: 'Learn how to build scalable server-side applications with NestJS, including setup, key features, and basic concepts.',
      openGraphImage: 'https://example.com/images/nestjs-og.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      title: 'Understanding TypeScript Decorators',
      slug: 'understanding-typescript-decorators',
      content: `Decorators are a powerful feature in TypeScript that allows you to add metadata and modify the behavior of your code. Let's dive deep into how they work and when to use them.

## What are Decorators?

Decorators are special kinds of declarations that can be attached to class declarations, methods, properties, or parameters. They use the form @expression, where expression must evaluate to a function.

## Types of Decorators

1. Class Decorators
2. Method Decorators
3. Property Decorators
4. Parameter Decorators

## Common Use Cases

- Dependency Injection
- Validation
- Logging
- Access Control
- Route Definition

## Example

\`\`\`typescript
function log(target: any, propertyKey: string) {
  console.log(\`Accessing property: \${propertyKey}\`);
}

class Example {
  @log
  name: string;
}
\`\`\``,
      excerpt: 'Explore TypeScript decorators and learn how to use them effectively in your applications.',
      tags: ['TypeScript', 'Decorators', 'Programming', 'JavaScript'],
      status: 'published',
      metaTitle: 'TypeScript Decorators Explained',
      metaDescription: 'A comprehensive guide to understanding and implementing TypeScript decorators in your applications.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      title: 'Building a Blog with Next.js and Tailwind CSS',
      slug: 'building-blog-nextjs-tailwind',
      content: `Learn how to create a modern blog using Next.js and Tailwind CSS. We'll cover everything from setup to deployment.

## Tech Stack

- Next.js for the frontend
- Tailwind CSS for styling
- Markdown for content
- Vercel for deployment

## Features We'll Build

1. Responsive Layout
2. Dark Mode Support
3. SEO Optimization
4. Dynamic Routing
5. Static Site Generation

## Getting Started

First, create a new Next.js project:

\`\`\`bash
npx create-next-app@latest my-blog --typescript --tailwind
cd my-blog
\`\`\``,
      excerpt: 'Create a modern blog using Next.js and Tailwind CSS with features like dark mode, SEO optimization, and more.',
      coverImage: 'https://example.com/images/nextjs-blog.jpg',
      tags: ['Next.js', 'Tailwind CSS', 'React', 'Web Development'],
      status: 'draft',
      metaTitle: 'Create a Modern Blog with Next.js and Tailwind CSS',
      metaDescription: 'Step-by-step guide to building a feature-rich blog using Next.js and Tailwind CSS.',
      openGraphImage: 'https://example.com/images/nextjs-blog-og.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  // Insert the sample posts
  for (const post of posts) {
    await prisma.post.create({
      data: post
    });
  }

  console.log('Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
