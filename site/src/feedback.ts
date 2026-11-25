/** Who the feedback is about, as hubnx.com's report route registered it (hubnx's Assistant, 2026-11-20). */
import type { FeedbackApp } from "@hubnx/web-parts/feedback-report";
import { APP_NAME } from "../../app/src/shared/app-api.ts";

export const FEEDBACK: FeedbackApp = { key: "video", name: APP_NAME, support: "video@hubnx.com" };
