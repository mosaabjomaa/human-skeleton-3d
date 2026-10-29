import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ErrorBoundary } from "react-error-boundary";
import { Anatomy, PartDetails } from "./BodySystems";
import {
  bodyParts,
  bodySystems,
  partName,
  systemInfo,
} from "../data/bodySystems";
import type { BodyPart, BodySystem } from "../data/bodySystems";
import { SkeletonModel } from "./SkeletonModel";
import { CirculatoryAtlasModel } from "./CirculatoryAtlasModel";
import type {
  CirculationFocus,
  CirculationPart,
} from "./CirculatoryAtlasModel";
import { VisceralAtlasModel } from "./VisceralAtlasModel";
import type { VisceralPart } from "./VisceralAtlasModel";
import { CameraRig } from "./CameraRig";
import { Loader } from "./Loader";
import { DetailsPanel } from "./DetailsPanel";
import { CirculationDetailsPanel } from "./CirculationDetailsPanel";
import { VisceralDetailsPanel } from "./VisceralDetailsPanel";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Icon } from "./Icon";
import { useAppStore } from "../store/useAppStore";
import "./CombinedSystems.css";

type Layer =
  BodySystem | "skeleton" | "circulation" | "respiratory" | "digestive";
const layers: Layer[] = [
  "skeleton",
  "circulation",
  "respiratory",
  "digestive",
  ...bodySystems,
];
const core: Record<string, [string, string]> = {
  skeleton: ["Skeleton", "الهيكل العظمي"],
  circulation: ["Circulatory system", "الدورة الدموية"],
  respiratory: ["Respiratory system", "الجهاز التنفسي"],
  digestive: ["Digestive system", "الجهاز الهضمي"],
};
function label(layer: Layer, ar: boolean) {
  return (
    core[layer]?.[ar ? 1 : 0] ||
    systemInfo[layer as BodySystem].name[ar ? 1 : 0]
  );
}
const ids = new Set(bodyParts.map((p) => p.id));

