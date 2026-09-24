"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { PageShell } from "@/components/ui";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <PageShell>
      <div className="mx-auto max-w-md rounded-lg border border-slate/15 bg-white p-8 text-center shadow-soft">
        <AlertTriangle className="mx-auto h-10 w-10 text-signal" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-ink">Something went wrong</h1>
        <p className="mt-2 text-sm leading-6 text-slate">
          That didn&apos;t go through — often it&apos;s a field that didn&apos;t pass validation. Nothing you entered was lost; try again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" className="button-primary" onClick={() => reset()}>
            Try again
          </button>
          <Link href="/" className="button-secondary">
            Go home
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
