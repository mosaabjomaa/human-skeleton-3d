import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";
import { ErrorBoundary } from "react-error-boundary";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { Box3, Mesh, MeshStandardMaterial, Vector3 } from "three";
import type { Object3D } from "three";
import type { OrbitControls as Controls } from "three-stdlib";
import {
  bodyParts,
  bodySystems,
  categories,
  partFunction,
  partName,
  systemInfo,
} from "../data/bodySystems";
import type { BodyPart, BodySystem } from "../data/bodySystems";
import { anatomyPosition, anatomyScale } from "../utils/anatomyTransform";
import { useAppStore } from "../store/useAppStore";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Icon } from "./Icon";
import { useFocusTrap } from "../hooks/useFocusTrap";
import "./BodySystems.css";

const assets: Record<BodySystem, string> = {
  lymphatic: "lymphatic.glb",
  muscular: "muscles.glb",
  nervous: "nerves.glb",
  integumentary: "skin.glb",
  urinary: "visceral-extra.glb",
  reproductive: "visceral-extra.glb",
  endocrine: "visceral-extra.glb",
};
const partById = new Map(bodyParts.map((p) => [p.id, p]));
function BodyLoading({ ar }: { ar: boolean }) {
  const { active, progress } = useProgress();
  return active ? (
    <div className="body-loading body-progress" role="status">
      {ar ? "جاري تحميل المجسم…" : "Loading anatomy…"} {Math.round(progress)}%
    </div>
  ) : null;
}
function metadata(object: Object3D): BodyPart | undefined {
  let o: Object3D | null = object;
  while (o) {
    const p = partById.get(o.userData.partId);
    if (p) return p;
    o = o.parent;
  }
  return undefined;
}

export function Anatomy({
  system,
  category,
  selected,
  isolate,
  wireframe,
  rotate,
  reset,
  visibleIds,
  onSelect,
  onHover,
  cameraOwner = true,
  opacity = 1,
}: {
  system: BodySystem;
  category: string;
  selected: string | null;
  isolate: boolean;
  wireframe: boolean;
  rotate: boolean;
  reset: number;
  visibleIds: Set<string>;
  onSelect: (
    p: BodyPart,
    focus?: { id: string; position: [number, number, number]; radius: number },
  ) => void;
  onHover: (p: BodyPart | null) => void;
  cameraOwner?: boolean;
  opacity?: number;
}) {
  const gltf = useLoader(
    GLTFLoader,
    `${import.meta.env.BASE_URL}models/${assets[system]}`,
    (l) => l.setMeshoptDecoder(MeshoptDecoder),
  );
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);
  const { camera, invalidate } = useThree();
  const controls = useRef<Controls>(null);
  const materials = useMemo(
    () => ({
      normal: new MeshStandardMaterial({
        color: systemInfo[system].color,
        roughness: 0.48,
      }),
      selected: new MeshStandardMaterial({
        color: "#fff0d9",
        emissive: systemInfo[system].color,
        emissiveIntensity: 0.6,
        roughness: 0.4,
      }),
    }),
    [system],
  );
  const [hover, setHover] = useState<string | null>(null);
  useEffect(
    () => () => {
      materials.normal.dispose();
      materials.selected.dispose();
    },
    [materials],
  );
  useEffect(() => {
    for (const m of Object.values(materials)) m.wireframe = wireframe;
    const transparencyChanged = materials.normal.transparent !== opacity < 1;
    Object.assign(materials.normal, {
      opacity,
      transparent: opacity < 1,
      depthWrite: opacity >= 1,
    });
    if (transparencyChanged)
      Object.assign(materials.normal, { needsUpdate: true });
    scene.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const p = metadata(o);
      o.visible =
        !!p &&
        p.system === system &&
        visibleIds.has(p.id) &&
        (!isolate || !selected || p.id === selected);
      o.material =
        p?.id === selected || p?.id === hover
          ? materials.selected
          : materials.normal;
    });
    invalidate();
  }, [
    scene,
    system,
    category,
    selected,
    isolate,
    wireframe,
    hover,
    materials,
    invalidate,
    visibleIds,
    opacity,
  ]);
  useEffect(() => {
    if (!cameraOwner) return;
    scene.updateWorldMatrix(true, true);
    const bounds = new Box3();
    scene.traverse((o) => {
      if (
        o instanceof Mesh &&
        o.visible &&
        (!selected || metadata(o)?.id === selected)
      )
        bounds.union(new Box3().setFromObject(o));
    });
    if (bounds.isEmpty()) return;
    const center = bounds.getCenter(new Vector3()),
      size = bounds.getSize(new Vector3());
    const distance = Math.max(
      0.12,
      Math.max(
        size.y,
        size.x / ("aspect" in camera ? camera.aspect : 1),
        size.z,
      ) * 1.8,
    );
    camera.position.copy(center).add(new Vector3(0, 0, distance));
    controls.current?.target.copy(center);
    controls.current?.update();
    invalidate();
  }, [
    scene,
    selected,
    system,
    category,
    reset,
    isolate,
    visibleIds,
    camera,
    invalidate,
    cameraOwner,
  ]);
  const handle = (e: ThreeEvent<MouseEvent>) => {
    const p = metadata(e.object);
    if (!p || !visibleIds.has(p.id) || opacity < 0.3) return;
    e.stopPropagation();
    e.object.updateWorldMatrix(true, false);
    const box = new Box3().setFromObject(e.object),
      center = box.getCenter(new Vector3());
    onSelect(p, {
      id: p.id,
      position: [center.x, center.y, center.z],
      radius: box.getSize(new Vector3()).length() / 2,
    });
  };
  return (
    <>
      {cameraOwner && (
        <>
          <ambientLight intensity={1} />
          <hemisphereLight args={["#f4f5ee", "#293c34", 1.5]} />
          <directionalLight position={[3, 4, 5]} intensity={2.5} />
          <directionalLight
            position={[-3, 2, -3]}
            intensity={1.5}
            color="#a5dfd0"
          />
        </>
      )}
      <group scale={anatomyScale} position={anatomyPosition}>
        <primitive
          object={scene}
          onClick={handle}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            const p = metadata(e.object);
            if (p && visibleIds.has(p.id) && opacity >= 0.3) {
              e.stopPropagation();
              setHover(p.id);
              onHover(p);
            }
          }}
          onPointerOut={() => {
            setHover(null);
            onHover(null);
          }}
        />
      </group>
      {cameraOwner && (
        <OrbitControls
          ref={controls}
          makeDefault
          enableDamping
          autoRotate={rotate}
          autoRotateSpeed={0.6}
          minDistance={0.04}
          maxDistance={15}
        />
      )}
    </>
  );
}

