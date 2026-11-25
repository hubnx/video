/**
 * Builds video.hubnx.com: static pages whose shared parts (`<!--header-->` and the like) are written in at build time,
 * so they're in the HTML for search engines and nothing shifts as scripts arrive. Links that leave the site open a new
 * tab, and /licenses/ lists what the bundle read (@hubnx/web-parts; ../../docs/brand.md › Links, Every app site carries).
 * Run with `--configLoader runner` (package.json): the shared parts are TypeScript in node_modules.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { openOutboundLinksInNewTab } from "@hubnx/web-parts/external-links";
import { licensesPage } from "@hubnx/web-parts/licenses";
import { defineConfig, type Plugin } from "vite";
import { APP_NAME } from "../app/src/shared/app-api.ts";
import { renderDownloads, renderHeroDownload, VERSION, WINDOWS_INSTALLER } from "./src/downloads.ts";
import { renderFooter } from "./src/footer.ts";
import { renderHeader } from "./src/header.ts";
import { renderIconLinks } from "./src/icons.ts";
import { renderMoreOnAbout, renderMoreOnHome } from "./src/more-from-hub-nexus.ts";
import { robotsMeta, robotsTxt, SITE_URL, sitemapXml } from "./src/site.ts";

const PARTS: Record<string, () => string> = {
  header: renderHeader,
  footer: renderFooter,
  icons: renderIconLinks,
  robots: robotsMeta,
  downloads: renderDownloads,
  heroDownload: renderHeroDownload,
  moreOnHome: renderMoreOnHome,
  moreOnAbout: renderMoreOnAbout,
  // Left for the licenses plugin, which fills it once the bundle is complete.
  licenses: () => "<!--licenses-->",
  appLicenses,
};

const APP_DIST = new URL("../app/dist/", import.meta.url);

/** The app's own list, made by its build (app/scripts/app-notices.ts): the website offers the app, so it carries the
 * app's notices too. Build the app first; a site without them would be wrong, so the build stops. */
function appLicenses(): string {
  const list = new URL("licenses-list.html", APP_DIST);
  if (!existsSync(list)) throw new Error("no app/dist/licenses-list.html: run `pnpm build` in app/ first");
  return readFileSync(list, "utf8");
}

/** Chromium's notices, too long for the list, as a page of their own, which the list and the app link to. */
function chromiumNoticesPage(): Plugin {
  return {
    name: "video-chromium-notices",
    apply: "build",
    generateBundle() {
      const notices = new URL("../app/node_modules/electron/dist/LICENSES.chromium.html", import.meta.url);
      this.emitFile({ type: "asset", fileName: "licenses/chromium.html", source: readFileSync(notices, "utf8") });
    },
  };
}

const WORDS: Record<string, string> = {
  "%SITE_URL%": SITE_URL,
  "%APP_NAME%": APP_NAME,
  "%VERSION%": VERSION,
  "%INSTALLER%": WINDOWS_INSTALLER,
  // The GitHub release with FFmpeg's sources, GPL's offer beside the downloads (app/scripts/app-notices.ts says the same).
  "%FFMPEG_RELEASE%": (JSON.parse(readFileSync(new URL("../ffmpeg/builds.json", import.meta.url), "utf8")) as { release: string }).release,
};

function prerender(): Plugin {
  return {
    name: "video-prerender",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        // A part or a word named but not known fails the build, rather than leaving a page without it.
        const page = html
          .replace(/<!--([a-zA-Z]+)-->/g, (_comment, name: string) => {
            const part = PARTS[name];
            if (!part) throw new Error(`no part called ${name} for <!--${name}-->`);
            return part();
          })
          .replace(/%[A-Z_]+%/g, (token) => {
            const word = WORDS[token];
            if (word === undefined) throw new Error(`no word for ${token}`);
            return word;
          });
        return openOutboundLinksInNewTab(page, SITE_URL);
      },
    },
    generateBundle() {
      const sitemap = sitemapXml();
      if (sitemap) this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robotsTxt() });
    },
  };
}

const page = (file: string) => fileURLToPath(new URL(file, import.meta.url));

export default defineConfig({
  plugins: [prerender(), licensesPage({ siteUrl: SITE_URL }), chromiumNoticesPage()],
  build: {
    rolldownOptions: {
      input: {
        home: page("./index.html"),
        download: page("./download/index.html"),
        about: page("./about/index.html"),
        feedback: page("./feedback/index.html"),
        privacy: page("./privacy/index.html"),
        terms: page("./terms/index.html"),
        licenses: page("./licenses/index.html"),
        notFound: page("./404.html"), // CloudFront shows it for any missing address
      },
    },
  },
});
