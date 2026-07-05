# ProjectHub

A modern, production-quality project management platform built with Next.js, NestJS, and PostgreSQL.

## Tech Stack

| Layer    | Technology                                                                |
| -------- | ------------------------------------------------------------------------- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend  | NestJS, Prisma, PostgreSQL (Neon)                                         |
| Monorepo | TurboRepo, pnpm workspaces                                                |
| Auth     | JWT, Refresh Token Rotation, Google OAuth, GitHub OAuth                   |
| Realtime | Socket.IO                                                                 |

## Project Structure

```
apps/
  web/          # Next.js frontend
  api/          # NestJS backend
packages/
  ui/           # Shared UI components
  types/        # Shared TypeScript types
  config/       # Shared ESLint, Prettier, TS configs
  utils/        # Shared utility functions
```

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- A [Neon](https://neon.tech) PostgreSQL database

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Fill in your values in both files

# Generate Prisma client
pnpm --filter @projecthub/api prisma:generate

# Run database migrations
pnpm --filter @projecthub/api prisma:migrate

# Start development servers
pnpm dev
```

### Development URLs

| Service       | URL                            |
| ------------- | ------------------------------ |
| Frontend      | http://localhost:3000          |
| Backend API   | http://localhost:4000/api/v1   |
| Swagger Docs  | http://localhost:4000/api/docs |
| Prisma Studio | http://localhost:5555          |

### Available Commands

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps
pnpm lint         # Lint all packages
pnpm type-check   # Type check all packages
pnpm format       # Format all files with Prettier
```

## CI/CD

GitHub Actions runs type checking, linting, and tests on every push and pull request to `main` and `develop`.

## Deployment

### API (Railway / Render / Fly.io)

1. Set all environment variables from `apps/api/.env.example`
2. Set `NODE_ENV=production`
3. Set `FRONTEND_URL` to your frontend's domain
4. Generate JWT secrets: `openssl rand -base64 64`
5. Build command: `pnpm --filter @projecthub/api build`
6. Start command: `node apps/api/dist/main`
7. Run migrations before deploying: `pnpm --filter @projecthub/api prisma:migrate`

### Web (Vercel)

1. Set `NEXT_PUBLIC_API_URL` to your API's domain (e.g. `https://api.yourdomain.com`)
2. Framework preset: Next.js
3. Root directory: `apps/web`
4. Build command: `cd ../.. && pnpm build --filter=@projecthub/web`
5. Install command: `pnpm install --frozen-lockfile`

### Production checklist

- [ ] `DATABASE_URL` points to Neon pooled connection
- [ ] `DIRECT_URL` points to Neon direct connection
- [ ] `JWT_SECRET` is a random 64-byte base64 string
- [ ] `JWT_REFRESH_SECRET` is a different random 64-byte base64 string
- [ ] `FRONTEND_URL` matches the exact origin of the deployed frontend
- [ ] `NEXT_PUBLIC_API_URL` matches the exact origin of the deployed API
- [ ] `NODE_ENV=production` on the API server
