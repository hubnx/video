/**
 * The part of the picture shown: all of it, a 9:16 window across a landscape picture (a short), or either punched in
 * about the speaker's face (smooth jump cuts). The compositor draws whatever view it's given, so the preview and the
 * export frame a short alike (preview/compositor.ts). Pure.
 */
import type { View } from "../preview/compositor.ts";

/** A short's shape, width over height: YouTube Shorts, TikTok and Reels all take 9:16. */
export const SHORTS_SHAPE = 9 / 16;

/** The share of the picture's width a 9:16 window takes: 1 for a picture already that narrow, which a short shows whole
 * across. */
export function shortsWidth(pictureWidth: number, pictureHeight: number): number {
  return Math.min(1, (pictureHeight * SHORTS_SHAPE) / pictureWidth);
}

/** The 9:16 window with its centre at `centre` across the picture, kept inside it. A picture narrower than 9:16 shows its
 * whole width and the middle of its height. */
export function shortsView(pictureWidth: number, pictureHeight: number, centre: number): View {
  const width = shortsWidth(pictureWidth, pictureHeight);
  if (width < 1) return { left: Math.min(Math.max(centre - width / 2, 0), 1 - width), top: 0, width, height: 1 };
  const height = Math.min(1, pictureWidth / SHORTS_SHAPE / pictureHeight);
  return { left: 0, top: (1 - height) / 2, width: 1, height };
}

/** `view` punched in `scale` times about `point` (the speaker's face): the point keeps its place on screen and the rest
 * grows around it, so the cut reads as a closer camera rather than a slide. A point outside the view zooms about its
 * nearest edge, and the result always stays inside the view. */
export function zoomedView(view: View, point: { x: number; y: number }, scale: number): View {
  const x = Math.min(Math.max(point.x, view.left), view.left + view.width);
  const y = Math.min(Math.max(point.y, view.top), view.top + view.height);
  return { left: x - (x - view.left) / scale, top: y - (y - view.top) / scale, width: view.width / scale, height: view.height / scale };
}
