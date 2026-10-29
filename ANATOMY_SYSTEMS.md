# Additional human anatomy systems

Open **More body systems / باقي أجهزة الجسم** in the existing header. This view adds seven systems while retaining the previous skeletal, circulatory, respiratory and digestive views.

| System | Selectable structures | Runtime asset |
|---|---:|---|
| Muscular | 476 | muscles.glb |
| Nervous | 255 | nerves.glb |
| Integumentary | 256 | skin.glb |
| Urinary | 20 | visceral-extra.glb |
| Male reproductive | 25 | visceral-extra.glb |
| Endocrine | 27 | visceral-extra.glb |
| Lymphatic | 220 | lymphatic.glb |

Total: **1,279 additional selectable structures**. Counts include anatomical surfaces, landmarks and grouped structures, not that many distinct organs.

Each view provides search, category filtering, hover highlighting, click/list selection, camera focus, orbit/pan/zoom, automatic rotation, wireframe, selection isolation, reset and seven expandable detail sections. UI and educational explanations support English and Arabic; verified translations are used where available and other source names remain visible.

Details cover overview, location/side, function, category, functional route, representation limits and clinical context. These are organ/category/system-level educational summaries, not a bespoke surgical reference for every surface. References link to OpenStax and the per-structure model provenance.

## Source and limitations

`public/models/body-systems-provenance.json` records source URLs, pinned commits, checksums, classifications and the full structure inventory. `src/data/body-systems-inventory.json` is its build-generated UI counterpart. Models derive from Z-Anatomy / BodyParts3D and are CC BY-SA 4.0 except source-attributed kidney geometry carrying CC BY-NC 4.0. Preserve attribution and source license restrictions when redistributing model assets.

Muscles/nerves/skin are verified pinned exports from SeemaBansal1/3d-human-body-anatomy. Urinary/reproductive/endocrine meshes derive from the pinned VisceralSystem100.fbx. Lymphatic meshes derive from the official LymphoidOrgans100.fbx, commit `6c7f9016bd5899ac8edafd31b9900c151df42ed6`, SHA256 `310ff82f502f4f3a79e85f99ddc2009bba9514338119af9edff87b20cf1b3609`.

Only male reproductive anatomy is represented by the available source. Skin meshes mostly represent surface regions, not histological layers. Muscle surface/deep grouping is an educational filter, not a comprehensive dissection classification. Some endocrine tissues, microscopic lymphatics and cellular structures are not modeled. These limitations appear within each view.

## Rebuild models on Windows

```powershell
npm run model:visceral:download
npm run model:systems:download
npm run model:systems:build
npm run build
```

The visceral downloader provides the checksum-verified Windows FBX2glTF converter. The systems build also downloads/verifies the pinned lymphatic source when absent and generates its asset and inventory. Source downloads/converter live in ignored `work/source`; generated runtime GLBs and inventories must be committed for GitHub Pages. Do not commit `node_modules`, the Python virtualenv, downloaded ML datasets or temporary work files.

## Publish the update to an existing repository

```powershell
git add .
git commit -m "Add seven interactive anatomy systems"
git push origin main
```

Verify the existing repository URL with `git remote -v`; do not create another repository or run `git remote add` when origin already exists. GitHub Pages uses the existing Actions workflow. Wait for a successful deployment and reload the site. These anatomy additions run as static assets on mobile; X-ray analysis still requires its separate Python API.
