"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOutAction } from "@/lib/actions";

const links = [
  { href: "/search", label: "Search" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/property-manager", label: "Managers" },
  { href: "/dashboard", label: "Dashboard" }
];

export function MobileNav({ userEmail }: { userEmail: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors duration-150 ease-out hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-slate/15 bg-paper px-4 py-4 shadow-soft">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 text-sm font-medium text-slate">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-md px-2 py-2.5 hover:bg-mist hover:text-signal">
                {link.label}
              </Link>
            ))}
            {userEmail ? (
              <form action={signOutAction} className="flex items-center justify-between gap-3 border-t border-slate/15 px-2 pt-3 mt-2">
                <span className="text-ink">{userEmail}</span>
                <button type="submit" className="font-medium hover:text-signal">Sign out</button>
              </form>
            ) : (
              <Link href="/auth/sign-in" onClick={() => setOpen(false)} className="mt-2 border-t border-slate/15 px-2 pt-3 hover:text-signal">
                Sign in
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
