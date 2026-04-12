// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.

/** RunningHub OpenAPI v2 base URL (international site). */
export const RUNNINGHUB_API_BASE_URL = "https://www.runninghub.ai/openapi/v2";

/** Default web entry when opening RunningHub from in-app CTAs (account / API setup). */
const RUNNINGHUB_PORTAL_DEFAULT = "https://www.runninghub.ai/?inviteCode=thxpek8c";

/**
 * URL opened for “Open RunningHub” actions. Optional override via
 * `VITE_RUNNINGHUB_PORTAL_URL` (e.g. your own short redirect).
 */
export const RUNNINGHUB_PORTAL_URL: string =
  import.meta.env.VITE_RUNNINGHUB_PORTAL_URL?.trim() || RUNNINGHUB_PORTAL_DEFAULT;

/** Open RunningHub in a new tab (prefer over `<a href>` so the URL is not shown on hover). */
export function openRunninghubPortal(): void {
  window.open(RUNNINGHUB_PORTAL_URL, "_blank", "noopener,noreferrer");
}
