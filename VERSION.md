# V6.33 β — Segment-level Glyph Mapping

- Fixed a structural limitation in the 2D matcher: one physical handwriting stroke can span several connected Arabic glyphs.
- A continuous student stroke is now split into consecutive geometric segments before Glyph assignment.
- Segment assignment uses the corrected HarfBuzz Ink Bounds, baseline, cluster geometry, and hysteresis near boundaries.
- The same physical stroke can therefore contribute to several Glyphs instead of being incorrectly owned by one Glyph.
- Exact HarfBuzz glyph outlines are now captured with glyphToPath() and used for the reference rendering when available.
- The handwriting canvas uses the same exact shaped Glyph outlines and geometry as the reference panel.
- Mapping cards now report linked segments rather than only whole strokes.
- This prepares the next stage: per-segment Outline/Contour similarity scoring.
- App/PWA version bumped to V6.33 β.

# V6.32.2 β — Correct HarfBuzz positions & Glyph selection

- Fixed the main selection bug: harfbuzzjs v1.x exposes xAdvance/yAdvance/xOffset/yOffset in camelCase; the lab had still been reading the old snake_case fields, which produced undefined advances and effectively equal-width Glyph regions.
- Added backwards-compatible snake_case fallbacks.
- Glyph selection boxes now prefer the actual HarfBuzz glyph ink extents (xBearing/yBearing/width/height) instead of only the advance cell.
- The advance cell is retained as a larger hit target when glyph ink overlaps or is very narrow.
- Cluster-to-character lookup now uses UTF-16 source offsets, so Arabic combining marks do not shift the displayed character/cluster relationship.
- App/PWA version bumped to V6.32.2 β.

# V6.32.1 β — Natural word proportions & geometry registration

- Fixed horizontal stretching caused by a mismatch between the canvas bitmap aspect ratio and its CSS display size.
- Added HiDPI canvas resizing so the drawing buffer always matches the rendered canvas size.
- The reference word is now rendered at its natural typographic width; Canvas maxWidth compression/stretching is no longer used.
- Glyph zones are centered on the real measured word width rather than spanning a fixed 88% of the canvas.
- HarfBuzz xAdvance and xOffset are now applied inside that natural word span.
- The handwriting canvas reuses the same normalized word transform, so reference geometry and student strokes share one coordinate system.
- Resizing the window recomputes the reference layout and handwriting overlay.
- App/PWA version bumped to V6.32.1 β.

# V6.32 β — 2D Glyph–Stroke Mapping

- Redesigned «مختبر تشكيل الكلمات» as a full workflow page with five guided steps.
- Added an independent handwriting canvas inside the shaping lab.
- Added clickable Glyph selection on the HarfBuzz geometry canvas and Glyph cards.
- Upgraded matching from horizontal-only assignment to 2D scoring using stroke position, bounding boxes, baseline alignment, and HarfBuzz clusters.
- Added per-Glyph confidence, overall geometric confidence, mapping overlays, and actionable baseline/bounds/cluster feedback.
- Added optional glyph extents from HarfBuzz when the loaded font/runtime exposes them.
- Kept the score explicitly geometric; curve quality, nib angle, and stroke-order scoring remain future work.
- Bumped the PWA cache and app version to V6.32 β.

# Version

**Hybrid V6.11 — AliQaseef Arabic Brush Presets**

- SVG guide layer
- Canvas renderer
- Normalized Stroke Data Model
- Pointer Events + pressure/tilt/twist capture
- Pressure calibration
- Forward and reverse replay
- Saved replay library in IndexedDB
- Self-intersection-safe per-stroke compositing
- Finite 2D qalam nib footprint
- Qalam cut-thickness control and presets: 6%, 16%, 24%
- Brush Lab A/B for the latest calligraphy stroke
- +θ / −θ / mirrored nib-angle comparison on the exact same stroke
- Independent B-side nib-thickness test
- Optional Stabilizer with Radius and Friction controls
- Stabilizer settings stored in named brush presets and app settings
- Multiple named custom brush presets
- Web App Manifest
- Service Worker + offline fallback
- In-app PWA update notification

- Guided diagnostic letters: ج، ح، خ، ع، غ، م
- Default diagnostic comparison: +θ versus −θ on the exact same recorded stroke
- Displays the originally recorded nib angle alongside diagnostic angles

- ر and و now preserve the selected nib angle above the 62% baseline and mirror the nib cut only below it.
- The per-stroke letter policy is stored with Stroke Data so redraw and replay remain deterministic.
- Brush Lab includes a dedicated «عكس تحت السطر» comparison mode.

- Replaced the hard baseline nib flip for ر/و with a smooth transition around the lowest point of the lower stroke.
- The nib keeps its original cut throughout descent and rotates toward the mirrored cut around the bottom turn.
- Transition distance is derived from qalam size and clamped to 10–34 px to avoid a visible seam.

- The ر/و lower-stroke nib reversal is now opt-in and disabled by default.
- The option is available in Brush Settings and is persisted in named brushes and app settings.
- ي and all other letters remain outside the reversal policy.
- The application version is now visible in the main header as V6.10.

- Added five Arabic presets extracted from the supplied AliQaseef Procreate brushset: Reqa'a, Naskh, Farsi, Thuluth and Diwani.
- Preserved the existing Makhtuta presets as a separate group.
- Extended the quick nib-angle control to 0–90° to support the extracted Diwani angle (~86.6°).
- Added docs/ALI_QASEEF_BRUSHSET.md with source values and explicit mapping limitations.
