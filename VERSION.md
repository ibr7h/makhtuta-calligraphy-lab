# V6.34.3.3 β — Gross-Shape Validation

- Added hard validation gates for high reference coverage with excessive extra ink / low IoU.
- Large overpainted shapes can no longer receive a moderate/high shape score merely because they cover most of the reference.
- The position score is now explicitly labeled as a diagnostic-only indicator.
- Educational feedback now warns when coverage is high but the actual ink shape is not close to the glyph.
- Per-segment debug boxes/labels were replaced by one aggregate geometry annotation per Glyph to reduce visual clutter.
- Educational per-Glyph percentages now use the same primary shape score shown in the main result card.
- App/PWA version bumped to V6.34.3.3 β.

# V6.34.3.2 β — Ink Footprint Calibration

- Corrected an important scoring flaw exposed by an oversized filled handwriting blob receiving an unrealistically high shape score.
- Ink matching now reports strict reference coverage, strict extra ink, and strict IoU separately from tolerant edge metrics.
- The primary shape score is now dominated by strict IoU / strict ink precision, while tolerance only softens edge noise.
- Added a size-balance term so oversized or undersized student ink is penalized even if it covers the reference completely.
- Educational feedback now flags grossly oversized ink and excessive ink outside the reference.
- A 100% reference coverage result can no longer mask poor shape quality when the student ink extends far beyond the Glyph.
- The default shaping-lab pen width was restored from 15 px to 7 px; evaluation and visible lab stroke still share the same width.
- App/PWA version bumped to V6.34.3.2 β.

# V6.34.3.1 β — Ink Footprint Matching

- Replaced the misleading centerline-vs-filled-Glyph comparison with rasterized ink-footprint comparison.
- Student handwriting is now rendered into a binary ink mask using the same visible lab stroke width.
- Reference HarfBuzz Glyphs are rasterized as exact filled ink masks.
- Added tolerance masks around both student ink and reference ink so handwriting is not judged pixel-perfect.
- Primary shape score now combines tolerant precision, tolerant reference coverage, and strict IoU.
- Added a lab control for student ink width (4–32 px); the visual stroke and the evaluator share the same value.
- Diagnostics now report reference coverage, strict IoU, and extra student ink instead of the former centerline "inside Ink" statistic.
- Added a selected-Glyph ink heatmap:
  - green = student ink within the tolerated reference,
  - red = student ink outside the tolerated reference,
  - amber = reference ink still missing from the tolerated student footprint.
- Educational feedback now prefers ink-mask evidence for incomplete coverage and excess ink.
- Stale heatmaps are cleared immediately when handwriting changes.
- The previous Outline-distance diagnostics remain available internally as a secondary signal.
- App/PWA version bumped to V6.34.3.1 β.

# V6.34.3 β — Educational Feedback Engine

- Converts the geometric and Outline diagnostics into actionable Arabic feedback per Glyph.
- Added per-Glyph analysis for horizontal/vertical placement, width, height, ascender/descender length, coverage, and outside-ink deviation.
- Added regional Outline coverage for upper/lower/left/right parts of each Glyph.
- Added detection of detached small Outline components to flag missing dots or isolated marks when they are not covered by student writing.
- Added an Arabic-specific hint for س/ش when upper-shape coverage is weak, pointing the learner to the teeth area.
- Added a dedicated educational-feedback panel with one primary message per Glyph.
- Added a "focus weakest" action that selects the Glyph with the highest-priority issue.
- Glyph cards now surface the primary educational note instead of only numeric diagnostics.
- The engine deliberately remains relative to the selected reference font; it does not claim an absolute calligraphy grade.
- App/PWA version bumped to V6.34.3 β.

# V6.34.2.1 β — Stable Shaping Layout

- Fixed a race condition that made the reference word appear very large before handwriting and then shrink after matching started.
- Reference and handwriting canvases are now rendered in a strict sequence so the natural word layout is established before the practice canvas draws.
- Removed the temporary 62% fallback layout from the handwriting canvas.
- The normalized word span remains fixed for the current shaped text; handwriting no longer changes the reference scale.
- Resize events invalidate and recompute the layout once, then redraw both canvases consistently.
- Mapping waits for a valid shaping layout instead of silently generating fallback geometry.
- App/PWA version bumped to V6.34.2.1 β.

# V6.34.2 β — Outline Distance Matching

- Added point-to-contour distance analysis for student handwriting segments against the exact HarfBuzz Glyph outline.
- Each student point is tested against the real Glyph ink area when Path2D hit testing is available, with sampled-contour fallback.
- Added adjustable contour tolerance from 6–36 px.
- Added an error heatmap on the handwriting canvas:
  - green = inside the reference ink,
  - amber = outside but within tolerance,
  - red = outside beyond tolerance.
- For the selected Glyph, the worst outside points draw connector lines to their nearest Outline location.
- Added three contour metrics: inside-ink ratio, Outline coverage, and mean outside-ink error.
- Added a separate Outline Match score alongside the existing 2D geometric confidence.
- Glyph result cards now report both geometric and Outline scores.
- V6.34.2 remains a geometric diagnostic score rather than a final educational grade.
- App/PWA version bumped to V6.34.2 β.

# V6.34.1 β — Outline Engine

- Added an Outline Engine on top of HarfBuzz `glyphToPath()`.
- Parses SVG glyph commands M/L/Q/C/Z and samples quadratic/cubic Bézier contours into geometry points.
- Transforms sampled outline points into the exact same normalized Canvas coordinate system used by the shaped word and handwriting canvas.
- Added selectable Outline visualization with contour lines and sampled points for the active Glyph.
- Added an adjustable sampling-density control.
- Added per-Glyph Outline diagnostics: contour count, sampled point count, and approximate contour length.
- The same selected Glyph outline is shown in the handwriting canvas, preparing the pipeline for point-to-contour distance scoring.
- V6.34.1 intentionally does not assign a contour-quality score yet; that is reserved for V6.34.2 Distance Matching.
- App/PWA version bumped to V6.34.1 β.

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
