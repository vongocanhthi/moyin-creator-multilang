// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.
"use client";

/**
 * Character Detail Panel - Right column
 * Shows selected character's preview images, info, and actions
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCharacterLibraryStore, type Character } from "@/stores/character-library-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  User,
  Image as ImageIcon,
  Edit3,
  Check,
  X,
  Shirt,
  Trash2,
  Download,
  GripVertical,
  Tag,
  StickyNote,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { WardrobeModal } from "./wardrobe-modal";
import { LocalImage } from "@/components/ui/local-image";
import { ImagePreviewModal } from "@/components/panels/director/media-preview-modal";

interface CharacterDetailProps {
  character: Character | null;
}

export function CharacterDetail({ character }: CharacterDetailProps) {
  const { t } = useTranslation();
  const { updateCharacter, deleteCharacter, selectCharacter } = useCharacterLibraryStore();

  const viewLabels = useMemo(
    () => ({
      front: t("characters.viewTypes.front"),
      side: t("characters.viewTypes.side"),
      back: t("characters.viewTypes.back"),
      "three-quarter": t("characters.viewTypes.threeQuarter"),
    }),
    [t]
  );

  const genderLabels = useMemo(
    () => ({
      male: t("characters.gender.male"),
      female: t("characters.gender.female"),
      other: t("characters.gender.other"),
    }),
    [t]
  );

  const ageLabels = useMemo(
    () => ({
      child: t("characters.age.child"),
      teen: t("characters.age.teen"),
      "young-adult": t("characters.age.youngAdult"),
      adult: t("characters.age.adult"),
      senior: t("characters.age.senior"),
    }),
    [t]
  );
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [selectedViewIndex, setSelectedViewIndex] = useState(0);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [newTag, setNewTag] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  if (!character) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          {t("characters.detail.selectPrompt")}
        </p>
      </div>
    );
  }

  const handleSaveName = () => {
    if (editName.trim() && editName.trim() !== character.name) {
      updateCharacter(character.id, { name: editName.trim() });
      toast.success(t("characters.detail.nameUpdated"));
    }
    setIsEditingName(false);
  };

  const handleDelete = () => {
    if (confirm(t("characters.detail.confirmDelete", { name: character.name }))) {
      deleteCharacter(character.id);
      selectCharacter(null);
      toast.success(t("characters.detail.deleted"));
    }
  };

  const handleSaveNotes = () => {
    updateCharacter(character.id, { notes: editNotes.trim() || undefined });
    setIsEditingNotes(false);
    toast.success(t("characters.detail.notesUpdated"));
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const tag = newTag.trim().replace(/^#/, '');
    const currentTags = character.tags || [];
    if (!currentTags.includes(tag)) {
      updateCharacter(character.id, { tags: [...currentTags, tag] });
      toast.success(t("characters.detail.tagAdded"));
    }
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = character.tags || [];
    updateCharacter(character.id, { tags: currentTags.filter(t => t !== tagToRemove) });
  };

  const handleExportImage = async (imageUrl: string, name: string) => {
    try {
      let blob: Blob;
      
      // Handle different URL formats
      if (imageUrl.startsWith('data:')) {
        // Base64 data URL
        const res = await fetch(imageUrl);
        blob = await res.blob();
      } else if (imageUrl.startsWith('local-image://')) {
        // Local image protocol - fetch through Electron's custom protocol
        const res = await fetch(imageUrl);
        blob = await res.blob();
      } else if (imageUrl.startsWith('http')) {
        // Remote URL
        const res = await fetch(imageUrl);
        blob = await res.blob();
      } else {
        // Fallback
        const res = await fetch(imageUrl);
        blob = await res.blob();
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t("characters.detail.exportOk", { name }));
    } catch (err) {
      console.error("Export image failed:", err);
      toast.error(t("characters.detail.exportFailed"));
    }
  };

  const currentView = character.views[selectedViewIndex];
  const variationCount = character.variations?.length || 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 pb-2 border-b">
        {isEditingName ? (
          <div className="flex items-center gap-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") setIsEditingName(false);
              }}
            />
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveName}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditingName(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm truncate">{character.name}</h3>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => {
                setEditName(character.name);
                setIsEditingName(true);
              }}
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4 pb-32">
          {/* Main preview */}
          <div className="space-y-2">
            <div 
              className="aspect-square rounded-lg bg-muted overflow-hidden border relative cursor-zoom-in"
              title={t("characters.detail.dblViewFull")}
              draggable
              onDoubleClick={() => {
                const url = currentView?.imageUrl || character.thumbnailUrl;
                if (url) setPreviewImageUrl(url);
              }}
              onDragStart={(e) => {
                e.dataTransfer.setData("application/json", JSON.stringify({
                  type: "character",
                  characterId: character.id,
                  characterName: character.name,
                  visualTraits: character.visualTraits,
                  thumbnailUrl: character.thumbnailUrl,
                }));
                e.dataTransfer.effectAllowed = "copy";
              }}
            >
            {currentView ? (
                <LocalImage 
                  src={currentView.imageUrl} 
                  alt={`${character.name} - ${viewLabels[currentView.viewType as keyof typeof viewLabels] || currentView.viewType}`}
                  className="w-full h-full object-contain"
                />
              ) : character.thumbnailUrl ? (
                <LocalImage 
                  src={character.thumbnailUrl} 
                  alt={character.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              
              {/* Drag hint */}
              <div className="absolute top-2 right-2 bg-black/50 text-white rounded p-1">
                <GripVertical className="h-4 w-4" />
              </div>
            </div>

            {/* View thumbnails */}
            {character.views.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {character.views.map((view, index) => (
                  <button
                    key={view.viewType}
                    className={cn(
                      "w-12 h-12 rounded border overflow-hidden transition-all",
                      "hover:ring-1 hover:ring-foreground/30",
                      selectedViewIndex === index && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedViewIndex(index)}
                  >
                    <LocalImage 
                      src={view.imageUrl} 
                      alt={viewLabels[view.viewType as keyof typeof viewLabels] || view.viewType}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Character info */}
          <div className="space-y-3">
            <div className="text-xs font-medium text-muted-foreground">{t("characters.detail.sectionInfo")}</div>
            
            {/* Basic info badges */}
            <div className="flex flex-wrap gap-1.5">
              {character.gender && (
                <Badge variant="secondary" className="text-xs">
                  {genderLabels[character.gender as keyof typeof genderLabels] || character.gender}
                </Badge>
              )}
              {character.age && (
                <Badge variant="secondary" className="text-xs">
                  {ageLabels[character.age as keyof typeof ageLabels] || character.age}
                </Badge>
              )}
              {character.personality && (
                <Badge variant="outline" className="text-xs">
                  {character.personality}
                </Badge>
              )}
            </div>

            {/* Description */}
            {character.description && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("characters.detail.labelDesc")}</Label>
                <p className="text-xs whitespace-pre-wrap bg-muted rounded p-2 max-h-[120px] overflow-y-auto">
                  {character.description}
                </p>
              </div>
            )}

            {/* Visual traits */}
            {character.visualTraits && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("characters.detail.labelVisualTraits")}</Label>
                <p className="text-xs text-muted-foreground bg-muted rounded p-2">
                  {character.visualTraits}
                </p>
              </div>
            )}

            {/* Notes / 角色备注 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <StickyNote className="h-3 w-3" />
                  {t("characters.detail.notesLabel")}
                </Label>
                {!isEditingNotes && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5"
                    onClick={() => {
                      setEditNotes(character.notes || '');
                      setIsEditingNotes(true);
                    }}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {isEditingNotes ? (
                <div className="space-y-2">
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder={t("characters.detail.notesPlaceholder")}
                    className="text-xs min-h-[60px]"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button size="sm" className="h-6 text-xs" onClick={handleSaveNotes}>
                      {t("characters.detail.save")}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setIsEditingNotes(false)}>
                      {t("characters.detail.cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded p-2 text-indigo-800 dark:text-indigo-200">
                  {character.notes || t("characters.detail.notesEmpty")}
                </p>
              )}
            </div>

            <Separator />

            {/* Tags / 标签 */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {t("characters.detail.tagsLabel")}
              </Label>
              <div className="flex flex-wrap gap-1">
                {(character.tags || []).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs gap-1 group">
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder={t("characters.detail.tagPlaceholder")}
                  className="h-7 text-xs"
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button size="sm" variant="outline" className="h-7 px-2" onClick={handleAddTag}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Reference images */}
            {character.referenceImages && character.referenceImages.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("characters.detail.refImages")}</Label>
                <div className="flex gap-1.5">
                  {character.referenceImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={t("characters.detail.refAlt", { n: i + 1 })}
                      className="w-10 h-10 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              size="sm"
              onClick={() => setShowWardrobe(true)}
            >
              <Shirt className="h-4 w-4 mr-2" />
              {t("characters.detail.wardrobe", { count: variationCount })}
            </Button>

            {currentView && (
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={() => handleExportImage(currentView.imageUrl, `${character.name}-${currentView.viewType}`)}
              >
                <Download className="h-4 w-4 mr-2" />
                {t("characters.detail.exportView")}
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("characters.detail.delete")}
            </Button>
          </div>

          {/* Tips */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 {t("characters.detail.dragHint")}</p>
          </div>
        </div>
      </ScrollArea>

      {/* Wardrobe Modal */}
      <WardrobeModal
        character={character}
        open={showWardrobe}
        onOpenChange={setShowWardrobe}
      />

      {/* Image Preview Lightbox */}
      <ImagePreviewModal
        imageUrl={previewImageUrl || ''}
        isOpen={!!previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </div>
  );
}
