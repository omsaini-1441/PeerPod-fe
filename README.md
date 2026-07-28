# PeerPod Frontend

PeerPod frontend is a separate Next.js App Router app that talks to the PeerPod backend.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Socket.IO client

## Features in this repo

- Register and login flows
- Pod list with create and join actions
- Pod detail page with:
  - leaderboard
  - pod-linked tasks
  - focus session start/stop
  - members list
  - live leaderboard/session updates
- Profile page

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy env values from `.env.example`.

3. Start the app:

```bash
npm run dev
```

By default the app expects the backend at `http://localhost:3001`.

## Backend contract

This app was built against the backend docs in the backend repo:

- `docs/API_CONTRACT.md`
- `docs/PRODUCT_AND_STACK.md`
- `docs/SYSTEM_DESIGN.md`

## Frontend-local docs

This repo also keeps its own context docs in:

- `docs/README.md`
- `docs/OVERVIEW.md`
- `docs/FRONTEND_ARCHITECTURE.md`
- `docs/IMPLEMENTATION_NOTES.md`
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
