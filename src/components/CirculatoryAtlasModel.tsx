import { useEffect, useMemo, useState } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import {
  Box3,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Sphere,
  Vector3,
} from "three";
import { anatomyPosition, anatomyScale } from "../utils/anatomyTransform";

export type CirculationCircuit = "all" | "pulmonary" | "systemic";
export type CirculationVesselType = "all" | "artery" | "vein";
export type CirculationPart = {
  id: string;
  name: string;
  type: "artery" | "vein" | "heart" | "other";
  circuit: "pulmonary" | "systemic" | "shared";
  side: "right" | "left" | "midline";
};
export type CirculationFocus = {
  id: string;
  position: [number, number, number];
  radius: number;
};

const colors = {
  artery: "#db3346",
  vein: "#3176df",
  heart: "#dd6670",
  other: "#d8a34e",
} as const;

function createMaterials() {
  const normal = Object.fromEntries(
    Object.entries(colors).map(([type, color]) => [
      type,
      new MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.045,
        roughness: 0.42,
        metalness: 0.02,
      }),
    ]),
  ) as Record<keyof typeof colors, MeshStandardMaterial>;
  const highlighted = Object.fromEntries(
    Object.entries(colors).map(([type, color]) => [
      type,
      new MeshStandardMaterial({
        color: "#ffe7d4",
        emissive: color,
        emissiveIntensity: 0.85,
        roughness: 0.36,
      }),
    ]),
  ) as Record<keyof typeof colors, MeshStandardMaterial>;
  return { normal, highlighted };
}

function getPart(object: Object3D): CirculationPart | null {
  const data = object.userData;
  if (
    typeof data.partId !== "string" ||
    typeof data.partName !== "string" ||
    !["artery", "vein", "heart", "other"].includes(data.vesselType) ||
    !["pulmonary", "systemic", "shared"].includes(data.circuit) ||
    !["right", "left", "midline"].includes(data.side)
  )
    return null;
  return {
    id: data.partId,
    name: data.partName,
    type: data.vesselType,
    circuit: data.circuit,
    side: data.side,
  };
}

function isPartVisible(
  part: CirculationPart,
  circuit: CirculationCircuit,
  vesselType: CirculationVesselType,
  selectedPartId: string | null,
  isolateSelected: boolean,
) {
  const circuitVisible =
    circuit === "all" || part.circuit === circuit || part.circuit === "shared";
  const typeVisible = vesselType === "all" || part.type === vesselType;
  return (
    circuitVisible &&
    typeVisible &&
    (!isolateSelected || !selectedPartId || part.id === selectedPartId)
  );
}

export function CirculatoryAtlasModel({
  circuit,
  vesselType,
  selectedPartId,
  isolateSelected,
  onSelectPart,
  onHoverPart,
  wireframe = false,
}: {
  circuit: CirculationCircuit;
  vesselType: CirculationVesselType;
  selectedPartId: string | null;
  isolateSelected: boolean;
  onSelectPart: (part: CirculationPart, focus: CirculationFocus) => void;
  onHoverPart?: (part: CirculationPart | null) => void;
  wireframe?: boolean;
}) {
  const gltf = useLoader(
    GLTFLoader,
    `${import.meta.env.BASE_URL}models/circulatory.glb`,
    (loader) => loader.setMeshoptDecoder(MeshoptDecoder),
  );
  const invalidate = useThree((state) => state.invalidate);
  const materials = useMemo(() => createMaterials(), []);
  useEffect(() => {
    for (const material of [
      ...Object.values(materials.normal),
      ...Object.values(materials.highlighted),
    ])
      material.wireframe = wireframe;
    invalidate();
  }, [materials, wireframe, invalidate]);
  const model = useMemo(() => {
    const scene = gltf.scene.clone(true);
    scene.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(scene);
    const size = bounds.getSize(new Vector3());
    if (size.y <= 0) throw new Error("Invalid cardiovascular model bounds.");
    let meshCount = 0;
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const part = getPart(object);
      if (!part) throw new Error(`Missing structure metadata: ${object.name}`);
      object.material = materials.normal[part.type];
      meshCount++;
    });
    if (meshCount < 600)
      throw new Error(`Incomplete cardiovascular model: ${meshCount} parts.`);
    return { scene, scale: anatomyScale, position: anatomyPosition };
  }, [gltf, materials]);
  const [hoveredPart, setHoveredPart] = useState<CirculationPart | null>(null);
  const visibleHoveredPart =
    hoveredPart &&
    isPartVisible(
      hoveredPart,
      circuit,
      vesselType,
      selectedPartId,
      isolateSelected,
    )
      ? hoveredPart
      : null;

  useEffect(() => {
    model.scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const part = getPart(object);
      if (!part) return;
      object.visible = isPartVisible(
        part,
        circuit,
        vesselType,
        selectedPartId,
        isolateSelected,
      );
      object.material =
        part.id === selectedPartId || part.id === visibleHoveredPart?.id
          ? materials.highlighted[part.type]
          : materials.normal[part.type];
    });
    invalidate();
  }, [
    circuit,
    vesselType,
    selectedPartId,
    isolateSelected,
    visibleHoveredPart,
    model,
    materials,
    invalidate,
  ]);

  useEffect(
    () => () => {
      Object.values(materials.normal).forEach((material) => material.dispose());
      Object.values(materials.highlighted).forEach((material) =>
        material.dispose(),
      );
    },
    [materials],
  );

  const selectIntersected = (event: ThreeEvent<MouseEvent>) => {
    const part = getPart(event.object);
    if (
      !part ||
      !isPartVisible(part, circuit, vesselType, selectedPartId, isolateSelected)
    )
      return;
    event.stopPropagation();
    event.object.updateWorldMatrix(true, false);
    const bounds = new Box3().setFromObject(event.object);
    const center = bounds.getCenter(new Vector3());
    const radius = bounds.getBoundingSphere(new Sphere()).radius;
    onSelectPart(part, {
      id: part.id,
      position: [center.x, center.y, center.z],
      radius,
    });
  };
  const hoverIntersected = (event: ThreeEvent<PointerEvent>) => {
    const part = getPart(event.object);
    if (
      !part ||
      !isPartVisible(part, circuit, vesselType, selectedPartId, isolateSelected)
    )
      return;
    event.stopPropagation();
    setHoveredPart(part);
    onHoverPart?.(part);
  };

  return (
    <group scale={model.scale} position={model.position}>
      <primitive
        object={model.scene}
        onClick={selectIntersected}
        onPointerOver={hoverIntersected}
        onPointerOut={(event: ThreeEvent<PointerEvent>) => {
          const part = getPart(event.object);
          if (part?.id === hoveredPart?.id) {
            setHoveredPart(null);
            onHoverPart?.(null);
          }
        }}
      />
    </group>
  );
}
