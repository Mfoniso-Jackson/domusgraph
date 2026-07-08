import Link from "next/link";
import { PageShell, SectionHeader } from "@/components/ui";

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const inviteUrl = `/invite/${code}`;

  return (
    <PageShell>
      <SectionHeader eyebrow="Referral link" title="Invite someone who can strengthen this profile" body="Share this link with a previous tenant, neighbour, landlord, or property manager. Reputation points reward trusted graph growth, not money." />
      <div className="panel">
        <label className="grid gap-2">
          <span className="label">Referral link</span>
          <input className="field" readOnly value={inviteUrl} aria-label="Referral link" />
        </label>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="button-primary" href="/search">Contribute housing data</Link>
          <Link className="button-secondary" href="/onboarding">Start onboarding</Link>
        </div>
      </div>
    </PageShell>
  );
}
