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

GitHub Actions runs type checking and linting on every push and pull request to `main` and `develop`.
