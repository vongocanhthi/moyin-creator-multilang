// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.

import i18n from "@/i18n/i18n";
import type { PromptLanguage } from "@/types/script";

/**
 * Default script content language + prompt language for a new script project,
 * aligned with the current app UI language (i18n).
 */
export function getDefaultScriptLanguageFieldsForAppLocale(): {
  language: string;
  promptLanguage: PromptLanguage;
} {
  const lng = i18n.resolvedLanguage ?? i18n.language ?? "en";
  if (lng.startsWith("zh")) {
    return { language: "Chinese", promptLanguage: "zh" };
  }
  if (lng.startsWith("ja")) {
    return { language: "Japanese", promptLanguage: "ja" };
  }
  if (lng.startsWith("ko")) {
    return { language: "Korean", promptLanguage: "ko" };
  }
  if (lng.startsWith("vi")) {
    return { language: "Vietnamese", promptLanguage: "vi" };
  }
  return { language: "English", promptLanguage: "en" };
}
