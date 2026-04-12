# Changelog

## v0.1.3 — Major fixes: character consistency, generation stability, smoother batch runs

### ⭐ S-Class — Storyboard card architecture (`split-scene-card`)

```
Storyboard card (split-scene-card)
│
├─ [Character library] → characterIds ─────────────┐
├─ [Scene reference] → sceneReferenceImage ────────┤  auto-collected
├─ [From asset library] → imageDataUrl (replace FF) ┤
├─ [AI generate] → imageDataUrl (generate FF) ───────┤
│                                                   ▼
│                              GroupRefManager (@refs)
│                              ├── Images: char + scene + FF (auto, ≤9)
│                              ├── Videos: camera ref (manual, ≤3)
│                              └── Audio: BGM ref (manual, ≤3)
│                                                   │
│                                                   ▼
│                              collectAllRefs() → build API request
│                              ├── @Image1 = grid / first frame
│                              ├── @Image2~9 = char + scene refs
│                              ├── @Video1~3 = camera refs
│                              └── @Audio1~3 = BGM
│                                                   │
│                                                   ▼
└──────────────── S-Class video (Seedance 2.0 API) ◀─┘
```

### Highlights

- **Stronger character consistency:** storyboard cards auto-collect character refs, scene refs, and first frames into `GroupRefManager`
- **More stable generation:** `collectAllRefs()` builds API payloads and respects Seedance 2.0 limits (≤9 images + ≤3 videos + ≤3 audio, prompt ≤5000 chars)
- **Smoother batch generation:** improved concurrency queue and error recovery

### Bug fixes

- Director panel right sidebar visibility at default window size (`ResizablePanel` `min-w-0`)
- Removed deprecated providers (dik3, nanohajimi, apimart, zhipu); v6→v7 migration clears stale persisted data
- Provider binding panel: multi-select, model categories, search

### Architecture

- **Multimodal refs:** `GroupRefManager` centralizes image / video / audio reference assets
- **First-frame grid stitching:** N×N layout for multi-character / scene references
- **Provider stack:** core providers are Moyin API (memefast) and RunningHub; legacy providers removed from code and UI

### Other

- Stopped tracking `out/` build artifacts in git
- Demo project seeding (“Slam Dunk Girl” demo)
- Sidebar help link entry

---

## v0.1.2

- Initial open source release
- Five modules: Script → Characters → Scenes → Director → S-Class
- Multi-provider AI scheduling + API key rotation
- Seedance 2.0 integration
- Electron + React + TypeScript stack
