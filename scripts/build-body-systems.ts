import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Document, NodeIO, type Node as GltfNode } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  joinPrimitives,
  meshopt,
  prune,
  transformPrimitive,
} from "@gltf-transform/functions";
import draco from "draco3dgltf";
import { MeshoptEncoder } from "meshoptimizer";

type BodySystem =
  | "muscular"
  | "nervous"
  | "integumentary"
  | "urinary"
  | "reproductive"
  | "endocrine";
type MuscleLayer = "superficial" | "deep";
type Structure = {
  id: string;
  name: string;
  system: BodySystem;
  category: string;
  layer: MuscleLayer | null;
  side: "right" | "left" | "midline";
  asset: string;
};

const sourceDirectory = "work/source";
const outputDirectory = "public/models";
const sourceCommit = "28912432581accd7a1c62129d55f0e9758221d48";
const sourceModels = [
  {
    source: "atlas-muscles.glb",
    output: "muscles.glb",
    system: "muscular",
    expectedCount: 476,
    blobSha: "31f87dff1bde2d2cdd6328c99e2155154c738bd0",
  },
  {
    source: "atlas-nerves.glb",
    output: "nerves.glb",
    system: "nervous",
    expectedCount: 255,
    blobSha: "965ac854bd18d12f959f4e7bc34444a1a6032c03",
  },
  {
    source: "atlas-skin.glb",
    output: "skin.glb",
    system: "integumentary",
    expectedCount: 256,
    blobSha: "1000d249050112ea014651647d3145e0bde127f8",
  },
] as const;
const visceralHashes = {
  fbx: "22b301c93327929c9a14ee582d1848b550a950376e221a6d1078c7256bb83d0e",
  glb: "6ad89edb026f75eb68e7d02ab82cc1c55f4e026ac2bed11830f2fa3e8ac21037",
};
const colors = {
  muscular: "#b35d58",
  nervous: "#e6bf6b",
  integumentary: "#d99b82",
  urinary: "#5ba6a1",
  reproductive: "#b9779c",
  endocrine: "#8e79bd",
} as const;
const structures: Structure[] = [];

function hash(bytes: Uint8Array, algorithm = "sha256") {
  return createHash(algorithm).update(bytes).digest("hex");
}

function gitBlobHash(bytes: Uint8Array) {
  return hash(
    Buffer.concat([Buffer.from(`blob ${bytes.byteLength}\0`), bytes]),
    "sha1",
  );
}

function cleanName(name: string) {
  return name
    .trim()
    .replace(/\.\d{3}$/i, "")
    .replaceAll("_", " ");
}

function getSide(name: string): Structure["side"] {
  if (/\.r(?:\.\d{3})?$/i.test(name) || /\bright\b/i.test(name)) return "right";
  if (/\.l(?:\.\d{3})?$/i.test(name) || /\bleft\b/i.test(name)) return "left";
  return "midline";
}

const explicitlySuperficial =
  /^(?:frontalis|occipitalis|temporoparietalis|nasalis|orbicularis|zygomaticus|corrugator|depressor|levator|procerus|risorius|mentalis|platysma|sternocleidomastoid|trapezius|pectoralis major|serratus anterior|latissimus dorsi|deltoid|biceps brachii|triceps brachii|brachioradialis|flexor carpi radialis|palmaris longus|flexor carpi ulnaris|external oblique|rectus abdominis|gluteus maximus|tensor fasciae latae|sartorius|quadriceps|rectus femoris|vastus (?:lateralis|medialis|intermedius)|biceps femoris|semitendinosus|semimembranosus|gastrocnemius|fibularis (?:longus|brevis)|tibialis anterior|extensor digitorum longus|buccinator|masseter|temporalis)\b/i;

function classifyMuscle(name: string): MuscleLayer {
  if (
    /\b(?:deep|profundus)\b/i.test(name) ||
    /vastus intermedius|levator scapulae|levator ani|flexor digitorum profundus|flexor pollicis longus|pronator quadratus|supinator|interosse(?:i|us)|lumbrical/i.test(
      name,
    )
  )
    return "deep";
  if (/superficial/i.test(name) || explicitlySuperficial.test(name))
    return "superficial";
  return "deep";
}

function classifyVisceral(name: string): BodySystem | null {
  if (
    /suprarenal gland|adrenal gland|thyroid|parathyroid|endocrine|hypophysis|pineal|infundibular stalk|pyramidal lobe/i.test(
      name,
    )
  )
    return "endocrine";
  if (
    /\bkidney\b|\brenal (?:pelvis|sinus)\b|\burinary\b|\bureter\b|\bbladder\b|\burethra\b/i.test(
      name,
    )
  )
    return "urinary";
  if (
    /genital|testis|epididymis|ductus deferens|seminal gland|prostate|ejaculatory duct|penis|glans/i.test(
      name,
    )
  )
    return "reproductive";
  return null;
}

