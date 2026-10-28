import { getBounds, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import { readFile, stat } from "node:fs/promises";
import { bones } from "../src/data/bones.ts";
import { boneMap } from "../src/data/boneMap.ts";
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const document = await io.read("public/models/skeleton.glb");
const root = document.getRoot();
const nodes = root.listNodes().filter((node) => node.getMesh());
const meshes = root.listMeshes();
const errors: string[] = [];
const expected = new Set(bones.map((b) => b.meshName));
const counts = new Map<string, number>();
for (const node of nodes) {
  const name = node.getName();
  counts.set(name, (counts.get(name) || 0) + 1);
  if (!expected.has(name) || !boneMap[name])
    errors.push(`Unmapped node: ${name}`);
  if (node.getMesh()!.getName() !== name)
    errors.push(`Mesh name differs: ${name}`);
  const primitives = node.getMesh()!.listPrimitives();
  if (primitives.length !== 1)
    errors.push(
      `${name}: expected one mesh primitive, found ${primitives.length}`,
    );
  for (const primitive of primitives) {
    const position = primitive.getAttribute("POSITION");
    if (!position || position.getCount() < 3)
      errors.push(`${name}: empty geometry`);
    if (position && ![...position.getArray()!].every(Number.isFinite))
      errors.push(`${name}: non-finite vertices`);
  }
}
for (const bone of bones)
  if (counts.get(bone.meshName) !== 1)
    errors.push(`Missing or duplicate expected bone: ${bone.id}`);
if (bones.length !== 206 || nodes.length !== 206 || meshes.length !== 206)
  errors.push(
    `Counts dataset=${bones.length}, nodes=${nodes.length}, meshes=${meshes.length}; all must be 206.`,
  );
const axial = bones.filter((b) => b.region === "axial").length;
if (axial !== 80) errors.push(`Axial inventory ${axial}, expected 80.`);
const size = (await stat("public/models/skeleton.glb")).size;
if (size > 15 * 1024 * 1024)
  errors.push("Compressed GLB exceeds 15 MB target.");
for (const lang of ["en", "ar"] as const)
  for (const bone of bones)
    if (Object.values(bone.details[lang]).some((value) => !value.trim()))
      errors.push(`Missing ${lang} content: ${bone.id}`);
// Anatomical ordering catches swapped head/limb positions in the shipped asset.
const centerY = (name: string) => {
  const node = nodes.find((node) => node.getName() === name);
  if (!node) return NaN;
  const bounds = getBounds(node);
  return (bounds.min[1] + bounds.max[1]) / 2;
};
const order = ["frontal", "sternum", "hip_left", "femur_left", "talus_left"];
for (let i = 1; i < order.length; i++)
  if (!(centerY(order[i - 1]) > centerY(order[i])))
    errors.push(
      "Anatomical vertical order failed: " + order[i - 1] + " / " + order[i],
    );
const provenance = JSON.parse(
  await readFile("public/models/provenance.json", "utf8"),
);
if (provenance.bones.length !== 206)
  errors.push("Provenance must list 206 bones.");
for (const bone of bones) {
  const record = provenance.bones.find(
    (item: { id: string }) => item.id === bone.id,
  );
  if (
    !record ||
    JSON.stringify(record.sourceNames) !== JSON.stringify(bone.sourceNames)
  )
    errors.push("Provenance mismatch: " + bone.id);
}
console.log({
  bones: bones.length,
  meshes: meshes.length,
  axial,
  appendicular: bones.length - axial,
  megabytes: (size / 1024 / 1024).toFixed(2),
});
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "PASS — all 206 expected bones are present, individually named and mapped. No missing bones.",
  );
