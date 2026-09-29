# Brush Engine V2 — Beta

Stable application: `index.html` / V6.11.
Experimental application: `brush-engine-v2.html` / V6.12 β.

## Phase 1

### Velocity Dynamics
- Disabled by default.
- Uses per-point CSS-pixel velocity derived from accepted stroke points and timestamps.
- At 100% strength, high speed can reduce the major nib width by up to 45%.
- The response uses a smoothstep curve; slow handwriting remains close to the selected base size.
- Velocity is recomputed from normalized stroke data during final redraw, so replay/resize remain deterministic.

### Start / End Taper
- Both are 0% by default.
- Start Taper is visible live because distance from the beginning is already known.
- End Taper is finalized on pointer-up because the total stroke length is only known then.
- Taper length is adjustable from 8–120 CSS px.
- Taper multiplies pressure/velocity width rather than replacing them.

## Suggested first test
- Velocity: enabled, 25–35%.
- Start Taper: 15–25%.
- End Taper: 25–40%.
- Taper length: 28–42 px.
- Keep the experimental ر/و descender flip disabled while evaluating V2 dynamics.

## Design rule
No character-specific correction is introduced by Brush Engine V2. Dynamics are stroke-based and are stored per stroke for deterministic redraw/replay.
