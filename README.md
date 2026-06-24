## BookCover Agent Portal Demo

Next.js (App Router) site that hosts the interactive agent portal mockup, with a JWT-gated public demo and a separate admin portal.

## Getting Started

1. Copy `.env.example` → `.env.local` and fill in values.

2. Install and run the dev server:

```bash
npm install
npm run dev
```

Open:

- `/` → redirects to `/demo`
- `/demo` public demo (embedded mockup; gated in production)
- `/login` admin sign-in
- `/admin` protected dashboard (next-auth, separate from demo JWT)

## Demo gate (shared with landing + member demo)

Landing signs `__bc_demo_jwt` (HS256, `DEMO_JWT_SECRET`) and launches via:

`https://bcagentportaldemo.cercalabs.com/api/demo-auth/handoff?bc_handoff=<JWT>&dest=/demo`

The handoff API verifies the JWT, sets the shared cookie on `.cercalabs.com`, and redirects to `/demo`. `proxy.ts` gates `/`, `/demo`, and `/demo/*`; `/admin` and `/api/*` are excluded.

### Vercel environment variables (Production)

| Variable | Value |
|----------|-------|
| `DEMO_JWT_SECRET` | Identical to landing + member demo |
| `NEXT_PUBLIC_LANDING_URL` | `https://bookcover.cercalabs.com` |
| `NEXT_PUBLIC_AGENT_DEMO_URL` | `https://bcagentportaldemo.cercalabs.com` (optional) |
| `AUTH_SECRET` | Admin session secret |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |

No Firebase or SMTP vars are required for the demo gate on this project.

### Analytics (`usageEvents`)

This deployment records events with `product: agent-demo` and `site: agent`.

| Variable | Purpose |
|----------|---------|
| `FIREBASE_SERVICE_ACCOUNT` | Shared JSON credentials — writes to Firestore `usageEvents` |
| `NEXT_PUBLIC_ANALYTICS_PRODUCT` | Client product slug (`agent-demo`) |
| `DATABASE_URL` | Optional Postgres fallback when Firebase is unset |

Tracking is loaded via `/analytics.js` on `/demo` and inside the embedded mock (`/demo/index.html`). Events are POSTed to `/api/track` (CORS-enabled) and optionally forwarded to `bookcover.cercalabs.com/api/track`.

Use the canonical admin at `https://bookcover.cercalabs.com/admin` for cross-product filters, or `/admin/analytics` on this host with the same `FIREBASE_SERVICE_ACCOUNT`.

Rebuild screen data after editing the monolith source:

```bash
npm run build:demo
```

## Deploy on Vercel

Set the env vars above, then deploy. Build output should include `ƒ /api/demo-auth/handoff`. Preview `*.vercel.app` hosts redirect to `bcagentportaldemo.cercalabs.com` via `vercel.json`.
