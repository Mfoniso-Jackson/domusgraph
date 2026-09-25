import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { REFERRAL_COOKIE } from "@/lib/referral-cookie";

const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function applyReferralCookie(request: NextRequest, response: NextResponse) {
  const inviteMatch = request.nextUrl.pathname.match(/^\/invite\/([a-zA-Z0-9_-]+)/);
  if (inviteMatch) {
    response.cookies.set(REFERRAL_COOKIE, inviteMatch[1], { maxAge: REFERRAL_COOKIE_MAX_AGE, path: "/", sameSite: "lax" });
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return applyReferralCookie(request, NextResponse.next());

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  await supabase.auth.getUser();

  return applyReferralCookie(request, response);
}

export const config = {
  matcher: ["/((?!monitoring|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
