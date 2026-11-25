/**
 * The header every page shares (vite.config.ts writes it in): the app's icon and its hubnx name, nothing beside it
 * (../../../docs/brand.md › Naming: no maker line once the name carries hubnx), and the site's three places.
 */
import { APP_NAME } from "../../app/src/shared/app-api.ts";

const LINKS = [
  { href: "/download/", label: "Download" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#questions", label: "Questions" },
];

export function renderHeader(): string {
  const links = LINKS.map((link) => `<a href="${link.href}">${link.label}</a>`).join("\n        ");
  return `<header class="site-header">
      <a class="brand" href="/"><img src="/favicon.svg" alt="" width="28" height="28" />${APP_NAME}</a>
      <nav class="site-nav" aria-label="Main">
        ${links}
      </nav>
    </header>`;
}
