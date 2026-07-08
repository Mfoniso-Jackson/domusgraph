# DomusGraph

DomusGraph is a production-shaped MVP for housing transparency: property search, tenant reviews, maintenance issue reporting, landlord/property manager claims, manager intake, contributor dashboards, and an admin research dashboard.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, and RLS
- Zod validation
- Server Actions
- CSV exports for admin research workflows

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add Supabase values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=founder@example.com,ops@example.com
```

Run the SQL migration in `supabase/migrations/20260708120000_initial_domusgraph.sql` against your Supabase project.

## Core Routes

- `/` landing page
- `/search` property search and property profile creation
- `/property/[id]` property profile and timeline
- `/property/[id]/review` review submission
- `/property/[id]/issue` maintenance issue reporting
- `/property/[id]/claim` landlord/property manager claim
- `/property-manager` property manager intake
- `/dashboard` authenticated contributor dashboard
- `/admin` admin metrics, pending records, and CSV export links

## Data and Moderation

Reviews and maintenance issues default to `pending`. The public RLS policies only expose `approved` reviews/issues and a signed-in user's own records. The app uses a server-side service role client for MVP submissions and admin displays so data collection works with minimal renter friction. Before a public launch with open traffic, add rate limiting, spam checks, and explicit moderation controls.

The admin dashboard is protected by Supabase Auth plus the `ADMIN_EMAILS` allowlist. It shows recent pending records and exports CSV files for:

- properties
- reviews
- maintenance issues
- property claims
- property manager intake responses

## Structured Signals

The MVP prioritizes structured data needed for future housing graph intelligence:

- ratings across maintenance, communication, condition, deposit fairness, and safety
- issue type, severity, response time, status, and actual fix outcome
- would-rent-again answer
- landlord portfolio size and maintenance workflow
- manager units managed and operational challenges

## Next Iteration

- Add Supabase Auth UI and magic-link sign-in pages
- Add approve/reject moderation controls in `/admin`
- Add address normalization and postcode lookup
- Add evidence uploads and verification levels
- Add rate limiting and abuse prevention to server actions
