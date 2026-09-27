"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled the native share sheet, or it's unsupported — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — nothing to fall back to here, silently no-op
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink transition-colors duration-150 ease-out hover:bg-signal/10 hover:text-signal"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-leaf" aria-hidden="true" /> : <Share2 className="h-3.5 w-3.5 text-signal" aria-hidden="true" />}
      {copied ? "Link copied" : "Share this property"}
    </button>
  );
}
