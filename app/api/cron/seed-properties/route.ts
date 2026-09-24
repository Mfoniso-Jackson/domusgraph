import { NextResponse, type NextRequest } from "next/server";
import { seedPropertiesFromEpc } from "@/lib/seed-properties";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await seedPropertiesFromEpc({ council: "Cambridge", count: 200 });
  return NextResponse.json(result);
}
