// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.

/**
 * Demo seed stores SeriesMeta.title in Chinese (e.g. 灌篮少女) while project.name
 * may be migrated separately — localize display for the demo project only.
 */
import type { TFunction } from "i18next";
import { DEMO_PROJECT_ID } from "@/stores/project-store";

/** Raw titles shipped with / historically used for the demo series */
const DEMO_SERIES_TITLE_KEYS = new Set([
  "灌篮少女",
  "灌篮少女（演示）",
  "灌篮少女 (演示)",
  "灌篮少女(演示)",
  "Slam Dunk Girl",
  /** Legacy / locale-saved copy of the demo series title */
  "Cô gái Slam Dunk",
]);

export function getLocalizedDemoSeriesTitle(
  projectId: string | null | undefined,
  storedTitle: string | undefined,
  t: TFunction
): string {
  if (!storedTitle) return "";
  if (projectId !== DEMO_PROJECT_ID) return storedTitle;
  /** Seed or editor may add trailing spaces — normalize before lookup */
  const key = storedTitle.trim();
  if (!DEMO_SERIES_TITLE_KEYS.has(key)) return storedTitle;
  return t("demoProject.seriesTitle");
}
