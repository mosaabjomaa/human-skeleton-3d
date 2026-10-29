import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  joinPrimitives,
  meshopt,
  prune,
  transformPrimitive,
} from "@gltf-transform/functions";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco from "draco3dgltf";
import { MeshoptEncoder } from "meshoptimizer";

const sourcePath = "work/source/visceral-draco.glb";
const sourceFbxPath = "work/source/VisceralSystem100.fbx";
const outputPath = "public/models/visceral.glb";
const provenancePath = "public/models/visceral-provenance.json";
const sourceUrl =
  "https://github.com/LluisV/Z-Anatomy/blob/6c7f9016bd5899ac8edafd31b9900c151df42ed6/Resources/Models/FBX/VisceralSystem100.fbx";
const expectedHashes = {
  source: "6ad89edb026f75eb68e7d02ab82cc1c55f4e026ac2bed11830f2fa3e8ac21037",
  sourceFbx: "22b301c93327929c9a14ee582d1848b550a950376e221a6d1078c7256bb83d0e",
};

const respiratoryPattern =
  /lung|bronch|trachea|larynx|pharynx|nasal|nose|paranasal sinus|epiglottis|pleura/i;
const digestivePattern =
  /digestive|oral|mouth|tongue|saliv|parotid|sublingual|submandibular|palate|fauces|gingiva|pharynx|bile duct|liver|gallbladder|pancrea|oesoph|esoph|stomach|duod|jejun|intestin|colon|appendix|peritone|mesocol|omentum|abdominopelvic|caudate lobe|fissure for ligamentum|main portal fissure|notch for ligamentum|papillary process|porta hepatis|quadrate lobe|right portal fissure|umbilical fissure|angular incisure|cardiac notch|pyloric antrum|pyloric part|free taenia|omental taenia|taeniae coli/i;
const accessoryDigestivePattern =
  /liver|gallbladder|pancrea|bile duct|saliv|parotid|sublingual|submandibular|omentum|mesocolon|peritone|abdominopelvic/i;
const airwayPattern =
  /bronch|trachea|larynx|pharynx|nasal|nose|paranasal sinus|epiglottis|respiratory/i;

function classify(name: string): {
  system: "respiratory" | "digestive" | "shared";
  category: "airway" | "lung" | "tract" | "organs";
} | null {
  const respiratory = respiratoryPattern.test(name);
  const digestive = digestivePattern.test(name);
  if (!respiratory && !digestive) return null;

  const system =
    respiratory && digestive
      ? "shared"
      : respiratory
        ? "respiratory"
        : "digestive";
  const category =
    system === "respiratory" || system === "shared"
      ? airwayPattern.test(name)
        ? "airway"
        : "lung"
      : accessoryDigestivePattern.test(name)
        ? "organs"
        : "tract";
  return { system, category };
}

const sourceBytes = await readFile(sourcePath);
const sourceHash = createHash("sha256").update(sourceBytes).digest("hex");
if (sourceHash !== expectedHashes.source)
  throw new Error(`Unexpected visceral source GLB SHA-256: ${sourceHash}`);
const sourceFbx = await readFile(sourceFbxPath);
const sourceFbxHash = createHash("sha256").update(sourceFbx).digest("hex");
if (sourceFbxHash !== expectedHashes.sourceFbx)
  throw new Error(`Unexpected visceral source FBX SHA-256: ${sourceFbxHash}`);

await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco.createDecoderModule(),
    "meshopt.encoder": MeshoptEncoder,
  });
const document = await io.read(sourcePath);
const root = document.getRoot();
const sourceNodes = root.listNodes().filter((node) => node.getMesh());
const sourceScenes = root.listScenes();
if (sourceNodes.length !== 296)
  throw new Error(
    `Expected 296 visceral source structures, found ${sourceNodes.length}.`,
  );

