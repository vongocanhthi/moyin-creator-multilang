// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.

import { APP_GITHUB_DOCS_BASE } from "@/config/github-repo";
import type { AppLocale } from "@/types/locale";

/** GitHub URL for the workflow guide markdown matching the app UI language. */
export function getWorkflowGuideDocUrl(locale: AppLocale): string {
  switch (locale) {
    case "vi":
      return `${APP_GITHUB_DOCS_BASE}WORKFLOW_GUIDE_VI.md`;
    case "zh":
      return `${APP_GITHUB_DOCS_BASE}WORKFLOW_GUIDE.md`;
    case "en":
    default:
      return `${APP_GITHUB_DOCS_BASE}WORKFLOW_GUIDE_EN.md`;
  }
}
