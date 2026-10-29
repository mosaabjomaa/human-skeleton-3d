import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Vector3 } from "three";
import { useReducedMotion } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import { modelRegistry } from "../utils/modelRegistry";
import type {
  CirculationCircuit,
  CirculationFocus,
} from "./CirculatoryAtlasModel";
import type { VisceralFocus, VisceralSystem } from "./VisceralAtlasModel";
export function CameraRig({
  circulationCircuit,
  circulationFocus,
  visceralFocus,
  visceralSystem,
}: {
  circulationCircuit?: CirculationCircuit;
  circulationFocus?: CirculationFocus | null;
  visceralFocus?: VisceralFocus | null;
  visceralSystem?: VisceralSystem;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const selected = useAppStore((state) => state.selectedId);
  const nonce = useAppStore((state) => state.resetNonce);
  const autoRotate = useAppStore((state) => state.autoRotate);
  const view = useAppStore((state) => state.view);
  const reduced = useReducedMotion();
  const flight = useRef<{ eye: Vector3; target: Vector3 } | null>(null);
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      const bone = selected ? modelRegistry.get(selected) : null;
      const focusedPart = circulationFocus ?? visceralFocus;
      let target = new Vector3(0, 1.52, 0),
        eye = new Vector3(0, 1.6, 5.6);
      if (bone) {
        bone.geometry.computeBoundingSphere();
        target = bone.getWorldPosition(new Vector3());
        const radius = bone.geometry.boundingSphere?.radius || 0.1;
        const direction = camera.position
          .clone()
          .sub(controls.current?.target || target)
          .normalize();
        eye = target
          .clone()
          .add(
            direction.multiplyScalar(
              Math.max(0.045, Math.min(2.9, radius * 4.5)),
            ),
          );
      } else if (focusedPart) {
        target.fromArray(focusedPart.position);
        const direction = camera.position
          .clone()
          .sub(controls.current?.target || target);
        if (direction.lengthSq() < 0.0001) direction.set(0, 0, 1);
        eye = target
          .clone()
          .add(
            direction
              .normalize()
              .multiplyScalar(
                Math.max(0.045, Math.min(2.9, focusedPart.radius * 4.5)),
              ),
          );
      } else {
        if (circulationCircuit === "pulmonary") {
          target.set(0, 2.38, 0);
          eye.set(0, 2.38, 0.75);
        }
        if (circulationCircuit === "systemic") eye.set(0, 1.55, 4.8);
        if (visceralSystem === "respiratory") {
          target.set(0, 2.12, 0);
          eye.set(0, 2.12, 3.4);
        }
        if (visceralSystem === "digestive") {
          target.set(0, 1.95, 0);
          eye.set(0, 1.95, 3.4);
        }
        if (view === "back")
          eye.set(
            0,
            target.y,
            circulationCircuit === "pulmonary" ? -0.75 : -5.6,
          );
        if (view === "left")
          eye.set(circulationCircuit === "pulmonary" ? 0.75 : 5.6, target.y, 0);
        if (view === "right")
          eye.set(
            circulationCircuit === "pulmonary" ? -0.75 : -5.6,
            target.y,
            0,
          );
      }
      if (reduced) {
        camera.position.copy(eye);
        controls.current?.target.copy(target);
        controls.current?.update();
      } else flight.current = { eye, target };
      invalidate();
    });
    return () => cancelAnimationFrame(timer);
  }, [
    selected,
    nonce,
    camera,
    invalidate,
    reduced,
    circulationCircuit,
    circulationFocus,
    visceralFocus,
    visceralSystem,
    view,
  ]);
  useFrame((_, delta) => {
    if (!flight.current || !controls.current) return;
    const blend = 1 - Math.exp(-7 * delta);
    camera.position.lerp(flight.current.eye, blend);
    controls.current.target.lerp(flight.current.target, blend);
    controls.current.update();
    if (
      camera.position.distanceTo(flight.current.eye) < 0.0005 &&
      controls.current.target.distanceTo(flight.current.target) < 0.0005
    )
      flight.current = null;
    else invalidate();
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      zoomToCursor
      minDistance={0.025}
      maxDistance={11}
      target={[0, 1.52, 0]}
      autoRotate={autoRotate && !reduced}
      autoRotateSpeed={0.55}
      onStart={() => {
        flight.current = null;
      }}
    />
  );
}
