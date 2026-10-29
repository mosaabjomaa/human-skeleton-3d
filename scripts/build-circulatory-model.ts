import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Node, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { meshopt, prune } from "@gltf-transform/functions";
import draco from "draco3dgltf";
import { MeshoptEncoder } from "meshoptimizer";

const inputPath = "work/source/circulatory-draco.glb";
const outputPath = "public/models/circulatory.glb";
const sourceFbx = await readFile("work/source/CardioVascular41.fbx");
await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco.createDecoderModule(),
    "meshopt.encoder": MeshoptEncoder,
  });
const document = await io.read(inputPath);
const root = document.getRoot();
const nodes = root.listNodes().filter((node) => node.getMesh());
if (nodes.length !== 676)
  throw new Error(`Expected 676 vascular structures, found ${nodes.length}.`);

const materials = {
  artery: document
    .createMaterial("Arteries")
    .setBaseColorFactor([0.85, 0.13, 0.2, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(0.38),
  vein: document
    .createMaterial("Veins")
    .setBaseColorFactor([0.12, 0.36, 0.82, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(0.4),
  heart: document
    .createMaterial("Heart and valves")
    .setBaseColorFactor([0.72, 0.22, 0.28, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(0.4),
  other: document
    .createMaterial("Other cardiovascular structures")
    .setBaseColorFactor([0.83, 0.57, 0.29, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(0.45),
};
const structures = [];
const usedNames = new Set<string>();

for (let index = 0; index < nodes.length; index++) {
  const node = nodes[index];
  const name = node.getName().trim();
  if (!name) throw new Error(`Vascular structure ${index} has no name.`);
  const normalized = name.toLowerCase();
  const type = /atrium|ventricle|heart|valve|papillary/.test(normalized)
    ? "heart"
    : /vein|venous|vena/.test(normalized)
      ? "vein"
      : /artery|arteries|aorta|aortic|trunk/.test(normalized)
        ? "artery"
        : "other";
  const circuit = normalized.includes("pulmonary")
    ? "pulmonary"
    : type === "heart"
      ? "shared"
      : "systemic";
  const side = /\.(r)$/.test(normalized)
    ? "right"
    : /\.(l)$/.test(normalized)
      ? "left"
      : /\bright\b/.test(normalized)
        ? "right"
        : /\bleft\b/.test(normalized)
          ? "left"
          : "midline";

  node.setExtras({
    partId: `cv-${index}`,
    partName: name.replaceAll("_", " "),
    vesselType: type,
    circuit,
    side,
  });
  for (const primitive of node.getMesh()!.listPrimitives())
    primitive.setMaterial(materials[type]);
  structures.push({
    id: `cv-${index}`,
    name,
    type,
    circuit,
    side,
  });
  if (usedNames.has(name)) console.warn(`Duplicate source structure name: ${name}`);
  usedNames.add(name);
}

root.listExtensionsUsed().forEach((extension) => {
  if (extension.extensionName === "KHR_draco_mesh_compression")
    extension.dispose();
});
await document.transform(
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);
for (const node of root.listNodes()) {
  if (!node.getMesh() || node.getExtras().partId) continue;
  const parent = node.listParents().find((candidate) => candidate instanceof Node);
  if (!(parent instanceof Node) || !parent.getExtras().partId)
    throw new Error(`Could not restore metadata for mesh ${node.getName()}.`);
  node.setName(parent.getName()).setExtras(parent.getExtras());
}
await mkdir("public/models", { recursive: true });
await io.write(outputPath, document);
await writeFile(
  "public/models/circulatory-provenance.json",
  JSON.stringify(
    {
      source:
        "https://github.com/LluisV/Z-Anatomy/blob/6c7f9016bd5899ac8edafd31b9900c151df42ed6/Resources/Models/FBX/CardioVascular41.fbx",
      sourceSha256: createHash("sha256").update(sourceFbx).digest("hex"),
      license: "CC-BY-SA-4.0",
      attribution:
        "Z-Anatomy (Kousaku Okubo, Gauthier Kervyn, Colline Brassard, Christophe Céleste) / BodyParts3D (Database Center for Life Science).",
      modifications:
        "Converted the named cardiovascular FBX structures to glTF, assigned red artery, blue vein, and coral heart materials, added selectable structure metadata, and compressed geometry with Meshopt. Capillary beds are not individually represented in the source model.",
      structures,
    },
    null,
    2,
  ),
);
console.log(
  `Exported ${structures.length} selectable cardiovascular structures to ${outputPath}`,
);
