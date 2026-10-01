import Link from "next/link";
import { AlertTriangle, ArrowRight, Building2, CheckCircle2, MessageSquareReply, Search, TrendingUp, Users } from "lucide-react";
import { PageShell } from "@/components/ui";
import { PropertyCard } from "@/components/property-card";
import { getFeaturedProperties, getHomepageTimelineExample, getPlatformStats } from "@/lib/data";

const graphChain = [
  ["Property", Building2, "One permanent profile per address, not a new listing every time it's re-let."],
  ["Problem", AlertTriangle, "A maintenance issue, a damp patch, a broken boiler: reported and dated."],
  ["Response", MessageSquareReply, "How the landlord or manager actually responded, and how fast."],
  ["Resolution", CheckCircle2, "Whether it was fixed, and whether it stayed fixed."],
  ["Outcome", TrendingUp, "Deposit returned, would-rent-again, dispute resolved: what a photo can't show."]
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
    role: "Residents & former tenants",
    tagline: "You lived it. Make it count.",
    body: "Recover the places you've lived and add what you know: repairs, responsiveness, what it was actually like.",
    action: "Recover my housing history",
    href: "/recover"
  },
  {
    role: "For professionals",
    tagline: "Build trust while operating better.",
    body: "Claim your properties, respond to reports, and show a verified track record instead of a star rating.",
    action: "Claim a property",
    href: "/search"
  }
] as const;

function formatMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export default async function HomePage() {
  const [stats, featured, timelineExample] = await Promise.all([
    getPlatformStats(),
    getFeaturedProperties("Cambridge", 3),
    getHomepageTimelineExample()
  ]);
  const hasContributions = stats.reviews + stats.issues + stats.verifiedEvents > 0;

  return (
    <PageShell>
      {/* Hero: identity and promise first. Search is offered quietly, not as the headline act. */}
      <section className="py-8 sm:py-14">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase text-signal">
          Housing intelligence
          <span className="rounded-full bg-signal/10 px-2 py-0.5 text-xs font-semibold normal-case text-signal">Now in Cambridge</span>
        </p>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-ink sm:text-6xl">
          Every home has a history.
          <span className="mt-2 block text-signal">We&apos;re building its memory.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate">
          When someone moves out, what happened there usually disappears: the repairs, the landlord&apos;s responsiveness, the issues that kept coming back. DomusGraph
          keeps a structured, evidence-backed record of every rental property in Cambridge, so the next person doesn&apos;t have to find out the hard way.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/city/cambridge" className="button-primary">Explore housing</Link>
          <Link href="/recover" className="button-secondary">Add your housing history</Link>
        </div>
        <Link href="/search" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate hover:text-signal">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          Looking for a specific address? Search the graph
        </Link>
      </section>

      {/* Curiosity before intent: show what the product actually contains, with one real example. */}
      {timelineExample ? (
        <section className="border-y border-slate/15 py-10">
          <p className="text-sm font-semibold uppercase text-signal">What happened here?</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">
            {timelineExample.property.address_line_1}
            {timelineExample.property.city ? <span className="text-slate">, {timelineExample.property.city}</span> : null}
          </h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {timelineExample.moments.map((moment, index) => (
              <li key={`${moment.date}-${index}`} className="flex gap-3 rounded-lg border border-slate/15 bg-surface p-4">
                <span className="shrink-0 font-mono text-xs font-semibold text-slate/70">{formatMonthYear(moment.date)}</span>
                <span className="text-sm leading-5 text-ink">{moment.label}</span>
              </li>
            ))}
          </ol>
          <Link href={`/property/${timelineExample.property.id}`} className="button-secondary mt-6 w-fit">
            Explore this history
          </Link>
        </section>
      ) : null}

      {/* Honest early-stage framing: lead with the real asset, don't let zero-value metrics define the product. */}
      <section className="py-10">
        <h2 className="text-2xl font-bold text-ink">Cambridge housing graph</h2>
        <p className="mt-2 max-w-2xl text-slate">
          {stats.properties} Cambridge properties have their first public-record profile, sourced from the EPC register. Now we&apos;re adding the memories, events,
          and experiences that make those profiles useful.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4 text-sm">
          {[
            [stats.properties, "properties with a starting profile"],
            [stats.observations, "public records on file"],
            [stats.reviews + stats.issues, "tenant reviews & maintenance reports"],
            [stats.verifiedEvents, "verified events"]
          ].map(([value, label]) => (
            <div key={label}>
              <div className="font-mono text-xl font-semibold tabular-nums text-ink">{value}</div>
              <div className="text-slate">{label}</div>
            </div>
          ))}
        </div>
        {!hasContributions ? (
          <p className="mt-4 text-sm leading-6 text-slate">
            Every review, issue, and verified event here comes from a real person&apos;s real experience. Nothing is fabricated or filled in for show, which is
            why these numbers are still small, and why yours would be among the first.
          </p>
        ) : null}
      </section>

      {/* Contribution ask, kept lightweight and separate from the audience segmentation below. */}
      <section className="flex flex-col items-start gap-4 rounded-lg border border-slate/15 bg-mist p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-6 w-6 shrink-0 text-signal" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">You know something the graph doesn&apos;t.</p>
            <p className="mt-1 text-sm leading-6 text-slate">Every place you&apos;ve lived has a story. Recover it and add what only you know.</p>
          </div>
        </div>
        <Link href="/recover" className="button-primary shrink-0">Add your housing history</Link>
      </section>

      <section className="py-10">
        <h2 className="text-2xl font-bold text-ink">Built for renters, residents, and professionals</h2>
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

      {/* The structural asset, made legible: a relationship chain instead of a flat feature grid. */}
      <section className="py-10">
        <h2 className="text-2xl font-bold text-ink">The Housing Graph</h2>
        <p className="mt-2 max-w-2xl text-slate">Not a star rating. A structured chain, from what happened to how it was resolved.</p>
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-0">
          {graphChain.map(([label, Icon, description], index) => (
            <div key={label} className="flex flex-col items-stretch lg:flex-1 lg:flex-row">
              <div className="flex flex-1 flex-col rounded-lg border border-slate/15 bg-surface p-4 transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-signal/30 hover:shadow-md">
                <Icon className="h-6 w-6 text-signal" aria-hidden="true" />
                <div className="mt-3 font-semibold text-ink">{label}</div>
                <p className="mt-1.5 text-sm leading-5 text-slate">{description}</p>
              </div>
              {index < graphChain.length - 1 ? (
                <div className="flex h-8 shrink-0 items-center justify-center text-slate/40 lg:h-auto lg:w-8">
                  <ArrowRight className="h-5 w-5 rotate-90 lg:rotate-0" aria-hidden="true" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {featured.length ? (
        <section className="py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-ink">Now covering Cambridge</h2>
              <p className="mt-2 max-w-2xl text-slate">{stats.properties} real addresses, each with a starting profile, ready for a real tenant&apos;s history.</p>
            </div>
            <Link href="/city/cambridge" className="button-secondary shrink-0">Browse all {stats.properties} properties</Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
        </section>
      ) : null}

      <section className="rounded-lg border border-slate/15 bg-onyx p-6 text-white">
        <p className="max-w-3xl text-lg font-semibold">Every home has a history. We&apos;re building a more transparent rental market by giving it memory.</p>
      </section>
    </PageShell>
  );
}
