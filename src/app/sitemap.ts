import type { MetadataRoute } from "next";
import { gallery, siteUrl } from "@/lib/content";
import { locales } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}`]));

  return locales.map((lang) => ({
    url: `${siteUrl}/${lang}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages },
    images: ["/sections/hero.jpg", ...gallery].map((src) => `${siteUrl}${src}`),
  }));
}
