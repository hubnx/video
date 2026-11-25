/**
 * Which of the release's systems the visitor's computer is, when the browser says so plainly; null when it doesn't. A
 * Mac's browser rarely says which chip it has (Safari and Firefox report Intel on both), so a Mac is known only where
 * Chromium's client hints name the architecture (`video assistant`, 2026-11-24). Phones and tablets are none of them:
 * an iPhone's browser says "like Mac OS X", an iPad's may say "Macintosh", and Android's says "Linux".
 */
import type { Target } from "../../app/electron/targets.ts";

interface ClientHints {
  getHighEntropyValues(hints: string[]): Promise<{ architecture?: string }>;
}

export async function visitorTarget(): Promise<Target | null> {
  const agent = navigator.userAgent;
  if (/iPhone|iPad|Android/.test(agent) || (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)) return null;
  if (/Windows/.test(agent)) return "win-x64"; // an Arm PC runs the x64 installer too
  if (/Linux|X11/.test(agent)) return "linux-x64";
  if (!/Macintosh/.test(agent)) return null;
  const hints = (navigator as Navigator & { userAgentData?: ClientHints }).userAgentData;
  const architecture = hints ? (await hints.getHighEntropyValues(["architecture"]).catch(() => ({ architecture: undefined }))).architecture : undefined;
  return architecture === "arm" ? "mac-arm64" : architecture === "x86" ? "mac-x64" : null;
}
