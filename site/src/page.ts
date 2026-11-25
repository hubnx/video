/**
 * Every page's script: feedback links open the report pop-up over the page (@hubnx/web-parts, sent to hubnx.com's
 * report route, which knows this app as `video` from exactly https://video.hubnx.com); the feedback page holds the form
 * itself, for a link opened in a new tab; the download page marks the visitor's own system.
 */
import { FeedbackForm, renderFeedbackForm } from "@hubnx/web-parts/feedback-form";
import { openFeedbackLinksAsPopup } from "@hubnx/web-parts/feedback-link";
import { APP_NAME } from "../../app/src/shared/app-api.ts";
import { FEEDBACK } from "./feedback.ts";

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

// The visitor's system, from what the browser says of itself: a hint on the card, never a choice made for them (a Mac's
// browser doesn't say which chip it has, so both Mac cards are marked).
const system = /Windows/.test(navigator.userAgent) ? "windows" : /Mac OS X|Macintosh/.test(navigator.userAgent) ? "mac" : /Linux|X11/.test(navigator.userAgent) ? "linux" : null;
if (system) for (const card of document.querySelectorAll<HTMLElement>(`.download[data-system="${system}"] .yours`)) card.hidden = false;
