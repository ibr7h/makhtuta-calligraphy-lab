# Brush Engine Research — 2026-09-29

This note records external GitHub projects reviewed for ideas applicable to Makhtuta's Arabic qalam engine.

## 1. perfect-freehand
Repository: https://github.com/steveruizok/perfect-freehand
License: MIT

Useful concepts:
- pressure-sensitive outline generation
- thinning
- smoothing
- streamline
- real or simulated pressure
- pressure easing
- start/end taper and cap control

Use in Makhtuta:
- borrow the parameter model and pressure/taper ideas
- do not replace the qalam renderer wholesale because Arabic chisel-nib geometry needs a directional nib rather than a round freehand outline

## 2. signature_pad
Repository: https://github.com/szimek/signature_pad
License: MIT

Useful concepts:
- variable-width Bézier interpolation
- velocity filtering
- min/max width
- point-group based redraw

Use in Makhtuta:
- add velocity as an optional brush dynamic
- use a velocity filter to prevent sudden width jumps
- consider Bézier centerline interpolation before qalam geometry

## 3. lazy-brush
Repository: https://github.com/dulnan/lazy-brush
License: MIT

Useful concepts:
- lazy radius
- friction
- stabilized proxy point between hand input and rendered brush

Use in Makhtuta:
- add an optional Stabilizer setting for mouse/finger and handwriting practice
- keep it disabled or low by default for fast Arabic strokes

## 4. Shodo
Repository: https://github.com/cobysy/shodo
License: MIT

Useful concepts:
- per-stroke working canvas composited to a finished canvas
- input buffering
- size response based on velocity when pressure is absent
- real pressure when available
- textured brush stamps
- kasure/dry-brush texture
- end-of-stroke continuation based on acceleration

Use in Makhtuta:
- Makhtuta V6.1 now uses the same broad per-stroke compositing principle to avoid holes at self-intersections
- investigate optional dry-ink texture and stroke-tail behavior
- do not copy its old pointer/event architecture

## 5. libmypaint
Repository: https://github.com/mypaint/libmypaint
License: ISC

Useful concepts:
- mature brush engine architecture
- brush inputs mapped to settings
- elliptical dab ratio and angle
- direction filter
- dab density / spacing
- opacity dynamics
- smudge and texture-oriented settings
- pressure and tilt-related dynamics

Use in Makhtuta:
- best conceptual reference for a Photoshop-like Brush Settings panel
- model Makhtuta presets as settings + input mappings rather than a flat list of sliders

## 6. brushlib-wasm
Repository: https://github.com/eliot-akira/brushlib-wasm
License: ISC

Useful concepts:
- WebAssembly port of the MyPaint brush engine
- browser-facing functions for brush settings and input mappings

Use in Makhtuta:
- prototype candidate for a future advanced brush engine
- evaluate performance, bundle size, Safari/iOS behavior and maintenance status before adopting as a dependency

## Proposed Makhtuta brush roadmap

1. Self-intersection-safe per-stroke compositing — implemented in V6.1.
2. Velocity filter and optional velocity-to-width response.
3. Stabilizer: radius + friction.
4. Start/end taper controls.
5. Direction filter for nib rotation.
6. Elliptical/chisel tip ratio and nib angle.
7. Dab spacing/density model.
8. Dry-ink / kasure texture.
9. Input-mapping matrix: pressure, speed, tilt, twist -> size, opacity, angle, texture.
10. Versioned brush presets with JSON import/export.

## Licensing note

Prefer MIT/ISC sources for reusable implementation ideas and code. Krita is GPL-3.0; its concepts are useful for study, but direct code reuse would impose GPL obligations that may not fit Makhtuta's desired distribution model.
