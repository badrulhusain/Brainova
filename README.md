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
