# WishNest 🎁

WishNest is a full-stack wishlist application built with React 19, Vite, and Vercel Serverless Functions powered by Supabase (PostgreSQL). Users can create wishlists, manage registry items, share public links with loved ones, browse gift ideas, and set preferences.

## Tech Stack

- **Frontend**: React 19, Vite, React Router v7, Axios, Lucide React
- **Backend**: Vercel Serverless Functions (`/api/*.js`)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Auth**: HttpOnly, Secure, SameSite=Lax JWT Cookies, Bcrypt password hashing, optional Google OAuth 2.0
- **Rate Limiting**: Upstash Redis REST API sliding-window rate limiting for authentication endpoints
- **Deployment**: Vercel Serverless Platform

---

## Environment Setup

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Fill in your environment variables:

```env
VITE_API_URL=/api

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Auth
JWT_SECRET=your-secret-jwt-key

# Persistent Rate Limiting (Optional in local dev, recommended in production)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Optional Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

---

## Installation & Local Development

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
# or
npm run dev:web
```

Run frontend & Vercel API functions locally:

```bash
npm run dev:api
```

---

## Quality Checks & Build Commands

Run ESLint across frontend and API handlers:

```bash
npm run lint
```

Build production bundle:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## Database & Security Architecture

### Row Level Security (RLS)
Database access is handled through serverless functions in `/api/*.js` using the Supabase Service Role Key. For defense-in-depth, RLS policies are available in `supabase_rls.sql`.

### Cookie Authentication
Authentication tokens are issued as HttpOnly, Secure cookies via `/api/auth/login` and `/api/auth/register`, eliminating XSS token theft risks associated with localStorage storage.
