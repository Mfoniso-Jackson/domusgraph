import { EmptyState, PageShell, SectionHeader, TextField } from "@/components/ui";
import { requestMagicLinkAction } from "@/lib/actions";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string; next?: string }> }) {
  const { sent, error, next } = await searchParams;

  if (sent) {
    return (
      <PageShell>
        <SectionHeader eyebrow="Sign in" title="Check your email" />
        <EmptyState title="Magic link sent" body="Click the link we emailed you to finish signing in. You can close this tab." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeader eyebrow="Sign in" title="Sign in to DomusGraph" body="Enter your email and we'll send you a magic link. No password required." />
      {error ? <p className="mb-4 text-sm font-medium text-red-600">That link didn&apos;t work. Request a new one below.</p> : null}
      <form action={requestMagicLinkAction} className="panel grid max-w-md gap-5">
        <TextField label="Email" name="email" type="email" placeholder="you@example.com" />
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <button className="button-primary" type="submit">Send magic link</button>
      </form>
    </PageShell>
  );
}
