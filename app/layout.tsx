import type { Metadata } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/data";
import { signOutAction } from "@/lib/actions";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "DomusGraph",
  description: "Housing transparency for renters, landlords, and property managers."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <header className="border-b border-slate/15 bg-paper/90">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight text-ink">
              DomusGraph
            </Link>
            <div className="flex items-center gap-3 text-sm font-medium text-slate">
              <Link href="/search" className="hover:text-signal">Search</Link>
              <Link href="/onboarding" className="hover:text-signal">Onboarding</Link>
              <Link href="/property-manager" className="hover:text-signal">Managers</Link>
              <Link href="/dashboard" className="hover:text-signal">Dashboard</Link>
              {user ? (
                <form action={signOutAction} className="flex items-center gap-3">
                  <span className="text-ink">{user.email}</span>
                  <button type="submit" className="hover:text-signal">Sign out</button>
                </form>
              ) : (
                <Link href="/auth/sign-in" className="hover:text-signal">Sign in</Link>
              )}
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="border-t border-slate/15 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate">
            <p>
              DomusGraph is an early housing transparency platform. Reviews and reports may be user-submitted and should be considered alongside independent checks.
            </p>
            <div className="mt-3 flex gap-4">
              <Link href="/terms" className="hover:text-signal">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-signal">Privacy Policy</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
