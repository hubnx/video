/**
 * Logs a problem the window met to the app's log under a searchable event name, as the error's kind and first line
 * only (no file names or words of the person's). Described here, in the window's own world: a DOMException, which is
 * what WebCodecs' encoders and decoders throw, reaches the preload's world as an empty object.
 */
export function logProblem(event: string, error: unknown): void {
  const { name, message } = (typeof error === "object" && error !== null ? error : {}) as { name?: unknown; message?: unknown };
  const described = typeof message === "string" ? `${typeof name === "string" ? name : "Error"}: ${message.split("\n")[0]}` : String(error);
  window.video.logProblem(event, described.slice(0, 300));
}
