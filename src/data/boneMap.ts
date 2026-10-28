import { bones } from "./bones.ts";
// Model mesh names intentionally equal stable dataset IDs.
export const boneMap: Record<string, string> = Object.fromEntries(
  bones.map((bone) => [bone.meshName, bone.id]),
);
