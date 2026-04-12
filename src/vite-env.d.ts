// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional override for Moyin API registration link (e.g. short redirect URL). */
  readonly VITE_MEMEFAST_PORTAL_URL?: string;
  /** Optional override for RunningHub web entry from in-app CTAs. */
  readonly VITE_RUNNINGHUB_PORTAL_URL?: string;
}
