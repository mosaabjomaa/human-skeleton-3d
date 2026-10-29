import type { VisceralPart } from "../components/VisceralAtlasModel";

export function getVisceralFunctionKey(part: VisceralPart) {
  const name = part.name.toLowerCase();
  if (part.system === "shared" || name.includes("pharynx"))
    return "sharedPharynx";
  if (part.system === "respiratory") {
    if (/lung|pleura/.test(name)) return "respiratoryLung";
    if (/nose|nasal|sinus/.test(name)) return "respiratoryUpper";
    return "respiratoryAirway";
  }
  if (/liver|gallbladder|bile duct/.test(name)) return "digestiveLiver";
  if (/pancrea/.test(name)) return "digestivePancreas";
  if (/stomach|pylor|cardia/.test(name)) return "digestiveStomach";
  if (/intestin|duod|jejun|colon|appendix|taenia/.test(name))
    return "digestiveIntestine";
  if (
    /mouth|tongue|saliv|parotid|sublingual|submandibular|palate|gingiva|fauces/.test(
      name,
    )
  )
    return "digestiveOral";
  if (/oesoph|esoph/.test(name)) return "digestiveOesophagus";
  if (/peritone|omentum|mesocol/.test(name)) return "digestiveSupport";
  return "digestiveGeneral";
}

export function getVisceralRouteKey(part: VisceralPart) {
  return part.system === "respiratory" || part.system === "shared"
    ? part.system === "shared"
      ? "sharedRoute"
      : "respiratoryRoute"
    : "digestiveRoute";
}
