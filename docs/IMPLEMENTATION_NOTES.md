# PeerPod Frontend Implementation Notes

## What is already built

- separate frontend repo scaffolded in `peerpod-frontend`
- own git remote configured
- auth provider using bearer-token flow
- landing page
- login page
- register page
- pods listing page
- pod detail page
- profile page
- Socket.IO client wiring
- env example and README

## Current intended direction

The frontend is being built as a clean MVP shell around the existing backend.

Current priorities:

1. Make the pod page feel strong
2. Keep the timer + tasks + leaderboard loop tight
3. Avoid unnecessary frontend complexity
4. Preserve enough backend context in this repo to keep building quickly

## What likely comes next

- better loading and empty states
- clearer join/create success feedback
- improve task filtering and layout
- add small session history and personal stats widgets
- tighten mobile responsiveness
- refine the visual language so it feels sharper in demos

## Known backend realities this frontend should remember

- backend still uses `groups` in routes
- auth is still bearer-token based
- leaderboard truth comes from backend scoring
- live data comes from Socket.IO
- email verification exists but real mail delivery may still be incomplete

## Working rule for future frontend changes

If a feature does not make the pod loop better:

- join pod
- add task
- start focus session
- earn points
- see rank move

then it probably should not be added yet.
