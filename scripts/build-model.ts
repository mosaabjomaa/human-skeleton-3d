import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  joinPrimitives,
  meshopt,
  prune,
  transformPrimitive,
} from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import draco from "draco3dgltf";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { bones } from "../src/data/bones.ts";

await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco.createDecoderModule(),
    "meshopt.encoder": MeshoptEncoder,
  });
const document = await io.read("work/source/z-skeleton.glb");
const root = document.getRoot();
root
  .listExtensionsUsed()
  .filter(
    (extension) => extension.extensionName === "KHR_draco_mesh_compression",
  )
  .forEach((extension) => extension.dispose());
const oldScenes = root.listScenes();
const byName = new Map(root.listNodes().map((node) => [node.getName(), node]));
const scene = document.createScene("Adult human skeleton — 206 bones");
const material = document
  .createMaterial("Ivory cortical bone")
  .setBaseColorFactor([0.76, 0.81, 0.79, 1])
  .setMetallicFactor(0)
  .setRoughnessFactor(0.56);
const provenance = [];
for (const bone of bones) {
  const pieces = [];
  for (const source of bone.sourceNames) {
    const node = byName.get(source);
    if (!node?.getMesh())
      throw new Error(`Missing real anatomical mesh: ${bone.id} -> ${source}`);
    for (const original of node.getMesh()!.listPrimitives()) {
      const primitive = original.clone();
      for (const semantic of primitive.listSemantics())
        primitive.setAttribute(
          semantic,
          primitive.getAttribute(semantic)!.clone(),
        );
      if (primitive.getIndices())
        primitive.setIndices(primitive.getIndices()!.clone());
      primitive.setMaterial(material);
      transformPrimitive(primitive, node.getWorldMatrix());
      pieces.push(primitive);
    }
  }
  const primitive = pieces.length === 1 ? pieces[0] : joinPrimitives(pieces);
  const mesh = document.createMesh(bone.meshName).addPrimitive(primitive);
  scene.addChild(
    document
      .createNode(bone.meshName)
      .setMesh(mesh)
      .setExtras({ boneId: bone.id, sourceNames: bone.sourceNames }),
  );
  provenance.push({
    id: bone.id,
    meshName: bone.meshName,
    sourceNames: bone.sourceNames,
    vertices: primitive.getAttribute("POSITION")!.getCount(),
  });
}
for (const old of oldScenes) old.dispose();
// Explicitly remove original atlas nodes; only the canonical adult inventory is exported.
for (const node of byName.values()) node.dispose();
root.setDefaultScene(scene);
await document.transform(
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);
await mkdir("public/models", { recursive: true });
await io.write("public/models/skeleton.glb", document);
const source = await readFile("work/source/z-skeleton.glb");
await writeFile(
  "public/models/provenance.json",
  JSON.stringify(
    {
      source:
        "https://github.com/SeemaBansal1/3d-human-body-anatomy/blob/main/web/public/models/skeleton.glb",
      sourceSha256: createHash("sha256").update(source).digest("hex"),
      license: "CC-BY-SA-4.0",
      modifications:
        "Excluded teeth, cartilage, sinuses and accessory foot sesamoids; composed three sternum parts into one mesh; baked source anatomical transforms; Meshopt compression. No fabricated or mirrored replacement bones.",
      bones: provenance,
    },
    null,
    2,
  ),
);
console.log(
  "Exported 206 genuine anatomical meshes to public/models/skeleton.glb",
);
