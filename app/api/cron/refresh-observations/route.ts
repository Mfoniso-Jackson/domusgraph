import { NextResponse, type NextRequest } from "next/server";
import { refreshPropertyObservations } from "@/lib/refresh-observations";

// Measured at ~115s locally against 201 properties / 129 postcodes. Vercel's
// Hobby plan caps functions at 60s regardless of this setting — this raises
// the ceiling as far as the current plan allows, but a full run may still
// not complete in one invocation. See commit message for the honest status.
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await refreshPropertyObservations();
  return NextResponse.json(result);
}
