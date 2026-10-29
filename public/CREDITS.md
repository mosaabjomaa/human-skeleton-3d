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
- Source names, circuit/type tags, and modification details are recorded in `public/models/circulatory-provenance.json`. Retain the attribution and share-alike license when redistributing the derived model.
- Rebuild on Windows with 
pm run model:circulation:download` followed by 
pm run model:circulation:build`. Source and converter downloads are pinned and SHA-256 checked.

**Respiratory and digestive systems:** the interactive models use named structures from [Z-Anatomy's VisceralSystem100 FBX](https://github.com/LluisV/Z-Anatomy/blob/6c7f9016bd5899ac8edafd31b9900c151df42ed6/Resources/Models/FBX/VisceralSystem100.fbx).

- Authors: Kousaku Okubo, Gauthier Kervyn, Colline Brassard, and Christophe Céleste; based on BodyParts3D, © Database Center for Life Science.
- License: **CC BY-SA 4.0**. Attribute Z-Anatomy and BodyParts3D, link the license, and distribute adapted model data under the same license.
- Source FBX SHA-256: `22b301c93327929c9a14ee582d1848b550a950376e221a6d1078c7256bb83d0e`
- Converted source GLB SHA-256: `6ad89edb026f75eb68e7d02ab82cc1c55f4e026ac2bed11830f2fa3e8ac21037`
- The adaptation contains 220 separately selectable structures: 81 respiratory, 134 digestive, and five shared pharyngeal structures. Unrelated urinary, genital, and endocrine parts are excluded. Airways, lungs, digestive tract, and accessory organs use distinct colors; source transforms are preserved and geometry is compressed with Meshopt.
- The model is aligned with the skeleton and cardiovascular model. Microscopic alveoli and intestinal villi are not separately modeled; the visualization and authored summaries are educational, not clinical references.
- Source names, system/category/side tags, counts, and modifications are recorded in `public/models/visceral-provenance.json`. Retain the attribution and share-alike license when redistributing the derived model.
- Rebuild on Windows with 
pm run model:visceral:download` followed by 
pm run model:visceral:build`. Source and converter downloads are pinned and SHA-256 checked.

## Educational references

Original short English/Arabic educational summaries were authored for this interface. Regional summaries are labeled; they are not a comprehensive medical textbook or independently peer-reviewed clinical reference. No source-page prose is reproduced as a dataset.

- OpenStax, Anatomy and Physiology 2e, 7.2 Skull: https://openstax.org/books/anatomy-and-physiology-2e/pages/7-2-the-skull
- 7.3 Vertebral column: https://openstax.org/books/anatomy-and-physiology-2e/pages/7-3-the-vertebral-column
- 7.4 Thoracic cage: https://openstax.org/books/anatomy-and-physiology-2e/pages/7-4-the-thoracic-cage
- 8.1 Pectoral girdle: https://openstax.org/books/anatomy-and-physiology-2e/pages/8-1-the-pectoral-girdle
- 8.2 Upper limb: https://openstax.org/books/anatomy-and-physiology-2e/pages/8-2-bones-of-the-upper-limb
- 8.3 Pelvic girdle: https://openstax.org/books/anatomy-and-physiology-2e/pages/8-3-the-pelvic-girdle-and-pelvis
- 8.4 Lower limb: https://openstax.org/books/anatomy-and-physiology-2e/pages/8-4-bones-of-the-lower-limb
- 22.1 Organs and Structures of the Respiratory System: https://openstax.org/books/anatomy-and-physiology-2e/pages/22-1-organs-and-structures-of-the-respiratory-system
- 23.1 Overview of the Digestive System: https://openstax.org/books/anatomy-and-physiology-2e/pages/23-1-overview-of-the-digestive-system
- 23.3 The Mouth, Pharynx, and Esophagus: https://openstax.org/books/anatomy-and-physiology-2e/pages/23-3-the-mouth-pharynx-and-esophagus
- 23.4 The Stomach: https://openstax.org/books/anatomy-and-physiology-2e/pages/23-4-the-stomach
- 23.5 The Small and Large Intestines: https://openstax.org/books/anatomy-and-physiology-2e/pages/23-5-the-small-and-large-intestines
- 23.6 Accessory Organs in Digestion: The Liver, Pancreas, and Gallbladder: https://openstax.org/books/anatomy-and-physiology-2e/pages/23-6-accessory-organs-in-digestion-the-liver-pancreas-and-gallbladder
- StatPearls, Anatomy, Head and Neck, Skull: https://www.ncbi.nlm.nih.gov/books/NBK499834/

## X-ray research data and model

FracAtlas v7, Abedeen et al., [official dataset](https://doi.org/10.6084/m9.figshare.22363012.v7), CC BY 4.0; [publication](https://www.nature.com/articles/s41597-023-02432-4). Images remain attributed public research data. Uploaded user images are not retained. The number of usable images is computed from the downloaded archive rather than copied from the original publication.

YOLO11n weights and training/inference code by Ultralytics: [AGPL-3.0 or Enterprise terms](https://www.ultralytics.com/license). This is a separate license obligation from the dataset license; review it before distributing or deploying a derivative application. All custom training and integration source is included locally; no project source was published to an external service. Initial COCO weights: `https://github.com/ultralytics/assets/releases/download/v8.4.0/yolo11n.pt`. A rejected MobileNetV3 baseline uses torchvision (BSD-3-Clause) and is not loaded by the inference service.

Medical limitations reference: [RadiologyInfo — bone X-ray](https://www.radiologyinfo.org/en/info/bonerad), ACR/RSNA. Plain radiography may miss occult fractures and bone bruises. The research tool cannot rule out injury or classify bruises/hairline fracture subtypes. Internal evaluation is not clinical validation. See `ml/README.md` and the actual model metrics for scope, splits and limitations.

## UI software and font

Three.js, React, React Three Fiber, Drei, Zustand, Tailwind CSS, Framer Motion, i18next and other npm dependencies retain their published licenses. The locally bundled **Cairo** font is distributed through `@fontsource-variable/cairo` under the SIL Open Font License. Dependency license notices remain inside the installed packages. No Google Fonts or model CDN is needed at runtime.

## Additional systems model assets

Muscles (476), nerves (255), skin regions (256), urinary structures (20), male reproductive structures (25), endocrine structures (27), and lymphatic structures (220) are mapped in public/models/body-systems-provenance.json. Sources: Z-Anatomy / BodyParts3D and pinned web exports by SeemaBansal1/3d-human-body-anatomy. Lymphatic source: https://github.com/LluisV/Z-Anatomy/blob/6c7f9016bd5899ac8edafd31b9900c151df42ed6/Resources/Models/FBX/LymphoidOrgans100.fbx . Models retain CC BY-SA 4.0; source-attributed kidney geometry retains CC BY-NC 4.0. Changes include web compression, illustrative materials, stable selectable IDs and educational grouping. See ANATOMY_SYSTEMS.md for limitations. Functional notes reference OpenStax Anatomy and Physiology 2e chapters 5, 11, 13, 17, 21, 25 and 27 and are not peer-reviewed clinical documentation.
