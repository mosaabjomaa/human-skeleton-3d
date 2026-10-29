import type { CirculationPart } from "../components/CirculatoryAtlasModel";

export function getSpecificFunction(part: CirculationPart, name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("pulmonary trunk")) return "pulmonaryTrunk";
  if (normalized.includes("pulmonary artery")) return "pulmonaryArtery";
  if (normalized.includes("pulmonary vein")) return "pulmonaryVein";
  if (normalized.includes("coronary artery")) return "coronaryArtery";
  if (
    normalized.includes("coronary vein") ||
    normalized.includes("coronary sinus")
  )
    return "coronaryVein";
  if (normalized.includes("aorta")) return "aorta";
  if (normalized.includes("vena cava") || normalized.includes("cava"))
    return "venaCava";
  if (normalized.includes("atrium")) return "atrium";
  if (normalized.includes("ventricle")) return "ventricle";
  if (normalized.includes("valve") || normalized.includes("leaflet"))
    return "valve";
  if (part.type === "artery")
    return part.circuit === "pulmonary" ? "arteryPulmonary" : "arterySystemic";
  if (part.type === "vein")
    return part.circuit === "pulmonary" ? "veinPulmonary" : "veinSystemic";
  if (part.type === "heart") return "heart";
  return "other";
}
