// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.
"use client";

/**
 * Settings Panel - Unified API Manager v2
 * Provider-based API configuration with multi-key support
 * Based on AionUi's ModelModalContent pattern
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  isVisibleImageHostProvider,
  useAPIConfigStore,
  type IProvider,
  type ImageHostProvider,
  type AIFeature,
} from "@/stores/api-config-store";
import { useAppSettingsStore } from "@/stores/app-settings-store";
import type { AppLocale } from "@/types/locale";
import { APP_LOCALES } from "@/types/locale";
import { useProjectStore } from "@/stores/project-store";
import { useCharacterLibraryStore } from "@/stores/character-library-store";
import { useSceneStore } from "@/stores/scene-store";
import { useMediaStore } from "@/stores/media-store";
import { getApiKeyCount, parseApiKeys, maskApiKey } from "@/lib/api-key-manager";
import { AddProviderDialog, EditProviderDialog, FeatureBindingPanel } from "@/components/api-manager";
import { AddImageHostDialog } from "@/components/image-host-manager/AddImageHostDialog";
import { EditImageHostDialog } from "@/components/image-host-manager/EditImageHostDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Key,
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Shield,
  Check,
  X,
  Loader2,
  MessageSquare,
  Zap,
  ScanEye,
  Info,
  Image,
  RotateCcw,
  Link2,
  Play,
  ShieldAlert,
  Layers,
  Folder,
  HardDrive,
  Download,
  RefreshCw,
  Upload,
  ExternalLink,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { uploadToImageHost } from "@/lib/image-host";
import {
  localizedAiProviderName,
  localizedImageHostName,
} from "@/lib/i18n/settings-labels";
import packageJson from "../../../package.json";
import { INDEXEDDB_APP_DB_NAME } from "@/constants/storage";
import { APP_GITHUB_RELEASES_URL } from "@/config/github-repo";
import { openMemefastPortal } from "@/constants/memefast";
import { openRunninghubPortal } from "@/constants/runninghub";

// Platform icon mapping
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  memefast: <Zap className="h-5 w-5" />,
  runninghub: <Image className="h-5 w-5" />,
  custom: <Settings className="h-5 w-5" />,
};

export function SettingsPanel() {
  const { t } = useTranslation();
  const {
    providers,
    concurrency,
    advancedOptions,
    imageHostProviders,
    addProvider,
    updateProvider,
    removeProvider,
    addImageHostProvider,
    updateImageHostProvider,
    removeImageHostProvider,
    setConcurrency,
    setAdvancedOption,
    resetAdvancedOptions,
    isImageHostConfigured,
    syncProviderModels,
    setFeatureBindings,
    getFeatureBindings,
  } = useAPIConfigStore();
  const {
    locale,
    setLocale,
    resourceSharing,
    storagePaths,
    cacheSettings,
    setResourceSharing,
    setStoragePaths,
    setCacheSettings,
  } = useAppSettingsStore();
  const { activeProjectId } = useProjectStore();
  const { assignProjectToUnscoped: assignCharactersToProject } = useCharacterLibraryStore();
  const { assignProjectToUnscoped: assignScenesToProject } = useSceneStore();
  const { assignProjectToUnscoped: assignMediaToProject } = useMediaStore();

  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<IProvider | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [imageHostAddOpen, setImageHostAddOpen] = useState(false);
  const [imageHostEditOpen, setImageHostEditOpen] = useState(false);
  const [editingImageHost, setEditingImageHost] = useState<ImageHostProvider | null>(null);
  const [testingImageHostId, setTestingImageHostId] = useState<string | null>(null);
  const [cacheSize, setCacheSize] = useState(0);
  const [isCacheLoading, setIsCacheLoading] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [appVersion, setAppVersion] = useState(packageJson.version);
  const visibleImageHostProviders = useMemo(
    () => imageHostProviders.filter(isVisibleImageHostProvider),
    [imageHostProviders],
  );

  // ====== Memefast 默认绑定自动补全 ======
  // 覆盖场景：
  //  1. 旧版本升级后已有 key 但 featureBindings 为空
  //  2. 旧版本留下无效绑定（模型名错、provider ID 变更等）
  //  3. 用户编辑填 key 后页面刷新
  useEffect(() => {
    const mf = providers.find(p => p.platform === 'memefast');
    if (!mf || parseApiKeys(mf.apiKey).length === 0) return;

    const pid = mf.id;
    const models = mf.model || [];
    const defaults: Record<string, string> = {
      script_analysis: `${pid}:deepseek-v3.2`,
      character_generation: `${pid}:gemini-3-pro-image-preview`,
      video_generation: `${pid}:doubao-seedance-1-5-pro-251215`,
      image_understanding: `${pid}:gemini-2.5-flash`,
    };

    // 检查绑定是否有效
    const isBindingValid = (b: string): boolean => {
      const idx = b.indexOf(':');
      if (idx <= 0) return false;
      const ref = b.slice(0, idx);
      const model = b.slice(idx + 1);
      const p = providers.find(pv => pv.id === ref || pv.platform === ref);
      if (!p || parseApiKeys(p.apiKey).length === 0) return false;
      // 模型列表为空时（尚未同步）暂时信任绑定
      if (p.model.length === 0) return true;
      return p.model.includes(model);
    };

    let changed = false;
    for (const [feature, binding] of Object.entries(defaults)) {
      const cur = getFeatureBindings(feature as AIFeature);

      // 自愈：deepseek-v3 → deepseek-v3.2（在校验之前先迁移）
      if (feature === 'script_analysis' && cur && cur.some(b => b.endsWith(':deepseek-v3'))) {
        const migrated = cur.map(b => {
          if (!b.endsWith(':deepseek-v3')) return b;
          const i = b.indexOf(':');
          return i > 0 ? `${b.slice(0, i)}:deepseek-v3.2` : binding;
        });
        setFeatureBindings(feature as AIFeature, [...new Set(migrated)]);
        changed = true;
        continue;
      }

      // 为空 或 全部无效 → 重新设置默认值
      const needsDefault = !cur || cur.length === 0 || !cur.some(isBindingValid);
      if (needsDefault) {
        setFeatureBindings(feature as AIFeature, [binding]);
        changed = true;
      }
    }
    if (changed) {
      console.log('[SettingsPanel] Auto-applied memefast default bindings');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const version = await window.appUpdater?.getCurrentVersion?.();
        if (!cancelled && version) {
          setAppVersion(version);
        }
      } catch (error) {
        console.warn("[SettingsPanel] Failed to load app version:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Toggle provider expansion
  const toggleExpanded = (id: string) => {
    setExpandedProviders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Open edit dialog
  const handleEdit = (provider: IProvider) => {
    setEditingProvider(provider);
    setEditDialogOpen(true);
  };

  // Delete provider
  const handleDelete = (id: string) => {
    removeProvider(id);
    toast.success(t("settings.toast.providerDeleted"));
  };

  const handleEditImageHost = (provider: ImageHostProvider) => {
    setEditingImageHost(provider);
    setImageHostEditOpen(true);
  };

  const handleDeleteImageHost = (id: string) => {
    removeImageHostProvider(id);
    toast.success(t("settings.toast.imageHostDeleted"));
  };

  const handleTestImageHost = async (provider: ImageHostProvider) => {
    setTestingImageHostId(provider.id);
    try {
      const testImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const result = await uploadToImageHost(testImage, {
        expiration: 60,
        providerId: provider.id,
      });
      if (result.success) {
        toast.success(
          t("settings.toast.imageHostTestOk", {
            name: localizedImageHostName(provider.platform, provider.name, t),
          }),
        );
      } else {
        toast.error(t("settings.toast.testFailed", { message: result.error || "—" }));
      }
    } catch (error) {
      toast.error(t("settings.toast.testNetworkError"));
    } finally {
      setTestingImageHostId(null);
    }
  };

  // Test connection - directly call external APIs
  const testConnection = async (provider: IProvider) => {
    const keys = parseApiKeys(provider.apiKey);
    if (keys.length === 0) {
      toast.error(t("settings.toast.configureApiKeyFirst"));
      return;
    }

    setTestingProvider(provider.id);
    setTestResults((prev) => ({ ...prev, [provider.id]: null }));

    try {
      let response: Response;
      const apiKey = keys[0]; // Use first key for test
      const normalizedBaseUrl = provider.baseUrl?.replace(/\/+$/, "");
      const buildEndpoint = (root: string, path: string) => {
        const normalized = root.replace(/\/+$/, "");
        return /\/v\d+$/.test(normalized) ? `${normalized}/${path}` : `${normalized}/v1/${path}`;
      };

      if (provider.platform === "runninghub") {
        if (!normalizedBaseUrl) {
          toast.error(t("settings.toast.configureBaseUrl"));
          setTestingProvider(null);
          return;
        }
        response = await fetch(`${normalizedBaseUrl}/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            taskId: "test-connection-check",
          }),
        });
        
        // For RunningHub, 400/404 means auth is OK (task doesn't exist)
        if (response.status === 400 || response.status === 404) {
          setTestResults((prev) => ({ ...prev, [provider.id]: true }));
          toast.success(t("settings.toast.connectionOk"));
          setTestingProvider(null);
          return;
        }
      } else if (normalizedBaseUrl && provider.model?.length) {
        const endpoint = buildEndpoint(normalizedBaseUrl, "chat/completions");
        const model = provider.model[0];
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 5,
          }),
        });
      } else {
        // For providers without chat endpoint info, just mark as configured
        setTestResults((prev) => ({ ...prev, [provider.id]: true }));
        toast.success(
          t("settings.toast.providerConfigured", {
            name: localizedAiProviderName(provider.platform, provider.name, t),
          }),
        );
        setTestingProvider(null);
        return;
      }

      const success = response.ok;
      setTestResults((prev) => ({ ...prev, [provider.id]: success }));

      if (success) {
        toast.success(t("settings.toast.connectionOk"));
      } else {
        const errorData = await response.text();
        console.error("API test error:", response.status, errorData);
        toast.error(t("settings.toast.connectionFailed", { status: response.status }));
      }
    } catch (error) {
      console.error("Connection test error:", error);
      setTestResults((prev) => ({ ...prev, [provider.id]: false }));
      toast.error(t("settings.toast.connectionFailedGeneric"));
    } finally {
      setTestingProvider(null);
    }
  };

  // Get existing platforms
  const existingPlatforms = useMemo(
    () => providers.map((p) => p.platform),
    [providers]
  );

  const configuredCount = providers.filter(
    (p) => parseApiKeys(p.apiKey).length > 0
  ).length;

  const [activeTab, setActiveTab] = useState<string>("api");
  const hasStorageManager = typeof window !== "undefined" && !!window.storageManager;

  const formatBytes = useCallback((bytes: number) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(
      units.length - 1,
      Math.floor(Math.log(bytes) / Math.log(1024))
    );
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[index]}`;
  }, []);

  const refreshCacheSize = useCallback(async () => {
    if (!window.storageManager) return;
    setIsCacheLoading(true);
    try {
      const result = await window.storageManager.getCacheSize();
      setCacheSize(result.total || 0);
    } catch (error) {
      console.error("Failed to get cache size:", error);
    } finally {
      setIsCacheLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasStorageManager) return;
    window.storageManager
      ?.getPaths()
      .then((paths) => {
        if (paths.basePath) {
          setStoragePaths({ basePath: paths.basePath });
        }
      })
      .catch(() => {});
    refreshCacheSize();
  }, [hasStorageManager, refreshCacheSize, setStoragePaths]);

  useEffect(() => {
    if (!hasStorageManager || !window.storageManager) return;
    window.storageManager.updateConfig({
      autoCleanEnabled: cacheSettings.autoCleanEnabled,
      autoCleanDays: cacheSettings.autoCleanDays,
    });
  }, [cacheSettings.autoCleanEnabled, cacheSettings.autoCleanDays, hasStorageManager]);

  const handleToggleShareCharacters = async (checked: boolean) => {
    setResourceSharing({ shareCharacters: checked });
    if (!checked && activeProjectId) {
      assignCharactersToProject(activeProjectId);
    }
    // Rehydrate to load/unload other projects' data
    try { await useCharacterLibraryStore.persist.rehydrate(); } catch {}
  };

  const handleToggleShareScenes = async (checked: boolean) => {
    setResourceSharing({ shareScenes: checked });
    if (!checked && activeProjectId) {
      assignScenesToProject(activeProjectId);
    }
    try { await useSceneStore.persist.rehydrate(); } catch {}
  };

  const handleToggleShareMedia = async (checked: boolean) => {
    setResourceSharing({ shareMedia: checked });
    if (!checked && activeProjectId) {
      assignMediaToProject(activeProjectId);
    }
    try { await useMediaStore.persist.rehydrate(); } catch {}
  };

  // Unified storage handlers
  const handleSelectStoragePath = async () => {
    if (!window.storageManager) {
      toast.error(t("settings.toast.storageDesktopOnly"));
      return;
    }
    const dir = await window.storageManager.selectDirectory();
    if (!dir) return;
    const result = await window.storageManager.moveData(dir);
    if (result.success) {
      setStoragePaths({ basePath: result.path || dir });
      
      // 清除 localStorage 中的缓存，确保从新路径加载数据
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('moyin-') || key.includes('store')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // 清除 IndexedDB 缓存
      try {
        const dbRequest = indexedDB.open(INDEXEDDB_APP_DB_NAME, 1);
        dbRequest.onsuccess = () => {
          const db = dbRequest.result;
          if (db.objectStoreNames.contains('zustand-storage')) {
            const tx = db.transaction('zustand-storage', 'readwrite');
            tx.objectStore('zustand-storage').clear();
          }
        };
      } catch (e) {
        console.warn('Failed to clear IndexedDB:', e);
      }
      
      toast.success(t("settings.toast.storageMoved"));
      setTimeout(() => window.location.reload(), 500);
    } else {
      toast.error(t("settings.toast.moveFailed", { message: result.error || "—" }));
    }
  };

  const handleExportData = async () => {
    if (!window.storageManager) return;
    const dir = await window.storageManager.selectDirectory();
    if (!dir) return;
    const result = await window.storageManager.exportData(dir);
    if (result.success) {
      toast.success(t("settings.toast.exportOk"));
    } else {
      toast.error(t("settings.toast.exportFailed", { message: result.error || "—" }));
    }
  };

  const handleImportData = async () => {
    if (!window.storageManager) return;
    const dir = await window.storageManager.selectDirectory();
    if (!dir) return;
    if (!confirm(t("settings.toast.importConfirm"))) return;
    const result = await window.storageManager.importData(dir);
    if (result.success) {
      // 清除 localStorage 中的缓存，防止旧数据覆盖导入的数据
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('moyin-') || key.includes('store')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // 清除 IndexedDB 缓存
      try {
        const dbRequest = indexedDB.open(INDEXEDDB_APP_DB_NAME, 1);
        dbRequest.onsuccess = () => {
          const db = dbRequest.result;
          if (db.objectStoreNames.contains('zustand-storage')) {
            const tx = db.transaction('zustand-storage', 'readwrite');
            tx.objectStore('zustand-storage').clear();
          }
        };
      } catch (e) {
        console.warn('Failed to clear IndexedDB:', e);
      }
      
      toast.success(t("settings.toast.importOk"));
      // 延迟刷新页面以确保缓存清理完成
      setTimeout(() => window.location.reload(), 500);
    } else {
      toast.error(t("settings.toast.importFailed", { message: result.error || "—" }));
    }
  };

  const handleLinkData = async () => {
    if (!window.storageManager) {
      toast.error(t("settings.toast.storageDesktopOnly"));
      return;
    }
    const dir = await window.storageManager.selectDirectory();
    if (!dir) return;
    
    // Validate the directory first
    const validation = await window.storageManager.validateDataDir(dir);
    if (!validation.valid) {
      toast.error(t("settings.toast.linkInvalid", { message: validation.error || "—" }));
      return;
    }
    
    // Confirm with user
    const confirmMsg = t("settings.toast.linkConfirm", {
      projects: validation.projectCount || 0,
      media: validation.mediaCount || 0,
    });
    if (!confirm(confirmMsg)) return;
    
    const result = await window.storageManager.linkData(dir);
    if (result.success) {
      setStoragePaths({ basePath: result.path || dir });
      
      // 清除 localStorage 中的缓存，确保从新路径加载数据
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('moyin-') || key.includes('store')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // 清除 IndexedDB 缓存
      try {
        const dbRequest = indexedDB.open(INDEXEDDB_APP_DB_NAME, 1);
        dbRequest.onsuccess = () => {
          const db = dbRequest.result;
          if (db.objectStoreNames.contains('zustand-storage')) {
            const tx = db.transaction('zustand-storage', 'readwrite');
            tx.objectStore('zustand-storage').clear();
          }
        };
      } catch (e) {
        console.warn('Failed to clear IndexedDB:', e);
      }
      
      toast.success(t("settings.toast.linkOk"));
      setTimeout(() => window.location.reload(), 500);
    } else {
      toast.error(t("settings.toast.linkFailed", { message: result.error || "—" }));
    }
  };

  const handleClearCache = async () => {
    if (!window.storageManager) return;
    setIsClearingCache(true);
    try {
      const result = await window.storageManager.clearCache();
      if (result.success) {
        toast.success(t("settings.toast.cacheCleared"));
        refreshCacheSize();
      } else {
        toast.error(t("settings.toast.cacheClearFailed", { message: result.error || "—" }));
      }
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleCheckForUpdates = () => {
    window.open(APP_GITHUB_RELEASES_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-border bg-panel px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            {t("settings.title")}
          </h2>
        </div>
        {activeTab === "api" && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono bg-muted border border-border px-2 py-1 rounded">
              {t("settings.configured", { current: configuredCount, total: providers.length })}
            </span>
            <Button onClick={() => setAddDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              {t("settings.addProvider")}
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border px-6">
          <TabsList className="h-12 bg-transparent p-0 gap-4">
            <TabsTrigger 
              value="api" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 h-12"
            >
              <Key className="h-4 w-4 mr-2" />
              {t("settings.tabs.api")}
            </TabsTrigger>
            <TabsTrigger 
              value="advanced" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 h-12"
            >
              <Layers className="h-4 w-4 mr-2" />
              {t("settings.tabs.advanced")}
            </TabsTrigger>
            <TabsTrigger 
              value="imagehost" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 h-12"
            >
              <Upload className="h-4 w-4 mr-2" />
              {t("settings.tabs.imagehost")}
              {isImageHostConfigured() && (
                <span className="ml-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="storage" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 h-12"
            >
              <HardDrive className="h-4 w-4 mr-2" />
              {t("settings.tabs.storage")}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* API Management Tab */}
        <TabsContent value="api" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-8 max-w-5xl mx-auto space-y-8">
          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 border border-border rounded-lg">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-foreground text-sm">{t("settings.api.securityTitle")}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t("settings.api.securityBody")}
              </p>
            </div>
          </div>

          {/* MemeFast 购买引导 — button avoids showing destination URL on hover */}
          <button
            type="button"
            onClick={() => openMemefastPortal()}
            className="flex items-center gap-3 p-4 w-full text-left bg-gradient-to-r from-orange-500/5 to-primary/5 border border-orange-500/20 rounded-lg hover:border-orange-500/40 transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground text-sm flex items-center gap-2">
                {t("settings.api.memefastTitle")}
                <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded">
                  {t("settings.api.recommended")}
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("settings.api.memefastDesc")}
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:underline">
              {t("settings.api.getApiKey")}
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </button>

          {/* Feature Binding */}
          <FeatureBindingPanel />

          {/* Provider List */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Key className="h-4 w-4" />
              {t("settings.api.providersTitle")}
            </h3>

            {providers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl">
                <Info className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {t("settings.api.emptyProvidersTitle")}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("settings.api.emptyProvidersHint")}
                </p>
                <button
                  type="button"
                  onClick={() => openMemefastPortal()}
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-4 cursor-pointer bg-transparent border-0 p-0 font-sans"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t("settings.api.getKeyLink")}
                </button>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t("settings.addProvider")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {providers.map((provider) => {
                  const isExpanded = expandedProviders[provider.id] ?? false;
                  const keyCount = getApiKeyCount(provider.apiKey);
                  const configured = keyCount > 0;
                  const testResult = testResults[provider.id];
                  const isTesting = testingProvider === provider.id;

                  return (
                    <Collapsible
                      key={provider.id}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(provider.id)}
                    >
                      <div
                        className={cn(
                          "border rounded-xl transition-all",
                          configured
                            ? "bg-card border-primary/30"
                            : "bg-card border-border"
                        )}
                      >
                        {/* Header */}
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-4 hover:bg-muted/30 rounded-t-xl transition-colors">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "p-2 rounded-lg",
                                  configured
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {PLATFORM_ICONS[provider.platform] || (
                                  <Settings className="h-5 w-5" />
                                )}
                              </div>
                              <div className="text-left">
                                <h4 className="font-medium text-foreground flex items-center gap-2">
                                  {localizedAiProviderName(
                                    provider.platform,
                                    provider.name,
                                    t,
                                  )}
                                  {provider.platform === 'memefast' && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded font-normal">
                                      {t("settings.api.recommended")}
                                    </span>
                                  )}
                                  {configured && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-normal">
                                      {t("settings.api.configured")}
                                    </span>
                                  )}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {provider.platform}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span
                                  className="cursor-pointer hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpanded(provider.id);
                                  }}
                                >
                                  {t("settings.api.modelsLabel", { count: provider.model.length })}
                                </span>
                                <span>|</span>
                                <span
                                  className="cursor-pointer hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(provider);
                                  }}
                                >
                                  {t("settings.api.keysLabel", { count: keyCount })}
                                </span>
                              </div>

                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title={t("settings.api.syncModels")}
                                  onClick={async () => {
                                    setSyncingProvider(provider.id);
                                    const result = await syncProviderModels(provider.id);
                                    setSyncingProvider(null);
                                    if (result.success) {
                                      toast.success(t("settings.toast.syncedModels", { count: result.count }));
                                    } else {
                                      toast.error(result.error || t("settings.api.syncFailed"));
                                    }
                                  }}
                                  disabled={!configured || syncingProvider === provider.id}
                                >
                                  {syncingProvider === provider.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4" />
                                  )}
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title={t("settings.api.testConnection")}
                                  onClick={() => testConnection(provider)}
                                  disabled={!configured || isTesting}
                                >
                                  {isTesting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : testResult === true ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : testResult === false ? (
                                    <X className="h-4 w-4 text-red-500" />
                                  ) : (
                                    <Shield className="h-4 w-4" />
                                  )}
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title={t("settings.api.edit")}
                                  onClick={() => handleEdit(provider)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {t("settings.api.deleteConfirmTitle")}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {t("settings.api.deleteConfirmBody", {
                                          name: localizedAiProviderName(
                                            provider.platform,
                                            provider.name,
                                            t,
                                          ),
                                        })}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t("dashboard.cancel")}</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(provider.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        {t("dashboard.delete")}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>

                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        {/* MemeFast 购买引导 */}
                        {provider.platform === 'memefast' && !configured && (
                          <div className="px-4 pb-2">
                            <button
                              type="button"
                              onClick={() => openMemefastPortal()}
                              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer bg-transparent border-0 p-0 font-sans"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t("settings.api.getKeyArrow")}
                            </button>
                          </div>
                        )}

                        {provider.platform === 'runninghub' && !configured && (
                          <div className="px-4 pb-2">
                            <button
                              type="button"
                              onClick={() => openRunninghubPortal()}
                              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer bg-transparent border-0 p-0 font-sans"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t("settings.api.runninghubPortalArrow")}
                            </button>
                          </div>
                        )}

                        {/* Expandable Content */}
                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                            {/* Base URL */}
                            {provider.baseUrl && (
                              <div className="text-xs">
                                <span className="text-muted-foreground">
                                  Base URL:{" "}
                                </span>
                                <span className="font-mono text-foreground">
                                  {provider.baseUrl}
                                </span>
                              </div>
                            )}

                            {/* Models */}
                            {provider.model.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {provider.model.map((m) => (
                                  <span
                                    key={m}
                                    className="text-xs px-2 py-1 bg-muted rounded font-mono"
                                  >
                                    {m}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* API Key Preview */}
                            {configured && (
                              <div className="text-xs">
                                <span className="text-muted-foreground">
                                  API Key:{" "}
                                </span>
                                <span className="font-mono text-foreground">
                                  {maskApiKey(parseApiKeys(provider.apiKey)[0])}
                                  {keyCount > 1 && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      ({t("settings.api.extraKeys", { count: keyCount - 1 })})
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </div>

          {/* Global Settings */}
          <div className="p-6 border border-border rounded-xl bg-card space-y-6">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t("settings.api.globalSettings")}
            </h3>

            {/* Concurrency */}
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">{t("settings.api.concurrencyLabel")}</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  value={concurrency}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1) setConcurrency(val);
                  }}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground">
                  {t("settings.api.concurrencyHint")}
                </span>
              </div>
            </div>
          </div>

              {/* About */}
              <div className="text-center py-8 text-muted-foreground border-t border-border">
                <p className="text-sm font-medium">{t("settings.api.aboutName")}</p>
                <p className="text-xs mt-1">{t("settings.api.aboutTagline", { version: appVersion })}</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Advanced Options Tab */}
        <TabsContent value="advanced" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-8 max-w-3xl mx-auto space-y-8">
              <div className="p-4 border border-border rounded-xl bg-card space-y-3">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary shrink-0" />
                  <h4 className="font-medium text-foreground">{t("settings.language.title")}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{t("settings.language.description")}</p>
                <Select
                  value={locale}
                  onValueChange={(v) => setLocale(v as AppLocale)}
                >
                  <SelectTrigger className="w-full max-w-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APP_LOCALES.map((opt) => (
                      <SelectItem key={opt.code} value={opt.code}>
                        {opt.nativeLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    {t("settings.advanced.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("settings.advanced.subtitle")}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    resetAdvancedOptions();
                    toast.success(t("settings.advanced.resetToast"));
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {t("settings.advanced.resetDefault")}
                </Button>
              </div>

              {/* Options List */}
              <div className="space-y-4">
                {/* Visual Continuity */}
                <div className="p-4 border border-border rounded-xl bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                        <Link2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{t("settings.advanced.visualContinuityTitle")}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("settings.advanced.visualContinuityBody")}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {t("settings.advanced.visualContinuityHint")}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={advancedOptions.enableVisualContinuity}
                      onCheckedChange={(checked) => setAdvancedOption('enableVisualContinuity', checked)}
                    />
                  </div>
                </div>

                {/* Resume Generation */}
                <div className="p-4 border border-border rounded-xl bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                        <Play className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{t("settings.advanced.resumeTitle")}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("settings.advanced.resumeBody")}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {t("settings.advanced.resumeHint")}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={advancedOptions.enableResumeGeneration}
                      onCheckedChange={(checked) => setAdvancedOption('enableResumeGeneration', checked)}
                    />
                  </div>
                </div>

                {/* Content Moderation */}
                <div className="p-4 border border-border rounded-xl bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{t("settings.advanced.moderationTitle")}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("settings.advanced.moderationBody")}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {t("settings.advanced.moderationHint")}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={advancedOptions.enableContentModeration}
                      onCheckedChange={(checked) => setAdvancedOption('enableContentModeration', checked)}
                    />
                  </div>
                </div>

                {/* Auto Model Switch */}
                <div className="p-4 border border-border rounded-xl bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted text-muted-foreground mt-0.5">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{t("settings.advanced.autoModelTitle")}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("settings.advanced.autoModelBody")}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {t("settings.advanced.autoModelHint")}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={advancedOptions.enableAutoModelSwitch}
                      onCheckedChange={(checked) => setAdvancedOption('enableAutoModelSwitch', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 border border-border rounded-lg">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.advanced.footerNote")}
                  </p>
                </div>
              </div>

              {/* About */}
              <div className="text-center py-8 text-muted-foreground border-t border-border">
                <p className="text-sm font-medium">{t("settings.api.aboutName")}</p>
                <p className="text-xs mt-1">{t("settings.api.aboutTagline", { version: appVersion })}</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Image Host Config Tab */}
        <TabsContent value="imagehost" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-8 max-w-3xl mx-auto space-y-8">
              {/* Header */}
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {t("settings.imagehost.title")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("settings.imagehost.subtitle")}
                </p>
              </div>

              {/* Image Host Providers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{t("settings.imagehost.providersLabel")}</Label>
                  <Button size="sm" variant="outline" onClick={() => setImageHostAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t("settings.imagehost.add")}
                  </Button>
                </div>

                {visibleImageHostProviders.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{t("settings.imagehost.empty")}</div>
                ) : (
                  <div className="space-y-3">
                    {visibleImageHostProviders.map((provider) => {
                      const keyCount = getApiKeyCount(provider.apiKey);
                      const endpoint = provider.uploadPath || provider.baseUrl;
                      const configured = provider.enabled && !!endpoint && (provider.apiKeyOptional || keyCount > 0);
                      return (
                        <div key={provider.id} className="p-4 border border-border rounded-xl bg-card space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {localizedImageHostName(
                                    provider.platform,
                                    provider.name,
                                    t,
                                  )}
                                </span>
                                {configured ? (
                                  <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded">
                                    {t("settings.imagehost.configured")}
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                                    {t("settings.imagehost.notConfigured")}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {provider.platform} · {endpoint || t("settings.imagehost.addressUnset")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {provider.apiKeyOptional && keyCount === 0
                                  ? t("settings.imagehost.guestUpload")
                                  : t("settings.imagehost.keyCount", { count: keyCount })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={provider.enabled}
                                onCheckedChange={(checked) =>
                                  updateImageHostProvider({ ...provider, enabled: checked })
                                }
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!provider.enabled || testingImageHostId === provider.id}
                              onClick={() => handleTestImageHost(provider)}
                            >
                              {testingImageHostId === provider.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                t("settings.imagehost.testConnection")
                              )}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditImageHost(provider)}>
                              {t("settings.imagehost.edit")}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteImageHost(provider.id)}>
                              {t("settings.imagehost.delete")}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Info Notice */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 border border-border rounded-lg">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t("settings.imagehost.infoBody")}
                  </p>
                  <p className="text-sm">
                    {t("settings.imagehost.infoScdn")}
                  </p>
                </div>
              </div>

              {/* About */}
              <div className="text-center py-8 text-muted-foreground border-t border-border">
                <p className="text-sm font-medium">{t("settings.api.aboutName")}</p>
                <p className="text-xs mt-1">{t("settings.api.aboutTagline", { version: appVersion })}</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-8 max-w-3xl mx-auto space-y-8">
              {/* Header */}
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  {t("settings.storage.title")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("settings.storage.subtitle")}
                </p>
              </div>

              {!hasStorageManager && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 border border-border rounded-lg">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.storage.desktopOnly")}
                    </p>
                  </div>
                </div>
              )}

              {/* Resource Sharing */}
              <div className="p-6 border border-border rounded-xl bg-card space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  {t("settings.storage.sharingTitle")}
                </h4>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t("settings.storage.shareCharacters")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings.storage.shareCharactersHint")}</p>
                  </div>
                  <Switch
                    checked={resourceSharing.shareCharacters}
                    onCheckedChange={handleToggleShareCharacters}
                    disabled={!hasStorageManager}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t("settings.storage.shareScenes")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings.storage.shareScenesHint")}</p>
                  </div>
                  <Switch
                    checked={resourceSharing.shareScenes}
                    onCheckedChange={handleToggleShareScenes}
                    disabled={!hasStorageManager}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t("settings.storage.shareMedia")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings.storage.shareMediaHint")}</p>
                  </div>
                  <Switch
                    checked={resourceSharing.shareMedia}
                    onCheckedChange={handleToggleShareMedia}
                    disabled={!hasStorageManager}
                  />
                </div>
              </div>

              {/* Storage Path - Single unified location */}
              <div className="p-6 border border-border rounded-xl bg-card space-y-5">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  {t("settings.storage.locationTitle")}
                </h4>

                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">{t("settings.storage.locationLabel")}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={storagePaths.basePath || t("settings.storage.defaultLocation")}
                      placeholder={t("settings.storage.defaultLocation")}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button size="sm" onClick={handleSelectStoragePath} disabled={!hasStorageManager}>
                      {t("settings.storage.choose")}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportData} disabled={!hasStorageManager}>
                      <Download className="h-3.5 w-3.5 mr-1" />
                      {t("settings.storage.export")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleImportData} disabled={!hasStorageManager}>
                      {t("settings.storage.import")}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {t("settings.storage.moveWarning")}
                </p>
              </div>

              {/* Data Recovery - Link to existing data */}
              <div className="p-6 border border-border rounded-xl bg-card space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {t("settings.storage.recoveryTitle")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("settings.storage.recoveryBody")}
                </p>

                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLinkData} 
                    disabled={!hasStorageManager}
                    className="w-full"
                  >
                    <Folder className="h-3.5 w-3.5 mr-1" />
                    {t("settings.storage.linkData")}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {t("settings.storage.recoveryHint")}
                  </p>
                </div>
              </div>

              {/* Cache Management */}
              <div className="p-6 border border-border rounded-xl bg-card space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  {t("settings.storage.cacheTitle")}
                </h4>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t("settings.storage.cacheSize")}</p>
                    <p className="text-xs text-muted-foreground">
                      {isCacheLoading ? t("settings.storage.calculating") : formatBytes(cacheSize)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={refreshCacheSize}
                      disabled={!hasStorageManager || isCacheLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isCacheLoading ? "animate-spin" : ""}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCache}
                      disabled={!hasStorageManager || isClearingCache}
                    >
                      {isClearingCache ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t("settings.storage.clear")
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t("settings.storage.autoClean")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings.storage.autoCleanOff")}</p>
                  </div>
                  <Switch
                    checked={cacheSettings.autoCleanEnabled}
                    onCheckedChange={(checked) => setCacheSettings({ autoCleanEnabled: checked })}
                    disabled={!hasStorageManager}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">{t("settings.storage.cleanDaysLabel")}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={cacheSettings.autoCleanDays}
                    onChange={(e) =>
                      setCacheSettings({ autoCleanDays: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="w-20"
                    disabled={!cacheSettings.autoCleanEnabled}
                  />
                  <span className="text-xs text-muted-foreground">{t("settings.storage.cleanOlderThan")}</span>
                </div>
              </div>

              <div className="p-6 border border-border rounded-xl bg-card space-y-5">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {t("settings.storage.updatesTitle")}
                </h4>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{t("settings.storage.currentVersion")}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">v{appVersion}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCheckForUpdates}
                    type="button"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {t("settings.storage.checkUpdates")}
                  </Button>
                </div>
              </div>

              {/* About */}
              <div className="text-center py-8 text-muted-foreground border-t border-border">
                <p className="text-sm font-medium">{t("settings.api.aboutName")}</p>
                <p className="text-xs mt-1">{t("settings.api.aboutTagline", { version: appVersion })}</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddProviderDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={(providerData) => {
          // 魔因API：已存在时合并 Key，不重复创建
          const existingMemefast = providerData.platform === 'memefast'
            ? providers.find((p) => p.platform === 'memefast')
            : null;
          let provider: IProvider;
          if (existingMemefast) {
            const oldKeys = parseApiKeys(existingMemefast.apiKey);
            const newKeys = parseApiKeys(providerData.apiKey);
            const merged = Array.from(new Set([...oldKeys, ...newKeys]));
            updateProvider({ ...existingMemefast, apiKey: merged.join(',') });
            provider = existingMemefast;
          } else {
            provider = addProvider(providerData);
          }
          // 如果添加的是 memefast 供应商，自动设置默认服务映射（仅在对应服务尚未配置时）
          if (providerData.platform === 'memefast') {
            // 使用 provider.id（而非 platform 字符串）避免多供应商时的歧义解析
            const pid = provider.id;
            const MEMEFAST_DEFAULT_BINDINGS: Record<string, string> = {
              // NOTE: MemeFast 端点已升级，旧的 deepseek-v3 已不在列表中，改用 deepseek-v3.2
              script_analysis: `${pid}:deepseek-v3.2`,
              character_generation: `${pid}:gemini-3-pro-image-preview`,
              video_generation: `${pid}:doubao-seedance-1-5-pro-251215`,
              image_understanding: `${pid}:gemini-2.5-flash`,
            };
            for (const [feature, binding] of Object.entries(MEMEFAST_DEFAULT_BINDINGS)) {
              const current = getFeatureBindings(feature as AIFeature);
              // 仅在未配置时设置默认值，避免覆盖用户手动选择
              if (!current || current.length === 0) {
                setFeatureBindings(feature as AIFeature, [binding]);
                continue;
              }
              // 自愈：旧默认 deepseek-v3 -> deepseek-v3.2（尽量不破坏多选配置）
              if (feature === 'script_analysis') {
                const hasOld = current.some((b) => b.endsWith(':deepseek-v3'));
                if (hasOld) {
                  const migrated = current.map((b) => {
                    if (!b.endsWith(':deepseek-v3')) return b;
                    const idx = b.indexOf(':');
                    if (idx <= 0) return binding;
                    const prefix = b.slice(0, idx);
                    return `${prefix}:deepseek-v3.2`;
                  });
                  const deduped = Array.from(new Set(migrated));
                  setFeatureBindings(feature as AIFeature, deduped);
                }
              }
            }
          }
          // 添加后自动同步模型列表和端点元数据
          const finalProviderId = existingMemefast ? existingMemefast.id : provider.id;
          if (parseApiKeys(providerData.apiKey).length > 0) {
            setSyncingProvider(finalProviderId);
            syncProviderModels(finalProviderId).then(result => {
              setSyncingProvider(null);
              if (result.success) {
                toast.success(t("settings.toast.autoSynced", { count: result.count }));
              } else if (result.error) {
                toast.error(t("settings.toast.modelSyncFailed", { message: result.error }));
              }
            });
          }
        }}
        existingPlatforms={existingPlatforms}
      />

      <EditProviderDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        provider={editingProvider}
        onSave={(provider) => {
          updateProvider(provider);

          // 编辑 memefast 时也自动设置默认服务映射：初始状态会预置一个空 key 的 memefast，
          // 用户通常是“编辑填 key”，如果不在这里补默认映射，会导致服务映射一直是 0/6。
          if (provider.platform === 'memefast' && parseApiKeys(provider.apiKey).length > 0) {
            const pid = provider.id;
            const MEMEFAST_DEFAULT_BINDINGS: Record<string, string> = {
              // NOTE: MemeFast 端点已升级，旧的 deepseek-v3 已不在列表中，改用 deepseek-v3.2
              script_analysis: `${pid}:deepseek-v3.2`,
              character_generation: `${pid}:gemini-3-pro-image-preview`,
              video_generation: `${pid}:doubao-seedance-1-5-pro-251215`,
              image_understanding: `${pid}:gemini-2.5-flash`,
            };
            for (const [feature, binding] of Object.entries(MEMEFAST_DEFAULT_BINDINGS)) {
              const current = getFeatureBindings(feature as AIFeature);
              if (!current || current.length === 0) {
                setFeatureBindings(feature as AIFeature, [binding]);
                continue;
              }
              // 自愈：旧默认 deepseek-v3 -> deepseek-v3.2
              if (feature === 'script_analysis') {
                const hasOld = current.some((b) => b.endsWith(':deepseek-v3'));
                if (hasOld) {
                  const migrated = current.map((b) => {
                    if (!b.endsWith(':deepseek-v3')) return b;
                    const idx = b.indexOf(':');
                    if (idx <= 0) return binding;
                    const prefix = b.slice(0, idx);
                    return `${prefix}:deepseek-v3.2`;
                  });
                  const deduped = Array.from(new Set(migrated));
                  setFeatureBindings(feature as AIFeature, deduped);
                }
              }
            }
          }
          // 编辑保存后自动同步模型列表和端点元数据
          if (parseApiKeys(provider.apiKey).length > 0) {
            setSyncingProvider(provider.id);
            syncProviderModels(provider.id).then(result => {
              setSyncingProvider(null);
              if (result.success) {
                toast.success(t("settings.toast.autoSynced", { count: result.count }));
              } else if (result.error) {
                toast.error(t("settings.toast.modelSyncFailed", { message: result.error }));
              }
            });
          }
        }}
      />

      <AddImageHostDialog
        open={imageHostAddOpen}
        onOpenChange={setImageHostAddOpen}
        onSubmit={addImageHostProvider}
      />

      <EditImageHostDialog
        open={imageHostEditOpen}
        onOpenChange={setImageHostEditOpen}
        provider={editingImageHost}
        onSave={updateImageHostProvider}
      />
    </div>
  );
}
