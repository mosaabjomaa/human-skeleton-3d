# Model credits, license and educational references

## Anatomical geometry

**Z-Anatomy / BodyParts3D**, exported and web-simplified in **SeemaBansal1/3d-human-body-anatomy**.

- Source export: https://github.com/SeemaBansal1/3d-human-body-anatomy/blob/main/web/public/models/skeleton.glb
- Exporter and source credit statement: https://github.com/SeemaBansal1/3d-human-body-anatomy
- Original atlas: https://www.z-anatomy.com/
- Model license retained by this adaptation: **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**: https://creativecommons.org/licenses/by-sa/4.0/
- Underlying dataset attribution: **BodyParts3D, © The Database Center for Life Science**. The source export credits its historical BodyParts3D geometry under CC BY-SA 2.1 Japan. The official archive now describes the current database license as CC BY 4.0 (updated 2025-02-27): https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html . This does not remove the share-alike obligations of the Z-Anatomy-derived export used here.
- Source SHA-256: `2d159eddbc12de45d84195fc56957b274e7086b00224c245f22ea9d8ea6409eb`

**Changes:** selected the standard adult 206-bone inventory from the 271-object source; excluded teeth, cartilage, sinus representations and accessory foot sesamoids; combined manubrium, body and xiphoid geometry into one adult sternum mesh; baked original anatomical transforms; assigned stable IDs and neutral materials; recompressed using Meshopt. No bone was synthesized, replaced by a primitive or arbitrarily mirrored to fill a missing entry.

Each output bone's original source names are recorded in `models/provenance.json`. The model download remains available from the credits dialog. Retain this notice, attribution and CC BY-SA 4.0 when sharing the derived model. No anatomical model endorsement is implied. The software and authored educational content are separate from the geometry license.

**Cardiovascular system:** the detailed interactive circulation view and combined anatomy view use the separately named heart, valve, arterial, and venous structures from [Z-Anatomy's CardioVascular41 FBX](https://github.com/LluisV/Z-Anatomy/blob/6c7f9016bd5899ac8edafd31b9900c151df42ed6/Resources/Models/FBX/CardioVascular41.fbx).

- Authors: Kousaku Okubo, Gauthier Kervyn, Colline Brassard, and Christophe Céleste; based on BodyParts3D, © Database Center for Life Science.
- License: **CC BY-SA 4.0**. Attribute Z-Anatomy and BodyParts3D, link the license, and distribute adapted model data under the same license.
- Source SHA-256: `ed7d049117cc944a8c47a416b16ade642cbd1392bbcce3c677450d3234dbf680`
- This adaptation contains 676 separately selectable named structures, including 400 arteries, 212 veins, and heart/valve structures. Source geometry was converted to glTF, vessels were color-coded, and the result was compressed with Meshopt. Lungs and capillary beds are not included; the pulmonary route text describes their physiological role but does not visualize them.
- The two model assets use a shared normalization transform in the combined view to preserve their aligned source-space coordinates. Circulatory detail text describes general functions and routes and is educational, not a medical reference.
- Source names, circuit/type tags, and modification details are recorded in `models/circulatory-provenance.json`. Retain the attribution and share-alike license when redistributing the derived model.
- Rebuild on Windows with `npm run model:circulation:download` followed by `npm run model:circulation:build`. Source and converter downloads are pinned and SHA-256 checked.

## Educational references

Original short English/Arabic educational summaries were authored for this interface. Regional summaries are labeled; they are not a comprehensive medical textbook or independently peer-reviewed clinical reference. No source-page prose is reproduced as a dataset.

- OpenStax, Anatomy and Physiology 2e, 7.2 Skull: https://openstax.org/books/anatomy-and-physiology-2e/pages/7-2-the-skull
- 7.3 Vertebral column: https://openstax.org/books/anatomy-and-physiology-2e/pages/7-3-the-vertebral-column
- 7.4 Thoracic cage: https://openstax.org/books/anatomy-and-physiology-2e/pages/7-4-the-thoracic-cage
- 8.1 Pectoral girdle: https://openstax.org/books/anatomy-and-physiology-2e/pages/8-1-the-pectoral-girdle
- 8.2 Upper limb: https://openstax.org/books/anatomy-and-physiology-2e/pages/8-2-bones-of-the-upper-limb
- 8.3 Pelvic girdle: https://openstax.org/books/anatomy-and-physiology-2e/pages/8-3-the-pelvic-girdle-and-pelvis
- 8.4 Lower limb: https://openstax.org/books/anatomy-and-physiology-2e/pages/8-4-bones-of-the-lower-limb
- StatPearls, Anatomy, Head and Neck, Skull: https://www.ncbi.nlm.nih.gov/books/NBK499834/

## X-ray research data and model

FracAtlas v7, Abedeen et al., [official dataset](https://doi.org/10.6084/m9.figshare.22363012.v7), CC BY 4.0; [publication](https://www.nature.com/articles/s41597-023-02432-4). Images remain attributed public research data. Uploaded user images are not retained. The number of usable images is computed from the downloaded archive rather than copied from the original publication.

YOLO11n weights and training/inference code by Ultralytics: [AGPL-3.0 or Enterprise terms](https://www.ultralytics.com/license). This is a separate license obligation from the dataset license; review it before distributing or deploying a derivative application. All custom training and integration source is included locally; no project source was published to an external service. Initial COCO weights: `https://github.com/ultralytics/assets/releases/download/v8.4.0/yolo11n.pt`. A rejected MobileNetV3 baseline uses torchvision (BSD-3-Clause) and is not loaded by the inference service.

Medical limitations reference: [RadiologyInfo — bone X-ray](https://www.radiologyinfo.org/en/info/bonerad), ACR/RSNA. Plain radiography may miss occult fractures and bone bruises. The research tool cannot rule out injury or classify bruises/hairline fracture subtypes. Internal evaluation is not clinical validation. See `ml/README.md` and the actual model metrics for scope, splits and limitations.

## UI software and font

Three.js, React, React Three Fiber, Drei, Zustand, Tailwind CSS, Framer Motion, i18next and other npm dependencies retain their published licenses. The locally bundled **Cairo** font is distributed through `@fontsource-variable/cairo` under the SIL Open Font License. Dependency license notices remain inside the installed packages. No Google Fonts or model CDN is needed at runtime.
