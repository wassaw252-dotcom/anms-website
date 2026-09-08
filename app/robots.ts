import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/", "/discovery"],
    },
    sitemap: siteUrl() ? `${siteUrl()}/sitemap.xml` : undefined,
  };
}