function classifyCategory(system: BodySystem, name: string) {
  if (system === "nervous")
    return /brain|tract|chiasm|stria|spinal cord|nucleus|cerebell/i.test(name)
      ? "central"
      : "peripheral";
  if (system === "urinary")
    return /kidney|renal/i.test(name) ? "kidneys" : "urinaryTract";
  if (system === "reproductive") {
    if (/testis|epididymis|ovary|uterus|ovary|gonad/i.test(name))
      return "gonads";
    if (/duct|urethra|uterine tube|vagina/i.test(name)) return "ducts";
    if (/seminal|prostate|gland/i.test(name)) return "accessoryGlands";
    return "external";
  }
  if (system === "endocrine")
    return /hypophysis|pituitary/i.test(name) ? "pituitary" : "glands";
  if (system === "integumentary") {
    if (/hair|follicle/i.test(name)) return "hair";
    if (/nail/i.test(name)) return "nails";
    return "skin";
  }
  return "muscles";
}

function setStructureData(
  node: GltfNode,
  structure: Structure,
  material: ReturnType<Document["createMaterial"]>,
) {
  node.setName(structure.name);
  node.setExtras({
    partId: structure.id,
    partName: structure.name,
    system: structure.system,
    category: structure.category,
    layer: structure.layer,
    side: structure.side,
  });
  for (const primitive of node.getMesh()?.listPrimitives() ?? [])
    primitive.setMaterial(material);
}

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [
    ((value >> 16) & 0xff) / 255,
    ((value >> 8) & 0xff) / 255,
    (value & 0xff) / 255,
  ];
}

await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco.createDecoderModule(),
    "meshopt.encoder": MeshoptEncoder,
  });
await mkdir(outputDirectory, { recursive: true });

