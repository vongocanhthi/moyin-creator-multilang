// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.

/**
 * UI labels for built-in visual style presets (names + short descriptions).
 * Chinese strings remain the source of truth in `visual-styles.ts` for prompts;
 * this file supplies English (and optional Vietnamese) for the style picker.
 */
import { getStyleById, type MediaType, type StyleCategory, type StylePreset } from "@/lib/constants/visual-styles";

export const STYLE_CATEGORY_UI: Record<
  StyleCategory,
  { en: string; vi: string }
> = {
  "3d": { en: "3D styles", vi: "Phong cách 3D" },
  "2d": { en: "2D animation", vi: "Hoạt hình 2D" },
  real: { en: "Live-action / realistic", vi: "Người thật / hiện thực" },
  stop_motion: { en: "Stop motion", vi: "Hoạt hình tĩnh vật" },
};

export const STYLE_MEDIA_UI: Record<MediaType, { en: string; vi: string }> = {
  cinematic: { en: "cinematic", vi: "điện ảnh" },
  animation: { en: "animation", vi: "hoạt hình" },
  "stop-motion": { en: "stop motion", vi: "stop motion" },
  graphic: { en: "graphic", vi: "đồ họa" },
};

/** Compact badges next to style names in the trigger row */
export const STYLE_BADGE_UI: Record<StyleCategory | "custom", { en: string; vi: string }> = {
  "3d": { en: "3D", vi: "3D" },
  "2d": { en: "2D", vi: "2D" },
  real: { en: "LA", vi: "LA" },
  stop_motion: { en: "SM", vi: "SM" },
  custom: { en: "★", vi: "★" },
};

type LocaleSlice = "zh" | "en" | "vi";

function sliceLocale(lng: string): LocaleSlice {
  if (lng.startsWith("zh")) return "zh";
  if (lng.startsWith("vi")) return "vi";
  return "en";
}

/** Built-in preset UI copy (en + vi). Chinese comes from StylePreset in constants. */
export const STYLE_ITEM_UI: Record<
  string,
  { en: { name: string; description: string }; vi: { name: string; description: string } }
