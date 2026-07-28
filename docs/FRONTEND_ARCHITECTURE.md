# PeerPod Frontend Architecture

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Socket.IO client

## App shape

The frontend is intentionally lightweight.

Main areas:

- `app/` for pages
- `components/` for shared UI and providers
- `hooks/` for auth and page behavior
- `lib/` for API client, auth storage, env config, socket wiring, and shared types

## Routing

Current pages:

- `/` landing page
- `/login`
- `/register`
- `/pods`
- `/pods/[id]`
- `/profile`

## Auth model

The frontend uses a same-origin BFF auth pattern:

- login happens via `POST /api/auth/login`
- the backend bearer token is stored in an **httpOnly**, **SameSite=Lax** cookie
- the browser never keeps the access token in `localStorage`
- authenticated REST calls go through `/api/backend/*`, which attaches `Authorization` server-side
- middleware blocks unauthenticated access to `/pods` and `/profile`
- Socket.IO connects to the **same frontend origin** and is rewritten to the backend (`/socket.io` → `API_BASE_URL`), so the browser does not hit a cross-origin socket URL
- a short-lived in-memory token from `GET /api/auth/socket-token` is still used for Socket.IO auth until the backend accepts cookie auth on websockets

Do not put access tokens in query strings, localStorage, or client logs.

## Environment

See [`.env.example`](../.env.example):

- `API_BASE_URL` — server-only backend base used by the BFF and socket rewrite
- `ALLOWED_ORIGINS` — extra browser origins for CSRF checks (LAN IPs, etc.)
- `NEXT_PUBLIC_SOCKET_URL` — leave unset unless you intentionally want direct cross-origin sockets


## Data flow

### REST

REST is used for:

- register/login
- profile load/update
- pods list/create/join/leave
- members list
- tasks create/update
- session start/stop
- initial leaderboard fetch

### Realtime

Socket.IO is used on the pod page for:

- `session.started`
- `session.stopped`
- `leaderboard.updated`

The frontend joins pod-specific rooms using the current pod id.

## Page responsibilities

### `/pods`

- load visible pods
- create pod
- join public/private pod
- navigate into a pod

### `/pods/[id]`

This is the main product page.

It should show:

- pod identity
- leaderboard
- members
- pod-linked tasks
- active focus session state
- start/stop controls
- small streak/momentum signals

## Product design stance

The frontend should feel:

- competitive
- focused
- dark-friendly
- energetic without becoming noisy

Avoid:

- badge spam
- fake reward-shop energy
- dashboard clutter
- too many unrelated widgets

## Backend translation layer

The frontend should continue to translate backend terms carefully:

- backend `groups` -> frontend `pods`
- backend session/leaderboard payloads -> frontend display components

This translation belongs in the UI copy and API wrapper layer, not scattered everywhere.
