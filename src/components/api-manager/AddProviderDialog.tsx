// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.
"use client";

/**
 * Add Provider Dialog
 * For adding new API providers with platform selection
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { IProvider } from "@/lib/api-key-manager";
import { MEMEFAST_API_ORIGIN } from "@/constants/memefast";
import { RUNNINGHUB_API_BASE_URL } from "@/constants/runninghub";

type PlatformPreset = {
  platform: string;
  baseUrl: string;
  models: string[];
  recommended?: boolean;
};

const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    platform: "memefast",
    baseUrl: MEMEFAST_API_ORIGIN,
    models: [
      "deepseek-v3.2",
      "glm-4.7",
      "gemini-3-pro-preview",
      "gemini-3-pro-image-preview",
      "gpt-image-1.5",
      "doubao-seedance-1-5-pro-251215",
      "veo3.1",
      "sora-2-all",
      "wan2.6-i2v",
      "grok-video-3-10s",
      "claude-haiku-4-5-20251001",
    ],
    recommended: true,
  },
  {
    platform: "runninghub",
    baseUrl: RUNNINGHUB_API_BASE_URL,
    models: ["2009613632530812930"],
  },
  {
    platform: "custom",
    baseUrl: "",
    models: [],
  },
];

interface AddProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (provider: Omit<IProvider, "id">) => void;
  existingPlatforms?: string[];
}

export function AddProviderDialog({
  open,
  onOpenChange,
  onSubmit,
  existingPlatforms = [],
}: AddProviderDialogProps) {
  const { t } = useTranslation();
  const tk = (key: string) => t(`settings.addProviderDialog.${key}`);

  const [platform, setPlatform] = useState("");
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");

  const selectedPreset = PLATFORM_PRESETS.find((p) => p.platform === platform);
  const isCustom = platform === "custom";

  useEffect(() => {
    if (open) {
      setPlatform("");
      setName("");
      setBaseUrl("");
      setApiKey("");
      setModel("");
    }
  }, [open]);

  useEffect(() => {
    if (!selectedPreset) return;
    if (isCustom) {
      setName(t(`settings.addProviderDialog.presets.custom.name`));
      setBaseUrl("");
      setModel("");
      return;
    }
    setName(t(`settings.addProviderDialog.presets.${selectedPreset.platform}.name`));
    setBaseUrl(selectedPreset.baseUrl);
    if (selectedPreset.models.length > 0) {
      setModel(selectedPreset.models[0]);
    }
  }, [platform, selectedPreset, isCustom, t]);

  const handleSubmit = () => {
    if (!platform) {
      toast.error(t("settings.addProviderDialog.errors.selectPlatform"));
      return;
    }
    if (!name.trim()) {
      toast.error(t("settings.addProviderDialog.errors.enterName"));
      return;
    }
    if (isCustom && !baseUrl.trim()) {
      toast.error(t("settings.addProviderDialog.errors.customBaseUrl"));
      return;
    }
    if (!apiKey.trim()) {
      toast.error(t("settings.addProviderDialog.errors.enterApiKey"));
      return;
    }

    const presetModels = selectedPreset?.models || [];
    const modelArray = presetModels.length > 0 ? presetModels : model ? [model] : [];

    onSubmit({
      platform,
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      model: modelArray,
    });

    onOpenChange(false);
    toast.success(
      isMemefastAppend
        ? t("settings.addProviderDialog.toast.successAppend", { name: name.trim() })
        : t("settings.addProviderDialog.toast.successAdded", { name: name.trim() }),
    );
  };

  const availablePlatforms = PLATFORM_PRESETS.filter(
    (p) => p.platform === "custom" || p.platform === "memefast" || !existingPlatforms.includes(p.platform),
  );
  const isMemefastAppend = platform === "memefast" && existingPlatforms.includes("memefast");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tk("title")}</DialogTitle>
          <DialogDescription className="sr-only">{tk("description")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <Label>{tk("platform")}</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder={tk("selectPlatform")} />
              </SelectTrigger>
              <SelectContent>
                {availablePlatforms.map((preset) => (
                  <SelectItem key={preset.platform} value={preset.platform}>
                    <span className="flex items-center gap-2">
                      {t(`settings.addProviderDialog.presets.${preset.platform}.name`)}
                      {preset.recommended && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded font-medium">
                          {t("settings.api.recommended")}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{tk("name")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tk("namePlaceholder")}
            />
          </div>

          {(isCustom || platform) && (
            <div className="space-y-2">
              <Label>
                {tk("baseUrl")} {!isCustom && <span className="text-muted-foreground font-normal">{tk("baseUrlOptionalEdit")}</span>}
              </Label>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={isCustom ? tk("baseUrlPlaceholder") : ""}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{tk("apiKey")}</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={tk("apiKeyPlaceholder")}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">{tk("apiKeyHint")}</p>
          </div>

          <div className="space-y-2">
            <Label>{tk("modelOptional")}</Label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={tk("modelPlaceholder")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tk("cancel")}
          </Button>
          <Button onClick={handleSubmit}>{isMemefastAppend ? tk("appendKey") : tk("add")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
