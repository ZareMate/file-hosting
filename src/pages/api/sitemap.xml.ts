import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";

// Replace this with your real data source
async function fetchFiles() {
  // Example: Fetch from your DB or API here
  const publicSites = await db.file.findMany({
    where: { public: true },
  });
  return [
    ...publicSites,
  ];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = process.env.NEXT_PUBLIC_PAGE_URL || "https://yourdomain.com";
  const files = await fetchFiles();

  // Only include public files
  const publicFiles = files.filter((file) => file.public);

  // Static routes
  const staticRoutes = [
    "/",
    "/search",
  ];

  const urls = [
    ...staticRoutes.map(
      (route) => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`
    ),
    ...publicFiles.map(
      (file) => `
  <url>
    <loc>${baseUrl}${file.url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    ),
  ].join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(sitemap);
}