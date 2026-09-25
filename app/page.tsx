import Link from "next/link";
import { Building2, ClipboardCheck, Hammer, KeyRound, MessageSquare, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/ui";
import { PropertyCard } from "@/components/property-card";
import { getFeaturedProperties, getPlatformStats } from "@/lib/data";

const graphItems = [
  ["Properties", Building2, "Every address gets one permanent profile — not a new listing each time it's re-rented."],
  ["Reviews", MessageSquare, "Structured tenant experiences tied to a verified account, not anonymous noise."],
  ["Maintenance Issues", Hammer, "What broke, how fast it got fixed, and whether it stayed fixed."],
  ["Landlords", KeyRound, "Owners and managers can claim a property and respond directly."],
  ["Outcomes", ClipboardCheck, "Deposit returned, dispute resolved, would-rent-again — what a listing photo can't show you."]
] as const;

const audiences = [
  {
    role: "Renters",
    tagline: "Know before you sign.",
    body: "Search a Cambridge address, see its real history, and add your own experience when you move on.",
    action: "Search a property",
    href: "/search"
  },
  {
    role: "Landlords",
    tagline: "Build trust while operating your properties better.",
    body: "Claim your property, respond to reports, and show prospective tenants a verified track record.",
    action: "Find & claim your property",
    href: "/search"
  },
  {
    role: "Property Managers",
    tagline: "Turn housing operations into actionable intelligence.",
    body: "Tell us how your portfolio runs today and help shape maintenance and reporting tools built for professional teams.",
    action: "Property manager intake",
    href: "/property-manager"
  }
] as const;

export default async function HomePage() {
  const [stats, featured] = await Promise.all([getPlatformStats(), getFeaturedProperties("Cambridge", 3)]);
  const hasData = stats.properties > 0;

  return (
    <PageShell>
      <section className="grid gap-10 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-signal">
            Housing intelligence
            <span className="rounded-full bg-signal/10 px-2 py-0.5 text-xs font-semibold normal-case text-signal">Now in Cambridge</span>
          </p>
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-ink sm:text-6xl">Know the home before you rent it.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate">
            DomusGraph is building a structured record of every rental property in Cambridge — history, landlord responsiveness, and hidden issues, before you sign a tenancy.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/search" className="button-primary">Search a property</Link>
            <Link href="/search" className="button-secondary">Review a property</Link>
            <Link href="/search" className="button-secondary">Claim a property</Link>
            <Link href="/onboarding" className="button-secondary">Start onboarding</Link>
          </div>
        </div>
        <div className="rounded-lg border border-slate/15 bg-surface p-6 shadow-soft">
          <div className="flex items-center gap-3 border-b border-slate/10 pb-4">
            <ShieldCheck className="h-8 w-8 text-signal" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-ink">{hasData ? "Cambridge housing graph snapshot" : "Just getting started"}</h2>
              <p className="text-sm text-slate">{hasData ? "Real totals from structured tenant and manager signals." : "No properties tracked yet — be the first to add one."}</p>
            </div>
          </div>
          {hasData ? (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ["Properties tracked", stats.properties],
                ["Reviews submitted", stats.reviews],
                ["Issues reported", stats.issues],
                ["Verified events", stats.verifiedEvents]
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-mist px-4 py-3">
                  <div className="font-mono text-xl font-bold tabular-nums text-ink">{value}</div>
                  <div className="text-xs text-slate">{label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              <p className="text-sm leading-6 text-slate">
                DomusGraph is brand new — every property profile, review, and maintenance report on here comes from a real person&apos;s real experience. Nothing here is fabricated or filled in for show.
              </p>
              <Link href="/search" className="button-primary w-fit">Add the first property</Link>
            </div>
          )}
        </div>
      </section>

      {featured.length ? (
        <section className="py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-ink">Now covering Cambridge</h2>
              <p className="mt-2 max-w-2xl text-slate">{stats.properties} real addresses, sourced from the EPC register — a starting profile for every one, ready for a real tenant&apos;s history.</p>
            </div>
            <Link href="/city/cambridge" className="button-secondary shrink-0">Browse all {stats.properties} properties</Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
        </section>
      ) : null}

      <section className="py-10">
        <h2 className="text-2xl font-bold text-ink">Built for renters, landlords, and property managers</h2>
        <p className="mt-2 max-w-2xl text-slate">The same structured history serves three different jobs.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {audiences.map((audience) => (
            <div key={audience.role} className="flex flex-col rounded-lg border border-slate/15 bg-surface p-5 shadow-soft">
              <span className="text-xs font-semibold uppercase tracking-wide text-signal">{audience.role}</span>
              <p className="mt-2 text-lg font-semibold leading-snug text-ink">{audience.tagline}</p>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate">{audience.body}</p>
              <Link href={audience.href} className="button-secondary mt-5 w-fit">{audience.action}</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10">
        <h2 className="text-2xl font-bold text-ink">The Housing Graph</h2>
        <p className="mt-2 max-w-2xl text-slate">Property, problem, response, resolution, outcome — a structured chain, not a star rating.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {graphItems.map(([label, Icon, description], index) => (
            <div
              key={label}
              className="rounded-lg border border-slate/15 bg-surface p-4 transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-signal/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6 text-signal" />
                <span className="font-mono text-xs text-slate/60">0{index + 1}</span>
              </div>
              <div className="mt-3 font-semibold text-ink">{label}</div>
              <p className="mt-1.5 text-sm leading-5 text-slate">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate/15 bg-onyx p-6 text-white">
        <p className="max-w-3xl text-lg font-semibold">We are building a more transparent rental market through verified housing experiences.</p>
      </section>
    </PageShell>
  );
}
