import { bones } from "../data/bones";
import type { Bone } from "../data/types";
// Replace these functions with HTTP calls when adding a database-backed API.
// The rest of the app can keep the same Bone interface.
export async function getBones(): Promise<Bone[]> {
  return bones;
}
export async function getBone(id: string): Promise<Bone | undefined> {
  return bones.find((bone) => bone.id === id);
}
