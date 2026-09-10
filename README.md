# RemindUs — Bridging the Therapeutics

RemindUs is an offline-first cognitive maintenance and reminder experience for seniors, caregivers, and families (SIH26003).

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` when configuring optional integrations.
3. Run the app:
   `npm run dev`

The Vite app is served at `http://localhost:3000`.

## Render

Use a Static Site service with:

- Build command: `npm install && npm run build`
- Publish directory: `dist`

The app is a client-side Vite build and does not require a backend start command.
