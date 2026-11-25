/**
 * How long voice clean-up will take, said on its switch before it's turned on (gate 7, `video assistant`, 2026-11-24).
 * In seconds of work per minute of sound. Once this computer has cleaned a voice, its own speed (kept in its settings by
 * electron/main.ts); until then, the speed measured on a computer of its kind, by scripts/time-voice.ts (`gh workflow
 * run voice-speed.yml` for GitHub's).
 */
// Measured 2026-11-24 at normal priority (at background priority, as checks run here, it took 41.7 s). Threads barely
// matter: 1 to 8 took 23 to 25 s here, so GitHub's 2-core machines, at 1 thread, aren't held back by it.
export const MEASURED_SECONDS_PER_MINUTE: Readonly<Record<string, number>> = {
  "darwin-x64": 24.3, // this Intel Mac, a Xeon W-3245
  "darwin-arm64": 14.2, // GitHub's Apple-chip Mac, an M2 Pro (virtual), 4 threads
  "win32-x64": 24.4, // GitHub's Windows, a Xeon Platinum 8573C, 1 thread
  "linux-x64": 21.2, // GitHub's Ubuntu, an EPYC 7763, 1 thread
};

/** A computer of a kind not measured (Windows or Linux on an Arm chip) gets the slowest measured. */
export function expectedSecondsPerMinute(platform: string, arch: string, own: number | undefined): number {
  if (own !== undefined && own > 0) return own;
  return MEASURED_SECONDS_PER_MINUTE[`${platform}-${arch}`] ?? Math.max(...Object.values(MEASURED_SECONDS_PER_MINUTE));
}

export function voiceSeconds(durationSeconds: number, secondsPerMinute: number): number {
  return (durationSeconds / 60) * secondsPerMinute;
}
