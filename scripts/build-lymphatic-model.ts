import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { meshopt, prune } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import draco from "draco3dgltf";
const source = "work/source/LymphoidOrgans100.fbx",
  converted = "work/source/lymphatic-draco.glb";
const hash = "310ff82f502f4f3a79e85f99ddc2009bba9514338119af9edff87b20cf1b3609";
const url =
  "https://raw.githubusercontent.com/LluisV/Z-Anatomy/6c7f9016bd5899ac8edafd31b9900c151df42ed6/Resources/Models/FBX/LymphoidOrgans100.fbx";
let bytes: Buffer;
try {
  bytes = await readFile(source);
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  const r = await fetch(url);
  if (!r.ok) throw Error(`HTTP ${r.status}`);
  bytes = Buffer.from(await r.arrayBuffer());
  await writeFile(source, bytes);
}
if (createHash("sha256").update(bytes).digest("hex") !== hash)
  throw Error("Lymphatic source checksum mismatch");
const converter = "work/source/FBX2glTF.exe";
if (
  createHash("sha256")
    .update(await readFile(converter))
    .digest("hex") !==
  "8d90fb5e0a8d186a3d9a7ff8c75eaee541c3975ce4df0d80351f20092ae0877f"
)
  throw Error("Converter checksum mismatch");
execFileSync(
  converter,
  [
    "--binary",
    "--draco",
    "--compute-normals",
    "missing",
    "--input",
    source,
    "--output",
    "work/source/lymphatic-draco",
  ],
  { stdio: "inherit" },
);
await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco.createDecoderModule(),
    "meshopt.encoder": MeshoptEncoder,
  });
const doc = await io.read(converted),
  nodes = doc
    .getRoot()
    .listNodes()
    .filter((n) => n.getMesh());
if (nodes.length !== 220)
  throw Error(`Expected 220 lymphatic structures, got ${nodes.length}`);
const material = doc
  .createMaterial("Lymphatic system")
  .setBaseColorFactor([0.43, 0.76, 0.44, 1])
  .setRoughnessFactor(0.48);
const structures = nodes.map((n, i) => {
  const name = n.getName(),
    part = {
      id: `lymphatic-${String(i + 1).padStart(3, "0")}`,
      name,
      system: "lymphatic",
      category: /spleen/i.test(name)
        ? "spleen"
        : /thymus/i.test(name)
          ? "thymus"
          : /tonsil|pharyngeal lymphoid/i.test(name)
            ? "tonsils"
            : /duct|trunk|vessel|cisterna/i.test(name)
              ? "vessels"
              : "nodes",
      layer: null,
      side: /\.l$|\bleft\b/i.test(name)
        ? "left"
        : /\.r$|\bright\b/i.test(name)
          ? "right"
          : "midline",
      asset: "lymphatic.glb",
    };
  n.setExtras({
    partId: part.id,
    partName: name,
    system: part.system,
    category: part.category,
    layer: null,
    side: part.side,
  });
  for (const p of n.getMesh()!.listPrimitives()) p.setMaterial(material);
  return part;
});
for (const extension of doc.getRoot().listExtensionsUsed())
  if (extension.extensionName === "KHR_draco_mesh_compression")
    extension.dispose();
await doc.transform(
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);
await io.write("public/models/lymphatic.glb", doc);
const path = "public/models/body-systems-provenance.json",
  p = JSON.parse(await readFile(path, "utf8"));
p.structures = p.structures
  .filter((s: { system: string }) => s.system !== "lymphatic")
  .concat(structures);
p.counts.lymphatic = structures.length;
p.lymphaticSource = {
  url,
  sha256: hash,
  license: "CC-BY-SA-4.0",
  output: "lymphatic.glb",
};
p.limitations = p.limitations.filter(
  (s: string) => !s.startsWith("No lymphatic"),
);
await writeFile(path, JSON.stringify(p, null, 2));
console.log("Exported 220 lymphatic structures with provenance.");
await writeFile(
  "src/data/body-systems-inventory.json",
  JSON.stringify(p, null, 2),
);
