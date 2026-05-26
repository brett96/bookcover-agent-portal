## BookCover Agent Portal Demo

Next.js (App Router) site that hosts the interactive `BookCover_Admin_Demo_v57.html` mockup and wraps it with a protected admin portal, ready to deploy to Vercel.

## Getting Started

1. Copy `.env.example` → `.env.local` and fill in values:

- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

2. Install and run the dev server:

```bash
npm install
npm run dev
```

Open:

- `/` marketing entry
- `/demo` public demo (embedded mockup)
- `/login` admin sign-in
- `/admin` protected dashboard
- `/admin/demo` protected demo

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deploy on Vercel

Set these environment variables in Vercel (Production at minimum), then deploy:

- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

