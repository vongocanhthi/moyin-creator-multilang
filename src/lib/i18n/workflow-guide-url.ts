// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.

import { APP_GITHUB_DOCS_BASE } from "@/config/github-repo";
/** GitHub URL for the workflow guide (English, canonical). */
export function getWorkflowGuideDocUrl(): string {
  return `${APP_GITHUB_DOCS_BASE}WORKFLOW_GUIDE.md`;
}
