import Link from "next/link";
import { Building2, ClipboardCheck, Hammer, KeyRound, MessageSquare, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/ui";
import { getPlatformStats } from "@/lib/data";

const graphItems = [
  ["Properties", Building2],
  ["Reviews", MessageSquare],
  ["Maintenance Issues", Hammer],
  ["Landlords", KeyRound],
  ["Outcomes", ClipboardCheck]
] as const;

export default async function HomePage() {
  const stats = await getPlatformStats();
  const hasData = stats.properties > 0;

  return (
    <PageShell>
      <section className="grid gap-10 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase text-clay">Housing intelligence</p>
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-ink sm:text-6xl">Know the home before you rent it.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-moss">
            DomusGraph helps renters discover property history, landlord responsiveness, and hidden housing issues before signing a tenancy.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/search" className="button-primary">Search a property</Link>
            <Link href="/search" className="button-secondary">Review a property</Link>
            <Link href="/search" className="button-secondary">Claim a property</Link>
            <Link href="/onboarding" className="button-secondary">Start onboarding</Link>
          </div>
        </div>
        <div className="rounded border border-moss/15 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3 border-b border-moss/10 pb-4">
            <ShieldCheck className="h-8 w-8 text-clay" />
            <div>
              <h2 className="font-semibold text-ink">{hasData ? "Housing graph snapshot" : "Just getting started"}</h2>
              <p className="text-sm text-moss">{hasData ? "Real totals from structured tenant and manager signals." : "No properties tracked yet — be the first to add one."}</p>
            </div>
          </div>
          {hasData ? (
            <div className="mt-5 grid gap-3">
              {[
                `Properties tracked: ${stats.properties}`,
                `Reviews submitted: ${stats.reviews}`,
                `Maintenance issues reported: ${stats.issues}`,
                `Verified housing events: ${stats.verifiedEvents}`
              ].map((item) => (
                <div key={item} className="rounded bg-mist px-4 py-3 text-sm font-medium text-ink">{item}</div>
              ))}
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              <p className="text-sm leading-6 text-moss">
                DomusGraph is brand new — every property profile, review, and maintenance report on here comes from a real person&apos;s real experience. Nothing here is fabricated or filled in for show.
              </p>
              <Link href="/search" className="button-primary w-fit">Add the first property</Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-10">
        <h2 className="text-2xl font-bold text-ink">The Housing Graph</h2>
        <p className="mt-2 max-w-2xl text-moss">A structured network of properties, experiences, maintenance events, ownership signals, and outcomes.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {graphItems.map(([label, Icon]) => (
            <div key={label} className="rounded border border-moss/15 bg-white p-4">
              <Icon className="h-6 w-6 text-clay" />
              <div className="mt-3 font-semibold text-ink">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border border-moss/15 bg-ink p-6 text-white">
        <p className="max-w-3xl text-lg font-semibold">We are building a more transparent rental market through verified housing experiences.</p>
      </section>
    </PageShell>
  );
}
