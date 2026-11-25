/** Processor threads for a model: all but one, at most 8 (the filler check's and the voice check's speeds were measured
 * at 8). Its own module so the checks, which run in plain Node, use the same rule as the app. */
import { availableParallelism } from "node:os";

export function modelThreads(): number {
  return Math.max(1, Math.min(8, availableParallelism() - 1));
}
