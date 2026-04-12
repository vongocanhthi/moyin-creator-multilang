// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.

/** Origin for Moyin API (memefast) OpenAI-compatible HTTP requests */
export const MEMEFAST_API_ORIGIN = "https://memefast.top";

/** Default registration entry for Moyin API (CTAs in Settings). */
const MEMEFAST_PORTAL_DEFAULT = "https://memefast.top/register?aff=Fw33";

/**
 * URL opened for “Get API key” / portal actions. Prefer a short URL you control
 * via `VITE_MEMEFAST_PORTAL_URL` (302 → provider) so the status bar does not show
 * the long query string.
 */
export const MEMEFAST_PORTAL_URL: string =
  (import.meta.env.VITE_MEMEFAST_PORTAL_URL?.trim() || MEMEFAST_PORTAL_DEFAULT);

/** Open Moyin API portal in a new tab (use instead of `<a href>` to avoid exposing the URL on hover). */
export function openMemefastPortal(): void {
  window.open(MEMEFAST_PORTAL_URL, "_blank", "noopener,noreferrer");
}
