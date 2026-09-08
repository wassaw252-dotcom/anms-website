import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();
  return url
    ? [
        { url, changeFrequency: "monthly", priority: 1 },
        { url: `${url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
      ]
    : [];
}
