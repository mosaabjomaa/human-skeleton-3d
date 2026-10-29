import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const sourceDirectory = resolve("work/source");
const sourcePath = resolve(sourceDirectory, "VisceralSystem100.fbx");
const converterPath = resolve(sourceDirectory, "FBX2glTF.exe");
const convertedPath = resolve(sourceDirectory, "visceral-draco.glb");
const sourceUrl =
  "https://raw.githubusercontent.com/LluisV/Z-Anatomy/6c7f9016bd5899ac8edafd31b9900c151df42ed6/Resources/Models/FBX/VisceralSystem100.fbx";
const converterUrl =
  "https://github.com/facebookincubator/FBX2glTF/releases/download/v0.9.7/FBX2glTF-windows-x64.exe";
const expectedHashes = {
  source: "22b301c93327929c9a14ee582d1848b550a950376e221a6d1078c7256bb83d0e",
  converter: "8d90fb5e0a8d186a3d9a7ff8c75eaee541c3975ce4df0d80351f20092ae0877f",
};

async function download(
  url: string,
  destination: string,
  expectedHash: string,
) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Could not download ${url}: HTTP ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (hash !== expectedHash)
    throw new Error(`SHA-256 mismatch for ${destination}: ${hash}`);
  await writeFile(destination, bytes);
}

if (process.platform !== "win32")
  throw new Error("The pinned FBX2glTF converter is currently Windows-only.");

await mkdir(sourceDirectory, { recursive: true });
for (const [path, url, hash] of [
  [sourcePath, sourceUrl, expectedHashes.source],
  [converterPath, converterUrl, expectedHashes.converter],
] as const) {
  let bytes: Buffer | undefined;
  try {
    bytes = await readFile(path);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      error.code !== "ENOENT"
    )
      throw error;
  }
  if (bytes && createHash("sha256").update(bytes).digest("hex") !== hash)
    throw new Error(`Existing source file failed SHA-256 validation: ${path}`);
  if (!bytes) await download(url, path, hash);
}

execFileSync(
  converterPath,
  [
    "--binary",
    "--draco",
    "--draco-compression-level",
    "7",
    "--draco-bits-for-position",
    "14",
    "--draco-bits-for-normals",
    "10",
    "--compute-normals",
    "missing",
    "--input",
    sourcePath,
    "--output",
    resolve(sourceDirectory, "visceral-draco"),
  ],
  { stdio: "inherit" },
);
await readFile(convertedPath);
console.log(`Converted source model to ${convertedPath}`);
