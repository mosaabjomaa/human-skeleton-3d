import { memo, useEffect, useMemo } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import {
  Box3,
  Float32BufferAttribute,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";
import type { BufferGeometry } from "three";
import { boneById } from "../data/bones";
import { boneMap } from "../data/boneMap";
import { useAppStore } from "../store/useAppStore";
import type { AppState } from "../store/useAppStore";
export interface ModelPart {
  id: string;
  geometry: BufferGeometry;
  center: Vector3;
  radius: number;
}
import { modelRegistry } from "../utils/modelRegistry";

export function SkeletonModel() {
  const gltf = useLoader(
    GLTFLoader,
    `${import.meta.env.BASE_URL}models/skeleton.glb`,
    (loader) => loader.setMeshoptDecoder(MeshoptDecoder),
  );
  const invalidate = useThree((state) => state.invalidate);
  const parts = useMemo(() => {
    gltf.scene.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(gltf.scene);
    const size = bounds.getSize(new Vector3());
    const scale = 3.1 / size.y;
    const origin = bounds.getCenter(new Vector3());
    const normalize = new Matrix4()
      .makeScale(scale, scale, scale)
      .multiply(
        new Matrix4().makeTranslation(-origin.x, -bounds.min.y, -origin.z),
      );
    const result: ModelPart[] = [];
    gltf.scene.traverse((object) => {
      if (!(object instanceof Mesh) || !boneMap[object.name]) return;
      const geometry = object.geometry.clone();
      // Meshopt quantizes positions to normalized integers. Bake transforms only
      // after expanding them to floating point, otherwise transformed values wrap.
      for (const semantic of ["position", "normal"]) {
        const attribute = geometry.getAttribute(semantic);
        if (!attribute) continue;
        const values = new Float32Array(attribute.count * 3);
        for (let i = 0; i < attribute.count; i++) {
          values[i * 3] = attribute.getX(i);
          values[i * 3 + 1] = attribute.getY(i);
          values[i * 3 + 2] = attribute.getZ(i);
        }
        geometry.setAttribute(semantic, new Float32BufferAttribute(values, 3));
      }
      geometry.applyMatrix4(object.matrixWorld).applyMatrix4(normalize);
      geometry.computeBoundingBox();
      const center = geometry.boundingBox!.getCenter(new Vector3());
      geometry.translate(-center.x, -center.y, -center.z);
      geometry.computeBoundingSphere();
      result.push({
        id: boneMap[object.name],
        geometry,
        center,
        radius: geometry.boundingSphere!.radius,
      });
    });
    if (result.length !== 206)
      throw new Error(`Invalid atlas: ${result.length} mapped bones.`);
    return result;
  }, [gltf]);
  const materials = useMemo(
    () => ({
      normal: new MeshStandardMaterial({
        color: "#d4dbd5",
        roughness: 0.52,
        metalness: 0.06,
      }),
      hover: new MeshStandardMaterial({
        color: "#b5efe2",
        emissive: "#1e6b5a",
        emissiveIntensity: 0.22,
        roughness: 0.42,
      }),
      selected: new MeshStandardMaterial({
        color: "#a4f3dd",
        emissive: "#1e7b65",
        emissiveIntensity: 0.4,
        roughness: 0.4,
      }),
      dim: new MeshStandardMaterial({
        color: "#6a827e",
        transparent: true,
        opacity: 0.23,
        depthWrite: false,
        roughness: 0.65,
      }),
    }),
    [],
  );
  useEffect(() => {
    function update(state: AppState, previous?: AppState) {
      const structural =
        !previous ||
        state.selectedId !== previous.selectedId ||
        state.region !== previous.region ||
        state.group !== previous.group ||
        state.isolate !== previous.isolate ||
        state.explode !== previous.explode ||
        state.wireframe !== previous.wireframe;
      if (!structural && state.hoveredId === previous?.hoveredId) return;
      Object.values(materials).forEach((material) => {
        if (material.wireframe !== state.wireframe) {
          material.wireframe = state.wireframe;
          material.needsUpdate = true;
        }
      });
      for (const part of parts) {
        if (
          !structural &&
          part.id !== state.hoveredId &&
          part.id !== previous?.hoveredId
        )
          continue;
        const mesh = modelRegistry.get(part.id);
        if (!mesh) continue;
        const bone = boneById[part.id];
        mesh.visible =
          (state.region === "all" || bone.region === state.region) &&
          (state.group === "all" || bone.group === state.group) &&
          (!state.isolate || !state.selectedId || part.id === state.selectedId);
        mesh.material =
          part.id === state.selectedId
            ? materials.selected
            : part.id === state.hoveredId
              ? materials.hover
              : state.selectedId
                ? materials.dim
                : materials.normal;
        const offset = part.center
          .clone()
          .sub(new Vector3(0, 1.5, 0))
          .multiplyScalar(state.explode * 0.35);
        mesh.position.copy(part.center).add(offset);
      }
      invalidate();
    }
    update(useAppStore.getState());
    const unsubscribe = useAppStore.subscribe((state, previous) =>
      update(state, previous),
    );
    return () => {
      unsubscribe();
      Object.values(materials).forEach((material) => material.dispose());
    };
  }, [parts, materials, invalidate]);
  useEffect(
    () => () => {
      parts.forEach((part) => part.geometry.dispose());
    },
    [parts],
  );
  return (
    <group>
      {parts.map((part) => (
        <BoneMesh key={part.id} part={part} material={materials.normal} />
      ))}
    </group>
  );
}
const BoneMesh = memo(function BoneMesh({
  part,
  material,
}: {
  part: ModelPart;
  material: MeshStandardMaterial;
}) {
  return (
    <mesh
      name={part.id}
      geometry={part.geometry}
      material={material}
      position={part.center}
      ref={(mesh) => {
        if (mesh) modelRegistry.set(part.id, mesh);
        else modelRegistry.delete(part.id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        useAppStore.getState().setHovered(part.id);
      }}
      onPointerOut={() => {
        if (useAppStore.getState().hoveredId === part.id)
          useAppStore.getState().setHovered(null);
      }}
      onClick={(event) => {
        event.stopPropagation();
        useAppStore.getState().selectBone(part.id);
      }}
    />
  );
});