export function CombinedSystems({ onBack }: { onBack: () => void }) {
  const [layersOpen, setLayersOpen] = useState(false);
  const ar = useAppStore((s) => s.language) === "ar";
  const bonePanel = useAppStore((s) => s.panelOpen),
    autoRotate = useAppStore((s) => s.autoRotate),
    wire = useAppStore((s) => s.wireframe);
  const [visible, setVisible] = useState<Record<Layer, boolean>>(
    () =>
      Object.fromEntries(layers.map((l) => [l, true])) as Record<
        Layer,
        boolean
      >,
  );
  const [opacity, setOpacity] = useState<Record<BodySystem, number>>(
    () =>
      Object.fromEntries(
        bodySystems.map((s) => [
          s,
          s === "integumentary" ? 0.06 : s === "muscular" ? 0.18 : 1,
        ]),
      ) as Record<BodySystem, number>,
  );
  const [body, setBody] = useState<BodyPart | null>(null),
    [bodyFocus, setBodyFocus] = useState<CirculationFocus | null>(null),
    [bodyPanel, setBodyPanel] = useState(false),
    [bodyIsolate, setBodyIsolate] = useState(false);
  const [circulation, setCirculation] = useState<CirculationPart | null>(null),
    [circulationFocus, setCirculationFocus] = useState<CirculationFocus | null>(
      null,
    ),
    [circulationPanel, setCirculationPanel] = useState(false),
    [circulationIsolate, setCirculationIsolate] = useState(false);
  const [visceral, setVisceral] = useState<VisceralPart | null>(null),
    [visceralFocus, setVisceralFocus] = useState<CirculationFocus | null>(null),
    [visceralPanel, setVisceralPanel] = useState(false),
    [visceralIsolate, setVisceralIsolate] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);
  const modal = bonePanel || bodyPanel || circulationPanel || visceralPanel;
  const hideHover = useCallback(() => {}, []);
  function clear() {
    setBody(null);
    setBodyFocus(null);
    setBodyPanel(false);
    setBodyIsolate(false);
    setCirculation(null);
    setCirculationFocus(null);
    setCirculationPanel(false);
    setCirculationIsolate(false);
    setVisceral(null);
    setVisceralFocus(null);
    setVisceralPanel(false);
    setVisceralIsolate(false);
    setSelectedLayer(null);
  }
  useEffect(
    () =>
      useAppStore.subscribe((s, p) => {
        if (s.selectedId && s.selectedId !== p.selectedId) {
          clear();
          setSelectedLayer("skeleton");
        }
      }),
    [],
  );
  function chooseBody(p: BodyPart, f?: CirculationFocus) {
    clear();
    useAppStore.setState({
      selectedId: null,
      panelOpen: false,
      autoRotate: false,
    });
    setBody(p);
    setBodyFocus(f || null);
    setBodyPanel(true);
    setSelectedLayer(p.system);
  }
  function chooseCirculation(p: CirculationPart, f: CirculationFocus) {
    clear();
    useAppStore.setState({
      selectedId: null,
      panelOpen: false,
      autoRotate: false,
    });
    setCirculation(p);
    setCirculationFocus(f);
    setCirculationPanel(true);
    setSelectedLayer("circulation");
  }
  function chooseVisceral(p: VisceralPart, f: CirculationFocus) {
    clear();
    useAppStore.setState({
      selectedId: null,
      panelOpen: false,
      autoRotate: false,
    });
    setVisceral(p);
    setVisceralFocus(f);
    setVisceralPanel(true);
    setSelectedLayer(p.system === "shared" ? "respiratory" : p.system);
  }
  function toggle(layer: Layer) {
    clear();
    useAppStore.getState().reset();
    setVisible((v) => ({ ...v, [layer]: !v[layer] }));
  }
  const anyIsolate = bodyIsolate || circulationIsolate || visceralIsolate;
  const show = (layer: Layer) =>
    visible[layer] && (!anyIsolate || selectedLayer === layer);
  const visceralSystem =
    show("respiratory") && show("digestive")
      ? "all"
      : show("respiratory")
        ? "respiratory"
        : "digestive";
  const enabledCount = layers.filter((l) => visible[l]).length;
  const bodyIds = useMemo(
    () => (bodyIsolate && body ? new Set([body.id]) : ids),
    [bodyIsolate, body],
  );
  return (
    <>
      <div
        className="combined-atlas body-atlas"
        dir={ar ? "rtl" : "ltr"}
        inert={modal}
      >
        <header className="app-header">
          <button
            className="brand body-back"
            onClick={() => {
              useAppStore.getState().reset();
              onBack();
            }}
          >
            <Icon name="arrow" />
            OSSEO <small>{ar ? "رجوع" : "Back"}</small>
          </button>
          <h1>{ar ? "دمج كل الأجهزة" : "All systems combined"}</h1>
          <LanguageSwitcher />
        </header>
        <div className="merged-mobile-toolbar">
          <button
            aria-expanded={layersOpen}
            aria-controls="merged-layer-panel"
            onClick={() => setLayersOpen((v) => !v)}
          >
            <Icon name="layers" />
            {ar ? "الأجهزة والشفافية" : "Layers and opacity"}
            <span>{layersOpen ? "−" : "+"}</span>
          </button>
        </div>
        <main className="merged-workspace">
          <aside
            id="merged-layer-panel"
            className={`merged-layers ${layersOpen ? "is-open" : ""}`}
          >
            <div className="eyebrow">{ar ? "طبقات الجسم" : "BODY LAYERS"}</div>
            <h2>{ar ? "11 جهازًا في مجسم واحد" : "11 systems, one model"}</h2>
            <p>
              {ar
                ? "تحكم بكل جهاز على حدة. الجلد والعضلات شبه شفافين لإظهار البنى الداخلية."
                : "Control each layer. Skin and muscles start translucent to reveal internal anatomy."}
            </p>
            <div className="merged-layer-actions">
              <button
                onClick={() => {
                  clear();
                  useAppStore.getState().reset();
                  setVisible(
                    Object.fromEntries(layers.map((l) => [l, true])) as Record<
                      Layer,
                      boolean
                    >,
                  );
                }}
              >
                {ar ? "إظهار الكل" : "Show all"}
              </button>
              <button
                onClick={() => {
                  clear();
                  useAppStore.getState().reset();
                  setVisible(
                    Object.fromEntries(layers.map((l) => [l, false])) as Record<
                      Layer,
                      boolean
                    >,
                  );
                }}
              >
                {ar ? "إخفاء الكل" : "Hide all"}
              </button>
            </div>
            {layers.map((layer) => (
              <div className="merged-layer" key={layer}>
                <label>
                  <input
                    type="checkbox"
                    checked={visible[layer]}
                    onChange={() => toggle(layer)}
                  />
                  <span
                    aria-hidden="true"
                    style={{
                      color: core[layer]
                        ? "#c1dbb5"
                        : systemInfo[layer as BodySystem].color,
                    }}
                  >
                    ●
                  </span>
                  {label(layer, ar)}
                </label>
                {!core[layer] && visible[layer] && (
                  <label className="merged-opacity">
                    {ar ? "العتامة" : "Opacity"}
                    <input
                      type="range"
                      min="0.03"
                      max="1"
                      step="0.01"
                      value={opacity[layer as BodySystem]}
                      aria-label={`${label(layer, ar)} ${ar ? "العتامة" : "opacity"}`}
                      onChange={(e) =>
                        setOpacity((v) => ({
                          ...v,
                          [layer]: Number(e.target.value),
                        }))
                      }
                    />
                    <output>
                      {Math.round(opacity[layer as BodySystem] * 100)}%
                    </output>
                  </label>
                )}
              </div>
            ))}
            <p>
              {ar
                ? "الطبقات الخارجية الشفافة تسمح بالنقر على الأعضاء خلفها. ارفع عتامة جهاز أو أخفِ ما أمامه لاختيار أجزائه."
                : "Translucent outer layers allow clicks through to inner organs. Increase a layer’s opacity or hide layers in front to select its structures."}
            </p>
            <small>
              {ar
                ? "التناسلي المعروض ذكري فقط. العرض تعليمي ولا يمثل كل التفاصيل المجهرية."
                : "Reproductive anatomy is male only. Educational model; microscopic detail is not complete."}
            </small>
          </aside>
          <section className="merged-viewer">
            <div className="merged-caption">
              {enabledCount}/11 {ar ? "أجهزة ظاهرة" : "systems enabled"} ·{" "}
              {ar
                ? "اسحب للدوران ومرر للتكبير"
                : "Drag to rotate · Scroll to zoom"}
            </div>
            <ErrorBoundary
              fallback={
                <div className="body-error" role="alert">
                  {ar
                    ? "تعذر تحميل المجسم. حدّث الصفحة أو جرّب عرض الأجهزة منفردة."
                    : "Model failed to load. Refresh or use individual system views."}
                </div>
              }
            >
              <Canvas
                className="merged-canvas"
                dpr={[1, 1.25]}
                frameloop={autoRotate ? "always" : "demand"}
                camera={{
                  position: [0, 1.6, 5.6],
                  fov: 36,
                  near: 0.001,
                  far: 50,
                }}
              >
                <ambientLight intensity={0.65} />
                <hemisphereLight args={["#eef7e9", "#1c392c", 1.4]} />
                <directionalLight position={[3, 5, 4]} intensity={2.4} />
                <directionalLight
                  position={[-3, 2, -3]}
                  color="#9dddc6"
                  intensity={1.4}
                />
                <Suspense fallback={null}>
                  {show("skeleton") && <SkeletonModel />}
                  {show("circulation") && (
                    <CirculatoryAtlasModel
                      wireframe={wire}
                      circuit="all"
                      vesselType="all"
                      selectedPartId={circulation?.id || null}
                      isolateSelected={circulationIsolate}
                      onSelectPart={chooseCirculation}
                      onHoverPart={hideHover}
                    />
                  )}
                  {(show("respiratory") || show("digestive")) && (
                    <VisceralAtlasModel
                      wireframe={wire}
                      system={visceralSystem}
                      category="all"
                      selectedPartId={visceral?.id || null}
                      isolateSelected={visceralIsolate}
                      onSelectPart={chooseVisceral}
                      onHoverPart={hideHover}
                    />
                  )}
                  {bodySystems
                    .filter((s) => show(s))
                    .map((s) => (
                      <Anatomy
                        key={s}
                        system={s}
                        category="all"
                        selected={body?.id || null}
                        isolate={bodyIsolate}
                        wireframe={wire}
                        rotate={false}
                        reset={0}
                        visibleIds={bodyIds}
                        onSelect={chooseBody}
                        onHover={hideHover}
                        cameraOwner={false}
                        opacity={opacity[s]}
                      />
                    ))}
                </Suspense>
                <CameraRig
                  circulationFocus={circulationFocus}
                  visceralFocus={bodyFocus || visceralFocus}
                />
              </Canvas>
              <Loader />
            </ErrorBoundary>
            {!enabledCount && (
              <p className="merged-empty">
                {ar
                  ? "كل الأجهزة مخفية. اختر جهازًا أو اضغط إظهار الكل."
                  : "All systems are hidden. Enable a layer or choose Show all."}
              </p>
            )}
            <div className="merged-controls">
              <button
                onClick={() => {
                  clear();
                  useAppStore.getState().reset();
                }}
              >
                {ar ? "إعادة العرض" : "Reset view"}
              </button>
              <label>
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={() => useAppStore.getState().toggle("autoRotate")}
                />
                {ar ? "دوران تلقائي" : "Auto rotate"}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={wire}
                  onChange={() => useAppStore.getState().toggle("wireframe")}
                />
                {ar ? "شبكة المجسم" : "Wireframe"}
              </label>
              {anyIsolate && (
                <button
                  onClick={() => {
                    setBodyIsolate(false);
                    setCirculationIsolate(false);
                    setVisceralIsolate(false);
                  }}
                >
                  {ar ? "إنهاء العزل" : "Exit isolation"}
                </button>
              )}
              {body && (
                <button onClick={() => setBodyPanel(true)}>
                  {partName(body, ar)}
                </button>
              )}
            </div>
          </section>
        </main>
      </div>
      <DetailsPanel />
      <CirculationDetailsPanel
        part={circulation}
        open={circulationPanel}
        isolateSelected={circulationIsolate}
        onClose={() => setCirculationPanel(false)}
        onIsolate={() => setCirculationIsolate(true)}
      />
      <VisceralDetailsPanel
        part={visceral}
        open={visceralPanel}
        isolateSelected={visceralIsolate}
        onClose={() => setVisceralPanel(false)}
        onIsolate={() => setVisceralIsolate(true)}
      />
      {bodyPanel && body && (
        <PartDetails
          part={body}
          ar={ar}
          onClose={() => setBodyPanel(false)}
          onIsolate={() => setBodyIsolate(true)}
        />
      )}
    </>
  );
}