> = {
  "3d_xuanhuan": {
    en: {
      name: "3D Chinese fantasy",
      description: "Chinese fantasy / xianxia, Unreal-style render, rich lighting",
    },
    vi: {
      name: "3D fantasy Trung Quốc",
      description: "Tiên hiệp, render kiểu Unreal, ánh sáng rực rỡ",
    },
  },
  "3d_american": {
    en: {
      name: "3D American animation",
      description: "Disney / Pixar look, bright colors, expressive characters",
    },
    vi: {
      name: "3D hoạt hình Mỹ",
      description: "Phong cách Disney/Pixar, màu tươi, nhân vật biểu cảm",
    },
  },
  "3d_q_version": {
    en: { name: "3D chibi / collectibles", description: "Blind-box / chibi 3D, soft studio light, C4D look" },
    vi: { name: "3D chibi / blind box", description: "Chibi 3D, ánh sáng studio, kiểu C4D" },
  },
  "3d_realistic": {
    en: { name: "3D photorealistic", description: "Photoreal 3D, cinematic lighting, rich detail" },
    vi: { name: "3D siêu thực", description: "3D photoreal, ánh sáng điện ảnh, chi tiết cao" },
  },
  "3d_block": {
    en: { name: "3D low-poly", description: "Low poly, geometric facets, minimal look" },
    vi: { name: "3D low-poly", description: "Khối đa giác tối giản, màu đơn giản" },
  },
  "3d_voxel": {
    en: { name: "3D voxel / block world", description: "Minecraft-style voxels, blocky look" },
    vi: { name: "3D voxel / thế giới khối", description: "Kiểu Minecraft, khối voxel" },
  },
  "3d_mobile": {
    en: { name: "3D mobile game", description: "Unity mobile game style, stylized 3D" },
    vi: { name: "3D game mobile", description: "Phong cách Unity, 3D tả hình" },
  },
  "3d_render_2d": {
    en: { name: "3D cel-shaded (anime)", description: "3D-to-2D cel shade, Genshin-like vibrant anime colors" },
    vi: { name: "3D tô màu anime (cel-shade)", description: "Ba tô hai, màu anime rực, kiểu Genshin" },
  },
  jp_3d_render_2d: {
    en: {
      name: "Japanese 3D-to-2D",
      description: "Guilty Gear–style Japanese 3D render, bold cel shading, vivid colors",
    },
    vi: {
      name: "3D Nhật (ba tô hai)",
      description: "Kiểu Guilty Gear, cel-shading mạnh, màu anime rực",
    },
  },
  "2d_animation": {
    en: { name: "2D TV anime", description: "Standard Japanese TV anime, clean lines" },
    vi: { name: "2D anime TV", description: "Anime Nhật cổ điển, nét sạch" },
  },
  "2d_movie": {
    en: { name: "2D anime film", description: "Theatrical anime look, Makoto Shinkai–style backgrounds" },
    vi: { name: "2D anime điện ảnh", description: "Phông nền chi tiết, phong cách Shinkai" },
  },
  "2d_fantasy": {
    en: { name: "2D fantasy anime", description: "Fantasy world, magic glow, rich color" },
    vi: { name: "2D fantasy", description: "Thế giới phép thuật, màu rực" },
  },
  "2d_retro": {
    en: { name: "2D retro anime (90s)", description: "90s cel anime, VHS nostalgia" },
    vi: { name: "2D retro (90s)", description: "Anime 90s, hoài cổ VHS" },
  },
  "2d_american": {
    en: { name: "2D Western cartoon", description: "Cartoon Network style, bold outlines" },
    vi: { name: "2D hoạt hình phương Tây", description: "Kiểu Cartoon Network, viền đậm" },
  },
  "2d_ghibli": {
    en: { name: "2D Ghibli-style", description: "Studio Ghibli watercolor backgrounds, gentle tone" },
    vi: { name: "2D kiểu Ghibli", description: "Nền màu nước, tông nhẹ nhàng" },
  },
  "2d_retro_girl": {
    en: { name: "2D retro shōjo", description: "80s shōjo manga, sparkly eyes, pastel palette" },
    vi: { name: "2D shōjo retro", description: "Shōjo thập niên 80, mắt lấp lánh" },
  },
  "2d_korean": {
    en: { name: "2D Webtoon / manhwa", description: "Premium webtoon coloring, modern fashion" },
    vi: { name: "2D Webtoon / manhwa", description: "Tô màu webtoon, thời trang hiện đại" },
  },
  "2d_shonen": {
    en: { name: "2D battle shōnen", description: "Dynamic poses, speed lines, high contrast" },
    vi: { name: "2D shōnen hành động", description: "Tư thế mạnh, đường tốc độ" },
  },
  "2d_akira": {
    en: { name: "2D Toriyama / Dragon Ball", description: "Akira Toriyama–style lines and energy" },
    vi: { name: "2D Toriyama / Dragon Ball", description: "Nét Toriyama, năng lượng cao" },
  },
  "2d_doraemon": {
    en: { name: "2D Doraemon / Fujiko F.", description: "Classic Fujiko F. Fujio round, friendly designs" },
    vi: { name: "2D Doraemon", description: "Hoạt hình Fujiko, nhân vật tròn trịa" },
  },
  "2d_fujimoto": {
    en: { name: "2D Fujimoto / Chainsaw Man", description: "Rough lines, cinematic panels, raw mood" },
    vi: { name: "2D Fujimoto", description: "Nét phác, khung điện ảnh" },
  },
  "2d_mob": {
    en: { name: "2D Mob Psycho 100", description: "ONE-style distortion, psychedelic palette" },
    vi: { name: "2D Mob Psycho", description: "Phong cách ONE, màu ảo" },
  },
  "2d_jojo": {
    en: { name: "2D JoJo’s style", description: "Araki-style heavy shading, dramatic poses" },
    vi: { name: "2D JoJo", description: "Bóng đậm, tư thế kịch tính" },
  },
  "2d_detective": {
    en: { name: "2D detective / Conan", description: "Detective Conan–era mystery anime look" },
    vi: { name: "2D thám tử / Conan", description: "Phong cách Conan, không khí bí ẩn" },
  },
  "2d_slamdunk": {
    en: { name: "2D Slam Dunk", description: "Takehiko Inoue sports anime, realistic bodies" },
    vi: { name: "2D Slam Dunk", description: "Inoue, tỷ lệ cơ thể thực" },
  },
  "2d_astroboy": {
    en: { name: "2D Tezuka / Astro Boy", description: "Classic Tezuka rounded, vintage anime" },
    vi: { name: "2D Tezuka / Astro Boy", description: "Nét Tezuka cổ điển" },
  },
  "2d_deathnote": {
    en: { name: "2D Death Note", description: "Obata-style gothic ink, dark mystery tone" },
    vi: { name: "2D Death Note", description: "Mực gothic, tối và bí ẩn" },
  },
  "2d_thick_line": {
    en: { name: "2D bold outline / graffiti", description: "Thick outlines, street-art energy" },
    vi: { name: "2D viền đậm / graffiti", description: "Viền dày, màu tương phản" },
  },
  "2d_rubberhose": {
    en: { name: "2D rubber-hose (1930s)", description: "Cuphead / vintage Disney bendy limbs" },
    vi: { name: "2D rubber-hose (1930)", description: "Kiểu Cuphead, chi dẻo" },
  },
  "2d_q_version": {
    en: { name: "2D chibi", description: "Super-deformed cute 2D" },
    vi: { name: "2D chibi", description: "Nhân vật chibi dễ thương" },
  },
  "2d_pixel": {
    en: { name: "2D pixel art", description: "16-bit style sprites, crisp pixels" },
    vi: { name: "2D pixel art", description: "Sprite 8/16-bit, pixel rõ" },
  },
  "2d_gongbi": {
    en: { name: "2D Gongbi (Chinese ink)", description: "Fine Chinese Gongbi line and ink wash" },
    vi: { name: "2D Gongbi (mực Trung)", description: "Nét công bút, mực truyền thống" },
  },
  "2d_stick": {
    en: { name: "2D minimalist / doodle", description: "Stick-figure doodle, simple and cute" },
    vi: { name: "2D stick / doodle", description: "Nét tối giản, phác họa" },
  },
  "2d_watercolor": {
    en: { name: "2D watercolor illustration", description: "Soft watercolor edges and paper texture" },
    vi: { name: "2D màu nước", description: "Viền mềm, giấy màu nước" },
  },
  "2d_simple_line": {
    en: { name: "2D clean line art", description: "Minimal line art on white" },
    vi: { name: "2D line art sạch", description: "Chỉ đường nét, nền trắng" },
  },
  "2d_comic": {
    en: { name: "2D American comic", description: "Marvel/DC comic ink, halftone, action" },
    vi: { name: "2D truyện tranh Mỹ", description: "Mực comic, chấm bán sắc" },
  },
  "2d_shoujo": {
    en: { name: "2D shōjo manga", description: "Classic shōjo thin lines, flowers and tones" },
    vi: { name: "2D shōjo manga", description: "Nét mảnh, hoa và tone" },
  },
  "2d_horror": {
    en: { name: "2D horror manga (Itō-like)", description: "Junji Itō–style dread, heavy black ink" },
    vi: { name: "2D kinh dị (Itō)", description: "Mực đen, không khí ám ảnh" },
  },
  real_movie: {
    en: { name: "Live-action film still", description: "35mm grain, graded color, cinematic lighting" },
    vi: { name: "Ảnh tĩnh phim người thật", description: "Hạt phim 35mm, grading điện ảnh" },
  },
  real_costume: {
    en: { name: "Period drama / Hanfu", description: "Chinese costume drama, elegant ancient sets" },
    vi: { name: "Cổ trang / Hán phục", description: "Phim cổ trang, ánh sáng điện ảnh" },
  },
  real_hk_retro: {
    en: { name: "Retro Hong Kong film", description: "90s HK neon, Wong Kar-wai mood, grain" },
    vi: { name: "Phim Hồng Kông retro", description: "Neon 90s, hạt phim, mood Wong Kar-wai" },
  },
  real_wuxia: {
    en: { name: "Vintage wuxia film", description: "Shaw Brothers–style martial-arts cinema" },
    vi: { name: "Võ hiệp retro", description: "Phim võ thuật kiểu Shaw Brothers" },
  },
  real_bloom: {
    en: { name: "Dreamy bloom / backlight", description: "Strong bloom, flares, soft ethereal light" },
    vi: { name: "Bloom / ngược sáng mơ", description: "Quang thánh, lens flare, mềm ảo" },
  },
  stop_motion: {
    en: { name: "Stop motion (general)", description: "Clay / handmade stop-motion look" },
    vi: { name: "Stop motion (chung)", description: "Nhìn tĩnh vật, đất sét" },
  },
  figure_stop_motion: {
    en: { name: "Figure / toy photography", description: "PVC figure macro, plastic sheen, shallow DOF" },
    vi: { name: "Mô hình / toy photo", description: "PVC, macro, xóa phông" },
  },
  clay_stop_motion: {
    en: { name: "Claymation", description: "Aardman-style clay, fingerprints, soft texture" },
    vi: { name: "Đất sét (claymation)", description: "Kiểu Aardman, vân tay trên đất sét" },
  },
  lego_stop_motion: {
    en: { name: "LEGO brick stop motion", description: "Plastic brick texture, toy-world scale" },
    vi: { name: "LEGO stop motion", description: "Gạch nhựa, thế giới đồ chơi" },
  },
  felt_stop_motion: {
    en: { name: "Needle-felt stop motion", description: "Wool felt texture, soft handmade look" },
    vi: { name: "Len felt stop motion", description: "Len cảm giác mềm, handmade" },
  },
};

