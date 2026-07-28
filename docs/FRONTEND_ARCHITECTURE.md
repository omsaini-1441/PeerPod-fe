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

For MVP, the frontend uses the current backend contract directly:

- login returns a bearer token
- the token is stored client-side
- API calls attach `Authorization: Bearer <token>`
- Socket.IO connects with the same token

This is intentionally simple so frontend progress is not blocked by a backend cookie/session rewrite.

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
