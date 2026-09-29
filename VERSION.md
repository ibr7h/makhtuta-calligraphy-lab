# Version

**Hybrid V6 — PWA + Brush Settings**

- SVG guide layer
- Canvas renderer
- Normalized Stroke Data Model
- Pointer Events + pressure/tilt/twist capture
- Pressure calibration
- Stroke Replay
- Photoshop-inspired Arabic Qalam Brush Settings
- Web App Manifest
- Service Worker + offline fallback
- Runtime cache for external assets
- Install flow for Android/Chromium
- iPhone/iPad Add to Home Screen guidance
- In-app service-worker update notification

## V6.1 — Qalam self-intersection fix
- Per-stroke offscreen compositing for calligraphy strokes
- Self-crossings render as ink union instead of self-intersecting fill holes
- Stroke opacity is applied once per completed stroke
- Existing Stroke Data Model, replay, pressure and brush presets preserved
