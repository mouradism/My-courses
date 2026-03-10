# My Courses

A full-stack online course platform built with **Next.js**, **Supabase**, and **Stripe**. Users can browse courses, sign up, log in, and purchase access to video content — all powered by a serverless architecture on the free tier.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [API Routes](#api-routes)
- [Pages](#pages)
- [Deployment](#deployment)
- [Roadmap / Known Limitations](#roadmap--known-limitations)

---

## Features

- **Authentication** — Email/password sign-up and login via Supabase Auth
- **Course Listing** — Dynamic course catalogue fetched from Supabase
- **Course Detail** — Embedded YouTube video player per course
- **Payments** — Stripe Checkout integration for one-time course purchases
- **Purchase Webhook** — Stripe webhook records completed purchases in Supabase
- **TypeScript** — End-to-end type safety across pages and API routes

---

## Tech Stack

| Layer | Technology |
|------------|--------------------------------------|
| Framework | [Next.js](https://nextjs.org/) 16 |
| Language | TypeScript 5 |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | [Stripe](https://stripe.com/) Checkout |
| Styling | Inline styles (MVP) |
| Hosting | Vercel (recommended) |

---

## Project Structure

```
my-courses/
├── lib/
│   └── supabaseClient.ts          # Supabase client initialisation
├── pages/
│   ├── _app.tsx                   # Next.js App wrapper
│   ├── index.tsx                  # Home page — course listing
│   ├── auth/
│   │   ├── login.tsx              # Login page
│   │   └── signup.tsx             # Sign-up page
│   ├── course/
│   │   └── [id].tsx               # Dynamic course detail / video player
│   └── api/
│       ├── create-checkout-session.ts  # Stripe Checkout session creator
│       └── webhook.ts             # Stripe webhook handler
├── styles/                        # Global CSS (optional)
├── .env.local.example             # Example environment variables
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Database Schema

Create the following tables in your Supabase project (SQL editor or Table Editor).

### `courses`

| Column | Type | Notes |
|-------------|---------|-------------------------------|
| `id` | uuid | Primary key, default `gen_random_uuid()` |
| `title` | text | Course title |
| `description` | text | Short description |
| `price_cents` | integer | Price in cents (e.g. `1000` = $10.00) |
| `youtube_id` | text | YouTube video ID for embed |

### `purchases`

| Column | Type | Notes |
|---------------------|---------|-------------------------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | References `auth.users.id` |
| `course_id` | uuid | References `courses.id` |
| `stripe_session_id` | text | Stripe Checkout session ID |
| `created_at` | timestamptz | Default `now()` |

> **Row-Level Security (RLS):** Enable RLS on both tables. Allow `SELECT` on `courses` for everyone; restrict `purchases` so users can only read their own rows.

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values.

| Variable | Description |
|--------------------------------------|----------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE` | Supabase service role key (server-side only) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_SITE_URL` | Base URL (e.g. `http://localhost:3000`) |

> **Never** commit `.env.local` to version control. The `.gitignore` already excludes it.

---

## Local Setup

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com) project (free tier is fine)
- A [Stripe](https://stripe.com) account in test mode
- The [Stripe CLI](https://stripe.com/docs/stripe-cli) (for local webhook forwarding)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/mouradism/My-courses.git
   cd My-courses
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and fill in your Supabase and Stripe credentials
   ```

4. **Create database tables**

   Run the SQL from the [Database Schema](#database-schema) section in your Supabase SQL editor, then seed some sample courses.

5. **Forward Stripe webhooks locally**

   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

   Copy the `whsec_...` value printed by the CLI into `STRIPE_WEBHOOK_SECRET` in your `.env.local`.

6. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Routes

### `POST /api/create-checkout-session`

Creates a Stripe Checkout session for a course purchase.

**Request body**

```json
{
  "courseId": "uuid-of-the-course",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel"
}
```

`successUrl` and `cancelUrl` are optional; the API falls back to `NEXT_PUBLIC_SITE_URL/success` and `NEXT_PUBLIC_SITE_URL/cancel` respectively.

**Response**

```json
{ "sessionId": "cs_test_..." }
```

Use the returned `sessionId` with `stripe.redirectToCheckout({ sessionId })` on the client.

---

### `POST /api/webhook`

Handles Stripe webhook events. Listens for `checkout.session.completed` and records the purchase in the `purchases` table.

This route must be registered in the Stripe Dashboard (or via the CLI during development) and requires the raw request body — Next.js `bodyParser` is disabled for this route.

---

## Pages

| Route | Component | Description |
|----------------------|------------|--------------------------------------|
| `/` | `index.tsx` | Lists all available courses |
| `/auth/signup` | `signup.tsx` | Email/password sign-up form |
| `/auth/login` | `login.tsx` | Email/password login form |
| `/course/[id]` | `[id].tsx` | Course detail page with video embed |

---

## Deployment

The recommended deployment target is **Vercel** (zero-config for Next.js).

1. Push the repository to GitHub.
2. Import the project in the [Vercel dashboard](https://vercel.com/new).
3. Add all environment variables from your `.env.local` in the Vercel project settings.
4. Register the production webhook URL (`https://your-domain.vercel.app/api/webhook`) in the Stripe Dashboard under **Developers → Webhooks**.

---

## Roadmap / Known Limitations

- **Server-side auth:** The course page currently fetches data without verifying a Supabase session server-side. Before going to production, add proper JWT/cookie validation in `getServerSideProps` to gate content behind a verified purchase.
- **Dynamic pricing:** The Stripe Checkout session uses a hardcoded `$10.00` placeholder. Replace with a real price lookup from the `courses` table.
- **Access control:** Add a check against the `purchases` table before serving course content.
- **Email confirmation:** Supabase Auth sends a confirmation email by default — ensure your Supabase SMTP settings are configured for production.
- **Styling:** The MVP uses minimal inline styles. Swap in Tailwind CSS, CSS Modules, or a UI library to suit your brand.

