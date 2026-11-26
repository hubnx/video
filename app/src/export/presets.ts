/**
 * Export's sizes and bitrates. The YouTube preset is the default: YouTube's recommended upload bitrates for SDR H.264
 * (its help page "Recommended upload encoding settings": 720p 5 Mb/s, 1080p 8, 4K 35–45 at 24–30 fps; about half again
 * at 48–60 fps), at the clip's own size up to 4K. Never larger than the clip: enlarging adds nothing but bytes.
 */
export const EXPORT_SIZES = { "720p": 720, "1080p": 1080, "4K": 2160 } as const;
export type ExportSize = keyof typeof EXPORT_SIZES;

const MEGABITS: Record<ExportSize, number> = { "720p": 5, "1080p": 8, "4K": 40 };

/** The sizes a clip can be exported at: those its shorter side reaches (720p always, for a smaller clip). */
export function sizesFor(width: number, height: number): ExportSize[] {
  const shorter = Math.min(width, height);
  const fits = (Object.keys(EXPORT_SIZES) as ExportSize[]).filter((size) => EXPORT_SIZES[size] <= shorter);
  return fits.length ? fits : ["720p"];
}

/** The output's width and height for `size`, the clip's shape kept and both even, as H.264 needs. */
export function exportDimensions(width: number, height: number, size: ExportSize): { width: number; height: number } {
  const shorter = Math.min(width, height, EXPORT_SIZES[size]);
  const scale = shorter / Math.min(width, height);
  const even = (value: number) => Math.max(2, Math.round((value * scale) / 2) * 2);
  return { width: even(width), height: even(height) };
}

export function exportBitrate(size: ExportSize, frameRate: number): number {
  return Math.round(MEGABITS[size] * (frameRate > 31 ? 1.5 : 1) * 1_000_000);
}

/** A short's size: YouTube Shorts, TikTok and Reels all ask for 1080 × 1920. A smaller clip's window is enlarged to it,
 * as every shorts tool does, since the platforms show anything smaller enlarged anyway. */
export const SHORTS_DIMENSIONS = { width: 1080, height: 1920 } as const;

/** The longest short YouTube Shorts and Instagram Reels take (both 3 minutes since 2024-25); a longer edit still exports,
 * and the dialog says so. */
export const SHORTS_LONGEST_SECONDS = 180;

/** How captions go out with the export: drawn into the picture, as an .srt file beside it, or not at all. */
export const CAPTION_OUTPUTS = ["burnedIn", "file", "none"] as const;
export type CaptionOutput = (typeof CAPTION_OUTPUTS)[number];