export function getStyleUiLabels(
  style: StylePreset,
  lng: string
): { name: string; description: string } {
  const loc = sliceLocale(lng);
  if (loc === "zh") {
    return { name: style.name, description: style.description };
  }
  const row = STYLE_ITEM_UI[style.id];
  if (row) {
    return loc === "vi" ? row.vi : row.en;
  }
  return { name: style.name, description: style.description };
}

export function getCategoryUiLabel(categoryId: StyleCategory, lng: string): string {
  const loc = sliceLocale(lng);
  const row = STYLE_CATEGORY_UI[categoryId];
  if (loc === "zh") {
    const map: Record<StyleCategory, string> = {
      "3d": "3D风格",
      "2d": "2D动画",
      real: "真人风格",
      stop_motion: "定格动画",
    };
    return map[categoryId];
  }
  return loc === "vi" ? row.vi : row.en;
}

export function getMediaUiLabel(media: MediaType, lng: string): string {
  const loc = sliceLocale(lng);
  if (loc === "zh") {
    const zh: Record<MediaType, string> = {
      cinematic: "电影摄影",
      animation: "动画运镜",
      "stop-motion": "定格微缩",
      graphic: "图形色彩",
    };
    return zh[media];
  }
  const row = STYLE_MEDIA_UI[media];
  return loc === "vi" ? row.vi : row.en;
}

export function getStyleBadgeLabel(
  category: StyleCategory | "custom",
  lng: string
): string {
  if (category === "custom") return STYLE_BADGE_UI.custom.en;
  const loc = sliceLocale(lng);
  if (loc === "zh") {
    const map: Record<StyleCategory, string> = {
      "3d": "3D",
      "2d": "2D",
      real: "真",
      stop_motion: "定",
    };
    return map[category];
  }
  return loc === "vi" ? STYLE_BADGE_UI[category].vi : STYLE_BADGE_UI[category].en;
}
