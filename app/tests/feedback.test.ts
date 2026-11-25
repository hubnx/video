import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { feedbackUrl, logEnd, reportBody, reportDetails, withoutHomes } from "../electron/feedback.ts";
import { draftRefusal, FEEDBACK_URL } from "../src/shared/app-api.ts";

const system = { version: "1.0.0", platform: "darwin" as const, systemVersion: "15.1", arch: "arm64" };

describe("a report", () => {
  it("never reaches the live route from a copy run from the repo or a check", () => {
    expect(feedbackUrl(false, undefined)).toBe(`${FEEDBACK_URL}?dryRun=1`);
    expect(feedbackUrl(true, "http://127.0.0.1:4169/api/feedback")).toBe("http://127.0.0.1:4169/api/feedback");
    expect(feedbackUrl(true, undefined)).toBe(FEEDBACK_URL);
  });

  it("carries the person's words, the app and system, and the log only when they ticked it", () => {
    const draft = { kind: "problem" as const, message: "  Captions never appeared  ", email: "", withLog: false, failure: "transcript_failed", theme: "dark" as const, locale: "en-US" };
    const details = reportDetails(system, draft.failure, null);
    expect(details).toBe("hubnx Video 1.0.0 · macOS 15.1 · arm64\nWhat didn't work: transcript_failed");
    const body = reportBody(draft, system, details);
    expect(body).toMatchObject({ source: "app", app: { name: "video", os: "macos" }, kind: "problem", subject: "Problem: Captions never appeared", message: "Captions never appeared" });
    expect(body).not.toHaveProperty("email");
    expect(reportDetails(system, null, "line one")).toContain("The end of the app's log:\nline one");
  });

  it("is checked before sending as the route checks it", () => {
    expect(draftRefusal({ message: "too short", email: "" })).toBe("message_short");
    expect(draftRefusal({ message: "Long enough to read", email: "not an address" })).toBe("email");
    expect(draftRefusal({ message: "Long enough to read", email: "a@b.co" })).toBeNull();
  });
});

describe("the log's end in a report", () => {
  it("shows every home folder as ~, however it's written", () => {
    expect(withoutHomes("open /Users/ana/Movies/x.mp4", ["/Users/ana"])).toBe("open ~/Movies/x.mp4");
    expect(withoutHomes(String.raw`C:\Users\Ana Maria\Videos and C:\\Users\\ANAMAR~1\\AppData`, [])).toBe(String.raw`~\Videos and ~\\AppData`);
    expect(withoutHomes("/home/someone/clip", [])).toBe("~/clip");
  });

  it("keeps the newest whole lines within its room", async () => {
    const folder = mkdtempSync(path.join(tmpdir(), "video-log-"));
    writeFileSync(path.join(folder, "app.log"), Array.from({ length: 100 }, (_, index) => `line ${index}`).join("\n") + "\n");
    const end = await logEnd(folder, 40);
    expect(end?.split("\n").at(-1)).toBe("line 99");
    expect(end!.length).toBeLessThanOrEqual(40);
    expect(await logEnd(path.join(folder, "none"))).toBeNull();
  });
});
