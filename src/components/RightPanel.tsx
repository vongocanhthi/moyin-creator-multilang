// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.
import { useTranslation } from "react-i18next";
import { useMediaPanelStore } from "@/stores/media-panel-store";
import { DirectorContextPanel } from "@/components/panels/director/context-panel";

export function RightPanel() {
  const { t } = useTranslation();
  const { activeTab } = useMediaPanelStore();

  // 根据当前Tab显示不同内容
  const renderContent = () => {
    switch (activeTab) {
      case "director":
      case "sclass":
        return (
          <div className="flex-1 min-w-0 overflow-hidden">
            <DirectorContextPanel />
          </div>
        );
      case "media":
        return (
          <div className="flex-1 min-w-0 flex items-center justify-center text-muted-foreground text-sm">
            <p>{t("media.propertiesPlaceholder")}</p>
          </div>
        );
      default:
        return (
          <div className="flex-1 min-w-0 flex items-center justify-center text-muted-foreground text-sm">
            <p>{t("director.shell.placeholder")}</p>
          </div>
        );
    }
  };

  const propertiesTitle =
    activeTab === "media" ? t("media.properties") : t("director.shell.properties");

  return (
    <div className="h-full min-w-0 flex flex-col overflow-hidden bg-panel">
      <div className="p-3 border-b border-border">
        <h3 className="font-medium text-sm">{propertiesTitle}</h3>
      </div>
      {renderContent()}
    </div>
  );
}
