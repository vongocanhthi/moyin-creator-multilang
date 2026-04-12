// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.
"use client";

/**
 * API Settings Component
 * Configure API keys for AI services
 */

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAPIConfigStore } from "@/stores/api-config-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProviderId } from "@opencut/ai-core";

interface APISettingsProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function APISettings({ collapsed = true, onToggleCollapse }: APISettingsProps) {
  const { t } = useTranslation();
  const { 
    apiKeys, 
    concurrency,
    setApiKey, 
    setConcurrency,
    isConfigured,
  } = useAPIConfigStore();

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({
    memefast: false,
    runninghub: false,
  });

  const [testing, setTesting] = useState<ProviderId | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({
    memefast: null,
    runninghub: null,
  });

  const toggleShowKey = (provider: ProviderId) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const testConnection = async (provider: ProviderId) => {
    setTesting(provider);
    setTestResults(prev => ({ ...prev, [provider]: null }));

    try {
      // Just verify the key is set - actual test requires running API
      const key = apiKeys[provider] || "";
      setTestResults(prev => ({ ...prev, [provider]: key.length > 0 }));
    } catch {
      setTestResults(prev => ({ ...prev, [provider]: false }));
    } finally {
      setTesting(null);
    }
  };

  const providers = useMemo(
    (): Array<{
      id: ProviderId;
      name: string;
      description: string;
    }> => [
      {
        id: "memefast",
        name: t("settings.api.memefastTitle"),
        description: t("director.apiSettings.memefastDesc"),
      },
      {
        id: "runninghub",
        name: t("settings.api.runninghubTitle"),
        description: t("director.apiSettings.runninghubDesc"),
      },
    ],
    [t],
  );

  const memefastServiceKeys = ["chat", "image", "video", "vision"] as const;
  const runninghubServiceKeys = ["angle", "i2i"] as const;

  if (collapsed) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between"
        onClick={onToggleCollapse}
      >
        <span className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          {t("director.apiSettings.title")}
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          {t("director.apiSettings.title")}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onToggleCollapse}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      {/* Provider Keys */}
      <div className="space-y-4">
        {providers.map((provider) => (
          <div key={provider.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{provider.name}</Label>
              {isConfigured(provider.id) && (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {t("director.apiSettings.configured")}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{provider.description}</p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKeys[provider.id] ? "text" : "password"}
                  placeholder={t("director.apiSettings.placeholderKey", { name: provider.name })}
                  value={apiKeys[provider.id] || ""}
                  onChange={(e) => setApiKey(provider.id, e.target.value)}
                  className="pr-10 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleShowKey(provider.id)}
                >
                  {showKeys[provider.id] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={!isConfigured(provider.id) || testing === provider.id}
                onClick={() => testConnection(provider.id)}
              >
                {testing === provider.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : testResults[provider.id] === true ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : testResults[provider.id] === false ? (
                  <X className="h-4 w-4 text-destructive" />
                ) : (
                  t("director.apiSettings.test")
                )}
              </Button>
            </div>
            {/* Service badges */}
            <div className="flex gap-1">
              {(provider.id === "memefast" ? memefastServiceKeys : runninghubServiceKeys).map((key) => (
                <span
                  key={key}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted"
                >
                  {provider.id === "memefast"
                    ? t(`director.apiSettings.memefastServices.${key}`)
                    : t(`director.apiSettings.runninghubServices.${key}`)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Concurrency Setting */}
      <div className="pt-2 border-t space-y-2">
        <Label className="text-sm font-medium">{t("director.apiSettings.concurrency")}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={5}
            value={concurrency}
            onChange={(e) => setConcurrency(parseInt(e.target.value) || 1)}
            className="w-20 text-sm"
          />
          <span className="text-xs text-muted-foreground">
            {t("director.apiSettings.concurrencyHint")}
          </span>
        </div>
      </div>

      {/* Tips */}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          {t("director.apiSettings.keyLocalTip")}
        </p>
      </div>
    </div>
  );
}