for (const model of sourceModels) {
  const bytes = await readFile(`${sourceDirectory}/${model.source}`);
  if (gitBlobHash(bytes) !== model.blobSha)
    throw new Error(`Unexpected pinned source model: ${model.source}`);
  const document = await io.read(`${sourceDirectory}/${model.source}`);
  const nodes = document
    .getRoot()
    .listNodes()
    .filter((node) => node.getMesh());
  if (nodes.length !== model.expectedCount)
    throw new Error(
      `Expected ${model.expectedCount} ${model.system} structures, found ${nodes.length}.`,
    );
  const usedNames = new Set<string>();
  const materials = new Map<string, ReturnType<Document["createMaterial"]>>();
  for (const [index, node] of nodes.entries()) {
    const name = cleanName(node.getName());
    if (!name) throw new Error(`${model.source} contains an unnamed mesh.`);
    const uniqueKey = name.toLowerCase();
    if (usedNames.has(uniqueKey))
      throw new Error(`Duplicate ${model.system} structure name: ${name}`);
    usedNames.add(uniqueKey);
    const layer = model.system === "muscular" ? classifyMuscle(name) : null;
    const structure: Structure = {
      id: `${model.system}-${String(index + 1).padStart(3, "0")}`,
      name,
      system: model.system,
      category:
        model.system === "muscular"
          ? layer!
          : classifyCategory(model.system, name),
      layer,
      side: getSide(name),
      asset: model.output,
    };
    let material = materials.get(structure.category);
    if (!material) {
      material = document
        .createMaterial(`${structure.system}-${structure.category}`)
        .setBaseColorFactor([...hexToRgb(colors[structure.system]), 1])
        .setMetallicFactor(0)
        .setRoughnessFactor(0.48);
      materials.set(structure.category, material);
    }
    setStructureData(node, structure, material);
    structures.push(structure);
  }
  for (const extension of document.getRoot().listExtensionsUsed())
    if (extension.extensionName === "KHR_draco_mesh_compression")
      extension.dispose();
  await document.transform(
    prune(),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
  await io.write(`${outputDirectory}/${model.output}`, document);
}

const visceralFbx = await readFile(`${sourceDirectory}/VisceralSystem100.fbx`);
if (hash(visceralFbx) !== visceralHashes.fbx)
  throw new Error("Unexpected pinned visceral FBX source.");
const visceralBytes = await readFile(`${sourceDirectory}/visceral-draco.glb`);
if (hash(visceralBytes) !== visceralHashes.glb)
  throw new Error("Unexpected converted visceral source.");
const visceralDocument = await io.read(`${sourceDirectory}/visceral-draco.glb`);
const visceralRoot = visceralDocument.getRoot();
const visceralScenes = visceralRoot.listScenes();
const visceralNodes = visceralRoot.listNodes().filter((node) => node.getMesh());
if (visceralNodes.length !== 296)
  throw new Error(
    `Expected 296 visceral structures, found ${visceralNodes.length}.`,
  );

const extraDocument = visceralDocument;
const extraScene = extraDocument.createScene(
  "Urinary, reproductive, and endocrine systems",
);
const extraMaterials = Object.fromEntries(
  (["urinary", "reproductive", "endocrine"] as const).map((system) => [
    system,
    extraDocument
      .createMaterial(system)
      .setBaseColorFactor([...hexToRgb(colors[system]), 1])
      .setMetallicFactor(0)
      .setRoughnessFactor(0.48),
  ]),
);

for (const [index, sourceNode] of visceralNodes.entries()) {
  const name = cleanName(sourceNode.getName());
  const system = classifyVisceral(name);
  if (!system) continue;
  const pieces = [];
  for (const original of sourceNode.getMesh()!.listPrimitives()) {
    const primitive = original.clone();
    for (const semantic of primitive.listSemantics())
      primitive.setAttribute(
        semantic,
        primitive.getAttribute(semantic)!.clone(),
      );
    if (primitive.getIndices())
      primitive.setIndices(primitive.getIndices()!.clone());
    primitive.setMaterial(extraMaterials[system]);
    transformPrimitive(primitive, sourceNode.getWorldMatrix());
    pieces.push(primitive);
  }
  const geometry = pieces.length === 1 ? pieces[0] : joinPrimitives(pieces);
  const structure: Structure = {
    id: `${system}-${String(index + 1).padStart(3, "0")}`,
    name,
    system,
    category: classifyCategory(system, name),
    layer: null,
    side: getSide(name),
    asset: "visceral-extra.glb",
  };
  extraScene.addChild(
    extraDocument
      .createNode(name)
      .setMesh(extraDocument.createMesh(name).addPrimitive(geometry))
      .setExtras({
        partId: structure.id,
        partName: structure.name,
        system: structure.system,
        category: structure.category,
        layer: null,
        side: structure.side,
      }),
  );
  structures.push(structure);
}

const extraCounts = {
  urinary: structures.filter((part) => part.system === "urinary").length,
  reproductive: structures.filter((part) => part.system === "reproductive")
    .length,
  endocrine: structures.filter((part) => part.system === "endocrine").length,
};
if (
  extraCounts.urinary !== 20 ||
  extraCounts.reproductive !== 25 ||
  extraCounts.endocrine !== 27
)
  throw new Error(
    `Unexpected extra system inventory: ${JSON.stringify(extraCounts)}.`,
  );
for (const scene of visceralScenes) scene.dispose();
for (const node of visceralNodes) node.dispose();
visceralRoot.setDefaultScene(extraScene);
for (const extension of visceralRoot.listExtensionsUsed())
  if (extension.extensionName === "KHR_draco_mesh_compression")
    extension.dispose();
await extraDocument.transform(
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);
await io.write(`${outputDirectory}/visceral-extra.glb`, extraDocument);

for (const model of [
  ...sourceModels.map((item) => item.output),
  "visceral-extra.glb",
]) {
  if ((await readFile(`${outputDirectory}/${model}`)).byteLength < 100_000)
    throw new Error(`Generated system model is unexpectedly small: ${model}`);
}

await writeFile(
  `${outputDirectory}/body-systems-provenance.json`,
  JSON.stringify(
    {
      license: "CC-BY-SA-4.0",
      attribution:
        "Z-Anatomy / BodyParts3D (Database Center for Life Science); web exports from SeemaBansal1/3d-human-body-anatomy.",
      sourceCommit,
      sourceModels: sourceModels.map((model) => ({
        file: model.source,
        gitBlobSha1: model.blobSha,
        output: model.output,
        source: `https://github.com/SeemaBansal1/3d-human-body-anatomy/blob/${sourceCommit}/web/public/models/${model.source.replace("atlas-", "")}`,
      })),
      visceralSource: {
        file: "VisceralSystem100.fbx",
        source:
          "https://github.com/LluisV/Z-Anatomy/blob/6c7f9016bd5899ac8edafd31b9900c151df42ed6/Resources/Models/FBX/VisceralSystem100.fbx",
        sourceSha256: visceralHashes.fbx,
        convertedSourceSha256: visceralHashes.glb,
        output: "visceral-extra.glb",
        license:
          "CC-BY-SA-4.0, with source-attributed kidney geometry under CC-BY-NC-4.0",
      },
      counts: {
        muscular: sourceModels[0].expectedCount,
        nervous: sourceModels[1].expectedCount,
        integumentary: sourceModels[2].expectedCount,
        ...extraCounts,
      },
      limitations: [
        "The source contains male reproductive structures only.",
        "No lymphatic or immune structures were present in the selected source assets.",
        "Muscle layer classification is an atlas-authored grouping based on names; unspecified deep muscles are grouped with the deep layer.",
      ],
      structures,
    },
    null,
    2,
  ),
);
console.log(
  `Exported ${structures.length} selectable structures: ${JSON.stringify({
    muscular: sourceModels[0].expectedCount,
    nervous: sourceModels[1].expectedCount,
    integumentary: sourceModels[2].expectedCount,
    ...extraCounts,
  })}.`,
);
await import("./build-lymphatic-model.ts");
