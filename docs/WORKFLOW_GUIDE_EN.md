# Full pre-install help (Chinese)
https://kvodb27hf3.feishu.cn/wiki/JjSmwf173iN3fqkjXakcGbvTnEf?from=from_copylink

Languages: **[简体中文](./WORKFLOW_GUIDE.md)** · **[Tiếng Việt](./WORKFLOW_GUIDE_VI.md)**

# 🎬 Moyin Creator — Basic workflow tutorial

> End-to-end guide from script to finished video

Moyin Creator supports multiple workflows; panels can be combined or used standalone for different creative needs. **This tutorial covers the most common baseline workflow** — a good place for new users to start.

---

## 📋 Overview

```
⚙️ Setup → 📝 Script → 🔧 AI refinement → 🌄 Scenes / 🎭 Characters (optional) → 🎬 Director / ⭐ S-Class → 🎥 Video generation
```

---

## Setup: environment

Before you create a project, complete the following:

### 1. Add API providers

Go to **Settings → API → Add provider** and configure your AI provider account.

- Add **as many API keys as practical** — the app rotates keys for load balancing
- More keys generally allow **higher concurrency** and faster batch generation
- Supported providers include memefast, RunningHub, etc.

### 2. Service mapping

Go to **Settings → Service mapping** and assign models for each capability:

- Pick models for text-to-image, image-to-video, text-to-video, etc.
- Choose models that match your provider and creative goals

> 💡 **Suggested for testing:**
> - **Image generation:** `gemini-3-pro-image-preview`
> - **Video generation:** `doubao-seedance-1-5-pro-251215`

### 3. Image host

Go to **Settings → Image host** and configure hosting for uploads:

- Set up an image host (for reference frames, first frames, and other assets)
- Prefer **multiple keys** where supported to improve concurrent upload throughput

> ✅ After the above, you are ready to create.

---

## Step 1: Script panel

Open the **Script** panel. You can start in two ways:

- **A. Import a script** — paste or import an existing full script into the editor
- **B. AI-assisted writing** — draft a script from scratch with AI help

> 📄 **Script format:** see [Script import format example](./SCRIPT_FORMAT_EXAMPLE_EN.md) for scene headings, dialogue, stage directions, etc.

The app parses the script into scenes, shots, characters, and lines.

---

## Step 2: Second-pass AI refinement

After automatic analysis finishes, run the three refinement actions in order for **deeper polish**:

1. **AI scene refinement** — improves environment, mood, lighting, and other scene details  
2. **API shot refinement** — tightens lens language, shot scale, and composition per shot  
3. **AI character refinement** — strengthens appearance, expression, and motion anchors for consistency  

> Refined outputs feed better prompts for later image and video generation.

---

## Step 3: Generate assets (optional)

After refinement, you may pre-generate assets:

- **A. Generate scenes** — batch scene reference images from refined scene descriptions  
- **B. Generate characters** — character reference images from refined character descriptions  

> This step is optional. Director / S-Class can still pull assets automatically if you skip it.

---

## Step 4: Director / S-Class

Switch to **Director** or **⭐ S-Class**:

1. Click **“Load script shots”** in the right sidebar to import all shots from the script  
2. The **left sidebar** fills prompts per shot:  
   - First-frame prompt  
   - Last-frame prompt  
   - Video prompt  
3. Adjust any parameter to taste (motion, duration, style, etc.)

---

## Step 5: Images and video

In **shot editing** (left sidebar) on Director / S-Class:

### Image generation (choose one)

- **A. Per-shot** — generate images shot by shot  
- **B. Merged batch (recommended)** — batch several shots in one run  

> 💡 **Merged batch** is recommended; resulting images are mapped back to the correct shots.

### Video generation

After images are assigned, use **“Generate video”** to batch-generate shot videos.

---

## Step 6: S-Class — Seedance 2.0

S-Class supports **Seedance 2.0** multi-shot merged storytelling:

1. After importing the script, choose **how shots are grouped**:  
   - One shot → ~15s clip  
   - Multiple shots merged → ~15s narrative segment  
   - Grouping is flexible  
2. The system gathers @Image / @Video / @Audio references  
3. Click **“Generate video”**

> S-Class handles first-frame stitching, layered prompts (action + camera + lip-sync), and parameter checks.

---

## 💡 Tips

- **Refine before generating** — second-pass refinement noticeably improves quality  
- **Prefer merged batch** — faster and more consistent than one-shot-at-a-time  
- **Everything is tunable** — prompts and first/last frames can be edited manually  
- **S-Class fits** — multi-shot continuous narrative (short drama, trailer-style cuts, etc.)  
- **Director fits** — per-shot fine control  

---

> Questions? See [README](../README.md)
