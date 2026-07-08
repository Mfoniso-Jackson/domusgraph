import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://domusgraph.com";
  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/search`, lastModified: new Date() },
    { url: `${baseUrl}/onboarding`, lastModified: new Date() },
    { url: `${baseUrl}/property-manager`, lastModified: new Date() },
    { url: `${baseUrl}/city/cambridge`, lastModified: new Date() },
    { url: `${baseUrl}/postcode/CB1`, lastModified: new Date() },
    { url: `${baseUrl}/neighbourhood/mill-road`, lastModified: new Date() }
  ];
}
