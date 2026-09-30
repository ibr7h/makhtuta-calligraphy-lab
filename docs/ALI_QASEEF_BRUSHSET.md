# AliQaseef Brushes — Procreate mapping

Source analyzed: user-supplied `AliQaseef_Brushes.brushset`.

The brushset is a ZIP/Procreate package containing five `SilicaBrush` archives. The app does not bundle or redistribute the original Procreate brush assets; it uses mapped numeric settings only.

| Brush | Procreate paintSize | shapeAngle | shapeRoundness | Smoothing | Moving-average stabilization | Pressure size |
|---|---:|---:|---:|---:|---:|---:|
| Reqa'a | 0.159613 | -60.09° | 5.66% | 80% | 30% | 0% |
| Naskh | 0.074944 | -65.00° | 5.66% | 80% | 30% | 0% |
| Farsi | 0.120016 | -69.82° | 5.66% | 80% | 30% | 15% |
| Thuluth | 0.224348 | -76.62° | 5.66% | 80% | 30% | 0% |
| Diwani | 0.081856 | -86.62° | 5.66% | 80% | 30% | 0% |

## Makhtuta mapping

- `paintSize × 100` is used as the starting CSS-pixel brush size, rounded to a practical integer.
- `abs(shapeAngle)` maps to Makhtuta's nib angle.
- Procreate `shapeRoundness` is treated as the compressed circular stamp's minor/major ratio, so it maps to a 6% nib thickness.
- The source shape is circular before Procreate roundness compression; Makhtuta therefore uses a fully rounded footprint for these imported presets.
- `plotSmoothing = 0.8` maps to 80% qalam smoothing.
- `plotMovingAverageStabilization = 0.3` has no exact engine equivalent; it is approximated with a mild Radius 4 / Friction 30 stabilizer.
- Only Farsi has `dynamicsPressureSize = 0.15`; it maps to a mild 15% pressure response. Other imported presets do not vary width by pressure.
- Procreate taper, wet-edge, rendering, grain and Valkyrie-specific transfer settings do not have 1:1 equivalents in the current Makhtuta engine and are not claimed as exact reproductions.

These presets are therefore parameter-based approximations grounded in the supplied Brush.archive values, not binary-compatible Procreate brushes.


## Original vs Effective calibration

Brush Engine V2 keeps the decoded Procreate source values separate from the current Makhtuta rendering values.

- **Original** displays raw `Brush.archive` values such as `paintSize`, `shapeAngle`, `shapeRoundness`, `plotSmoothing`, `dynamicsPressureSize`, and moving-average stabilization.
- **Effective** displays the values currently used by Makhtuta after conversion or manual calibration.
- The UI marks the active AliQaseef brush as **Archive** while its effective core values match the direct archive mapping, and **Calibrated** after a relevant manual adjustment.
- **Reset to Archive Values** recomputes the direct mapping from the raw archive values rather than copying rounded display values.
- Saved named brushes and saved app settings retain `sourcePresetKey`, so the original source brush can still be identified when the settings are restored.
- Procreate moving-average stabilization remains displayed as an original source value but is not silently treated as identical to Makhtuta Stabilizer; the Effective column reports it as not applied unless Makhtuta stabilization is explicitly enabled.
