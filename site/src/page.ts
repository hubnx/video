/**
 * Every page's script: feedback links open the report pop-up over the page (@hubnx/web-parts, sent to hubnx.com's
 * report route, which knows this app as `video` from exactly https://video.hubnx.com); the feedback page holds the form
 * itself, for a link opened in a new tab; the download page marks the visitor's own system.
 */
import { FeedbackForm, renderFeedbackForm } from "@hubnx/web-parts/feedback-form";
import { openFeedbackLinksAsPopup } from "@hubnx/web-parts/feedback-link";
import { APP_NAME } from "../../app/src/shared/app-api.ts";
import { FEEDBACK } from "./feedback.ts";
import { visitorTarget } from "./visitor.ts";

openFeedbackLinksAsPopup(FEEDBACK);

const holder = document.querySelector<HTMLElement>('[data-feedback="form"]');
const done = document.querySelector<HTMLElement>('[data-feedback="done"]');
if (holder && done) {
  holder.innerHTML = renderFeedbackForm("feedback");
  new FeedbackForm(holder, {
    app: FEEDBACK,
    about: () => APP_NAME,
    picture: async () => undefined, // a picture of this page would show only the form
    sent: () => {
      holder.hidden = true;
      done.hidden = false;
    },
  });
}

// The visitor's system, when the browser says which it is: its card marked, and the home page's button fetching its
// file, with the other systems a link away. Unknown, nothing is marked and the button goes to the download page.
const target = await visitorTarget();
if (target) {
  const tag = document.querySelector<HTMLElement>(`.download[data-target="${target}"] .yours`);
  if (tag) tag.hidden = false;
  const hero = document.querySelector<HTMLAnchorElement>("[data-download]");
  const file = hero ? (JSON.parse(hero.dataset.download!) as Record<string, { href: string; label: string }>)[target] : undefined;
  if (hero && file) {
    hero.href = file.href;
    hero.textContent = file.label;
    hero.setAttribute("download", "");
    document.querySelector<HTMLElement>("[data-download-systems]")!.hidden = true;
    document.querySelector<HTMLElement>("[data-download-others]")!.hidden = false;
  }
}
