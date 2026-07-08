import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/data";
import { createSupabaseAdminClient, isAdminEmail } from "@/lib/supabase";

const allowedTables = new Set(["properties", "reviews", "maintenance_issues", "property_claims", "property_manager_intake"]);

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? "";
        return `"${String(value).replaceAll('"', '""')}"`;
      })
      .join(",")
  );
  return [headers.join(","), ...lines].join("\n");
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!isAdminEmail(user?.email)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const table = request.nextUrl.searchParams.get("table") ?? "";
  if (!allowedTables.has(table)) {
    return new Response("Unsupported export", { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
  if (error) return new Response(error.message, { status: 500 });

  return new Response(toCsv((data ?? []) as Record<string, unknown>[]), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${table}.csv"`
    }
  });
}
