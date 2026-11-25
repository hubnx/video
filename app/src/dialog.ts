/**
 * One shape for every dialog over the window (export, settings, feedback, licenses): a heading, its parts on one even
 * rhythm, and its buttons at the end (styles.css › .dialog). Made once, added to the page, opened again as needed.
 */
import { element } from "./dom.ts";

export function dialogShell(id: string, className: string): { dialog: HTMLDialogElement; heading: HTMLHeadingElement } {
  const heading = element("h2", { id: `${id}-heading` });
  const dialog = element("dialog", { id, className: `dialog ${className}`, attributes: { "aria-labelledby": heading.id } }, heading);
  document.body.append(dialog);
  return { dialog, heading };
}

/** The system's light or dark look, as the window draws it: a report says which the person saw. */
export function currentTheme(): "light" | "dark" {
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
