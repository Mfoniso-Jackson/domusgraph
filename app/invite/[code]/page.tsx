import Link from "next/link";
import { PageShell, SectionHeader } from "@/components/ui";
import { CopyLinkField } from "@/components/copy-link-field";

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const inviteUrl = `${siteUrl}/invite/${code}`;

  return (
    <PageShell>
      <SectionHeader eyebrow="Referral link" title="Invite someone who can strengthen this profile" body="Share this link with a previous tenant, neighbour, landlord, or property manager. Reputation points reward trusted graph growth, not money." />
      <div className="panel">
        <CopyLinkField value={inviteUrl} label="Referral link" />
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="button-primary" href="/search">Contribute housing data</Link>
          <Link className="button-secondary" href="/onboarding">Start onboarding</Link>
        </div>
      </div>
    </PageShell>
  );
}
