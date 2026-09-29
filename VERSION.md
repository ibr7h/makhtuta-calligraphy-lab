# Version

**Hybrid V6.5 — Ra/Waw Descender Nib Flip**

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
