import type { VideoApi } from "./shared/app-api.ts";

declare global {
  interface Window {
    video: VideoApi; // electron/preload.ts
  }
}
