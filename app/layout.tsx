import type { Metadata } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/data";
import { signOutAction } from "@/lib/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { Logo } from "@/components/logo";

const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "DomusGraph",
  description: "Housing transparency for renters, landlords, and property managers."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <header className="relative border-b border-slate/15 bg-paper/90">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center">
              <Logo className="h-7 w-auto" />
            </Link>
            <div className="hidden items-center gap-3 text-sm font-medium text-slate md:flex">
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
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-1 md:hidden">
              <ThemeToggle />
              <MobileNav userEmail={user?.email ?? null} />
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="border-t border-slate/15 bg-surface">
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
