# Aptitude Connect

Production-ready scaffold for the Multi-Domain Aptitude Test Platform.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy frontend environment variables from `apps/web/.env.example` and fill Firebase project values.
3. Copy backend environment variables from `apps/api/.env.example` and fill API values.
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Project structure

- `apps/web/` — React/Vite frontend app
- `apps/api/` — NestJS backend API
- `functions/` — Firebase Cloud Functions
- `firebase.json` — Firebase Hosting and Functions config
- `firestore.rules` — Firestore security rules template

## Production environment

Set `VITE_API_URL` in the frontend host to the deployed API origin, without `/api`.

Example for Vercel:

```bash
VITE_API_URL=https://aptitude-connect-api.fly.dev
```

Set `FRONTEND_URL` in the API host to every deployed frontend origin that should be allowed by CORS.

Example for Fly:

```bash
FRONTEND_URL=https://your-vercel-app.vercel.app,https://your-custom-domain.com
```
