import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const url =
  "https://raw.githubusercontent.com/SeemaBansal1/3d-human-body-anatomy/main/web/public/models/skeleton.glb";
const expected =
  "2d159eddbc12de45d84195fc56957b274e7086b00224c245f22ea9d8ea6409eb";
let buffer: Buffer;
try {
  buffer = await readFile("work/source/z-skeleton.glb");
} catch {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Source download failed: ${response.status}`);
  buffer = Buffer.from(await response.arrayBuffer());
}
if (createHash("sha256").update(buffer).digest("hex") !== expected)
  throw new Error(
    "Source hash changed: review the upstream license and bone inventory before replacing this source.",
  );
await mkdir("work/source", { recursive: true });
await writeFile("work/source/z-skeleton.glb", buffer);
console.log("Verified source anatomical GLB is ready.");
