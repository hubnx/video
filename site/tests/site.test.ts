/** The site's rules a mistake would hide (src/site.ts, src/downloads.ts): crawlers kept off the installers but not the
 * download page, nothing in search before release, and a download link for every file the release makes. */
import { expect, it } from "vitest";
import { LINUX_DEB, PUBLISHED, RELEASE_FILES } from "../../app/scripts/release-files.ts";
import { renderDownloads, VERSION } from "../src/downloads.ts";
import { INDEXED, robotsMeta, robotsTxt, sitemapXml } from "../src/site.ts";

it("keeps crawlers off the installers and on the download page", () => {
  expect(robotsTxt()).toContain("Disallow: /download/*.");
  expect(robotsTxt()).toContain("Allow: /download/$");
});

it("stays out of search until release: every page says noindex, and no sitemap", () => {
  if (INDEXED) return;
  expect(robotsMeta()).toContain("noindex");
  expect(sitemapXml()).toBe("");
});

it("links every file the release makes, by the name its package is given", () => {
  const html = renderDownloads();
  for (const target of PUBLISHED) expect(html).toContain(`href="/download/${RELEASE_FILES[target](VERSION)}"`);
  expect(html).toContain(`href="/download/${LINUX_DEB(VERSION)}"`);
});