export function PartDetails({
  part,
  ar,
  onClose,
  onIsolate,
}: {
  part: BodyPart;
  ar: boolean;
  onClose: () => void;
  onIsolate: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  useFocusTrap(ref, true, onClose);
  const i = ar ? 1 : 0,
    info = systemInfo[part.system];
  const sections: [string, string][] = [
    [
      ar ? "نظرة عامة" : "Overview",
      `${partName(part, ar)} — ${info.name[i]}. ${info.overview[i]}`,
    ],
    [
      ar ? "الموقع والعلاقات" : "Location and relationships",
      `${info.location[i]} ${ar ? "الجهة:" : "Side:"} ${part.side === "midline" ? (ar ? "وسطي أو غير محدد في المصدر" : "Midline / unspecified in source") : part.side === "left" ? (ar ? "يسار" : "Left") : ar ? "يمين" : "Right"}.`,
    ],
    [ar ? "الوظيفة" : "Function", partFunction(part, ar)],
    [
      ar ? "التصنيف التشريحي" : "Anatomical grouping",
      `${categories[part.category]?.[i] || part.category}. ${ar ? "التصنيف يساعد على تصفية العرض، ولا يصف كل العلاقات المجهرية." : "This category supports filtering; it does not describe every microscopic relationship."}`,
    ],
    [ar ? "آلية العمل" : "Functional route", info.route[i]],
    [ar ? "حدود التمثيل" : "Representation limits", info.limit[i]],
    [
      ar ? "ملاحظات سريرية" : "Clinical context",
      ar
        ? "موضع البنية وعلاقتها بالجوار مهمان للفحص والتصوير. لا يبيّن المجسم وظيفة النسيج أو شدة إصابة أو تشخيصًا؛ يلزم التقييم السريري المناسب."
        : "Location and neighboring structures matter in examination and imaging. The model cannot establish tissue function, injury severity or a diagnosis.",
    ],
  ];
  return (
    <div className="detail-overlay">
      <button
        className="detail-backdrop"
        tabIndex={-1}
        aria-label={ar ? "إغلاق التفاصيل" : "Close details"}
        onClick={onClose}
      />
      <aside
        ref={ref}
        className="details-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="body-part-title"
        dir={ar ? "rtl" : "ltr"}
      >
        <div className="detail-top">
          <span className="eyebrow">
            OSSEO / {ar ? "تفاصيل البنية" : "STRUCTURE NOTES"}
          </span>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label={ar ? "إغلاق" : "Close"}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="detail-heading">
          <span className="bone-category">{info.name[i]}</span>
          <h2 id="body-part-title">{partName(part, ar)}</h2>
          <p className="latin-name" lang="en" dir="ltr">
            {part.name}
          </p>
          <div className="bone-tags">
            <span>{categories[part.category]?.[i] || part.category}</span>
            <span>{part.id}</span>
          </div>
        </div>
        <div className="detail-actions">
          <button
            onClick={() => {
              onIsolate();
              onClose();
            }}
          >
            <Icon name="focus" />
            {ar ? "عزل الجزء" : "Isolate structure"}
          </button>
        </div>
        <div className="detail-scroll">
          {sections.map(([title, text], n) => (
            <details className="anatomy-section" key={title} open={n < 3}>
              <summary>
                {title}
                <span>+</span>
              </summary>
              <p>{text}</p>
            </details>
          ))}
          <div className="reference-card">
            <span className="eyebrow">{ar ? "المصادر" : "REFERENCES"}</span>
            <p>
              {ar
                ? "الشرح الوظيفي عام للجهاز أو الفئة، وليس وصفًا متخصصًا مستقلًا لكل سطح تشريحي. الاسم الأصلي محفوظ حين لا تتوفر ترجمة موثقة."
                : "Functional notes apply to the organ/system or category; surface landmarks do not each have separate physiological functions. Original names are preserved where a verified translation is unavailable."}
            </p>
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://openstax.org/books/anatomy-and-physiology-2e/pages/${info.source}`}
            >
              OpenStax Anatomy & Physiology ↗
            </a>
            <a
              target="_blank"
              rel="noreferrer"
              href={`${import.meta.env.BASE_URL}models/body-systems-provenance.json`}
            >
              {ar ? "مصدر المجسم وترخيصه" : "Model provenance and license"} ↗
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function BodySystems({
  onBack,
  onCombine,
}: {
  onBack: () => void;
  onCombine?: () => void;
}) {
  const ar = useAppStore((s) => s.language) === "ar",
    i = ar ? 1 : 0;
  const [system, setSystem] = useState<BodySystem>("muscular"),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<BodyPart | null>(null),
    [hover, setHover] = useState<BodyPart | null>(null),
    [details, setDetails] = useState(false),
    [isolate, setIsolate] = useState(false),
    [wire, setWire] = useState(false),
    [rotate, setRotate] = useState(false),
    [reset, setReset] = useState(0);
  const all = useMemo(
    () => bodyParts.filter((p) => p.system === system),
    [system],
  );
  const filtered = useMemo(
    () =>
      all.filter(
        (p) =>
          (category === "all" || p.category === category) &&
          `${p.name} ${partName(p, true)} ${p.id}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [all, category, query],
  );
  const visibleIds = useMemo(
    () => new Set(filtered.map((p) => p.id)),
    [filtered],
  );
  const info = systemInfo[system];
  function switchSystem(next: BodySystem) {
    setSystem(next);
    setQuery("");
    setCategory("all");
    setSelected(null);
    setHover(null);
    setDetails(false);
    setIsolate(false);
    setRotate(false);
    setReset((n) => n + 1);
  }
  function choose(p: BodyPart) {
    setSelected(p);
    setIsolate(false);
    setDetails(true);
    setRotate(false);
  }
  return (
    <>
      <div className="body-atlas" dir={ar ? "rtl" : "ltr"} inert={details}>
        <header className="app-header">
          <button className="brand body-back" onClick={onBack}>
            <Icon name="bone" />
            OSSEO <small>{ar ? "الأجهزة السابقة" : "Previous systems"}</small>
          </button>
          <span className="eyebrow">
            {ar ? "أجهزة جسم الإنسان" : "HUMAN BODY SYSTEMS"}
          </span>
          <LanguageSwitcher />
          {onCombine && (
            <button className="preview-switch" onClick={onCombine}>
              {ar ? "دمج كل الأجهزة" : "Combine all systems"}
            </button>
          )}
        </header>
        <nav
          className="body-tabs"
          aria-label={ar ? "اختيار الجهاز" : "Select body system"}
        >
          {bodySystems.map((s) => (
            <button
              key={s}
              aria-pressed={s === system}
              onClick={() => switchSystem(s)}
              style={{
                borderColor: s === system ? systemInfo[s].color : undefined,
              }}
            >
              {systemInfo[s].name[i]}
            </button>
          ))}
        </nav>
        <main className="body-workspace">
          <aside className="body-browser">
            <div className="eyebrow">
              {ar ? "مكتبة البنى التشريحية" : "STRUCTURE LIBRARY"}
            </div>
            <h2>{info.name[i]}</h2>
            <p>{info.overview[i]}</p>
            <label>
              {ar ? "ابحث بالاسم أو المعرّف" : "Search name or ID"}
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(null);
                  setIsolate(false);
                }}
                placeholder={ar ? "ابحث عن جزء…" : "Find a structure…"}
              />
            </label>
            <label>
              {ar ? "التصنيف" : "Category"}
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSelected(null);
                  setIsolate(false);
                }}
              >
                <option value="all">{categories.all[i]}</option>
                {[...new Set(all.map((p) => p.category))].map((c) => (
                  <option key={c} value={c}>
                    {categories[c]?.[i] || c}
                  </option>
                ))}
              </select>
            </label>
            <div className="body-count" aria-live="polite">
              {filtered.length} / {all.length}{" "}
              {ar ? "بنية قابلة للاختيار" : "selectable structures"}
            </div>
            <div className="body-list">
              {filtered.length === 0 ? (
                <p>
                  {ar
                    ? "لا توجد نتائج مطابقة. جرّب الاسم الأصلي أو امسح الفلتر."
                    : "No matches. Try the original name or clear the filter."}
                </p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    className={selected?.id === p.id ? "active" : ""}
                    onClick={() => choose(p)}
                    title={p.name}
                  >
                    <strong>{partName(p, ar)}</strong>
                    <small>{p.name}</small>
                  </button>
                ))
              )}
            </div>
          </aside>
          <section className="body-viewer">
            <div className="body-heading">
              <span className="eyebrow">
                {ar ? "أطلس تشريحي تفاعلي" : "INTERACTIVE ANATOMY ATLAS"}
              </span>
              <h1>{info.name[i]}</h1>
              <p>{info.limit[i]}</p>
            </div>
            <ErrorBoundary
              key={system}
              fallback={
                <div role="alert" className="body-error">
                  {ar
                    ? "تعذر تحميل المجسم. أعد فتح الجهاز أو حدّث الصفحة."
                    : "Model could not load. Reopen the system or refresh the page."}
                </div>
              }
            >
              <Canvas
                className="body-canvas"
                frameloop={rotate ? "always" : "demand"}
                dpr={[1, 1.5]}
                camera={{
                  position: [0, 1.5, 5.6],
                  near: 0.001,
                  far: 50,
                  fov: 36,
                }}
              >
                <Suspense fallback={null}>
                  <Anatomy
                    key={system}
                    system={system}
                    category={category}
                    selected={selected?.id || null}
                    isolate={isolate}
                    wireframe={wire}
                    rotate={rotate}
                    reset={reset}
                    visibleIds={visibleIds}
                    onSelect={choose}
                    onHover={setHover}
                  />
                </Suspense>
              </Canvas>
              <BodyLoading ar={ar} />
            </ErrorBoundary>
            <div className="body-hover" aria-live="polite">
              {hover
                ? partName(hover, ar)
                : selected
                  ? partName(selected, ar)
                  : ar
                    ? "اختر جزءًا من المجسم أو القائمة"
                    : "Select a structure on the model or in the list"}
            </div>
            <div className="body-controls">
              <button
                onClick={() => {
                  setSelected(null);
                  setIsolate(false);
                  setReset((n) => n + 1);
                }}
              >
                {ar ? "إعادة العرض" : "Reset view"}
              </button>
              <label>
                <input
                  type="checkbox"
                  checked={wire}
                  onChange={(e) => setWire(e.target.checked)}
                />
                {ar ? "شبكة المجسم" : "Wireframe"}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={rotate}
                  onChange={(e) => setRotate(e.target.checked)}
                />
                {ar ? "دوران تلقائي" : "Auto rotate"}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={isolate}
                  disabled={!selected}
                  onChange={(e) => setIsolate(e.target.checked)}
                />
                {ar ? "عزل المحدد" : "Isolate selection"}
              </label>
              {selected && (
                <button onClick={() => setDetails(true)}>
                  {ar ? "تفاصيل الجزء" : "Structure details"}
                </button>
              )}
            </div>
            <p className="body-hint">
              {ar
                ? "اسحب للدوران • مرر للتكبير • بإصبعين للتكبير والتحريك"
                : "Drag to rotate · Scroll to zoom · Pinch/pan on touch screens"}
            </p>
          </section>
        </main>
        <footer className="app-footer">
          <span>
            {ar
              ? "للتعليم التشريحي. لا يستخدم للتشخيص."
              : "Anatomy education. Not for diagnosis."}
          </span>
          <a
            href={`${import.meta.env.BASE_URL}models/body-systems-provenance.json`}
            target="_blank"
            rel="noreferrer"
          >
            Z-Anatomy / BodyParts3D ↗
          </a>
        </footer>
      </div>
      {details && selected && (
        <PartDetails
          part={selected}
          ar={ar}
          onClose={() => setDetails(false)}
          onIsolate={() => setIsolate(true)}
        />
      )}
    </>
  );
}
