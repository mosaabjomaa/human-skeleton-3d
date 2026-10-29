import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const sourceDirectory = resolve("work/source");
const sourceCommit = "28912432581accd7a1c62129d55f0e9758221d48";
const assets = [
  {
    name: "atlas-muscles.glb",
    bytes: 1_911_456,
    blobSha: "31f87dff1bde2d2cdd6328c99e2155154c738bd0",
  },
  {
    name: "atlas-nerves.glb",
    bytes: 1_020_216,
    blobSha: "965ac854bd18d12f959f4e7bc34444a1a6032c03",
  },
  {
    name: "atlas-skin.glb",
    bytes: 770_296,
    blobSha: "1000d249050112ea014651647d3145e0bde127f8",
  },
] as const;

function getGitBlobSha(bytes: Uint8Array) {
  const header = Buffer.from(`blob ${bytes.byteLength}\0`);
  return createHash("sha1").update(header).update(bytes).digest("hex");
}

await mkdir(sourceDirectory, { recursive: true });

for (const asset of assets) {
  const destination = resolve(sourceDirectory, asset.name);
  let bytes: Buffer;
  try {
    bytes = await readFile(destination);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      error.code !== "ENOENT"
    )
      throw error;

    const url = `https://raw.githubusercontent.com/SeemaBansal1/3d-human-body-anatomy/${sourceCommit}/web/public/models/${asset.name.replace("atlas-", "")}`;
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Could not download ${url}: HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
  }

  if (bytes.byteLength !== asset.bytes)
    throw new Error(
      `Unexpected ${asset.name} size: ${bytes.byteLength} bytes.`,
    );
  const actualBlobSha = getGitBlobSha(bytes);
  if (actualBlobSha !== asset.blobSha)
    throw new Error(
      `Git blob SHA mismatch for ${asset.name}: ${actualBlobSha}`,
    );
  await writeFile(destination, bytes);
  console.log(`Verified ${asset.name} (${bytes.byteLength} bytes).`);
}
