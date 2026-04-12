// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.

/** UI locale codes bundled with the app */
export type AppLocale = "en" | "zh" | "vi";

export const APP_LOCALES: { code: AppLocale; nativeLabel: string }[] = [
  { code: "en", nativeLabel: "English" },
  { code: "zh", nativeLabel: "简体中文" },
  { code: "vi", nativeLabel: "Tiếng Việt" },
];

export const DEFAULT_APP_LOCALE: AppLocale = "en";