const materials = {
  airway: document
    .createMaterial("Airways")
    .setBaseColorFactor([0.24, 0.67, 0.72, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(0.42),
  lung: document
    .createMaterial("Lungs")
    .setBaseColorFactor([0.82, 0.38, 0.43, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(0.46),
  tract: document
    .createMaterial("Digestive tract")
    .setBaseColorFactor([0.84, 0.61, 0.3, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(0.46),
  organs: document
    .createMaterial("Digestive organs")
    .setBaseColorFactor([0.43, 0.66, 0.46, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(0.46),
};
const scene = document.createScene("Respiratory and digestive systems");
const structures: {
  id: string;
  name: string;
  system: "respiratory" | "digestive" | "shared";
  category: "airway" | "lung" | "tract" | "organs";
  side: "right" | "left" | "midline";
}[] = [];

for (const [index, node] of sourceNodes.entries()) {
  const name = node.getName().trim();
  const classification = classify(name);
  if (!classification) continue;

  const pieces = [];
  for (const original of node.getMesh()!.listPrimitives()) {
    const primitive = original.clone();
    for (const semantic of primitive.listSemantics())
      primitive.setAttribute(
        semantic,
        primitive.getAttribute(semantic)!.clone(),
      );
    if (primitive.getIndices())
      primitive.setIndices(primitive.getIndices()!.clone());
    primitive.setMaterial(materials[classification.category]);
    transformPrimitive(primitive, node.getWorldMatrix());
    pieces.push(primitive);
  }
  const primitive = pieces.length === 1 ? pieces[0] : joinPrimitives(pieces);
  const id = `vis-${index}`;
  const mesh = document.createMesh(name).addPrimitive(primitive);
  const side = /\.r$/i.test(name)
    ? "right"
    : /\.l$/i.test(name)
      ? "left"
      : /\bright\b/i.test(name)
        ? "right"
        : /\bleft\b/i.test(name)
          ? "left"
          : "midline";
  const extras = {
    partId: id,
    partName: name.replaceAll("_", " "),
    system: classification.system,
    category: classification.category,
    side,
  };
  scene.addChild(document.createNode(name).setMesh(mesh).setExtras(extras));
  structures.push({ id, name, ...classification, side });
}

const counts = {
  respiratory: structures.filter((part) => part.system === "respiratory")
    .length,
  digestive: structures.filter((part) => part.system === "digestive").length,
  shared: structures.filter((part) => part.system === "shared").length,
};
if (
  counts.respiratory !== 81 ||
  counts.digestive !== 134 ||
  counts.shared !== 5
)
  throw new Error(`Unexpected visceral inventory: ${JSON.stringify(counts)}.`);

for (const oldScene of sourceScenes) oldScene.dispose();
for (const node of sourceNodes) node.dispose();
root.setDefaultScene(scene);
if (
  scene.listChildren().length !== structures.length ||
  scene.listChildren().some((node) => !node.getMesh())
)
  throw new Error("The generated visceral scene is missing selectable meshes.");
root.listExtensionsUsed().forEach((extension) => {
  if (extension.extensionName === "KHR_draco_mesh_compression")
    extension.dispose();
});
await document.transform(
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);
await mkdir("public/models", { recursive: true });
await io.write(outputPath, document);
if ((await readFile(outputPath)).byteLength < 100_000)
  throw new Error(
    `Generated visceral model is unexpectedly small: ${outputPath}`,
  );
await writeFile(
  provenancePath,
  JSON.stringify(
    {
      source: sourceUrl,
      sourceSha256: sourceFbxHash,
      convertedSourceSha256: sourceHash,
      license: "CC-BY-SA-4.0",
      attribution:
        "Z-Anatomy (Kousaku Okubo, Gauthier Kervyn, Colline Brassard, Christophe Céleste) / BodyParts3D (Database Center for Life Science).",
      modifications:
        "Selected named respiratory and digestive structures from the visceral source, retained the source anatomical transforms, assigned system/category metadata and distinct materials, and compressed the derived model with Meshopt. The pharynx is shared by both systems; unrelated urinary, genital, and endocrine structures are excluded.",
      excludedSourceStructureCount: sourceNodes.length - structures.length,
      counts,
      structures,
    },
    null,
    2,
  ),
);
console.log(
  `Exported ${structures.length} selectable respiratory and digestive structures (${counts.respiratory} respiratory, ${counts.digestive} digestive, ${counts.shared} shared).`,
);
