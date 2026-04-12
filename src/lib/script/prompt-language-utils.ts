// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.

import type { PromptLanguage } from "@/types/script";

/** Chinese-only prompts */
export function promptLangIncludesZh(p: PromptLanguage): boolean {
  return p === "zh" || p === "zh+en";
}

/** English prompts (incl. bilingual with Chinese or Vietnamese) */
export function promptLangIncludesEn(p: PromptLanguage): boolean {
  return p === "en" || p === "zh+en" || p === "vi+en";
}

/** Vietnamese prompts */
export function promptLangIncludesVi(p: PromptLanguage): boolean {
  return p === "vi" || p === "vi+en";
}
