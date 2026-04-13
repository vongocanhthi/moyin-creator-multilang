// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.
"use client";

/**
 * Episode Tree Component
 * 中间栏：层级结构预览（集→场景→分镜）+ 状态追踪 + CRUD管理
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ScriptData, ScriptCharacter, ScriptScene, Episode, Shot, CompletionStatus, ProjectBackground, EpisodeRawScript, CalibrationStrictness, FilteredCharacterRecord } from "@/types/script";
import { formatEpisodeIndexLabel, stripStoredEpisodeTitlePrefix } from "@/lib/script/episode-title-format";
import { getShotCompletionStatus, calculateProgress } from "@/lib/script/shot-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Film,
  MapPin,
  User,
  Circle,
  Clock,
  CheckCircle2,
  Filter,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Wand2,
  RefreshCw,
  Search,
  Sparkles,
  Check,
  X,
  MessageSquare,
  Clapperboard,
  Play,
  Timer,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TrailerDuration, TrailerConfig } from "@/stores/director-store";
import { selectTrailerShots, convertShotsToSplitScenes, type TrailerGenerationOptions } from "@/lib/script/trailer-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type FilterType = "all" | "pending" | "completed";

// 计算完成状态图标
function StatusIcon({ status }: { status?: CompletionStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-3 w-3 text-green-500" />;
    case "in_progress":
      return <Clock className="h-3 w-3 text-yellow-500" />;
    default:
      return <Circle className="h-3 w-3 text-muted-foreground" />;
  }
}

interface EpisodeTreeProps {
  scriptData: ScriptData | null;
  shots: Shot[];
  shotStatus?: "idle" | "generating" | "ready" | "error"; // 分镜生成状态
  selectedItemId: string | null;
  selectedItemType: "character" | "scene" | "shot" | "episode" | null;
  onSelectItem: (id: string, type: "character" | "scene" | "shot" | "episode") => void;
  // CRUD callbacks (Bundle 版本，同步 episodeRawScripts)
  onAddEpisodeBundle?: (title: string, synopsis: string) => void;
  onUpdateEpisodeBundle?: (episodeIndex: number, updates: { title?: string; synopsis?: string }) => void;
  onDeleteEpisodeBundle?: (episodeIndex: number) => void;
  onAddScene?: (scene: ScriptScene, episodeId?: string) => void;
  onUpdateScene?: (id: string, updates: Partial<ScriptScene>) => void;
  onDeleteScene?: (id: string) => void;
  onAddCharacter?: (character: ScriptCharacter) => void;
  onUpdateCharacter?: (id: string, updates: Partial<ScriptCharacter>) => void;
  onDeleteCharacter?: (id: string) => void;
  onDeleteShot?: (id: string) => void;
  // 分镜生成 callbacks
  onGenerateEpisodeShots?: (episodeIndex: number) => void;
  onRegenerateAllShots?: () => void;
  episodeGenerationStatus?: Record<number, 'idle' | 'generating' | 'completed' | 'error'>;
  // 分镜校准 callback
  onCalibrateShots?: (episodeIndex: number) => void;
  onCalibrateScenesShots?: (sceneId: string) => void;
  // 角色校准 callback
  onCalibrateCharacters?: () => void;
  characterCalibrationStatus?: 'idle' | 'calibrating' | 'completed' | 'error';
  // AI 角色查找相关
  projectBackground?: ProjectBackground;
  episodeRawScripts?: EpisodeRawScript[];
  onAIFindCharacter?: (query: string) => Promise<{
    found: boolean;
    name: string;
    message: string;
    character?: ScriptCharacter;
  }>;
  aiFindingStatus?: 'idle' | 'searching' | 'found' | 'not_found' | 'error';
  // AI 场景查找相关
  onAIFindScene?: (query: string) => Promise<{
    found: boolean;
    message: string;
    scene?: ScriptScene;
  }>;
  // 场景校准相关
  onCalibrateScenes?: () => void;  // 全局校准所有场景
  onCalibrateEpisodeScenes?: (episodeIndex: number) => void;  // 校准单集场景
  sceneCalibrationStatus?: 'idle' | 'calibrating' | 'completed' | 'error';
  // 预告片相关
  trailerConfig?: TrailerConfig | null;
  onGenerateTrailer?: (duration: TrailerDuration) => void;
  onClearTrailer?: () => void;
  trailerApiOptions?: TrailerGenerationOptions | null;
  // 单个分镜校准 callback
  onCalibrateSingleShot?: (shotId: string) => void;
  singleShotCalibrationStatus?: Record<string, 'idle' | 'calibrating' | 'completed' | 'error'>;
  // 校准严格度相关
  calibrationStrictness?: CalibrationStrictness;
  onCalibrationStrictnessChange?: (strictness: CalibrationStrictness) => void;
  lastFilteredCharacters?: FilteredCharacterRecord[];
  onRestoreFilteredCharacter?: (characterName: string) => void;
  // 校准确认弹窗
  calibrationDialogOpen?: boolean;
  pendingCalibrationCharacters?: ScriptCharacter[] | null;
  pendingFilteredCharacters?: FilteredCharacterRecord[];
  onConfirmCalibration?: (kept: ScriptCharacter[], filtered: FilteredCharacterRecord[]) => void;
  onCancelCalibration?: () => void;
}

export function EpisodeTree({
  scriptData,
  shots,
  shotStatus,
  selectedItemId,
  selectedItemType,
  onSelectItem,
  onAddEpisodeBundle,
  onUpdateEpisodeBundle,
  onDeleteEpisodeBundle,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  onDeleteShot,
  onGenerateEpisodeShots,
  onRegenerateAllShots,
  episodeGenerationStatus,
  onCalibrateShots,
  onCalibrateScenesShots,
  onCalibrateCharacters,
  characterCalibrationStatus,
  // AI 角色查找相关
  projectBackground,
  episodeRawScripts,
  onAIFindCharacter,
  aiFindingStatus,
  // AI 场景查找相关
  onAIFindScene,
  // 场景校准相关
  onCalibrateScenes,
  onCalibrateEpisodeScenes,
  sceneCalibrationStatus,
  // 预告片相关
  trailerConfig,
  onGenerateTrailer,
  onClearTrailer,
  trailerApiOptions,
  // 单个分镜校准
  onCalibrateSingleShot,
  singleShotCalibrationStatus,
  // 校准严格度相关
  calibrationStrictness,
  onCalibrationStrictnessChange,
  lastFilteredCharacters,
  onRestoreFilteredCharacter,
  // 校准确认弹窗
  calibrationDialogOpen,
  pendingCalibrationCharacters,
  pendingFilteredCharacters,
  onConfirmCalibration,
  onCancelCalibration,
}: EpisodeTreeProps) {
  const { t } = useTranslation();
  const roleLabels = useMemo(
    () => ({
      protagonist: t("scriptPanel.tree.tagProtagonist"),
      supporting: t("scriptPanel.tree.tagSupporting"),
      minor: t("scriptPanel.tree.tagMinor"),
      extra: t("scriptPanel.tree.tagExtra"),
    }),
    [t]
  );
  const episodeIndexLabel = useCallback(
    (n: number) => formatEpisodeIndexLabel(scriptData?.language, n),
    [scriptData?.language]
  );
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<string>>(new Set(["default"]));
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>("all");
  // 角色分组折叠状态
  const [extrasExpanded, setExtrasExpanded] = useState(false);
  // Tab 状态: 剧集结构 vs 预告片
  const [activeTab, setActiveTab] = useState<"structure" | "trailer">("structure");
  // 预告片时长选择
  const [selectedTrailerDuration, setSelectedTrailerDuration] = useState<TrailerDuration>(30);
  // 预告片生成状态
  const [trailerGenerating, setTrailerGenerating] = useState(false);

  // Dialog states
  const [episodeDialogOpen, setEpisodeDialogOpen] = useState(false);
  const [sceneDialogOpen, setSceneDialogOpen] = useState(false);
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Edit states
  const [editingItem, setEditingItem] = useState<{ type: "episode" | "scene" | "character" | "shot"; id: string } | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ type: "episode" | "scene" | "character" | "shot"; id: string; name: string } | null>(null);
  const [targetEpisodeId, setTargetEpisodeId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  // AI 角色查找状态
  const [aiQuery, setAiQuery] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResult, setAiResult] = useState<{
    found: boolean;
    name: string;
    message: string;
    character?: ScriptCharacter;
  } | null>(null);
  
  // AI 场景查找状态
  const [sceneAiQuery, setSceneAiQuery] = useState("");
  const [sceneAiSearching, setSceneAiSearching] = useState(false);
  const [sceneAiResult, setSceneAiResult] = useState<{
    found: boolean;
    message: string;
    scene?: ScriptScene;
  } | null>(null);

  // 被过滤角色查看弹窗
  const [filteredCharsDialogOpen, setFilteredCharsDialogOpen] = useState(false);
  
  // 校准确认弹窗的本地编辑状态
  const [localKeptCharacters, setLocalKeptCharacters] = useState<ScriptCharacter[]>([]);
  const [localFilteredCharacters, setLocalFilteredCharacters] = useState<FilteredCharacterRecord[]>([]);
  // 缓存用户手动移除的角色完整数据，便于恢复时不丢失 AI 生成的字段
  const [removedCharactersCache, setRemovedCharactersCache] = useState<Map<string, ScriptCharacter>>(new Map());
  
  // 当确认弹窗打开时，从 props 同步
  useEffect(() => {
    if (calibrationDialogOpen && pendingCalibrationCharacters) {
      setLocalKeptCharacters([...pendingCalibrationCharacters]);
      setLocalFilteredCharacters([...(pendingFilteredCharacters || [])]);
      setRemovedCharactersCache(new Map());
    }
  }, [calibrationDialogOpen, pendingCalibrationCharacters, pendingFilteredCharacters]);
  
  // 从保留列表移除角色（缓存完整数据以便恢复）
  const handleRemoveKeptCharacter = useCallback((charId: string) => {
    const char = localKeptCharacters.find(c => c.id === charId);
    if (!char) return;
    setRemovedCharactersCache(prev => {
      const next = new Map(prev);
      next.set(char.name, char);
      return next;
    });
    setLocalKeptCharacters(prev => prev.filter(c => c.id !== charId));
    setLocalFilteredCharacters(prev => [...prev, { name: char.name, reason: t("scriptPanel.tree.reasonUserRemoved") }]);
  }, [localKeptCharacters, t]);
  
  // 从过滤列表恢复角色到保留列表
  const handleRestoreToKept = useCallback((characterName: string) => {
    setLocalFilteredCharacters(prev => prev.filter(fc => fc.name !== characterName));
    // 优先从缓存恢复完整角色数据，避免丢失 AI 生成的字段
    const cachedChar = removedCharactersCache.get(characterName);
    if (cachedChar) {
      setLocalKeptCharacters(prev => [...prev, cachedChar]);
      setRemovedCharactersCache(prev => {
        const next = new Map(prev);
        next.delete(characterName);
        return next;
      });
    } else {
      setLocalKeptCharacters(prev => [...prev, {
        id: `char_restored_${Date.now()}`,
        name: characterName,
        tags: ['extra', 'restored'],
      }]);
    }
  }, [removedCharactersCache]);
  
  // 确认校准结果
  const handleConfirmCalibrationLocal = useCallback(() => {
    onConfirmCalibration?.(localKeptCharacters, localFilteredCharacters);
  }, [localKeptCharacters, localFilteredCharacters, onConfirmCalibration]);
  
  // 全部保留（恢复所有被过滤的角色并确认）
  const handleRestoreAllAndConfirm = useCallback(() => {
    const restored: ScriptCharacter[] = localFilteredCharacters.map((fc, i) => ({
      id: `char_restored_${Date.now()}_${i}`,
      name: fc.name,
      tags: ['extra', 'restored'],
    }));
    onConfirmCalibration?.([...localKeptCharacters, ...restored], []);
  }, [localKeptCharacters, localFilteredCharacters, onConfirmCalibration]);

  // 如果没有episodes，创建一个默认的
  const episodes = useMemo(() => {
    if (!scriptData) return [];
    if (scriptData.episodes && scriptData.episodes.length > 0) {
      return scriptData.episodes;
    }
    // 默认单集
    return [{
      id: "default",
      index: 1,
      title: scriptData.title || episodeIndexLabel(1),
      sceneIds: scriptData.scenes.map((s) => s.id),
    }];
  }, [episodeIndexLabel, scriptData]);

  // 按场景分组的shots
  const shotsByScene = useMemo(() => {
    const map: Record<string, Shot[]> = {};
    shots.forEach((shot) => {
      const sceneId = shot.sceneRefId;
      if (!map[sceneId]) map[sceneId] = [];
      map[sceneId].push(shot);
    });
    return map;
  }, [shots]);

  // 筛选后的shots
  const filteredShots = useMemo(() => {
    if (filter === "all") return shots;
    return shots.filter((shot) => {
      const status = getShotCompletionStatus(shot);
      if (filter === "completed") return status === "completed";
      if (filter === "pending") return status !== "completed";
      return true;
    });
  }, [shots, filter]);

  const toggleEpisode = (id: string) => {
    setExpandedEpisodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleScene = (id: string) => {
    setExpandedScenes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // CRUD handlers
  const handleAddEpisode = () => {
    setEditingItem(null);
    setFormData({ title: episodeIndexLabel(episodes.length + 1), description: "" });
    setEpisodeDialogOpen(true);
  };

  const handleEditEpisode = (ep: Episode) => {
    setEditingItem({ type: "episode", id: ep.id });
    setFormData({ title: ep.title, description: ep.description || "" });
    setEpisodeDialogOpen(true);
  };

  const handleSaveEpisode = () => {
    if (editingItem?.type === "episode") {
      const ep = episodes.find(e => e.id === editingItem.id);
      if (ep) {
        onUpdateEpisodeBundle?.(ep.index, { title: formData.title, synopsis: formData.description });
      }
    } else {
      onAddEpisodeBundle?.(formData.title || episodeIndexLabel(episodes.length + 1), formData.description || '');
    }
    setEpisodeDialogOpen(false);
    setFormData({});
  };

  const handleAddScene = (episodeId: string) => {
    setEditingItem(null);
    setTargetEpisodeId(episodeId);
    // 重置 AI 查找状态
    setSceneAiQuery("");
    setSceneAiResult(null);
    setSceneAiSearching(false);
    setFormData({ name: "", location: "", time: t("scriptPanel.tree.timeDayDefault"), atmosphere: "" });
    setSceneDialogOpen(true);
  };

  const handleEditScene = (scene: ScriptScene) => {
    setEditingItem({ type: "scene", id: scene.id });
    setFormData({ name: scene.name || "", location: scene.location, time: scene.time || t("scriptPanel.tree.timeDayDefault"), atmosphere: scene.atmosphere || "" });
    setSceneDialogOpen(true);
  };

  // AI 场景查找
  const handleSceneAISearch = useCallback(async () => {
    if (!sceneAiQuery.trim() || !onAIFindScene) return;
    
    setSceneAiSearching(true);
    setSceneAiResult(null);
    
    try {
      const result = await onAIFindScene(sceneAiQuery);
      setSceneAiResult(result);
      
      // 如果找到场景，自动填充表单
      if (result.scene) {
        setFormData({
          name: result.scene.name || "",
          location: result.scene.location || "",
          time: result.scene.time || t("scriptPanel.tree.timeDayDefault"),
          atmosphere: result.scene.atmosphere || "",
        });
      }
    } catch (error) {
      console.error('[handleSceneAISearch] 错误:', error);
      setSceneAiResult({
        found: false,
        message: t("scriptPanel.tree.searchFailedRetry"),
      });
    } finally {
      setSceneAiSearching(false);
    }
  }, [sceneAiQuery, onAIFindScene, t]);

  // 确认添加 AI 查找到的场景
  const handleConfirmAIScene = useCallback(() => {
    if (!sceneAiResult?.scene) return;
    onAddScene?.(sceneAiResult.scene, targetEpisodeId || undefined);
    setSceneDialogOpen(false);
    setSceneAiQuery("");
    setSceneAiResult(null);
    setFormData({});
    setTargetEpisodeId(null);
  }, [sceneAiResult, onAddScene, targetEpisodeId]);

  const handleSaveScene = () => {
    if (editingItem?.type === "scene") {
      onUpdateScene?.(editingItem.id, { name: formData.name, location: formData.location, time: formData.time, atmosphere: formData.atmosphere });
    } else {
      // 如果有 AI 结果，使用 AI 生成的完整场景数据
      if (sceneAiResult?.scene) {
        onAddScene?.(sceneAiResult.scene, targetEpisodeId || undefined);
      } else {
        const newScene: ScriptScene = {
          id: `scene_${Date.now()}`,
          name: formData.name || t("scriptPanel.tree.defaultNewScene"),
          location: formData.location || t("scriptPanel.tree.defaultUnknownLocation"),
          time: formData.time || t("scriptPanel.tree.timeDayDefault"),
          atmosphere: formData.atmosphere,
        };
        onAddScene?.(newScene, targetEpisodeId || undefined);
      }
    }
    setSceneDialogOpen(false);
    setFormData({});
    setSceneAiQuery("");
    setSceneAiResult(null);
    setTargetEpisodeId(null);
  };

  const handleAddCharacter = () => {
    setEditingItem(null);
    // 重置 AI 查找状态
    setAiQuery("");
    setAiResult(null);
    setAiSearching(false);
    setFormData({ name: "", gender: "", age: "", personality: "" });
    setCharacterDialogOpen(true);
  };

  const handleEditCharacter = (char: ScriptCharacter) => {
    setEditingItem({ type: "character", id: char.id });
    setFormData({ name: char.name, gender: char.gender || "", age: char.age || "", personality: char.personality || "" });
    setCharacterDialogOpen(true);
  };

  // AI 角色查找
  const handleAISearch = useCallback(async () => {
    if (!aiQuery.trim() || !onAIFindCharacter) return;
    
    setAiSearching(true);
    setAiResult(null);
    
    try {
      const result = await onAIFindCharacter(aiQuery);
      setAiResult(result);
      
      // 如果找到角色，自动填充表单
      if (result.character) {
        setFormData({
          name: result.character.name || "",
          gender: result.character.gender || "",
          age: result.character.age || "",
          personality: result.character.personality || "",
          role: result.character.role || "",
        });
      }
    } catch (error) {
      console.error('[handleAISearch] 错误:', error);
      setAiResult({
        found: false,
        name: "",
        message: t("scriptPanel.tree.searchFailedRetry"),
      });
    } finally {
      setAiSearching(false);
    }
  }, [aiQuery, onAIFindCharacter, t]);

  // 确认添加 AI 查找到的角色
  const handleConfirmAICharacter = useCallback(() => {
    if (!aiResult?.character) return;
    onAddCharacter?.(aiResult.character);
    setCharacterDialogOpen(false);
    setAiQuery("");
    setAiResult(null);
    setFormData({});
  }, [aiResult, onAddCharacter]);

  const handleSaveCharacter = () => {
    if (editingItem?.type === "character") {
      onUpdateCharacter?.(editingItem.id, { name: formData.name, gender: formData.gender, age: formData.age, personality: formData.personality });
    } else {
      // 如果有 AI 结果，使用 AI 生成的完整角色数据
      if (aiResult?.character) {
        onAddCharacter?.(aiResult.character);
      } else {
        const newChar: ScriptCharacter = {
          id: `char_${Date.now()}`,
          name: formData.name || t("scriptPanel.tree.defaultNewCharacter"),
          gender: formData.gender,
          age: formData.age,
          personality: formData.personality,
        };
        onAddCharacter?.(newChar);
      }
    }
    setCharacterDialogOpen(false);
    setFormData({});
    setAiQuery("");
    setAiResult(null);
  };

  const handleDelete = (type: "episode" | "scene" | "character" | "shot", id: string, name: string) => {
    setDeleteItem({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteItem) return;
    switch (deleteItem.type) {
      case "episode": {
        const ep = episodes.find(e => e.id === deleteItem.id);
        if (ep) onDeleteEpisodeBundle?.(ep.index);
        break;
      }
      case "scene":
        onDeleteScene?.(deleteItem.id);
        break;
      case "character":
        onDeleteCharacter?.(deleteItem.id);
        break;
      case "shot":
        onDeleteShot?.(deleteItem.id);
        break;
    }
    setDeleteDialogOpen(false);
    setDeleteItem(null);
  };

  // 计算整体进度
  const overallProgress = useMemo(() => {
    if (!scriptData) return '0/0';
    return calculateProgress(
      shots.map((s) => ({ status: getShotCompletionStatus(s) }))
    );
  }, [shots, scriptData]);

  // 处理预告片生成
  const handleGenerateTrailer = useCallback(async () => {
    if (!trailerApiOptions || trailerGenerating) return;
    
    setTrailerGenerating(true);
    try {
      onGenerateTrailer?.(selectedTrailerDuration);
    } finally {
      setTrailerGenerating(false);
    }
  }, [trailerApiOptions, trailerGenerating, selectedTrailerDuration, onGenerateTrailer]);

  // 获取预告片中的分镜列表
  const trailerShots = useMemo(() => {
    if (!trailerConfig?.shotIds || !shots.length) return [];
    return trailerConfig.shotIds
      .map(id => shots.find(s => s.id === id))
      .filter((s): s is Shot => !!s);
  }, [trailerConfig?.shotIds, shots]);

  if (!scriptData) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        {t("scriptPanel.tree.emptyStructure")}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 顶部 Tab 切换 */}
      <div className="border-b">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "structure" | "trailer")} className="w-full">
          <TabsList className="w-full justify-start h-9 rounded-none bg-transparent border-b-0 p-0">
            <TabsTrigger 
              value="structure" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-9 px-4"
            >
              <Film className="h-3 w-3 mr-1" />
              {t("scriptPanel.tree.tabStructure")}
            </TabsTrigger>
            <TabsTrigger 
              value="trailer" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-9 px-4"
            >
              <Clapperboard className="h-3 w-3 mr-1" />
              {t("scriptPanel.tree.tabTrailer")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 标题和进度 - 仅在剧集结构 Tab 显示 */}
      {activeTab === "structure" && (
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-sm">{projectBackground?.title || scriptData.title}</h3>
              {scriptData.genre && (
                <span className="text-xs text-muted-foreground">{scriptData.genre}</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {t("scriptPanel.tree.progress", { value: overallProgress })}
            </span>
          </div>
        </div>
      )}

      {/* 筛选 + 新建按钮 - 仅在剧集结构 Tab 显示 */}
      {activeTab === "structure" && (
        <div className="px-3 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Filter className="h-3 w-3 text-muted-foreground" />
            <div className="flex gap-1">
              {(["all", "pending", "completed"] as FilterType[]).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "ghost"}
                  className="h-6 text-xs px-2"
                  onClick={() => setFilter(f)}
                >
                  {f === "all"
                    ? t("scriptPanel.tree.filterAll")
                    : f === "pending"
                      ? t("scriptPanel.tree.filterPending")
                      : t("scriptPanel.tree.filterCompleted")}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            {onCalibrateScenes && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2"
                onClick={onCalibrateScenes}
                disabled={sceneCalibrationStatus === 'calibrating'}
              >
                {sceneCalibrationStatus === 'calibrating' ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" />{t("scriptPanel.tree.calibrating")}</>
                ) : (
                  <><Wand2 className="h-3 w-3 mr-1" />{t("scriptPanel.tree.aiSceneCalib")}</>
                )}
              </Button>
            )}
            {onRegenerateAllShots && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2"
                onClick={onRegenerateAllShots}
              >
                <RefreshCw className="h-3 w-3 mr-1" />{t("scriptPanel.tree.refreshAll")}
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={handleAddEpisode}>
              <Plus className="h-3 w-3 mr-1" />{t("scriptPanel.tree.newEpisode")}
            </Button>
          </div>
        </div>
      )}

      {/* 预告片 Tab 内容 */}
      {activeTab === "trailer" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 预告片设置区 */}
          <div className="p-3 border-b space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t("scriptPanel.tree.trailerDuration")}</Label>
              <div className="flex gap-1">
                {([10, 30, 60] as TrailerDuration[]).map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={selectedTrailerDuration === d ? "default" : "outline"}
                    className="h-7 text-xs px-2"
                    onClick={() => setSelectedTrailerDuration(d)}
                  >
                    <Timer className="h-3 w-3 mr-1" />
                    {d === 60 ? t("scriptPanel.tree.trailer1min") : t("scriptPanel.tree.trailerSeconds", { n: d })}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="flex-1 h-8"
                onClick={handleGenerateTrailer}
                disabled={!trailerApiOptions || trailerGenerating || shots.length === 0 || trailerConfig?.status === 'generating'}
              >
                {trailerGenerating || trailerConfig?.status === 'generating' ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("scriptPanel.tree.aiAnalyzing")}</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" />{t("scriptPanel.tree.aiPickShots")}</>
                )}
              </Button>
              {trailerConfig?.shotIds && trailerConfig.shotIds.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={onClearTrailer}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {!trailerApiOptions && (
              <p className="text-xs text-amber-500">{t("scriptPanel.tree.configureApiFirst")}</p>
            )}
            {shots.length === 0 && (
              <p className="text-xs text-amber-500">{t("scriptPanel.tree.generateShotsFirst")}</p>
            )}
          </div>

          {/* 预告片分镜列表 */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {trailerConfig?.error && (
                <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                  {trailerConfig.error}
                </div>
              )}
              {trailerShots.length > 0 ? (
                <>
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("scriptPanel.tree.selectedShotsSummary", {
                      count: trailerShots.length,
                      seconds: trailerShots.reduce((sum, s) => sum + (s.duration || 5), 0),
                    })}
                  </div>
                  {trailerShots.map((shot, index) => {
                    const calibrationStatus = singleShotCalibrationStatus?.[shot.id] || 'idle';
                    return (
                      <div
                        key={shot.id}
                        className={cn(
                          "p-2 rounded border cursor-pointer hover:bg-muted/50 transition-colors",
                          selectedItemId === shot.id && selectedItemType === "shot" && "bg-primary/10 border-primary"
                        )}
                        onClick={() => onSelectItem(shot.id, "shot")}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground w-5">
                            #{index + 1}
                          </span>
                          <Play className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs flex-1 truncate">
                            {shot.shotSize || t("scriptPanel.tree.shotLabel")} - {shot.actionSummary?.slice(0, 30)}...
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {shot.duration || 5}s
                          </span>
                          {/* AI 校准按钮 */}
                          {onCalibrateSingleShot && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCalibrateSingleShot(shot.id);
                              }}
                              disabled={calibrationStatus === 'calibrating'}
                              title={t("scriptPanel.tree.calibrateShotTitle")}
                            >
                              {calibrationStatus === 'calibrating' ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : calibrationStatus === 'completed' ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : calibrationStatus === 'error' ? (
                                <X className="h-3 w-3 text-destructive" />
                              ) : (
                                <Wand2 className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                        {shot.dialogue && (
                          <p className="text-xs text-muted-foreground mt-1 pl-7 truncate">
                            「{shot.dialogue.slice(0, 40)}...」
                          </p>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : trailerConfig?.status === 'completed' ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  {t("scriptPanel.tree.noTrailerShots")}
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <Clapperboard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{t("scriptPanel.tree.trailerHint")}</p>
                  <p className="text-xs mt-1">{t("scriptPanel.tree.trailerHintSub")}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* 剧集结构 Tab 内容 - 树形结构 */}
      {activeTab === "structure" && (
      <ScrollArea className="flex-1">
        <div className="p-2 pb-20 space-y-1">
          {/* 集列表 */}
          {episodes.map((episode) => {
            const episodeScenes = scriptData.scenes.filter((s) =>
              episode.sceneIds.includes(s.id)
            );
            const episodeShots = shots.filter((shot) =>
              episodeScenes.some((s) => s.id === shot.sceneRefId)
            );
            const episodeProgress = calculateProgress(
              episodeShots.map((s) => ({ status: getShotCompletionStatus(s) }))
            );
            const episodeTitleRemainder = stripStoredEpisodeTitlePrefix(episode.title, episode.index);
            const episodeIndexText = episodeIndexLabel(episode.index);

            return (
              <div key={episode.id} className="space-y-0.5">
                {/* 集标题 */}
                <div className="flex items-center group">
                  <button
                    onClick={() => toggleEpisode(episode.id)}
                    className={cn(
                      "flex-1 min-w-0 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-muted text-left overflow-hidden",
                      selectedItemId === `episode_${episode.index}` &&
                        selectedItemType === "episode" &&
                        "bg-primary/10"
                    )}
                  >
                    {expandedEpisodes.has(episode.id) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                    <Film className="h-3 w-3 text-primary shrink-0" />
                    <span 
                      className="text-sm font-medium flex-1 min-w-0 flex items-center gap-1 truncate"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(`episode_${episode.index}`, "episode");
                      }}
                      title={episode.title}
                    >
                      <span className="shrink-0">{episodeIndexText}</span>
                      {episodeTitleRemainder ? (
                        <>
                          <span className="text-muted-foreground font-normal shrink-0">·</span>
                          <span className="font-normal truncate min-w-0">{episodeTitleRemainder}</span>
                        </>
                      ) : null}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {episodeProgress}
                    </span>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onGenerateEpisodeShots && (
                        <DropdownMenuItem
                          onClick={() => onGenerateEpisodeShots(episode.index)}
                          disabled={episodeGenerationStatus?.[episode.index] === 'generating'}
                        >
                          {episodeGenerationStatus?.[episode.index] === 'generating' ? (
                            <><Loader2 className="h-3 w-3 mr-2 animate-spin" />{t("scriptPanel.tree.ctxGeneratingShots")}</>
                          ) : episodeGenerationStatus?.[episode.index] === 'completed' ? (
                            <><RefreshCw className="h-3 w-3 mr-2" />{t("scriptPanel.tree.ctxRefreshShots")}</>
                          ) : (
                            <><Wand2 className="h-3 w-3 mr-2" />{t("scriptPanel.tree.ctxGenerateShots")}</>
                          )}
                        </DropdownMenuItem>
                      )}
                      {onCalibrateShots && episodeGenerationStatus?.[episode.index] === 'completed' && (
                        <DropdownMenuItem
                          onClick={() => onCalibrateShots(episode.index)}
                        >
                          <Wand2 className="h-3 w-3 mr-2" />{t("scriptPanel.property.aiCalibrateShots")}
                        </DropdownMenuItem>
                      )}
                      {onCalibrateEpisodeScenes && (
                        <DropdownMenuItem
                          onClick={() => onCalibrateEpisodeScenes(episode.index)}
                          disabled={sceneCalibrationStatus === 'calibrating'}
                        >
                          {sceneCalibrationStatus === 'calibrating' ? (
                            <><Loader2 className="h-3 w-3 mr-2 animate-spin" />{t("scriptPanel.tree.ctxSceneCalibrating")}</>
                          ) : (
                            <><MapPin className="h-3 w-3 mr-2" />{t("scriptPanel.tree.ctxCalibrateEpisodeScenes")}</>
                          )}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleAddScene(episode.id)}>
                        <Plus className="h-3 w-3 mr-2" />{t("scriptPanel.tree.ctxNewScene")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditEpisode(episode)}>
                        <Pencil className="h-3 w-3 mr-2" />{t("scriptPanel.tree.ctxEdit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete("episode", episode.id, episode.title)}>
                        <Trash2 className="h-3 w-3 mr-2" />{t("scriptPanel.tree.ctxDelete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* 场景列表 */}
                {expandedEpisodes.has(episode.id) && (
                  <div className="ml-4 space-y-0.5">
                    {episodeScenes.map((scene) => {
                      const sceneShots = shotsByScene[scene.id] || [];
                      const sceneProgress = calculateProgress(
                        sceneShots.map((s) => ({ status: getShotCompletionStatus(s) }))
                      );

                      return (
                        <div key={scene.id} className="space-y-0.5">
                          {/* 场景标题 */}
                          <div className="flex items-center group">
                            <button
                              onClick={() => toggleScene(scene.id)}
                              className={cn(
                                "flex-1 flex items-center gap-1 px-2 py-1 rounded hover:bg-muted text-left",
                                selectedItemId === scene.id &&
                                  selectedItemType === "scene" &&
                                  "bg-primary/10"
                              )}
                            >
                              {sceneShots.length > 0 ? (
                                expandedScenes.has(scene.id) ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )
                              ) : (
                                <span className="w-3" />
                              )}
                              {/* 分镜生成状态指示器 */}
                              {shotStatus === "generating" && sceneShots.length === 0 ? (
                                <Loader2 className="h-3 w-3 text-primary animate-spin" />
                              ) : (
                                <MapPin className="h-3 w-3 text-blue-500" />
                              )}
                              <span
                                className="text-xs flex-1 truncate"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectItem(scene.id, "scene");
                                }}
                              >
                                {scene.name || scene.location}
                              </span>
                              <StatusIcon status={scene.status} />
                              <span className="text-xs text-muted-foreground">
                                {sceneProgress}
                              </span>
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {onCalibrateScenesShots && sceneShots.length > 0 && (
                                  <DropdownMenuItem
                                    onClick={() => onCalibrateScenesShots(scene.id)}
                                  >
                                    <Wand2 className="h-3 w-3 mr-2" />{t("scriptPanel.property.aiCalibrateShots")}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleEditScene(scene)}>
                                  <Pencil className="h-3 w-3 mr-2" />{t("scriptPanel.tree.ctxEdit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete("scene", scene.id, scene.name || scene.location)}>
                                  <Trash2 className="h-3 w-3 mr-2" />{t("scriptPanel.tree.ctxDelete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* 分镜列表 */}
                          {expandedScenes.has(scene.id) && sceneShots.length > 0 && (
                            <div className="ml-4 space-y-0.5">
                              {sceneShots
                                .filter((shot) => {
                                  if (filter === "all") return true;
                                  const status = getShotCompletionStatus(shot);
                                  if (filter === "completed")
                                    return status === "completed";
                                  return status !== "completed";
                                })
                                .map((shot) => (
                                  <div key={shot.id} className="flex items-center group">
                                    <button
                                      onClick={() => onSelectItem(shot.id, "shot")}
                                      className={cn(
                                        "flex-1 flex items-center gap-2 px-2 py-1 rounded hover:bg-muted text-left",
                                        selectedItemId === shot.id &&
                                          selectedItemType === "shot" &&
                                          "bg-primary/10"
                                      )}
                                    >
                                      <span className="text-xs font-mono text-muted-foreground w-5">
                                        {String(shot.index).padStart(2, "0")}
                                      </span>
                                      <span className="text-xs flex-1 truncate">
                                        {shot.shotSize || t("scriptPanel.tree.shotLabel")} - {shot.actionSummary?.slice(0, 20)}...
                                      </span>
                                      <StatusIcon
                                        status={getShotCompletionStatus(shot)}
                                      />
                                    </button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete("shot", shot.id, t("scriptPanel.tree.shotDeleteLabel", { n: shot.index }));
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* 角色列表 - 分为主角组和群演配角组 */}
          {(() => {
            // 过滤掉父角色，并去重
            const seenIds = new Set<string>();
            const allCharacters = scriptData.characters
              .filter(c => !c.stageCharacterIds || c.stageCharacterIds.length === 0)
              .filter(c => {
                if (seenIds.has(c.id)) return false;
                seenIds.add(c.id);
                return true;
              });
            
            // 分组：主角组 (protagonist, supporting) 和 群演配角组 (minor, extra)
            const mainCharacters = allCharacters.filter(c => {
              const tags = c.tags || [];
              return tags.includes('protagonist') || tags.includes('supporting');
            });
            const extraCharacters = allCharacters.filter(c => {
              const tags = c.tags || [];
              return !tags.includes('protagonist') && !tags.includes('supporting');
            });

            const renderCharacterItem = (char: ScriptCharacter) => (
              <div key={char.id} className="flex items-center group">
                <button
                  onClick={() => onSelectItem(char.id, "character")}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-muted",
                    selectedItemId === char.id &&
                      selectedItemType === "character" &&
                      "bg-primary/10"
                  )}
                >
                  <StatusIcon status={char.status} />
                  {char.name}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditCharacter(char)}>
                      <Pencil className="h-3 w-3 mr-2" />{t("scriptPanel.tree.ctxEdit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete("character", char.id, char.name)}>
                      <Trash2 className="h-3 w-3 mr-2" />{t("scriptPanel.tree.ctxDelete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
            
            return (
              <>
                {/* 主角组 */}
                <div className="mt-4 pt-4 border-t">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {t("scriptPanel.tree.charactersHeading", { count: mainCharacters.length })}
                    </div>
                    <div className="flex items-center gap-1">
                      {onCalibrateCharacters && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-5 text-xs px-1"
                              disabled={characterCalibrationStatus === 'calibrating'}
                            >
                              {characterCalibrationStatus === 'calibrating' ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-3 w-3" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onCalibrateCharacters}>
                              <Wand2 className="h-3 w-3 mr-2" />{t("scriptPanel.tree.aiCharCalib")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="text-xs">
                                <Wand2 className="h-3 w-3 mr-2" />{t("scriptPanel.tree.calibrationStrictnessMenu")}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuRadioGroup
                                  value={calibrationStrictness || 'normal'}
                                  onValueChange={(v) => onCalibrationStrictnessChange?.(v as CalibrationStrictness)}
                                >
                                  <DropdownMenuRadioItem value="strict" className="text-xs">{t("scriptPanel.tree.strictnessStrict")}</DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="normal" className="text-xs">{t("scriptPanel.tree.strictnessNormal")}</DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="loose" className="text-xs">{t("scriptPanel.tree.strictnessLoose")}</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem onClick={() => setFilteredCharsDialogOpen(true)}>
                              <Filter className="h-3 w-3 mr-2" />{t("scriptPanel.tree.viewFilteredChars")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <Button size="sm" variant="ghost" className="h-5 text-xs px-1" onClick={handleAddCharacter}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 px-2 mt-1">
                    {mainCharacters.map(renderCharacterItem)}
                  </div>
                </div>
                
                {/* 群演配角组 - 可折叠 */}
                {extraCharacters.length > 0 && (
                  <div className="mt-2 border-t border-dashed pt-2">
                    <button
                      onClick={() => setExtrasExpanded(!extrasExpanded)}
                      className="w-full px-2 py-1 text-xs text-muted-foreground flex items-center justify-between hover:bg-muted/50 rounded"
                    >
                      <div className="flex items-center gap-1">
                        {extrasExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                        <span>{t("scriptPanel.tree.extrasHeading", { count: extraCharacters.length })}</span>
                      </div>
                    </button>
                    {extrasExpanded && (
                      <div className="flex flex-wrap gap-1 px-2 mt-1">
                        {extraCharacters.map(renderCharacterItem)}
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </ScrollArea>
      )}

      {/* Episode Dialog */}
      <Dialog open={episodeDialogOpen} onOpenChange={setEpisodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem?.type === "episode" ? t("scriptPanel.tree.dialogEditEpisode") : t("scriptPanel.tree.dialogNewEpisode")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("scriptPanel.tree.dialogLabelTitle")}</Label>
              <Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("scriptPanel.tree.dialogLabelDescription")}</Label>
              <Input value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEpisodeDialogOpen(false)}>{t("scriptPanel.property.cancel")}</Button>
            <Button onClick={handleSaveEpisode}>{t("scriptPanel.tree.dialogSave")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scene Dialog - AI 对话模式 */}
      <Dialog open={sceneDialogOpen} onOpenChange={(open) => {
        setSceneDialogOpen(open);
        if (!open) {
          setSceneAiQuery("");
          setSceneAiResult(null);
          setSceneAiSearching(false);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingItem?.type === "scene" ? (
                <><Pencil className="h-4 w-4" />{t("scriptPanel.tree.dialogEditScene")}</>
              ) : (
                <><Sparkles className="h-4 w-4 text-primary" />{t("scriptPanel.tree.dialogAiAddScene")}</>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {/* 编辑模式：显示普通表单 */}
          {editingItem?.type === "scene" ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("scriptPanel.tree.dialogSceneName")}</Label>
                <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("scriptPanel.property.labelLocation")}</Label>
                <Input value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("scriptPanel.property.labelTime")}</Label>
                <Input value={formData.time || ""} onChange={(e) => setFormData({ ...formData, time: e.target.value })} placeholder={t("scriptPanel.property.placeholderTime")} />
              </div>
              <div className="space-y-2">
                <Label>{t("scriptPanel.property.labelAtmosphere")}</Label>
                <Input value={formData.atmosphere || ""} onChange={(e) => setFormData({ ...formData, atmosphere: e.target.value })} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSceneDialogOpen(false)}>{t("scriptPanel.property.cancel")}</Button>
                <Button onClick={handleSaveScene}>{t("scriptPanel.tree.dialogSave")}</Button>
              </DialogFooter>
            </div>
          ) : (
            /* 新建模式：AI 对话界面 */
            <div className="space-y-4 py-2">
              {/* AI 输入区 */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {t("scriptPanel.tree.sceneAiLabelHint")}
                </Label>
                <div className="text-xs text-muted-foreground space-y-1 pl-2">
                  <p>{t("scriptPanel.tree.sceneAiExample1")}</p>
                  <p>{t("scriptPanel.tree.sceneAiExample2")}</p>
                  <p>{t("scriptPanel.tree.sceneAiExample3")}</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder={t("scriptPanel.tree.sceneAiPlaceholder")}
                    value={sceneAiQuery}
                    onChange={(e) => setSceneAiQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSceneAISearch();
                      }
                    }}
                    disabled={sceneAiSearching}
                  />
                  <Button
                    onClick={handleSceneAISearch}
                    disabled={!sceneAiQuery.trim() || sceneAiSearching || !onAIFindScene}
                    className="shrink-0"
                  >
                    {sceneAiSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {!onAIFindScene && (
                  <p className="text-xs text-amber-500">{t("scriptPanel.tree.importScriptForAi")}</p>
                )}
              </div>

              {/* AI 结果显示 */}
              {sceneAiResult && (
                <div className={cn(
                  "rounded-lg border p-3 space-y-3",
                  sceneAiResult.found ? "border-green-500/50 bg-green-50 dark:bg-green-950/20" : "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20"
                )}>
                  <div className="flex items-start gap-2">
                    {sceneAiResult.found ? (
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-amber-500 mt-0.5" />
                    )}
                    <p className="text-sm">{sceneAiResult.message}</p>
                  </div>
                  
                  {/* 找到场景时显示场景信息 */}
                  {sceneAiResult.scene && (
                    <div className="space-y-2 pl-6">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t("scriptPanel.tree.sceneDetailName")}</span>
                          <span className="font-medium">{sceneAiResult.scene.name || sceneAiResult.scene.location}</span>
                        </div>
                        {sceneAiResult.scene.time && (
                          <div>
                            <span className="text-muted-foreground">{t("scriptPanel.tree.sceneDetailTime")}</span>
                            <span>{sceneAiResult.scene.time}</span>
                          </div>
                        )}
                        {sceneAiResult.scene.atmosphere && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">{t("scriptPanel.tree.sceneDetailAtmosphere")}</span>
                            <span>{sceneAiResult.scene.atmosphere}</span>
                          </div>
                        )}
                      </div>
                      {sceneAiResult.scene.location && sceneAiResult.scene.location !== sceneAiResult.scene.name && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">{t("scriptPanel.tree.sceneDetailLocation")}</span>
                          <p className="text-xs mt-1 text-muted-foreground">{sceneAiResult.scene.location}</p>
                        </div>
                      )}
                      {sceneAiResult.scene.visualPrompt && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">{t("scriptPanel.tree.sceneDetailVisual")}</span>
                          <p className="text-xs mt-1 text-muted-foreground">{sceneAiResult.scene.visualPrompt}</p>
                        </div>
                      )}
                      {sceneAiResult.scene.tags && sceneAiResult.scene.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sceneAiResult.scene.tags.map((tag, i) => (
                            <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 操作按钮 */}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSceneDialogOpen(false)}>
                  {t("scriptPanel.property.cancel")}
                </Button>
                {sceneAiResult?.scene ? (
                  <Button onClick={handleConfirmAIScene} className="gap-1">
                    <Check className="h-4 w-4" />
                    {t("scriptPanel.tree.confirmAdd")}
                  </Button>
                ) : sceneAiResult && !sceneAiResult.found ? (
                  <Button onClick={handleSaveScene} variant="secondary" className="gap-1">
                    <Plus className="h-4 w-4" />
                    {t("scriptPanel.tree.createAnyway")}
                  </Button>
                ) : null}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Character Dialog - AI 对话模式 */}
      <Dialog open={characterDialogOpen} onOpenChange={(open) => {
        setCharacterDialogOpen(open);
        if (!open) {
          setAiQuery("");
          setAiResult(null);
          setAiSearching(false);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingItem?.type === "character" ? (
                <><Pencil className="h-4 w-4" />{t("scriptPanel.tree.dialogEditCharacter")}</>
              ) : (
                <><Sparkles className="h-4 w-4 text-primary" />{t("scriptPanel.tree.dialogAiAddCharacter")}</>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {/* 编辑模式：显示普通表单 */}
          {editingItem?.type === "character" ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("scriptPanel.tree.dialogLabelCharName")}</Label>
                <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("scriptPanel.property.labelGender")}</Label>
                <Input value={formData.gender || ""} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("scriptPanel.property.labelAge")}</Label>
                <Input value={formData.age || ""} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("scriptPanel.property.labelPersonality")}</Label>
                <Input value={formData.personality || ""} onChange={(e) => setFormData({ ...formData, personality: e.target.value })} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCharacterDialogOpen(false)}>{t("scriptPanel.property.cancel")}</Button>
                <Button onClick={handleSaveCharacter}>{t("scriptPanel.tree.dialogSave")}</Button>
              </DialogFooter>
            </div>
          ) : (
            /* 新建模式：AI 对话界面 */
            <div className="space-y-4 py-2">
              {/* AI 输入区 */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {t("scriptPanel.tree.charAiLabelHint")}
                </Label>
                <div className="text-xs text-muted-foreground space-y-1 pl-2">
                  <p>{t("scriptPanel.tree.charAiExample1")}</p>
                  <p>{t("scriptPanel.tree.charAiExample2")}</p>
                  <p>{t("scriptPanel.tree.charAiExample3")}</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder={t("scriptPanel.tree.charAiPlaceholder")}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAISearch();
                      }
                    }}
                    disabled={aiSearching}
                  />
                  <Button
                    onClick={handleAISearch}
                    disabled={!aiQuery.trim() || aiSearching || !onAIFindCharacter}
                    className="shrink-0"
                  >
                    {aiSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {!onAIFindCharacter && (
                  <p className="text-xs text-amber-500">{t("scriptPanel.tree.importScriptForAi")}</p>
                )}
              </div>

              {/* AI 结果显示 */}
              {aiResult && (
                <div className={cn(
                  "rounded-lg border p-3 space-y-3",
                  aiResult.found ? "border-green-500/50 bg-green-50 dark:bg-green-950/20" : "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20"
                )}>
                  <div className="flex items-start gap-2">
                    {aiResult.found ? (
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-amber-500 mt-0.5" />
                    )}
                    <p className="text-sm">{aiResult.message}</p>
                  </div>
                  
                  {/* 找到角色时显示角色信息 */}
                  {aiResult.character && (
                    <div className="space-y-2 pl-6">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t("scriptPanel.tree.charDetailName")}</span>
                          <span className="font-medium">{aiResult.character.name}</span>
                        </div>
                        {aiResult.character.gender && (
                          <div>
                            <span className="text-muted-foreground">{t("scriptPanel.tree.charDetailGender")}</span>
                            <span>{aiResult.character.gender}</span>
                          </div>
                        )}
                        {aiResult.character.age && (
                          <div>
                            <span className="text-muted-foreground">{t("scriptPanel.tree.charDetailAge")}</span>
                            <span>{aiResult.character.age}</span>
                          </div>
                        )}
                        {aiResult.character.personality && (
                          <div>
                            <span className="text-muted-foreground">{t("scriptPanel.tree.charDetailPersonality")}</span>
                            <span>{aiResult.character.personality}</span>
                          </div>
                        )}
                      </div>
                      {aiResult.character.role && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">{t("scriptPanel.tree.charDetailRole")}</span>
                          <p className="text-xs mt-1 text-muted-foreground">{aiResult.character.role}</p>
                        </div>
                      )}
                      {aiResult.character.visualPromptZh && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">{t("scriptPanel.tree.charDetailVisual")}</span>
                          <p className="text-xs mt-1 text-muted-foreground">{aiResult.character.visualPromptZh}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 操作按钮 */}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setCharacterDialogOpen(false)}>
                  {t("scriptPanel.property.cancel")}
                </Button>
                {aiResult?.character ? (
                  <Button onClick={handleConfirmAICharacter} className="gap-1">
                    <Check className="h-4 w-4" />
                    {t("scriptPanel.tree.confirmAdd")}
                  </Button>
                ) : aiResult && !aiResult.found ? (
                  <Button onClick={handleSaveCharacter} variant="secondary" className="gap-1">
                    <Plus className="h-4 w-4" />
                    {t("scriptPanel.tree.createAnyway")}
                  </Button>
                ) : null}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("scriptPanel.tree.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("scriptPanel.tree.deleteConfirmBody", { name: deleteItem?.name ?? "" })}
              {deleteItem?.type === "episode" && `\n${t("scriptPanel.tree.deleteConfirmEpisodeNote")}`}
              {deleteItem?.type === "scene" && `\n${t("scriptPanel.tree.deleteConfirmSceneNote")}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("scriptPanel.property.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">{t("scriptPanel.tree.ctxDelete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 角色校准确认弹窗 */}
      <Dialog open={calibrationDialogOpen} onOpenChange={(open) => { if (!open) onCancelCalibration?.(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              {t("scriptPanel.tree.calibrationDialogTitle")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* 保留角色列表 */}
            <div>
              <h4 className="text-sm font-medium mb-2">{t("scriptPanel.tree.keptCharactersHeading", { count: localKeptCharacters.length })}</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto border rounded-md p-2">
                {localKeptCharacters.map(char => {
                  const importance = char.tags?.find(t => ['protagonist', 'supporting', 'minor', 'extra'].includes(t));
                  return (
                    <div key={char.id} className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted text-xs">
                      <div className="flex items-center gap-2">
                        <span>{char.name}</span>
                        {importance && (
                          <span className="text-muted-foreground text-[10px]">({roleLabels[importance] || importance})</span>
                        )}
                      </div>
                      <Button
                        variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveKeptCharacter(char.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* 被过滤角色列表 */}
            {localFilteredCharacters.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t("scriptPanel.tree.filteredCharactersHeading", { count: localFilteredCharacters.length })}</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
                  {localFilteredCharacters.map((fc, i) => (
                    <div key={`${fc.name}_${i}`} className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through">{fc.name}</span>
                        <span className="text-muted-foreground text-[10px]">({fc.reason})</span>
                      </div>
                      <Button
                        variant="ghost" size="sm" className="h-5 w-5 p-0 text-green-600 hover:text-green-700"
                        onClick={() => handleRestoreToKept(fc.name)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onCancelCalibration}>{t("scriptPanel.property.cancel")}</Button>
            {localFilteredCharacters.length > 0 && (
              <Button variant="secondary" onClick={handleRestoreAllAndConfirm}>{t("scriptPanel.tree.restoreAll")}</Button>
            )}
            <Button onClick={handleConfirmCalibrationLocal}>{t("scriptPanel.tree.confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看被过滤角色弹窗 */}
      <Dialog open={filteredCharsDialogOpen} onOpenChange={setFilteredCharsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("scriptPanel.tree.filteredCharsDialogTitle")}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {(lastFilteredCharacters && lastFilteredCharacters.length > 0) ? (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {lastFilteredCharacters.map((fc, i) => (
                  <div key={`${fc.name}_${i}`} className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted text-xs">
                    <div>
                      <span>{fc.name}</span>
                      <span className="text-muted-foreground ml-2">({fc.reason})</span>
                    </div>
                    <Button
                      variant="ghost" size="sm" className="h-5 text-xs px-1 text-green-600"
                      onClick={() => {
                        onRestoreFilteredCharacter?.(fc.name);
                      }}
                    >
                      {t("scriptPanel.tree.restore")}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t("scriptPanel.tree.noFilteredChars")}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFilteredCharsDialogOpen(false)}>{t("scriptPanel.tree.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
