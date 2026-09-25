"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyLinkField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. non-HTTPS or blocked) — the field is still selectable/copyable by hand.
    }
  }

  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      <div className="flex gap-2">
        <input className="field" readOnly value={value} aria-label={label} onFocus={(event) => event.target.select()} />
        <button
          type="button"
          onClick={copy}
          className="button-secondary shrink-0 whitespace-nowrap"
          aria-label={copied ? "Link copied" : "Copy link"}
        >
          {copied ? <Check className="h-4 w-4 text-leaf" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </label>
  );
}
