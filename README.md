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

GitHub Actions runs type checking, linting, tests, and build verification on every push and pull request to `main` and `develop`.

## Deployment

The API deploys to **Render** (free tier, persistent Node.js process). The frontend deploys to **Vercel**.

### Prerequisites

- [Render](https://render.com) account (free)
- [Vercel](https://vercel.com) account (free)
- Neon database (already set up)

### 1. Run migrations before first deploy

```bash
cd apps/api
# Use the direct (unpooled) URL for migrations
DATABASE_URL="<your-neon-direct-url>" pnpm migrate:deploy
```

### 2. Deploy the API to Render

**Option A — render.yaml (recommended)**

1. Push your code to GitHub
2. Go to Render → New → Blueprint → connect your repo
3. Render reads `render.yaml` automatically
4. Set the secret env vars in the Render dashboard:
   - `DATABASE_URL` — Neon pooled connection string
   - `DIRECT_URL` — Neon direct connection string
   - `JWT_SECRET` — `openssl rand -base64 64`
   - `JWT_REFRESH_SECRET` — `openssl rand -base64 64` (different value)
   - `FRONTEND_URL` — your Vercel web URL (set after deploying web)

**Option B — manual**

1. Render → New Web Service → connect your repo
2. Build command: `pnpm install --frozen-lockfile && pnpm --filter @projecthub/api prisma:generate && pnpm --filter @projecthub/api build`
3. Start command: `node apps/api/dist/main`
4. Set the same env vars as above

### 3. Deploy the Web to Vercel

1. Vercel → New Project → Import your GitHub repo
2. **Root Directory:** `apps/web`
3. Framework preset: **Next.js** (auto-detected)
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` — your Render API URL (e.g. `https://projecthub-api.onrender.com`)
5. Deploy

### 4. Update FRONTEND_URL on Render

Once Vercel gives you a URL, update `FRONTEND_URL` in Render's environment variables to your Vercel URL, then redeploy.

### Production checklist

- [ ] `DATABASE_URL` points to Neon pooled connection
- [ ] `DIRECT_URL` points to Neon direct connection
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are unique random 64-byte base64 strings
- [ ] `FRONTEND_URL` on Render matches the exact Vercel origin
- [ ] `NEXT_PUBLIC_API_URL` on Vercel matches the exact Render origin
- [ ] `GET https://your-api.onrender.com/api/health` returns `{ "status": "ok" }`
- [ ] CORS is not blocking requests in browser console

### Free tier note

Render's free tier **spins down after 15 minutes of inactivity**. The first request after a spin-down takes ~30 seconds while the service wakes up. This is expected behavior on the free tier — paid plans keep the service always-on.
