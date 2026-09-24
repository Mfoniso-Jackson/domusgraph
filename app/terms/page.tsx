import { PageShell, SectionHeader } from "@/components/ui";

export const metadata = {
  title: "Terms of Service — DomusGraph"
};

export default function TermsPage() {
  return (
    <PageShell>
      <SectionHeader eyebrow="Legal" title="Terms of Service" body="Last updated 24 September 2026." />
      <div className="panel grid gap-6 text-sm leading-7 text-ink">
        <Section title="1. What DomusGraph is">
          <p>
            DomusGraph is a platform for structured, user-submitted housing information: property profiles, tenant
            reviews, maintenance issue reports, and landlord/property manager claims. Content on DomusGraph reflects
            the personal experiences and opinions of the people who submit it. It is not independently verified
            unless explicitly marked as verified, and should not be treated as a substitute for your own research,
            a professional survey, or legal advice before signing a tenancy or making a property decision.
          </p>
        </Section>

        <Section title="2. Accounts">
          <p>
            Some actions — leaving a review, reporting a maintenance issue, or claiming a property — require signing
            in with a magic link sent to your email. You must provide a real, working email address you control and
            keep it accurate. You&apos;re responsible for activity that happens under your account. Don&apos;t create
            an account to impersonate someone else, and don&apos;t create multiple accounts to evade moderation or
            rate limits.
          </p>
        </Section>

        <Section title="3. Content you submit">
          <p>By submitting a review, issue report, claim, or any other content to DomusGraph, you agree that:</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>What you submit is truthful and based on your own direct experience of the property.</li>
            <li>
              You will not post content that is false, defamatory, harassing, or that you have no genuine basis to
              make — including allegations about a landlord, letting agent, or property manager that you cannot
              support with your own experience.
            </li>
            <li>You will not post another person&apos;s private or personal information without their consent.</li>
            <li>You grant DomusGraph a licence to host, display, and distribute the content you submit as part of the service.</li>
          </ul>
          <p>
            Submitted content defaults to a pending state and is reviewed before it becomes publicly visible.
            Approval of a review or report is a moderation decision, not a certification that its contents are
            factually accurate — DomusGraph does not independently investigate claims made in user content.
          </p>
        </Section>

        <Section title="4. Disputing content about your property">
          <p>
            If you are a landlord, letting agent, or property manager and believe content about a property you
            manage is false, defamatory, or violates these terms, contact us at{" "}
            <a className="text-signal underline" href="mailto:legal@domusgraph.com">legal@domusgraph.com</a> with the
            property address and the specific content in question. We will review disputed content and may remove
            or restrict it pending investigation.
          </p>
        </Section>

        <Section title="5. Prohibited use">
          <p>
            Don&apos;t use automated tools to scrape, spam, or submit content at scale; don&apos;t attempt to bypass
            rate limits or moderation; don&apos;t use the service for any unlawful purpose; don&apos;t upload
            malicious code or attempt to compromise the platform&apos;s security.
          </p>
        </Section>

        <Section title="6. No warranty">
          <p>
            DomusGraph is provided &quot;as is&quot;, without warranty of any kind. We do not guarantee that content
            on the platform is accurate, complete, or current, and we are not liable for decisions made in reliance
            on it. To the maximum extent permitted by law, DomusGraph disclaims liability for indirect, incidental,
            or consequential damages arising from use of the service.
          </p>
        </Section>

        <Section title="7. Your responsibility for what you post">
          <p>
            You are personally responsible for the content you submit. To the extent permitted by law, you agree to
            indemnify DomusGraph against claims, losses, or damages arising from content you submitted that
            violates these terms or infringes a third party&apos;s rights.
          </p>
        </Section>

        <Section title="8. Changes and termination">
          <p>
            We may update these terms from time to time; material changes will be reflected by the &quot;last
            updated&quot; date above. We may suspend or remove accounts or content that violate these terms.
          </p>
        </Section>

        <Section title="9. Governing law">
          <p>These terms are governed by the laws of England and Wales.</p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions about these terms:{" "}
            <a className="text-signal underline" href="mailto:legal@domusgraph.com">legal@domusgraph.com</a>
          </p>
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
