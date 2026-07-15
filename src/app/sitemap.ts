import type { MetadataRoute } from "next";
import { DEFAULT_INGREDIENTS } from "@/lib/ingredient-db";
import { ARTICLES } from "@/lib/articles";

/** Required for static export compatibility. */
export const dynamic = "force-static";

/**
 * Site base URL — used for absolute URLs in sitemap.
 * Brand is "Aleeqa" (https://www.aleeqa.app).
 */
const SITE_URL = "https://aleqa.vercel.app";

/** Static top-level routes that don't depend on data. */
const STATIC_ROUTES = [
  "/",
  "/calculator",
  "/about",
  "/contact",
  "/terms",
  "/disclaimer",
  "/privacy",
  "/faq",
  "/guide",
  "/nutrition",
  "/knowledge",
  "/ingredients",
  "/compare",
  "/livestock-cost-calculator",
];

/**
 * Generates /sitemap.xml at build time (static export).
 * Includes:
 *  - 9 static routes
 *  - 22 ingredient pages (/ingredients/{key})
 *  - 8 knowledge articles (/knowledge/{slug})
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "/" : `${route}/`}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1.0 : 0.8,
  }));

  const ingredientEntries: MetadataRoute.Sitemap = DEFAULT_INGREDIENTS.map((ing) => ({
    url: `${SITE_URL}/ingredients/${ing.key}/`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const articleEntries: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${SITE_URL}/knowledge/${article.slug}/`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...ingredientEntries, ...articleEntries];
}
