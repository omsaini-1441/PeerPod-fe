# PeerPod Frontend Overview

## What PeerPod is

PeerPod is a social productivity app built around **pods**: small groups of friends, classmates, or coworkers who keep each other accountable.

The core product loop is:

1. Join or create a pod
2. Add tasks that count toward that pod
3. Start a focus session
4. Earn points from real work
5. Watch the pod leaderboard move

The product is intentionally not trying to become an over-gamified productivity carnival. The value comes from:

- visible effort
- live pod competition
- honest scoring
- lightweight accountability

## What this frontend repo is responsible for

This repo is responsible for the user-facing experience:

- authentication screens
- pod discovery and creation
- pod detail view
- tasks UI
- focus timer UI
- leaderboard rendering
- websocket-driven live updates
- profile/settings view

## What the backend repo is responsible for

The backend repo owns:

- auth
- users
- groups/pods
- tasks
- sessions
- points
- Redis-backed leaderboards
- Socket.IO events

The frontend should treat the backend as the source of truth for scoring, membership, and session validity.

## Current backend assumptions

At the time this frontend was built, the backend contract works like this:

- backend base URL defaults to `http://localhost:3001`
- auth uses `Authorization: Bearer <token>`
- pod routes still use the backend word `groups`
- live updates use Socket.IO
- leaderboard endpoint is `GET /groups/:id/leaderboard`

## Naming note

In the UI, use the word **pod**.

In the backend API, routes still use **group**.

Examples:

- UI label: `Create pod`
- API route: `POST /groups`

This translation is intentional for now.
