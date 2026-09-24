# DomusGraph

DomusGraph is a production-shaped MVP for housing transparency: property search, tenant reviews, maintenance issue reporting, landlord/property manager claims, manager intake, contributor dashboards, and an admin research dashboard.

The current product is optimized for one North Star Metric: **Verified Housing Events (VHE)**. Every major screen is designed to collect structured housing data, improve trust, strengthen property relationships, or encourage another contribution.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, and RLS
- Zod validation
- Server Actions
- CSV exports for admin research workflows
- Housing Event Engine for graph-growth analytics
- SEO routes for city, postcode, and neighbourhood discovery
- Notification service abstraction for in-app, email, and future push channels

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
NEXT_PUBLIC_SITE_URL=https://your-domain.com
RESEND_API_KEY=
EMAIL_FROM=DomusGraph <onboarding@resend.dev>
```

`RESEND_API_KEY` is optional — without it, email sends are silently skipped (same graceful-fallback pattern as Supabase). Without a verified sending domain on Resend, sandbox mode can only deliver to the Resend account's own email address.

Run the SQL migrations in order:

1. `supabase/migrations/20260708120000_initial_domusgraph.sql`
2. `supabase/migrations/20260708143000_growth_engine.sql`

## Core Routes

- `/` landing page
- `/search` property search and property profile creation
- `/property/[id]` property profile and timeline
- `/property/[id]/review` review submission
- `/property/[id]/issue` maintenance issue reporting
- `/property/[id]/claim` landlord/property manager claim
- `/property-manager` property manager intake
- `/onboarding` role-based onboarding funnel
- `/contribute/next` post-action contribution loop
- `/dashboard` authenticated contributor dashboard
- `/admin` admin metrics, pending records, and CSV export links
- `/admin/feedback` browse post-action customer discovery answers
- `/city/[city]`, `/postcode/[postcode]`, `/neighbourhood/[slug]` SEO discovery pages
- `/sitemap.xml`, `/robots.txt` generated with Next metadata routes

## Architecture

The app uses Server Components for data-heavy views and Server Actions for structured submissions. Supabase is accessed through:

- `lib/supabase.ts` for server/admin clients and admin allowlist helpers
- `lib/actions.ts` for write flows
- `lib/data.ts` for read models and dashboard aggregation
- `lib/events.ts` for analytics and unified housing event logging
- `lib/growth.ts` for completion, reputation, and trust calculations
- `lib/notifications.ts` for notification infrastructure

## Growth Engine

DomusGraph grows through compounding contribution loops:

- Onboarding captures structured renter, landlord, letting agent, and property manager discovery data.
- Every review, issue, claim, manager signup, feedback answer, and referral can create a `housing_events` row.
- Property pages show Housing Profile Completeness to highlight missing graph signals.
- Post-action pages ask users to leave another signal, invite someone, or answer the feedback prompt.
- Contributor dashboards show housing contributions and reputation points without excessive gamification.
- Admin dashboards track total housing events, verified events, average reviews per property, average events per property, daily growth, top users, and top cities.

## Database Schema

Initial MVP tables:

- `users_profile`
- `properties`
- `reviews`
- `maintenance_issues`
- `property_claims`
- `property_manager_intake`
- `analytics_events`

Growth engine tables:

- `housing_events`: unified event model with timestamp, property, actor type, event type, metadata, and verification flag
- `onboarding_responses`: structured customer discovery by user type
- `feedback_responses`: post-action product discovery answers
- `referrals`: invite links for previous tenants, neighbours, landlords, and property managers
- `notifications`: in-app/email/future push notification infrastructure
- `property_photos`: future trust/completion signal

Growth views:

- `property_summary`
- `housing_events_daily_growth`
- `top_contributing_users`
- `top_growing_cities`

## Housing Graph Concept

The Housing Graph connects:

- properties
- reviews
- maintenance issues
- claims
- landlords and managers
- response and repair outcomes
- referrals and contributor relationships
- verified housing events

The data model deliberately normalizes issue categories, response times, property types, outcomes, actor types, and event types so future AI models can learn from structured graph data instead of only free text.

## Seed Data

`npm run seed:properties -- [council] [count] [--dry-run]` populates real property profiles (address, postcode, city — no reviews) from the government EPC register, so search isn't empty before real users arrive. Defaults to 200 Cambridge addresses. Safe to re-run: skips addresses already in the database. This only ever creates address records, never reviews, issues, or claims — those must come from real people, since fabricating them would violate the platform's own Terms of Service.

## Data and Moderation

Reviews, maintenance issues, claims, and photos default to `pending` and go through the `/admin` moderation queue (approve/reject), which also sets `verification_level` and marks the linked housing event verified. The public RLS policies only expose `approved` reviews/issues and a signed-in user's own records. The app uses a server-side service role client for MVP submissions and admin displays so data collection works with minimal renter friction. Public write actions require sign-in (magic link) and are rate-limited per IP.

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

- Add address normalization and postcode lookup
- Add evidence uploads and verification levels
- Add EPC enrichment and UPRN-backed property identity
- Add HMO/selective licensing and council enforcement data once address identity is solid
- Add moderation actions that mark housing events as verified
- Add production error monitoring
