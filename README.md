# my-courses (MVP starter)

This is a small Next.js + Supabase starter scaffold for the free-tier MVP. It includes:

- Supabase client wrapper (`lib/supabaseClient.ts`)
- Basic signup/login pages (`pages/auth/signup.tsx`, `pages/auth/login.tsx`)
- Course listing (`pages/index.tsx`) and a course page (`pages/course/[id].tsx`)
- Skeleton API routes for Stripe Checkout and webhook (`pages/api/*`)

Setup (local)

1. Install dependencies
```powershell
cd my-courses
npm install
```

2. Create a `.env.local` with the following keys (use Supabase and Stripe test values):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Run locally
```powershell
npm run dev
```

Notes
- The project is a minimal scaffold for MVP validation. Replace placeholder pricing and add proper server-side auth checks before production.
