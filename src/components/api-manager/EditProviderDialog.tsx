// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.
"use client";

/**
 * Edit Provider Dialog
 * For editing existing API providers
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { IProvider } from "@/lib/api-key-manager";
import { getApiKeyCount } from "@/lib/api-key-manager";

interface EditProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: IProvider | null;
  onSave: (provider: IProvider) => void;
}

export function EditProviderDialog({
  open,
  onOpenChange,
  provider,
  onSave,
}: EditProviderDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");

  // Initialize form when provider changes
  useEffect(() => {
    if (provider) {
      setName(provider.name);
      setBaseUrl(provider.baseUrl);
      setApiKey(provider.apiKey);
      setModel(provider.model?.join(", ") || "");
    }
  }, [provider]);

  const handleSave = () => {
    if (!provider) return;

    if (!name.trim()) {
      toast.error(t("settings.editProviderDialog.errors.nameRequired"));
      return;
    }

    const models = model
      .split(/[,\n]/)
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    onSave({
      ...provider,
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      model: models,
    });

    onOpenChange(false);
    toast.success(t("settings.editProviderDialog.toastSaved"));
  };

  const keyCount = getApiKeyCount(apiKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("settings.editProviderDialog.title")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              {t("settings.editProviderDialog.platform")}
            </Label>
            <Input value={provider?.platform || ""} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>{t("settings.editProviderDialog.name")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("settings.editProviderDialog.namePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("settings.editProviderDialog.baseUrl")}</Label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={t("settings.editProviderDialog.baseUrlPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("settings.editProviderDialog.apiKeysLabel")}</Label>
              <span className="text-xs text-muted-foreground">
                {t("settings.editProviderDialog.keyCount", { count: keyCount })}
              </span>
            </div>
            <Textarea
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t("settings.editProviderDialog.apiKeysPlaceholder")}
              className="font-mono text-sm min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              {t("settings.editProviderDialog.apiKeysHint")}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("settings.editProviderDialog.model")}</Label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={t("settings.editProviderDialog.modelPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">
              {t("settings.editProviderDialog.modelHint")}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("settings.editProviderDialog.cancel")}
          </Button>
          <Button onClick={handleSave}>{t("settings.editProviderDialog.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
