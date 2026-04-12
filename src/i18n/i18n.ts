// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import vi from "@/locales/vi.json";
import type { AppLocale } from "@/types/locale";
import { DEFAULT_APP_LOCALE } from "@/types/locale";

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  vi: { translation: vi },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_APP_LOCALE,
  fallbackLng: DEFAULT_APP_LOCALE,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setAppLanguage(locale: AppLocale): void {
  void i18n.changeLanguage(locale);
}

export default i18n;
