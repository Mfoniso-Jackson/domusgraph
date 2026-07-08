import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DomusGraph",
  description: "Housing transparency for renters, landlords, and property managers."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-moss/15 bg-paper/90">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight text-ink">
              DomusGraph
            </Link>
            <div className="flex items-center gap-3 text-sm font-medium text-moss">
              <Link href="/search" className="hover:text-clay">Search</Link>
              <Link href="/property-manager" className="hover:text-clay">Managers</Link>
              <Link href="/dashboard" className="hover:text-clay">Dashboard</Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="border-t border-moss/15 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-moss">
            DomusGraph is an early housing transparency platform. Reviews and reports may be user-submitted and should be considered alongside independent checks.
          </div>
        </footer>
      </body>
    </html>
  );
}
