export type Language = "en" | "ar";
export type Localized = Record<Language, string>;
export type BoneGroup =
  "skull" | "spine" | "thorax" | "shoulder" | "upper" | "pelvis" | "lower";
export type DetailKey =
  | "overview"
  | "location"
  | "landmarks"
  | "function"
  | "articulations"
  | "muscles"
  | "supply"
  | "clinical"
  | "development"
  | "fact";
export type Details = Record<DetailKey, string>;
export interface Bone {
  id: string;
  meshName: string;
  sourceNames: string[];
  name: Localized;
  latinName: string;
  region: "axial" | "appendicular";
  group: BoneGroup;
  boneType: "long" | "short" | "flat" | "irregular" | "sesamoid";
  side: "left" | "right" | "midline";
  shortDescription: Localized;
  details: Record<Language, Details>;
  sources: string[];
}
export const L = (en: string, ar: string): Localized => ({ en, ar });
export interface BoneSeed {
  id: string;
  en: string;
  ar: string;
  latin: string;
  group: BoneGroup;
  type: Bone["boneType"];
  side?: Bone["side"];
  source: string[];
  note: string;
}
