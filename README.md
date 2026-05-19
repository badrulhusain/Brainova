# Aptitude Connect

Production-ready scaffold for the Multi-Domain Aptitude Test Platform.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables from `.env.example` and fill Firebase project values.
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Project structure

- `src/` — React app code
- `functions/` — Firebase Cloud Functions
- `firebase.json` — Firebase Hosting and Functions config
- `firestore.rules` — Firestore security rules template
