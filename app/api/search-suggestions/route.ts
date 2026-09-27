import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient, isConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!isConfigured() || q.length < 2) return NextResponse.json([]);

  const supabase = createSupabaseAdminClient();
  const term = `%${q}%`;
  const { data } = await supabase
    .from("property_summary")
    .select("id, address_line_1, address_line_2, city, postcode")
    .or(`address_line_1.ilike.${term},postcode.ilike.${term}`)
    .order("last_activity", { ascending: false, nullsFirst: false })
    .limit(8);

  return NextResponse.json(data ?? []);
}
