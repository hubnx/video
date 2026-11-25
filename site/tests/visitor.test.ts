/** Which system a visitor's browser says it's on (src/visitor.ts): a wrong guess would hand someone the wrong file, so
 * a Mac counts only with its chip named, and phones and tablets never count. */
import { afterEach, expect, it, vi } from "vitest";
import { visitorTarget } from "../src/visitor.ts";

const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36";
const visit = (userAgent: string, more: object = {}) => vi.stubGlobal("navigator", { userAgent, maxTouchPoints: 0, ...more });
const chip = (architecture: string) => ({ userAgentData: { getHighEntropyValues: async () => ({ architecture }) } });
afterEach(() => vi.unstubAllGlobals());

it("knows Windows and Linux from what the browser says", async () => {
  visit("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/156.0.0.0 Safari/537.36");
  expect(await visitorTarget()).toBe("win-x64");
  visit("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/156.0.0.0 Safari/537.36");
  expect(await visitorTarget()).toBe("linux-x64");
});

it("knows a Mac's chip only when Chromium names it", async () => {
  visit(MAC, chip("arm"));
  expect(await visitorTarget()).toBe("mac-arm64");
  visit(MAC, chip("x86"));
  expect(await visitorTarget()).toBe("mac-x64");
  visit("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15");
  expect(await visitorTarget()).toBeNull(); // Safari says Intel on both
});

it("never takes a phone or a tablet for a computer", async () => {
  visit("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148");
  expect(await visitorTarget()).toBeNull();
  visit(MAC, { maxTouchPoints: 5, ...chip("arm") }); // an iPad asking for the desktop site
  expect(await visitorTarget()).toBeNull();
  visit("Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/156.0.0.0 Mobile Safari/537.36");
  expect(await visitorTarget()).toBeNull();
});
