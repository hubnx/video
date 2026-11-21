/**
 * Every word the window shows, in one place, so a screen's wording is checked and changed here (the clarity check,
 * ../../../docs/brand.md), and translating later is this one file. Written to the owner's rule for words people read:
 * plain, the point first, short sentences (~/.claude/CLAUDE.md › Outreach and SEO).
 */
import { APP_NAME } from "./shared/app-api.ts";

export const words = {
  appName: APP_NAME,
  start: {
    heading: "Drop a video here",
    lead: "Captions, silences and the voice, cleaned up for you to check.",
    // Said at first run, where someone coming from an online editor notices it (docs/plan.md › The promise › Private).
    privacy: "Nothing is uploaded. No account. Your videos stay on this computer.",
  },
} as const;
