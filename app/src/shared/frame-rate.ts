/**
 * The steady frame rate a clip is copied and exported at: a phone's varying rate made constant at the nearest common
 * rate (29.94 averaged becomes 30000/1001), and an unusual one kept. One table, so the proxy, the edit copy and the
 * export all land on the same rate.
 */
const COMMON: { value: number; ffmpeg: string }[] = [
  { value: 24000 / 1001, ffmpeg: "24000/1001" }, { value: 24, ffmpeg: "24" }, { value: 25, ffmpeg: "25" },
  { value: 30000 / 1001, ffmpeg: "30000/1001" }, { value: 30, ffmpeg: "30" }, { value: 48, ffmpeg: "48" }, { value: 50, ffmpeg: "50" },
  { value: 60000 / 1001, ffmpeg: "60000/1001" }, { value: 60, ffmpeg: "60" }, { value: 120, ffmpeg: "120" },
];

export function steadyRate(average: number): { value: number; ffmpeg: string } {
  const nearest = COMMON.reduce((best, each) => (Math.abs(each.value - average) < Math.abs(best.value - average) ? each : best));
  if (Math.abs(nearest.value - average) / nearest.value < 0.02) return nearest;
  const rounded = Math.round(average) || 30;
  return { value: rounded, ffmpeg: String(rounded) };
}
