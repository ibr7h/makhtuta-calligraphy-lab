# Brush Engine V2 — Beta

Stable application: `index.html` / V6.11.
Experimental application: `brush-engine-v2.html` / V6.13 β.

## Phase 1 — Stroke dynamics
- Velocity Dynamics: optional and disabled by default.
- Start / End Taper: optional and 0% by default.
- Taper length: 8–120 CSS px.
- End taper is finalized on pointer-up to avoid adding expensive full-stroke work to every pointer move.

## Phase 2 — AliQaseef Brush.archive reconstruction
The supplied Procreate brushset contains five brushes. Their five `Shape.png` files are byte-identical 2048×2048 circular grayscale masks. Therefore the visual differences do not come from different shape images.

The distinct settings were decoded from each `Brush.archive` (NSKeyedArchiver). The main differing parameters are:
- `shapeAngle`
- `paintSize`
- `dynamicsPressureSize` (Farsi = 0.15; others = 0)
- `minSize` (Reqa'a is slightly higher)
- very small `wetEdgesAmount` differences
- a tiny `pencilTaperShape` difference for Diwani

A shared `shapeRoundness = 0.0565863922` is used by all five.

### Rendering decision
Instead of stamping the identical 2048px Shape.png on every dab, V2 reconstructs it mathematically as an ellipse:
- major axis = brush size
- minor axis = major × shapeRoundness
- rotation = absolute Brush.archive shapeAngle
This is closer to the source brush structure and substantially cheaper than image stamping.

### Archive-derived presets
| Brush | Angle | Size mapping | Shape ratio | Pressure size |
|---|---:|---:|---:|---:|
| Naskh | 65.0042° | 7.4944 | 5.6586% | 0% |
| Reqa'a | 60.0906° | 15.9613 | 5.6586% | 0% |
| Thuluth | 76.6244° | 22.4348 | 5.6586% | 0% |
| Farsi | 69.8245° | 12.0016 | 5.6586% | 15% |
| Diwani | 86.6242° | 8.1856 | 5.6586% | 0% |

## Performance rule
Do not map Procreate `plotMovingAverageStabilization` directly to Makhtuta Radius/Friction stabilization. The algorithms are not equivalent and the latter can create perceptible pen lag. AliQaseef presets therefore keep the old stabilizer off in V2 until a lightweight moving-average implementation is calibrated.
