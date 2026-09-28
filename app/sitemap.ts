import type { MetadataRoute } from "next";
import { createSupabaseAdminClient, isConfigured } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://domusgraph.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/search`, lastModified: new Date() },
    { url: `${baseUrl}/recover`, lastModified: new Date() },
    { url: `${baseUrl}/onboarding`, lastModified: new Date() },
    { url: `${baseUrl}/property-manager`, lastModified: new Date() }
  ];

  if (!isConfigured()) return staticRoutes;

  const supabase = createSupabaseAdminClient();
  const { data: properties } = await supabase.from("property_summary").select("id, city, postcode, last_activity");
  const rows = properties ?? [];

  const propertyRoutes: MetadataRoute.Sitemap = rows.map((property) => ({
    url: `${baseUrl}/property/${property.id}`,
    lastModified: property.last_activity ? new Date(property.last_activity) : new Date()
  }));

  const cities = new Set(rows.map((p) => p.city).filter(Boolean));
  const cityRoutes: MetadataRoute.Sitemap = Array.from(cities).map((city) => ({
    url: `${baseUrl}/city/${encodeURIComponent(String(city).toLowerCase().replace(/\s+/g, "-"))}`,
    lastModified: new Date()
  }));

  const postcodeAreas = new Set(rows.map((p) => p.postcode?.split(" ")[0]).filter(Boolean));
  const postcodeRoutes: MetadataRoute.Sitemap = Array.from(postcodeAreas).map((area) => ({
    url: `${baseUrl}/postcode/${area}`,
    lastModified: new Date()
  }));

  return [...staticRoutes, ...propertyRoutes, ...cityRoutes, ...postcodeRoutes];
}
