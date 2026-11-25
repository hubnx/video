/** The site's address, and what search engines are told: robots.txt, sitemap.xml, each page's robots tag. */

export const SITE_URL = "https://video.hubnx.com";

/**
 * Kept out of search until release 1 is out and its downloads work (docs/plan.md › Where it ships: release 1 goes out
 * quietly; the launch is 1.1). Pages stay crawlable, so search engines can read the noindex. Turned on the day the
 * release check passes.
 */
export const INDEXED = false;

const INDEXED_PAGES = ["/", "/download/", "/about/"];

export function robotsMeta(): string {
  return INDEXED ? "" : `<meta name="robots" content="noindex" />`;
}

// The installers aren't pages: crawlers took Songbrew's whole and read as downloads (music/site/src/site.ts, 2026-11-17).
// Browsers and the app's updater don't read robots.txt. The longest matching rule wins, so /download/ itself, the page,
// stays allowed.
const RULES = "User-agent: *\nAllow: /\nDisallow: /download/*.\nAllow: /download/$\n";

export function robotsTxt(): string {
  return INDEXED ? `${RULES}\nSitemap: ${SITE_URL}/sitemap.xml\n` : RULES;
}

/** Empty until the site is in search. */
export function sitemapXml(): string {
  if (!INDEXED) return "";
  const urls = INDEXED_PAGES.map((page) => `  <url><loc>${SITE_URL}${page}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
