import { bones } from "../src/data/bones.ts";
import { readFileSync } from "node:fs";
const j = JSON.parse(readFileSync("work/source/z-model.json", "utf8"));
const names = new Set(j.nodes.map((n: { name: string }) => n.name));
const missing = bones.flatMap((b) =>
  b.sourceNames
    .filter((n) => !names.has(n))
    .map((n) => ({ id: b.id, source: n })),
);
console.log({ expected: bones.length, missing });
