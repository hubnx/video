/**
 * The systems the app is built for, one name each: the packages (scripts/package.ts), the FFmpeg each carries
 * (scripts/fetch-ffmpeg.ts, ../ffmpeg/build.sh) and the copy run from the repo (paths.ts) all use these.
 */
export const TARGETS = ["mac-arm64", "mac-x64", "win-x64", "linux-x64"] as const;
export type Target = (typeof TARGETS)[number];

/** The target a running copy is: the copy run from the repo uses its own system's FFmpeg build. */
export function targetOf(platform: NodeJS.Platform, arch: string): Target {
  const target = `${platform === "darwin" ? "mac" : platform === "win32" ? "win" : platform}-${arch}`;
  if (!(TARGETS as readonly string[]).includes(target)) throw new Error(`no build for ${platform} ${arch}`);
  return target as Target;
}

/** FFmpeg's two programs as each system names them. */
export function programName(platform: NodeJS.Platform, program: "ffmpeg" | "ffprobe"): string {
  return platform === "win32" ? `${program}.exe` : program;
}
