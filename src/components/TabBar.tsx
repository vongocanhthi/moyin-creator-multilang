// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.
import { useTranslation } from "react-i18next";
import { mainNavItems, bottomNavItems, type Tab, useMediaPanelStore } from "@/stores/media-panel-store";
import { useThemeStore } from "@/stores/theme-store";
import { useAppSettingsStore } from "@/stores/app-settings-store";
import { getWorkflowGuideDocUrl } from "@/lib/i18n/workflow-guide-url";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_LOCALES, type AppLocale } from "@/types/locale";
import { ChevronLeft, LayoutDashboard, Settings, Sun, Moon, HelpCircle, Globe } from "lucide-react";

function TabBarLanguageMenu() {
  const { t } = useTranslation();
  const locale = useAppSettingsStore((s) => s.locale);
  const setLocale = useAppSettingsStore((s) => s.setLocale);

  return (
    <TooltipProvider delayDuration={300}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex flex-col items-center py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="text-[8px]">{t("tabBar.language")}</span>
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">{t("tabBar.languageTooltip")}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent side="right" align="start" className="min-w-[10rem]">
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={(v) => setLocale(v as AppLocale)}
          >
            {APP_LOCALES.map(({ code, nativeLabel }) => (
              <DropdownMenuRadioItem key={code} value={code}>
                {nativeLabel}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}

export function TabBar() {
  const { t } = useTranslation();
  const workflowGuideHref = getWorkflowGuideDocUrl();
  const { activeTab, inProject, setActiveTab, setInProject } = useMediaPanelStore();
  const { theme, toggleTheme } = useThemeStore();

  const navLabel = (id: Tab) => t(`nav.${id}`);

  // Dashboard mode
  if (!inProject) {
    return (
      <div className="flex flex-col w-14 bg-panel border-r border-border py-2">
        <div className="p-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center mx-auto rounded">
            <span className="text-sm font-bold">M</span>
          </div>
        </div>
        {/* Dashboard nav */}
        <nav className="flex-1 py-1">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={cn(
                    "w-full flex flex-col items-center py-2.5 transition-colors",
                    activeTab === "dashboard"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <LayoutDashboard className="h-5 w-5 mb-0.5" />
                  <span className="text-[9px]">{t("tabBar.project")}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{t("tabBar.projectDashboardTooltip")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        {/* Bottom: Language + Help + Settings + Theme */}
        <div className="mt-auto border-t border-border py-1">
          <TabBarLanguageMenu />
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={workflowGuideHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex flex-col items-center py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="text-[8px]">{t("tabBar.help")}</span>
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">{t("tabBar.helpTooltip")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={cn(
                    "w-full flex flex-col items-center py-2 transition-colors",
                    activeTab === "settings" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-[8px]">{t("tabBar.settingsShort")}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{t("tabBar.settingsTooltip")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Theme Toggle */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  className="w-full flex flex-col items-center py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span className="text-[8px]">{theme === "dark" ? t("tabBar.light") : t("tabBar.dark")}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {theme === "dark" ? t("tabBar.switchToLight") : t("tabBar.switchToDark")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  // Project mode - flat navigation
  return (
    <div className="flex flex-col w-14 bg-panel border-r border-border">
      {/* Logo + Back */}
      <div className="p-2 border-b border-border">
        <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center mx-auto rounded mb-1">
          <span className="text-sm font-bold">M</span>
        </div>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setInProject(false)}
                className="flex items-center justify-center w-full h-5 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{t("tabBar.backToProjects")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-1">
        {mainNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <TooltipProvider key={item.id} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex flex-col items-center py-2.5 transition-colors",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-5 w-5 mb-0.5" />
                    <span className="text-[9px]">{navLabel(item.id)}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.phase
                    ? t("tabBar.phaseTooltip", {
                        label: navLabel(item.id),
                        phase: item.phase,
                      })
                    : navLabel(item.id)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </nav>

      {/* Bottom: Language + Help + Settings + Theme */}
      <div className="mt-auto border-t border-border py-1">
        <TabBarLanguageMenu />
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={workflowGuideHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex flex-col items-center py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="text-[8px]">{t("tabBar.help")}</span>
              </a>
            </TooltipTrigger>
            <TooltipContent side="right">{t("tabBar.helpTooltip")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {bottomNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <TooltipProvider key={item.id} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex flex-col items-center py-2 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[8px]">{navLabel(item.id)}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{navLabel(item.id)}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
        {/* Theme Toggle */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                className="w-full flex flex-col items-center py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="text-[8px]">{theme === "dark" ? t("tabBar.light") : t("tabBar.dark")}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {theme === "dark" ? t("tabBar.switchToLight") : t("tabBar.switchToDark")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
