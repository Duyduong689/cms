import { PrismaClient, Role, UserStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// -------- helpers --------
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const topicPool = [
  'Next.js',
  'NestJS',
  'TypeScript',
  'Prisma',
  'PostgreSQL',
  'Redis',
  'Cloudflare R2',
  'Vercel',
  'Tailwind CSS',
  'React Server Components',
  'Zod',
  'tRPC',
  'JWT Auth',
  'React Query',
  'Docker',
  'Kubernetes',
  'Playwright',
  'Vitest',
  'CI/CD with GitHub Actions',
  'Web Vitals & Core Web Vitals',
  'SEO for Next.js',
  'OpenAPI & Swagger',
  'Stripe payments',
  'File uploads',
  'Caching strategies',
  'WebSockets',
  'BullMQ queues',
  'Rate limiting',
  'Feature flags',
  'S3-compatible storage',
  'Object relational mapping',
  'Image optimization',
  'Serverless functions',
  'Edge runtime',
  'Internationalization (i18n)',
  'RLS with Postgres',
  'Row-level security',
  'PgBouncer',
  'Connection pooling',
  'Database migrations',
  'Indexing & query plans',
  'Shadcn/ui',
  'Lucide icons',
  'Form validation',
  'Accessibility (a11y)',
  'Monorepos with PNPM',
  'Turborepo',
  'Env management',
  'Secrets & config',
  'Observability',
  'Logging with Pino',
  'Tracing with OpenTelemetry',
  'Metrics with Prometheus',
  'Grafana dashboards',
  'Error handling',
  'Background jobs',
  'Email/OTP flows',
  'Testing strategy',
  'E2E tests',
  'Component testing',
  'State management',
  'Zustand',
  'Redux Toolkit',
  'Design systems',
  'Storybook',
  'RSC + Actions',
  'File-based routing',
  'Caching headers',
  'CDN best practices',
  'Workers & KV',
  'Prisma relations',
  'Pagination patterns',
  'Infinite scroll',
  'Search with Postgres',
  'Full-text search',
  'Materialized views',
  'Cron jobs',
  'Scheduling',
  'Security headers',
  'Helmet',
  'CORS',
  'CSRF',
  'OWASP top 10',
  'Performance budgets',
  'Bundle analysis',
  'Code splitting',
  'Dynamic imports',
  'GraphQL with Mercurius',
  'Apollo Client',
  'REST vs GraphQL',
  'API versioning',
  'Idempotency keys',
  'Rate limiters with Redis',
  'Queues & retries',
  'File processing',
  'Video thumbnails',
  'Image sharp',
  'R2 presigned URLs',
  'Multi-tenant apps',
  'RBAC & ABAC',
  'Audit logs',
  'Data seeding',
  'Fixture strategies',
  'CI preview envs'
];

const topicTemplates: Record<string, (title: string) => string> = {
  'Next.js': (title) => `
${title}

Next.js gives you the app router, Server Components, and built-in optimizations.

## Why it matters
- File-based routing
- Data fetching on the server
- Edge/runtime options

## Example
\`\`\`tsx
// app/page.tsx
export default async function Page() {
  const res = await fetch('https://api.example.com/posts', { cache: 'no-store' });
  const posts = await res.json();
  return <main className="prose"><h1>Latest</h1>{posts.map((p:any)=><a key={p.id} href={"/"+p.slug}>{p.title}</a>)}</main>;
}
\`\`\`

## Takeaways
Prefer Server Actions for mutations when possible.
`,

  'NestJS': (title) => `
${title}

NestJS brings DI, modules, and decorators to Node.js.

## Example Controller
\`\`\`ts
import { Controller, Get } from '@nestjs/common';
@Controller('health')
export class HealthController {
  @Get()
  ping() { return { ok: true }; }
}
\`\`\`

## Tip
Keep providers stateless where possible; inject repositories/services instead.
`,

  'TypeScript': (title) => `
${title}

TypeScript adds strong typing and tooling for scalable apps.

## Example
\`\`\`ts
type Result<T> = { ok: true; data: T } | { ok: false; error: string };
function safeJSON<T>(s: string): Result<T> {
  try { return { ok: true, data: JSON.parse(s) as T }; }
  catch (e: any) { return { ok: false, error: e?.message ?? 'parse error' }; }
}
\`\`\`

## Tip
Use \`satisfies\` to ensure object shape without widening types.
`,

  'Prisma': (title) => `
${title}

Prisma provides a type-safe ORM for Node.

## Schema & Query
\`\`\`prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String
  createdAt DateTime @default(now())
}
\`\`\`
\`\`\`ts
const post = await prisma.post.findUnique({ where: { slug }});
\`\`\`
`,

  'PostgreSQL': (title) => `
${title}

Use Postgres for relational data, indexing and FTS.

## FTS Example
\`\`\`sql
CREATE INDEX posts_search_idx ON "Post" USING GIN (to_tsvector('simple', title || ' ' || content));
SELECT id, title FROM "Post"
WHERE to_tsvector('simple', title || ' ' || content) @@ plainto_tsquery('simple', 'nextjs redis');
\`\`\`
`,

  'Redis': (title) => `
${title}

Redis is perfect for caching, queues, and rate limiting.

## Cache Example
\`\`\`ts
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL!);

export async function getCached<T>(key: string, fetcher: () => Promise<T>, ttl = 60) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached) as T;
  const fresh = await fetcher();
  await redis.set(key, JSON.stringify(fresh), 'EX', ttl);
  return fresh;
}
\`\`\`
`,

  'Cloudflare R2': (title) => `
${title}

R2 is S3-compatible object storage with zero egress to Cloudflare.

## Upload with S3 SDK
\`\`\`ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! }
});
await s3.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: 'images/pic.jpg', Body: fileBuffer }));
\`\`\`
`,

  'Tailwind CSS': (title) => `
${title}

Utility-first styling that scales.

## Example
\`\`\`tsx
<button className="px-4 py-2 rounded-2xl shadow hover:shadow-md transition">Click</button>
\`\`\`
`,

  'JWT Auth': (title) => `
${title}

JSON Web Tokens for stateless auth between services.

## Example
\`\`\`ts
import jwt from 'jsonwebtoken';
const token = jwt.sign({ sub: user.id, role: 'user' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
const payload = jwt.verify(token, process.env.JWT_SECRET!);
\`\`\`
`,

  'Docker': (title) => `
${title}

Containerize your app for predictable deployments.

## Example Dockerfile
\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm i --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["pnpm","start"]
\`\`\`
`,

  'Kubernetes': (title) => `
${title}

Run workloads declaratively.

## Deployment
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: registry.example.com/api:latest
          ports: [{ containerPort: 3000 }]
\`\`\`
`,

  'Vercel': (title) => `
${title}

Zero-config deploys for Next.js.

## Tip
Prefer Edge runtime for lightweight, latency-sensitive endpoints.
`,
};

function buildContentFor(title: string) {
  // Pick the first matching topic that has a template, else default to TypeScript
  const topics = Object.keys(topicTemplates);
  const found = topics.find(t => title.toLowerCase().includes(t.toLowerCase()));
  const key = found ?? pick(topics);
  return topicTemplates[key](title);
}

function pickTagsFrom(title: string): string[] {
  const tags = new Set<string>();
  for (const t of topicPool) {
    if (title.toLowerCase().includes(t.toLowerCase())) tags.add(t);
  }
  // ensure a few generic tags
  ['Programming', 'Web Development', 'Backend', 'Frontend', 'DevOps'].forEach((g) => {
    if (tags.size < 4) tags.add(g);
  });
  return Array.from(tags).slice(0, 6);
}

function coverFrom(slug: string) {
  // deterministic, unique, and safe placeholder sources
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/1200/630`;
}

// Generates semi-realistic article titles around your stack
function generateTitle(i: number) {
  const structures = [
    (t: string) => `A Practical Guide to ${t}`,
    (t: string) => `How We Scaled ${t} in Production`,
    (t: string) => `${t}: Best Practices & Pitfalls`,
    (t: string) => `From Zero to Hero with ${t}`,
    (t: string) => `Production-Ready ${t} in 30 Minutes`,
    (t: string) => `What I Wish I Knew About ${t}`,
    (t: string) => `Modern Patterns for ${t}`,
    (t: string) => `Deep Dive: ${t}`,
  ];
  const topic = pick(topicPool);
  const title = pick(structures)(topic);
  // Slightly vary every nth title to avoid complete duplication
  return i % 9 === 0 ? `${title} (${i})` : title;
}

function randomDateWithin(daysBack: number) {
  const now = Date.now();
  const offset = Math.floor(Math.random() * daysBack);
  return new Date(now - offset * 24 * 60 * 60 * 1000);
}

async function main() {
  // Clean slate (adjust if you have relations)
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // ---- base posts (your originals) ----
  const basePosts = [
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
    },
  ];

  // ---- generate 100 additional posts ----
  const seenSlugs = new Set<string>(basePosts.map(p => p.slug));

  const generated: any[] = [];
  for (let i = 0; i < 100; i++) {
    const title = generateTitle(i);
    let slug = slugify(title);
    // ensure unique slug, append index if needed
    let uniqueSlug = slug;
    let n = 2;
    while (seenSlugs.has(uniqueSlug)) {
      uniqueSlug = `${slug}-${n++}`;
    }
    seenSlugs.add(uniqueSlug);

    const createdAt = randomDateWithin(420); // within ~14 months
    const updatedAt = new Date(createdAt.getTime() + Math.floor(Math.random() * 14) * 86400000);
    const status = i % 7 === 0 ? 'draft' : 'published';

    const contentTitle = `# ${title}`;
    const contentBody = buildContentFor(title);

    const excerpt =
      `${title} — practical notes, real examples, and production tips around ${pickTagsFrom(title).slice(0,2).join(' & ')}.`;

    generated.push({
      id: randomUUID(),
      title,
      slug: uniqueSlug,
      content: `${contentTitle}\n${contentBody}`,
      excerpt,
      coverImage: coverFrom(uniqueSlug),
      tags: pickTagsFrom(title),
      status,
      metaTitle: `${title} — Hands-on Guide`,
      metaDescription: excerpt,
      openGraphImage: coverFrom(uniqueSlug),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  }

  const posts = [...basePosts, ...generated];

  // Insert efficiently. If your Prisma version supports createMany for JSON/string arrays, use it.
  // Fallback to per-row create if your model has constraints that block createMany.
  await prisma.post.createMany({
    data: posts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      excerpt: p.excerpt,
      coverImage: p.coverImage ?? null,
      tags: p.tags as any, // adjust if tags is Json[]/string[]
      status: p.status,
      metaTitle: p.metaTitle ?? null,
      metaDescription: p.metaDescription ?? null,
      openGraphImage: p.openGraphImage ?? null,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    })),
    skipDuplicates: true, // safety for slugs/ids if you re-run
  });

  // ---- seed users ----
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  
  const users = [
    {
      id: randomUUID(),
      name: 'Admin User',
      email: 'admin@example.com',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      avatarUrl: 'https://example.com/avatars/admin.jpg',
      passwordHash: await bcrypt.hash('AdminPass123!', saltRounds),
    },
    {
      id: randomUUID(),
      name: 'Staff Member',
      email: 'staff@example.com',
      role: Role.STAFF,
      status: UserStatus.ACTIVE,
      avatarUrl: 'https://example.com/avatars/staff.jpg',
      passwordHash: await bcrypt.hash('StaffPass123!', saltRounds),
    },
    {
      id: randomUUID(),
      name: 'John Customer',
      email: 'customer@example.com',
      role: Role.CUSTOMER,
      status: UserStatus.DISABLED,
      avatarUrl: 'https://example.com/avatars/customer.jpg',
      passwordHash: await bcrypt.hash('CustomerPass123!', saltRounds),
    },
  ];

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`Seeded ${posts.length} posts and ${users.length} users`);
  console.log('User credentials:');
  console.log('- Admin: admin@example.com / AdminPass123!');
  console.log('- Staff: staff@example.com / StaffPass123!');
  console.log('- Customer: customer@example.com / CustomerPass123!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
