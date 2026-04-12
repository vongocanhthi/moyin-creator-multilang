// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.

import type { TFunction } from "i18next";

/**
 * Display name for AI API providers — stored `name` may be legacy Chinese;
 * known platforms resolve via i18n keys.
 */
export function localizedAiProviderName(
  platform: string,
  storedName: string,
  t: TFunction,
): string {
  if (platform === "memefast") return t("settings.api.memefastTitle");
  if (platform === "runninghub") return t("settings.api.runninghubTitle");
  return storedName;
}

/**
 * Display name for image host cards — preset names may be Chinese in storage.
 */
export function localizedImageHostName(
  platform: string,
  storedName: string,
  t: TFunction,
): string {
  if (platform === "scdn") return t("settings.imagehost.platforms.scdn");
  if (platform === "custom") return t("settings.imagehost.platforms.custom");
  return storedName;
}
