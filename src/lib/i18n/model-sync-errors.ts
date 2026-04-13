// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.

import type { TFunction } from "i18next";

/** Exact legacy Chinese strings from older api-config-store.syncProviderModels. */
const LEGACY_ZH: Record<string, string> = {
  供应商不存在: "settings.syncErrors.providerNotFound",
  "请先配置 API Key": "settings.syncErrors.apiKeyRequired",
  "Base URL 未配置": "settings.syncErrors.baseUrlRequired",
  响应格式异常: "settings.syncErrors.pricingBadFormat",
  未获取到任何模型: "settings.syncErrors.noModels",
  "API 返回异常": "settings.syncErrors.apiAbnormal",
  "网络请求失败，请检查网络": "settings.syncErrors.networkFailed",
};

function parseLegacyZhDynamic(
  raw: string
): { key: string; params?: Record<string, string> } | null {
  let m = raw.match(/^pricing_new API 返回 (\d+)$/);
  if (m) return { key: "settings.syncErrors.pricingHttp", params: { status: m[1] } };
  m = raw.match(/^key#(\d+) API 返回 (\d+)$/);
  if (m) return { key: "settings.syncErrors.keyHttp", params: { index: m[1], status: m[2] } };
  m = raw.match(/^key#(\d+) 网络请求失败$/);
  if (m) return { key: "settings.syncErrors.keyNetwork", params: { index: m[1] } };
  return null;
}

/**
 * Localized message for `syncProviderModels` errors (machine codes + legacy Chinese).
 */
export function formatModelSyncError(raw: string | undefined, t: TFunction): string {
  if (!raw) return t("settings.syncErrors.unknown");

  const dyn = parseLegacyZhDynamic(raw);
  if (dyn) {
    return dyn.params ? t(dyn.key, dyn.params) : t(dyn.key);
  }

  if (raw in LEGACY_ZH) {
    return t(LEGACY_ZH[raw]);
  }

  if (raw.startsWith("pricing_http:")) {
    return t("settings.syncErrors.pricingHttp", { status: raw.slice("pricing_http:".length) });
  }
  if (raw.startsWith("key_http:")) {
    const [, index, status] = raw.split(":");
    if (index && status) {
      return t("settings.syncErrors.keyHttp", { index, status });
    }
  }
  if (raw.startsWith("key_network:")) {
    return t("settings.syncErrors.keyNetwork", { index: raw.slice("key_network:".length) });
  }

  const simple: Record<string, string> = {
    provider_not_found: "settings.syncErrors.providerNotFound",
    api_key_required: "settings.syncErrors.apiKeyRequired",
    base_url_required: "settings.syncErrors.baseUrlRequired",
    pricing_bad_format: "settings.syncErrors.pricingBadFormat",
    api_abnormal: "settings.syncErrors.apiAbnormal",
    no_models: "settings.syncErrors.noModels",
    network_failed: "settings.syncErrors.networkFailed",
  };
  const path = simple[raw];
  if (path) return t(path);

  return raw;
}
