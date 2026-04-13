# WishNest

WishNest is a full-stack wishlist app built with React, Vite, Express, and MongoDB. Users can create wishlists, add items, share public links, browse shared lists, and manage account preferences.

## Tech Stack

- Frontend: React 19, Vite, React Router, Axios
- Backend: Express 5, Mongoose, Passport, JWT
- Database: MongoDB
- Auth: Email/password, guest access, optional Google OAuth

## Before You Start

This project is not a frontend-only demo. Wishlist data, auth, notifications, and sharing all depend on the API server and MongoDB.

You need:

- Node.js 20+
- npm
- A MongoDB database connection string

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in the required values

Required variables:

```env
VITE_API_URL=/api
FRONTEND_URL=http://localhost:5173
PORT=5001
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=replace-with-a-long-random-secret
```

Optional Google OAuth variables:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

If Google OAuth is not configured, the app will still run with email/password and guest login.

## Install

```bash
npm install
```

## Local Development

Run frontend and backend together:

```bash
npm run dev
```

This starts:

- Vite frontend on `http://localhost:5173`
- Express API on `http://localhost:5001`

Useful individual commands:

```bash
npm run dev:web
npm run dev:api
```

## Quality Checks

Lint:

```bash
npm run lint
```

Build frontend:

```bash
npm run build
```

Preview production frontend build:

```bash
npm run preview
```

Run the API in non-watch mode:

```bash
npm run start:api
```

## Deployment Notes

The frontend and backend can be deployed separately.

### Frontend

- Build with `npm run build`
- Deploy the `dist/` folder to your static host
- Set `VITE_API_URL` to your backend origin or keep `/api` if your host reverse-proxies API requests

Examples:

- Same domain with reverse proxy: `VITE_API_URL=/api`
- Separate backend domain: `VITE_API_URL=https://api.yourdomain.com/api`

### Backend

- Deploy `server/index.js` as a Node service
- Set `NODE_ENV=production`
- Set `FRONTEND_URL` to your deployed frontend URL
- Provide `MONGO_URI` and `JWT_SECRET`

In production, CORS is restricted to `FRONTEND_URL`.

## Current App Behavior

- Wishlists, items, and notifications are stored in MongoDB
- Auth tokens are stored in local storage
- Guest login creates a guest user record in MongoDB
- Public wishlist viewing works through `/wishlist/:id`

## Launch Checklist

Before publishing, verify:

1. `npm run lint` passes
2. `npm run build` passes
3. MongoDB connection works in the target environment
4. Register, login, guest login, wishlist create, item add, share link, and settings update all work against the deployed API
5. `FRONTEND_URL`, `VITE_API_URL`, and OAuth callback URLs match your deployed domains

## Known Limitations

- There is no offline/local-storage-only wishlist mode
- Google OAuth requires real Google Cloud credentials
- The app currently has no automated test suite
