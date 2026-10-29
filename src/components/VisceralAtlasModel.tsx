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

export type VisceralSystem = "respiratory" | "digestive" | "all";
export type VisceralCategory = "all" | "airway" | "lung" | "tract" | "organs";
export type VisceralPart = {
  id: string;
  name: string;
  system: "respiratory" | "digestive" | "shared";
  category: Exclude<VisceralCategory, "all">;
  side: "right" | "left" | "midline";
};
export type VisceralFocus = {
  id: string;
  position: [number, number, number];
  radius: number;
};

const colors = {
  airway: "#3dadb8",
  lung: "#d76f7a",
  tract: "#d49a46",
  organs: "#68a77b",
} as const;

function createMaterials() {
  const normal = Object.fromEntries(
    Object.entries(colors).map(([category, color]) => [
      category,
      new MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.045,
        roughness: 0.44,
      }),
    ]),
  ) as Record<keyof typeof colors, MeshStandardMaterial>;
  const highlighted = Object.fromEntries(
    Object.entries(colors).map(([category, color]) => [
      category,
      new MeshStandardMaterial({
        color: "#fff0d9",
        emissive: color,
        emissiveIntensity: 0.8,
        roughness: 0.36,
      }),
    ]),
  ) as Record<keyof typeof colors, MeshStandardMaterial>;
  return { normal, highlighted };
}

function getPart(object: Object3D): VisceralPart | null {
  const data = object.userData;
  if (
    typeof data.partId !== "string" ||
    typeof data.partName !== "string" ||
    !["respiratory", "digestive", "shared"].includes(data.system) ||
    !["airway", "lung", "tract", "organs"].includes(data.category) ||
    !["right", "left", "midline"].includes(data.side)
  )
    return null;
  return {
    id: data.partId,
    name: data.partName,
    system: data.system,
    category: data.category,
    side: data.side,
  };
}

function isPartVisible(
  part: VisceralPart,
  system: VisceralSystem,
  category: VisceralCategory,
  selectedPartId: string | null,
  isolateSelected: boolean,
) {
  const systemVisible =
    system === "all" || part.system === system || part.system === "shared";
  const categoryVisible =
    category === "all" ||
    part.category === category ||
    (part.system === "shared" && category === "tract");
  return (
    systemVisible &&
    categoryVisible &&
    (!isolateSelected || !selectedPartId || part.id === selectedPartId)
  );
}

export function VisceralAtlasModel({
  system,
  category,
  selectedPartId,
  isolateSelected,
  onSelectPart,
  onHoverPart,
}: {
  system: VisceralSystem;
  category: VisceralCategory;
  selectedPartId: string | null;
  isolateSelected: boolean;
  onSelectPart: (part: VisceralPart, focus: VisceralFocus) => void;
  onHoverPart?: (part: VisceralPart | null) => void;
}) {
  const gltf = useLoader(
    GLTFLoader,
    `${import.meta.env.BASE_URL}models/visceral.glb`,
    (loader) => loader.setMeshoptDecoder(MeshoptDecoder),
  );
  const invalidate = useThree((state) => state.invalidate);
  const materials = useMemo(() => createMaterials(), []);
  const model = useMemo(() => {
    const scene = gltf.scene.clone(true);
    scene.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(scene);
    const size = bounds.getSize(new Vector3());
    if (size.y <= 0)
      throw new Error("Invalid respiratory and digestive model bounds.");
    let meshCount = 0;
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const part = getPart(object);
      if (!part)
        throw new Error(`Missing visceral structure metadata: ${object.name}`);
      object.material = materials.normal[part.category];
      meshCount++;
    });
    if (meshCount < 200)
      throw new Error(`Incomplete visceral model: ${meshCount} parts.`);
    return { scene, scale: anatomyScale, position: anatomyPosition };
  }, [gltf, materials]);
  const [hoveredPart, setHoveredPart] = useState<VisceralPart | null>(null);
  const visibleHoveredPart =
    hoveredPart &&
    isPartVisible(
      hoveredPart,
      system,
      category,
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
        system,
        category,
        selectedPartId,
        isolateSelected,
      );
      object.material =
        part.id === selectedPartId || part.id === visibleHoveredPart?.id
          ? materials.highlighted[part.category]
          : materials.normal[part.category];
    });
    invalidate();
  }, [
    system,
    category,
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
      !isPartVisible(part, system, category, selectedPartId, isolateSelected)
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
      !isPartVisible(part, system, category, selectedPartId, isolateSelected)
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
