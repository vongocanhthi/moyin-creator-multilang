// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.

import type { PromptLanguage } from "@/types/script";

type ScriptLanguageToken = string | undefined;

/** Episode index label displayed in UI, based on script language (not app UI language). */
export function formatEpisodeIndexLabel(scriptLanguage: ScriptLanguageToken, episodeIndex: number): string {
  switch ((scriptLanguage || "").trim()) {
    case "Vietnamese":
      return `Tập ${episodeIndex}`;
    case "English":
      return `Episode ${episodeIndex}`;
    case "Japanese":
      return `第${episodeIndex}話`;
    case "Chinese":
    default:
      return `第${episodeIndex}集`;
  }
}

/** Full episode title stored on Episode / EpisodeRawScript after AI title calibration. */
export function formatCalibratedEpisodeTitle(
  episodeIndex: number,
  titleBody: string,
  promptLanguage: PromptLanguage | undefined
): string {
  const cleaned = titleBody.trim();
  const pl = promptLanguage ?? "zh";
  if (pl === "vi" || pl === "vi+en") {
    return `Tập ${episodeIndex}: ${cleaned}`;
  }
  if (pl === "en") {
    return `Episode ${episodeIndex}: ${cleaned}`;
  }
  return `第${episodeIndex}集：${cleaned}`;
}

/** Remove duplicate episode prefix if the model echoed it inside the title value. */
export function sanitizeTitleBodyFromAI(episodeIndex: number, raw: string): string {
  let s = raw.trim();
  s = s.replace(new RegExp(`^第${episodeIndex}集[：:]\\s*`), "");
  s = s.replace(new RegExp(`^第${episodeIndex}話[：:]\\s*`), "");
  s = s.replace(new RegExp(`^Tập\\s*${episodeIndex}\\s*[:：]\\s*`, "i"), "");
  s = s.replace(new RegExp(`^Episode\\s*${episodeIndex}\\s*[:：]\\s*`, "i"), "");
  return s.trim();
}

/**
 * Title text after removing stored episode-index prefix (第N集 / 第N話 / Tập N / Episode N).
 * Pair with a script-language episode index label to avoid mixed-language lines.
 */
export function stripStoredEpisodeTitlePrefix(title: string, episodeIndex: number): string {
  return sanitizeTitleBodyFromAI(episodeIndex, title);
}
