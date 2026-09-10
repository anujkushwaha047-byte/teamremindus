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

## Production and Render

The production build is served by the lightweight `serve` package:

- Build command: `npm install; npm run build`
- Start command: `npm start`
- Published directory: `dist`

The client-side Vite fallback keeps `/dashboard` available after a refresh.

### Demo authentication

RemindUs includes a clearly labelled local development flow so judges can explore the product without an external provider. Choose **Demo Login**, or enter a Gmail address and Indian mobile number and use the displayed development OTP `123456`. No SMS or email is sent, and this flow does not use production secrets.
