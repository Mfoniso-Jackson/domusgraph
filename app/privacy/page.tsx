import { PageShell, SectionHeader } from "@/components/ui";

export const metadata = {
  title: "Privacy Policy — DomusGraph"
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <SectionHeader eyebrow="Legal" title="Privacy Policy" body="Last updated 24 September 2026." />
      <div className="panel grid gap-6 text-sm leading-7 text-ink">
        <Section title="1. Who we are">
          <p>
            DomusGraph (&quot;we&quot;, &quot;us&quot;) is the data controller for personal data processed through
            domusgraph.com. Contact:{" "}
            <a className="text-signal underline" href="mailto:privacy@domusgraph.com">privacy@domusgraph.com</a>
          </p>
        </Section>

        <Section title="2. What we collect">
          <p>Depending on how you use DomusGraph, we collect:</p>
          <ul className="ml-5 list-disc space-y-2">
            <li><strong>Account data:</strong> your email address, used to sign in via a magic link (we never see or store a password).</li>
            <li><strong>Contribution data:</strong> reviews, maintenance issue reports, and property claims you submit, including any ratings, free-text descriptions, and the property they relate to.</li>
            <li><strong>Claim/contact data:</strong> if you claim a property as a landlord or property manager, or sign up as a manager, the name, email, and business details you provide.</li>
            <li><strong>Onboarding and feedback answers:</strong> free-text answers you give during onboarding or in response to feedback prompts.</li>
            <li><strong>Technical data:</strong> IP address (used only for rate limiting to prevent abuse, not stored long-term against your identity), browser/device information, and error reports if the app crashes.</li>
          </ul>
        </Section>

        <Section title="3. Why we process it">
          <ul className="ml-5 list-disc space-y-2">
            <li><strong>To provide the service</strong> — creating your account, publishing your contributions after moderation, showing you your dashboard.</li>
            <li><strong>To moderate content</strong> — reviewing pending submissions before they&apos;re public, and to investigate disputes.</li>
            <li><strong>To communicate with you</strong> — sign-in links, and notifying you when your submission is approved or rejected.</li>
            <li><strong>To prevent abuse</strong> — rate limiting and fraud/spam prevention.</li>
            <li><strong>To fix bugs</strong> — error monitoring when something goes wrong.</li>
          </ul>
          <p>
            Our legal basis is performance of a contract (providing the service you signed up for) and legitimate
            interest (moderation, abuse prevention, and keeping the service running).
          </p>
        </Section>

        <Section title="4. Who we share it with">
          <p>We use the following processors to run DomusGraph. None of them are permitted to use your data for their own purposes.</p>
          <ul className="ml-5 list-disc space-y-2">
            <li><strong>Supabase</strong> — database hosting and authentication.</li>
            <li><strong>Resend</strong> — sends sign-in links and notification emails on our behalf.</li>
            <li><strong>Sentry</strong> — error monitoring, so we can find and fix bugs. Sentry may receive technical details about the error (e.g. a stack trace) but we do not send review or issue content to it.</li>
            <li><strong>Vercel</strong> — hosts and serves the application.</li>
          </ul>
          <p>
            We do not sell your data, and we do not share it with advertisers. Some of these processors operate
            infrastructure outside the UK/EEA; where that&apos;s the case, they provide contractual safeguards
            (such as Standard Contractual Clauses) for the transfer.
          </p>
        </Section>

        <Section title="5. How long we keep it">
          <p>
            We keep account and contribution data for as long as your account is active. If you delete your
            account, we remove your personal data within 30 days, except where we need to keep a record for legal,
            dispute-resolution, or fraud-prevention purposes. Rate-limiting data (IP addresses) is held only in
            short-lived memory and is not retained.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>Under UK GDPR, you have the right to:</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request erasure of your data</li>
            <li>Restrict or object to certain processing</li>
            <li>Receive your data in a portable format</li>
            <li>Complain to the UK Information Commissioner&apos;s Office (ico.org.uk) if you think we&apos;ve mishandled your data</li>
          </ul>
          <p>
            To exercise any of these, email{" "}
            <a className="text-signal underline" href="mailto:privacy@domusgraph.com">privacy@domusgraph.com</a>.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            We use one essential cookie to keep you signed in (set by our authentication provider, Supabase). We
            don&apos;t use advertising or third-party tracking cookies.
          </p>
        </Section>

        <Section title="8. Children">
          <p>DomusGraph is intended for adults making housing decisions and isn&apos;t directed at children.</p>
        </Section>

        <Section title="9. Security">
          <p>
            We restrict database access with row-level security and role-based permissions, and connections to
            DomusGraph are encrypted in transit. No system is completely secure, but we take reasonable steps to
            protect your data.
          </p>
        </Section>

        <Section title="10. Changes">
          <p>We&apos;ll update the date at the top of this page when this policy changes materially.</p>
        </Section>
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-2">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}
