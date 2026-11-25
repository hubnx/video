/**
 * The feedback form (Settings › Send feedback, Help › Send Feedback… on a Mac, the top bar's Feedback, and *Send a
 * problem report* beside a failure): a problem or an idea, the person's words, an email only if they want an answer,
 * and the app's log only if they tick it, with exactly what goes shown first (electron/feedback.ts). Sent to Hub
 * Nexus, never anywhere else.
 */
import { currentTheme, dialogShell } from "./dialog.ts";
import { element } from "./dom.ts";
import { draftRefusal, FEEDBACK_LIMITS, type FeedbackDraft } from "./shared/app-api.ts";
import { words } from "./words.ts";

let made: ReturnType<typeof makeFeedback> | null = null;

/** Opens the form; `failure`, the code of what didn't work, when it's opened from one. */
export function openFeedback(options: { kind: FeedbackDraft["kind"]; failure: string | null }): void {
  made ??= makeFeedback();
  made.open(options);
}

function makeFeedback() {
  const { dialog, heading } = dialogShell("feedback", "feedback");
  let kind: FeedbackDraft["kind"] = "problem";
  let failure: string | null = null;
  const kinds = element("div", { className: "segmented", attributes: { role: "radiogroup", "aria-label": words.feedback.kind } },
    ...(["problem", "idea"] as const).map((each) => element("button", { type: "button", textContent: words.feedback.kinds[each], dataset: { value: each },
      attributes: { role: "radio" }, onclick: () => {
        kind = each;
        showKind();
      } })));
  const messageLabel = element("span");
  const message = element("textarea", { rows: 5, maxLength: FEEDBACK_LIMITS.longestMessage });
  const email = element("input", { type: "email", autocomplete: "email" });
  const withLog = element("input", { type: "checkbox" });
  const preview = element("pre", { className: "feedback-preview" });
  const details = element("details", { className: "dialog-details" }, element("summary", { textContent: words.feedback.preview }),
    element("p", { textContent: words.feedback.previewIntro }), preview);
  const status = element("p", { className: "dialog-status", attributes: { role: "status" } });
  const cancel = element("button", { type: "button", textContent: words.feedback.cancel, onclick: () => dialog.close() });
  const send = element("button", { type: "button", className: "primary", textContent: words.feedback.send });
  const form = element("div", { className: "dialog-parts" },
    element("div", { className: "field" }, element("span", { textContent: words.feedback.kind }), kinds),
    element("label", { className: "field" }, messageLabel, message),
    element("label", { className: "field" }, element("span", {}, `${words.feedback.email} `, element("span", { className: "muted", textContent: words.feedback.optional })), email),
    element("label", { className: "check" }, withLog, element("span", { textContent: words.feedback.withLog })),
    details);
  dialog.append(form, status, element("div", { className: "dialog-buttons" }, cancel, send));

  const draft = (): FeedbackDraft => ({ kind, message: message.value, email: email.value, withLog: withLog.checked, failure,
    theme: currentTheme(), locale: navigator.language });
  const showKind = () => {
    for (const button of kinds.querySelectorAll<HTMLElement>("button")) button.setAttribute("aria-checked", String(button.dataset.value === kind));
    messageLabel.textContent = words.feedback.message[kind];
    heading.textContent = kind === "problem" && failure ? words.feedback.problemHeading : words.feedback.heading;
  };
  // What goes, said before it goes, and again whenever the log's box changes.
  const showPreview = () => void window.video.feedbackPreview(draft()).then((text) => (preview.textContent = text));
  withLog.addEventListener("change", showPreview);
  details.addEventListener("toggle", showPreview);
  send.addEventListener("click", async () => {
    const refusal = draftRefusal({ message: message.value, email: email.value });
    if (refusal) {
      status.textContent = words.feedback.refusals[refusal];
      return;
    }
    send.disabled = true;
    status.textContent = words.feedback.sending;
    const result = await window.video.sendFeedback(draft()).catch(() => "unreachable" as const);
    status.textContent = words.feedback.results[result];
    send.disabled = false;
    if (result === "sent") {
      form.hidden = true;
      send.hidden = true;
      cancel.textContent = words.feedback.close;
    }
  });

  return {
    open(options: { kind: FeedbackDraft["kind"]; failure: string | null }) {
      kind = options.kind;
      failure = options.failure;
      message.value = "";
      email.value = "";
      withLog.checked = false; // the log goes only if they tick it
      details.open = false;
      form.hidden = false;
      send.hidden = false;
      cancel.textContent = words.feedback.cancel;
      status.textContent = "";
      showKind();
      dialog.showModal();
      message.focus();
    },
  };
}
