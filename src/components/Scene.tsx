import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Bvh, Environment, Grid, Lightformer } from "@react-three/drei";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { SkeletonModel } from "./SkeletonModel";
import { CameraRig } from "./CameraRig";
import { Loader } from "./Loader";
import { useAppStore } from "../store/useAppStore";
function SceneError() {
  const { t } = useTranslation();
  return (
    <div className="scene-error">
      <span>◇</span>
      <h2>{t("errorTitle")}</h2>
      <p>{t("errorText")}</p>
      <button onClick={() => location.reload()}>{t("retry")}</button>
    </div>
  );
}
export function Scene() {
  const { t } = useTranslation();
  return (
    <ErrorBoundary fallback={<SceneError />}>
      <div className="canvas-shell" role="img" aria-label={t("modelLabel")}>
        <Canvas
          camera={{ position: [0, 1.6, 5.6], fov: 36, near: 0.001, far: 60 }}
          dpr={[1, 1.5]}
          frameloop="demand"
          fallback={<SceneError />}
          onPointerMissed={() => useAppStore.getState().setHovered(null)}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.setClearColor("#071b1b", 0);
          }}
        >
          <ambientLight intensity={0.55} />
          <hemisphereLight args={["#dcf1e9", "#143831", 1.3]} />
          <directionalLight
            position={[3, 5, 4]}
            intensity={2.3}
            color="#fff3d9"
          />
          <directionalLight
            position={[-4, 2, -3]}
            intensity={1.7}
            color="#7fd7c1"
          />
          <Suspense fallback={null}>
            <Environment resolution={64}>
              <Lightformer
                intensity={1.5}
                position={[0, 4, 3]}
                scale={[5, 5, 1]}
              />
              <Lightformer
                intensity={1}
                color="#a5dfd0"
                position={[-3, 1, -2]}
                scale={[3, 5, 1]}
              />
            </Environment>
            <Bvh firstHitOnly>
              <SkeletonModel />
            </Bvh>
          </Suspense>
          <Grid
            position={[0, -0.02, 0]}
            args={[12, 12]}
            cellSize={0.25}
            cellThickness={0.35}
            cellColor="#1b3c37"
            sectionSize={1}
            sectionThickness={0.65}
            sectionColor="#34564d"
            fadeDistance={7}
            fadeStrength={2}
            infiniteGrid
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <circleGeometry args={[0.52, 48]} />
            <meshBasicMaterial color="#4b9b7d" transparent opacity={0.06} />
          </mesh>
          <CameraRig />
        </Canvas>
        <Loader />
      </div>
    </ErrorBoundary>
  );
}
