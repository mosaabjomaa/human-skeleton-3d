**https://mosaabjomaa.github.io/human-skeleton-3d/**

# OSSEO — Human Skeleton 3D

A static, bilingual adult skeleton atlas built with Vite, React, TypeScript, React Three Fiber, Drei, Three.js, Zustand, Tailwind CSS, Framer Motion and i18next.

## Run

```powershell
cd "C:\Users\HP\Documents\Codex\2026-10-24\fd\human-skeleton-3d"
npm install
npm run dev
```

Open the URL printed by Vite. The running development instance for this task uses **http://127.0.0.1:5174/** because 5173 is used by the separate HEXA LOTUS project.

Node.js **22.18+** is required: the model scripts use native TypeScript stripping. The UI build is compiled by TypeScript and Vite. No database, API key or backend is required. Fonts, model and Meshopt decoder are bundled locally; the atlas does not need a CDN at runtime.

## Features

- Actual anatomical geometry for **206 individually named adult bones**. No primitive/procedural stand-ins.
- Standard count: 80 axial and 126 appendicular bones. The skull group includes the 22 skull bones, six auditory ossicles and hyoid. The adult sternum is one selectable mesh composed from its three original anatomical parts. Accessory foot sesamoids, teeth, cartilage and sinus objects are excluded.
- 360° orbit, bounded zoom, pan, damping, touch controls and four anatomical camera presets.
- Hover highlighting and bilingual tooltip; selection highlighting and smooth fly-to.
- Search by English, Arabic, Latin or ID; region filters and seven collapsible groups.
- Isolate selection (hide other bones), exploded view, wireframe, auto rotation and reset.
- Animated details drawer / mobile bottom sheet, related-bone navigation, Escape close, keyboard focus trap and reduced-motion support.
- English and Arabic/RTL, locally bundled Cairo font and persisted language preference.
- Meshopt-compressed model (~1.78 MiB), demand rendering, DPR cap, BVH raycasting and imperative material updates on hover.

## Checks

```powershell
npm run validate:bones
npm run lint
npm run build
npm run preview
```

`validate:bones` reads and decompresses the actual GLB, checks every expected dataset ID, verifies exactly 206 nodes and meshes, checks nonempty finite geometry, the 80/126 split, basic anatomical ordering, all bilingual fields, provenance mappings and the file-size target. It exits nonzero for a missing/unmapped bone. No count is fabricated from empty meshes.

Automated browser checks in this task covered bilingual search, selection, focus trapping, Escape, isolation, wireframe, region filtering, exploded view, auto rotation, Arabic preference persistence, mobile browsing and details, with no JavaScript runtime errors. A stable 60 FPS target depends on the device and has not been certified on every mid-range laptop.

## Model, sources and licensing

See **CREDITS.md**. The derived model is **CC BY-SA 4.0** and must retain attribution and the same model license when redistributed/adapted. Application-source licensing is separate; the model is not CC0.

`public/models/provenance.json` records each selected bone, original source mesh names, source URL and SHA-256. The source GLB is retained locally at `work/source/z-skeleton.glb` for reproducibility, but `work/` is git-ignored. To obtain it in a clean checkout:

```powershell
npm run model:download
npm run model:build
npm run validate:bones
```

The download script verifies the pinned source hash before saving. Geometry was selected/composed, transformed to source anatomical positions and recompressed, not invented. The renderer expands quantized positions to float before transforming them, avoiding integer overflow that would misplace bones.

## Swap the model

1. Confirm rights and record the replacement license and attribution.
2. Supply exactly 206 separately selectable adult-bone meshes, one primitive per mesh. Use dataset IDs as both node and mesh names, or update `boneMap.ts` and the strict validator together.
3. Keep model transforms and quantization metadata intact. Normalize only after decoding normalized integer attributes; do not reorder body parts by guesswork.
4. Save as `public/models/skeleton.glb`. Meshopt is decoded locally. If adopting Draco, explicitly vendor/configure its decoder rather than relying on a CDN.
5. Update `public/models/provenance.json`, `CREDITS.md` and the footer if the source/license changes.
6. Run validation and inspect all anatomical regions, including tiny auditory bones and the coccyx.

## Content and accuracy

`src/data/bones.ts` constructs the full typed inventory using helpers for paired bones, vertebrae, ribs and digits. `boneNotes.ts` and `regionalNotes.ts` supply maintainable bilingual descriptions. All ten requested fields are populated; some small-bone vascular, nerve and developmental entries are explicitly **regional summaries**, rather than exhaustive bone-specific monographs.

These are educational summaries, not diagnostic guidance, and have **not undergone independent clinical peer review**. Source geometry is an individual anatomical representation, not a universal patient model. The conventional adult count excludes variable accessory bones. Linked OpenStax references are available in each panel. Obtain qualified anatomical/Arabic medical review before using the content as a clinical reference.

To add a field:

1. Extend `DetailKey` / `Details` in `src/data/types.ts`.
2. Populate both languages in the data builder and relevant notes.
3. Add labels to `src/locales/en.json` and `ar.json`.
4. Add the field to the `DetailsPanel` order and validate/build.

## Later database integration

`src/api/bones.ts` is a typed local-data adapter. Replace its methods with a backend endpoint returning the same `Bone` schema. Keep credentials and database access on the backend. Add validation, migration/versioning and content-review status before accepting edits. Zustand remains UI state, not the database. No database is currently connected.

## Structure

```text
src/components/     Scene, model, camera, sidebar, controls, tooltip, dialogs
src/data/           206-bone inventory, mesh map, types and bilingual notes
src/store/          Zustand UI state; language persistence only
src/locales/        English and Arabic UI strings
src/hooks/          Dialog focus management
src/utils/          Camera/model registry
src/api/            Future data API adapter
public/models/      Compressed GLB and per-bone provenance
scripts/            Source download, model composition and strict validation
```

The built `dist/` can be deployed to a static HTTP(S) host. Relative Vite base paths permit subdirectory hosting. Serve it over HTTP rather than opening `index.html` with `file://`.

## X-ray research lab

Open **X-ray lab / مختبر الأشعة** in the header. **npm run dev** starts the UI and the local ML service together when the Python environment is installed. To run the API separately, use **npm run ml:serve**. Training code, data attribution, evaluation methodology, supported formats, limitations, and Python setup are documented in **ml/README.md**. Outputs are experimental candidate regions, never a medical diagnosis; 3D bone selection is manually confirmed. Static hosting of `dist/` runs the atlas; the ML feature additionally needs the Python service and an `/api/xray` reverse proxy.

