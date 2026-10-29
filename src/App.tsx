import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
const Scene = lazy(() =>
  import("./components/Scene").then((module) => ({ default: module.Scene })),
);
import { Sidebar } from "./components/Sidebar";
import { ViewControls } from "./components/ViewControls";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { BoneTooltip } from "./components/BoneTooltip";
import { DetailsPanel } from "./components/DetailsPanel";
import { CirculationDetailsPanel } from "./components/CirculationDetailsPanel";
import { VisceralDetailsPanel } from "./components/VisceralDetailsPanel";
import { InfoDialog } from "./components/InfoDialog";
import { Icon } from "./components/Icon";
import { useAppStore } from "./store/useAppStore";
import { boneById } from "./data/bones";
import i18n from "./i18n";
import { XrayLab } from "./components/XrayLab";
import type {
  CirculationCircuit,
  CirculationFocus,
  CirculationPart,
  CirculationVesselType,
} from "./components/CirculatoryAtlasModel";
import { formatCirculationName } from "./utils/circulationName";
import type {
  VisceralCategory,
  VisceralFocus,
  VisceralPart,
  VisceralSystem,
} from "./components/VisceralAtlasModel";
import { formatVisceralName } from "./utils/visceralName";
const BodySystems = lazy(() =>
  import("./components/BodySystems").then((m) => ({ default: m.BodySystems })),
);
const CombinedSystems = lazy(() =>
  import("./components/CombinedSystems").then((m) => ({
    default: m.CombinedSystems,
  })),
);
export default function App() {
  const [allSystemsCombined, setAllSystemsCombined] = useState(false);
  const [additionalSystems, setAdditionalSystems] = useState(false);
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const selectedId = useAppStore((s) => s.selectedId);
  const panelOpen = useAppStore((s) => s.panelOpen);
  const view = useAppStore((s) => s.view);
  const region = useAppStore((s) => s.region);
  const group = useAppStore((s) => s.group);
  const [displayMode, setDisplayMode] = useState<
    "skeleton" | "circulation" | "respiratory" | "digestive" | "combined"
  >("skeleton");
  const circulatoryPreview = displayMode === "circulation";
  const respiratoryPreview = displayMode === "respiratory";
  const digestivePreview = displayMode === "digestive";
  const combinedView = displayMode === "combined";
  const showSkeleton = displayMode === "skeleton" || combinedView;
  const showCirculation = circulatoryPreview || combinedView;
  const showVisceral = respiratoryPreview || digestivePreview || combinedView;
  const visceralSystem: VisceralSystem = respiratoryPreview
    ? "respiratory"
    : digestivePreview
      ? "digestive"
      : "all";
  const [circulationCircuit, setCirculationCircuit] =
    useState<CirculationCircuit>("all");
  const [circulationVesselType, setCirculationVesselType] =
    useState<CirculationVesselType>("all");
  const [circulationPart, setCirculationPart] =
    useState<CirculationPart | null>(null);
  const [circulationFocus, setCirculationFocus] =
    useState<CirculationFocus | null>(null);
  const [hoveredCirculationPart, setHoveredCirculationPart] =
    useState<CirculationPart | null>(null);
  const [isolateCirculationPart, setIsolateCirculationPart] = useState(false);
  const [circulationDetailsOpen, setCirculationDetailsOpen] = useState(false);
  const [visceralCategory, setVisceralCategory] =
    useState<VisceralCategory>("all");
  const [visceralPart, setVisceralPart] = useState<VisceralPart | null>(null);
  const [visceralFocus, setVisceralFocus] = useState<VisceralFocus | null>(
    null,
  );
  const [hoveredVisceralPart, setHoveredVisceralPart] =
    useState<VisceralPart | null>(null);
  const [isolateVisceralPart, setIsolateVisceralPart] = useState(false);
  const [visceralDetailsOpen, setVisceralDetailsOpen] = useState(false);
  const [info, setInfo] = useState<"help" | "credits" | null>(null);
  const [xrayOpen, setXrayOpen] = useState(false);
  const closeXray = useCallback(() => setXrayOpen(false), []);
  const closeInfo = useCallback(() => setInfo(null), []);
  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    const titles = {
      ar: {
        skeleton: "OSSEO — أطلس الهيكل العظمي",
        circulation: "OSSEO — مجسم الدورة الدموية",
        respiratory: "OSSEO — مجسم الجهاز التنفسي",
        digestive: "OSSEO — مجسم الجهاز الهضمي",
        combined: "OSSEO — مجسم تشريحي متكامل",
      },
      en: {
        skeleton: "OSSEO — The human skeleton atlas",
        circulation: "OSSEO — Circulatory system model",
        respiratory: "OSSEO — Respiratory system model",
        digestive: "OSSEO — Digestive system model",
        combined: "OSSEO — Combined anatomy model",
      },
    };
    document.title = titles[language][displayMode];
  }, [language, displayMode]);
  const selected = selectedId ? boneById[selectedId] : null;
  const setMode = (mode: typeof displayMode) => {
    useAppStore.getState().reset();
    setCirculationCircuit("all");
    setCirculationVesselType("all");
    setCirculationPart(null);
    setCirculationFocus(null);
    setHoveredCirculationPart(null);
    setIsolateCirculationPart(false);
    setCirculationDetailsOpen(false);
    setVisceralCategory("all");
    setVisceralPart(null);
    setVisceralFocus(null);
    setHoveredVisceralPart(null);
    setIsolateVisceralPart(false);
    setVisceralDetailsOpen(false);
    setDisplayMode(mode);
  };
  const selectCirculationPart = (
    part: CirculationPart,
    focus: CirculationFocus,
  ) => {
    setHoveredCirculationPart(null);
    setVisceralPart(null);
    setVisceralFocus(null);
    setIsolateVisceralPart(false);
    setVisceralDetailsOpen(false);
    useAppStore.setState({
      selectedId: null,
      panelOpen: false,
      isolate: false,
    });
    setCirculationPart(part);
    setCirculationFocus(focus);
    setIsolateCirculationPart(false);
    setCirculationDetailsOpen(true);
  };
  const selectVisceralPart = (part: VisceralPart, focus: VisceralFocus) => {
    setHoveredVisceralPart(null);
    useAppStore.setState({
      selectedId: null,
      panelOpen: false,
      isolate: false,
    });
    setCirculationPart(null);
    setCirculationFocus(null);
    setIsolateCirculationPart(false);
    setCirculationDetailsOpen(false);
    setVisceralPart(part);
    setVisceralFocus(focus);
    setIsolateVisceralPart(false);
    setVisceralDetailsOpen(true);
  };
  const hoverCirculationPart = useCallback(
    (part: CirculationPart | null) => setHoveredCirculationPart(part),
    [],
  );
  const hoverVisceralPart = useCallback(
    (part: VisceralPart | null) => setHoveredVisceralPart(part),
    [],
  );
  const updateCirculationFilters = (
    circuit: CirculationCircuit,
    vesselType: CirculationVesselType,
  ) => {
    setHoveredCirculationPart(null);
    setCirculationCircuit(circuit);
    setCirculationVesselType(vesselType);
    if (
      circulationPart &&
      ((circuit !== "all" &&
        circulationPart.circuit !== circuit &&
        circulationPart.circuit !== "shared") ||
        (vesselType !== "all" && circulationPart.type !== vesselType))
    ) {
      setCirculationPart(null);
      setCirculationFocus(null);
      setHoveredCirculationPart(null);
      setIsolateCirculationPart(false);
      setCirculationDetailsOpen(false);
    }
  };
  const updateVisceralCategory = (category: VisceralCategory) => {
    setHoveredVisceralPart(null);
    setVisceralCategory(category);
    if (
      visceralPart &&
      category !== "all" &&
      visceralPart.category !== category &&
      !(visceralPart.system === "shared" && category === "tract")
    ) {
      setVisceralPart(null);
      setVisceralFocus(null);
      setIsolateVisceralPart(false);
      setVisceralDetailsOpen(false);
    }
  };
  useEffect(() => {
    return useAppStore.subscribe((state, previous) => {
      if (!state.selectedId || state.selectedId === previous.selectedId) return;
      setCirculationPart(null);
      setCirculationFocus(null);
      setIsolateCirculationPart(false);
      setCirculationDetailsOpen(false);
      setVisceralPart(null);
      setVisceralFocus(null);
      setIsolateVisceralPart(false);
      setVisceralDetailsOpen(false);
    });
  }, []);
  const visceralFilters: VisceralCategory[] =
    visceralSystem === "respiratory"
      ? ["all", "airway", "lung"]
      : visceralSystem === "digestive"
        ? ["all", "tract", "organs"]
        : ["all", "airway", "lung", "tract", "organs"];
  const openCombined = () => {
    useAppStore.getState().reset();
    setAllSystemsCombined(true);
  };
  if (allSystemsCombined)
    return (
      <Suspense fallback={<div className="scene-error">Loading anatomy…</div>}>
        <CombinedSystems onBack={() => setAllSystemsCombined(false)} />
      </Suspense>
    );
  if (additionalSystems)
    return (
      <Suspense fallback={<div className="scene-error">Loading anatomy…</div>}>
        <BodySystems
          onBack={() => setAdditionalSystems(false)}
          onCombine={openCombined}
        />
      </Suspense>
    );
  return (
    <>
      <div
        className="atlas-shell"
        inert={
          panelOpen ||
          circulationDetailsOpen ||
          visceralDetailsOpen ||
          !!info ||
          xrayOpen
        }
      >
        <header className="app-header">
          <a
            className="brand"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              useAppStore.getState().reset();
            }}
          >
            <span className="brand-symbol">
              <Icon
                name={
                  combinedView
                    ? "layers"
                    : circulatoryPreview
                      ? "vessels"
                      : respiratoryPreview
                        ? "lungs"
                        : digestivePreview
                          ? "digestive"
                          : "bone"
                }
              />
            </span>
            <span>
              OSSEO
              <small>
                {combinedView
                  ? t("showCombined")
                  : circulatoryPreview
                    ? t("circulationPreviewName")
                    : respiratoryPreview
                      ? t("respiratoryPreviewName")
                      : digestivePreview
                        ? t("digestivePreviewName")
                        : t("atlas")}
              </small>
            </span>
          </a>
          <div className="header-center">
            <span className="tiny-cross">+</span>
            {t("edition")}
            <span className="header-line" />
          </div>
          <div className="header-actions">
            <button
              className="preview-switch"
              onClick={() => setAdditionalSystems(true)}
            >
              <Icon name="layers" />
              {language === "ar" ? "باقي أجهزة الجسم" : "More body systems"}
            </button>
            <div
              className="display-mode-switch"
              role="group"
              aria-label={t("modelView")}
            >
              {(
                [
                  "skeleton",
                  "circulation",
                  "respiratory",
                  "digestive",
                  "combined",
                ] as const
              ).map((mode) => (
                <button
                  key={mode}
                  className="preview-switch"
                  onClick={() =>
                    mode === "combined" ? openCombined() : setMode(mode)
                  }
                  aria-label={t(
                    mode === "skeleton"
                      ? "showSkeleton"
                      : mode === "circulation"
                        ? "showCirculation"
                        : mode === "respiratory"
                          ? "showRespiratory"
                          : mode === "digestive"
                            ? "showDigestive"
                            : "showCombined",
                  )}
                  title={t(
                    mode === "skeleton"
                      ? "showSkeleton"
                      : mode === "circulation"
                        ? "showCirculation"
                        : mode === "respiratory"
                          ? "showRespiratory"
                          : mode === "digestive"
                            ? "showDigestive"
                            : "showCombined",
                  )}
                  aria-pressed={displayMode === mode}
                >
                  <Icon
                    name={
                      mode === "skeleton"
                        ? "bone"
                        : mode === "circulation"
                          ? "vessels"
                          : mode === "respiratory"
                            ? "lungs"
                            : mode === "digestive"
                              ? "digestive"
                              : "layers"
                    }
                  />
                  <span>
                    {t(
                      mode === "skeleton"
                        ? "showSkeleton"
                        : mode === "circulation"
                          ? "showCirculation"
                          : mode === "respiratory"
                            ? "showRespiratory"
                            : mode === "digestive"
                              ? "showDigestive"
                              : "showCombined",
                    )}
                  </span>
                </button>
              ))}
            </div>
            <button className="xray-entry" onClick={() => setXrayOpen(true)}>
              {language === "ar" ? "مختبر الأشعة" : "X-ray lab"} ↗
            </button>
            <button className="help-button" onClick={() => setInfo("help")}>
              <Icon name="help" />
              <span>{t("help")}</span>
            </button>
            <LanguageSwitcher />
            <button
              className="mobile-only icon-button"
              onClick={() => useAppStore.getState().toggle("sidebarOpen")}
              aria-label={t("toggleSidebar")}
            >
              <Icon name="menu" />
            </button>
          </div>
        </header>
        <main
          className={
            !showSkeleton
              ? "workspace circulatory-preview"
              : combinedView
                ? "workspace combined-preview"
                : "workspace"
          }
        >
          {showSkeleton && <Sidebar />}
          <div className="viewport-area">
            <div className="viewport-heading">
              <span className="eyebrow">
                <i className="status-dot" />
                {t(
                  combinedView
                    ? "combinedEyebrow"
                    : circulatoryPreview
                      ? "circulationEyebrow"
                      : respiratoryPreview
                        ? "respiratoryEyebrow"
                        : digestivePreview
                          ? "digestiveEyebrow"
                          : "explore",
                )}
              </span>
              <h1>
                {t(
                  combinedView
                    ? "combinedHeadline"
                    : circulatoryPreview
                      ? "circulationHeadline"
                      : respiratoryPreview
                        ? "respiratoryHeadline"
                        : digestivePreview
                          ? "digestiveHeadline"
                          : "headline",
                )}
              </h1>
              <p>
                {t(
                  combinedView
                    ? "combinedIntro"
                    : circulatoryPreview
                      ? "circulationIntro"
                      : respiratoryPreview
                        ? "respiratoryIntro"
                        : digestivePreview
                          ? "digestiveIntro"
                          : "intro",
                )}
              </p>
            </div>
            {(showCirculation || showVisceral) && (
              <div className="circulation-tools">
                {showCirculation && (
                  <section className="system-filter-section">
                    <span className="eyebrow">{t("circulationFilter")}</span>
                    <div
                      className="circulation-filter-row"
                      role="group"
                      aria-label={t("circulationFilter")}
                    >
                      {(
                        ["all", "pulmonary", "systemic"] as CirculationCircuit[]
                      ).map((value) => (
                        <button
                          key={value}
                          aria-pressed={circulationCircuit === value}
                          onClick={() =>
                            updateCirculationFilters(
                              value,
                              circulationVesselType,
                            )
                          }
                        >
                          {t(
                            value === "all"
                              ? "allCirculation"
                              : value === "pulmonary"
                                ? "pulmonaryCircuit"
                                : "systemicCircuit",
                          )}
                        </button>
                      ))}
                    </div>
                    <div
                      className="circulation-filter-row vessel-filter-row"
                      role="group"
                      aria-label={t("vesselTypeFilter")}
                    >
                      {(
                        ["all", "artery", "vein"] as CirculationVesselType[]
                      ).map((value) => (
                        <button
                          key={value}
                          aria-pressed={circulationVesselType === value}
                          onClick={() =>
                            updateCirculationFilters(circulationCircuit, value)
                          }
                        >
                          {t(
                            value === "all"
                              ? "allVessels"
                              : value === "artery"
                                ? "arteries"
                                : "veins",
                          )}
                        </button>
                      ))}
                    </div>
                    <label className="circulation-isolate">
                      <input
                        type="checkbox"
                        checked={isolateCirculationPart}
                        disabled={!circulationPart}
                        onChange={() => {
                          setHoveredCirculationPart(null);
                          setIsolateCirculationPart((isolated) => !isolated);
                        }}
                      />
                      <span>{t("isolateCirculationPart")}</span>
                    </label>
                  </section>
                )}
                {showVisceral && (
                  <section
                    className={`system-filter-section visceral-filter-section${
                      visceralSystem === "all" ? " all-system-filters" : ""
                    }`}
                  >
                    <span className="eyebrow">{t("visceralFilter")}</span>
                    <div
                      className="circulation-filter-row"
                      role="group"
                      aria-label={t("visceralFilter")}
                    >
                      {visceralFilters.map((value) => (
                        <button
                          key={value}
                          aria-pressed={visceralCategory === value}
                          onClick={() => updateVisceralCategory(value)}
                        >
                          {t(
                            value === "all"
                              ? "allCirculation"
                              : `visceralCategories.${value}`,
                          )}
                        </button>
                      ))}
                    </div>
                    <label className="circulation-isolate">
                      <input
                        type="checkbox"
                        checked={isolateVisceralPart}
                        disabled={!visceralPart}
                        onChange={() => {
                          setHoveredVisceralPart(null);
                          setIsolateVisceralPart((isolated) => !isolated);
                        }}
                      />
                      <span>{t("isolateVisceralPart")}</span>
                    </label>
                  </section>
                )}
              </div>
            )}
            <div
              className={
                showCirculation || showVisceral
                  ? "viewer circulation-viewer"
                  : "viewer"
              }
            >
              <Suspense
                fallback={
                  <div className="atlas-loader">
                    <div className="loader-symbol">✳</div>
                    <h2>{t("loading")}</h2>
                    <p>
                      {t(
                        combinedView
                          ? "combinedLoadingDetail"
                          : circulatoryPreview
                            ? "circulationLoadingDetail"
                            : showVisceral
                              ? "visceralLoadingDetail"
                              : "loadingDetail",
                      )}
                    </p>
                  </div>
                }
              >
                <Scene
                  showSkeleton={showSkeleton}
                  showCirculation={showCirculation}
                  showVisceral={showVisceral}
                  circuit={circulationCircuit}
                  vesselType={circulationVesselType}
                  selectedPartId={circulationPart?.id ?? null}
                  circulationFocus={circulationFocus}
                  isolateSelected={isolateCirculationPart}
                  onSelectPart={selectCirculationPart}
                  onHoverPart={hoverCirculationPart}
                  visceralSystem={visceralSystem}
                  visceralCategory={visceralCategory}
                  selectedVisceralPartId={visceralPart?.id ?? null}
                  isolateVisceralSelected={isolateVisceralPart}
                  visceralFocus={visceralFocus}
                  onSelectVisceralPart={selectVisceralPart}
                  onHoverVisceralPart={hoverVisceralPart}
                />
              </Suspense>
              {showSkeleton && (
                <div className="vertical-measure" aria-hidden="true">
                  <span>01</span>
                  <i />
                  <span>206</span>
                </div>
              )}
              <div
                className="orientation-switch"
                role="group"
                aria-label={t("viewControls")}
              >
                {(["front", "back", "left", "right"] as const).map((value) => (
                  <button
                    key={value}
                    aria-pressed={view === value}
                    onClick={() => {
                      setCirculationFocus(null);
                      setVisceralFocus(null);
                      useAppStore.getState().setView(value);
                    }}
                  >
                    {t(value)}
                  </button>
                ))}
              </div>
              {showCirculation || showVisceral ? (
                <div className="viewer-legend circulation-legend">
                  {combinedView && (
                    <>
                      <span className="legend-dot" />
                      {t("boneCount")}
                    </>
                  )}
                  {showCirculation && (
                    <>
                      <span className="vessel-key artery-key" />
                      {t("arteryCount")}
                      <span className="vessel-key vein-key" />
                      {t("veinCount")}
                      <span className="vessel-key heart-key" />
                      {t("heartCount")}
                    </>
                  )}
                  {showVisceral && (
                    <>
                      <span className="visceral-key airway-key" />
                      {t("respiratorySystem")}
                      <span className="visceral-key digestive-key" />
                      {t("digestiveSystem")}
                    </>
                  )}
                  <small>
                    {combinedView
                      ? t("combinedDisclaimer")
                      : showCirculation
                        ? t("circulationDisclaimer")
                        : t("visceralDisclaimer")}
                  </small>
                </div>
              ) : (
                <div className="viewer-legend">
                  <span className="legend-dot" />
                  {t("modelVerified")}
                  <small>{t("modelInfo")}</small>
                </div>
              )}
            </div>
            {showSkeleton && <ViewControls />}
            {showCirculation && circulationPart ? (
              <div className="selection-strip circulation-selection">
                <span className="selection-icon">
                  <Icon name="vessels" />
                </span>
                <div>
                  <span className="eyebrow">{t("selectedStructure")}</span>
                  <strong>
                    {formatCirculationName(circulationPart.name, language)}
                  </strong>
                  <small>
                    {`${t(
                      circulationPart.type === "artery"
                        ? "arteryLabel"
                        : circulationPart.type === "vein"
                          ? "veinLabel"
                          : circulationPart.type === "heart"
                            ? "heartLabel"
                            : "otherLabel",
                    )} · ${t(
                      circulationPart.circuit === "pulmonary"
                        ? "pulmonaryCircuit"
                        : circulationPart.circuit === "systemic"
                          ? "systemicCircuit"
                          : "bothCircuits",
                    )} · ${t(
                      circulationPart.side === "right"
                        ? "right"
                        : circulationPart.side === "left"
                          ? "left"
                          : "midline",
                    )}`}
                  </small>
                </div>
                <button
                  className="selection-open"
                  onClick={() => setCirculationDetailsOpen(true)}
                >
                  {t("openDetails")}
                  <Icon name="arrow" />
                </button>
                <button
                  className="selection-open circulation-clear"
                  onClick={() => {
                    setCirculationPart(null);
                    setCirculationFocus(null);
                    setIsolateCirculationPart(false);
                    setCirculationDetailsOpen(false);
                  }}
                  aria-label={t("clearSelection")}
                  title={t("clearSelection")}
                >
                  <Icon name="close" />
                </button>
              </div>
            ) : showVisceral && visceralPart ? (
              <div className="selection-strip circulation-selection visceral-selection">
                <span className="selection-icon">
                  <Icon
                    name={
                      visceralPart.system === "digestive"
                        ? "digestive"
                        : "lungs"
                    }
                  />
                </span>
                <div>
                  <span className="eyebrow">{t("selectedStructure")}</span>
                  <strong>
                    {formatVisceralName(visceralPart.name, language)}
                  </strong>
                  <small>
                    {`${t(
                      visceralPart.system === "respiratory"
                        ? "respiratorySystem"
                        : visceralPart.system === "digestive"
                          ? "digestiveSystem"
                          : "sharedSystem",
                    )} · ${t(
                      `visceralCategories.${visceralPart.category}`,
                    )} · ${t(
                      visceralPart.side === "right"
                        ? "right"
                        : visceralPart.side === "left"
                          ? "left"
                          : "midline",
                    )}`}
                  </small>
                </div>
                <button
                  className="selection-open"
                  onClick={() => setVisceralDetailsOpen(true)}
                >
                  {t("openDetails")}
                  <Icon name="arrow" />
                </button>
                <button
                  className="selection-open circulation-clear"
                  onClick={() => {
                    setVisceralPart(null);
                    setVisceralFocus(null);
                    setIsolateVisceralPart(false);
                    setVisceralDetailsOpen(false);
                  }}
                  aria-label={t("clearSelection")}
                  title={t("clearSelection")}
                >
                  <Icon name="close" />
                </button>
              </div>
            ) : showCirculation && !showSkeleton && !showVisceral ? (
              <div className="selection-strip circulation-selection">
                <span className="selection-icon">
                  <Icon name="vessels" />
                </span>
                <div>
                  <span className="eyebrow">{t("selectedStructure")}</span>
                  <strong>{t("selectCirculationPart")}</strong>
                  <small>
                    {t(
                      circulationCircuit === "pulmonary"
                        ? "pulmonaryFlow"
                        : circulationCircuit === "systemic"
                          ? "systemicFlow"
                          : "completeFlow",
                    )}
                  </small>
                </div>
              </div>
            ) : showVisceral && !showSkeleton ? (
              <div className="selection-strip circulation-selection visceral-selection">
                <span className="selection-icon">
                  <Icon name={digestivePreview ? "digestive" : "lungs"} />
                </span>
                <div>
                  <span className="eyebrow">{t("selectedStructure")}</span>
                  <strong>{t("selectVisceralPart")}</strong>
                  <small>
                    {t(
                      `visceralRoute.${
                        visceralSystem === "respiratory"
                          ? "respiratoryRoute"
                          : "digestiveRoute"
                      }`,
                    )}
                  </small>
                </div>
              </div>
            ) : (
              <div className="selection-strip">
                <span className="selection-icon">
                  <Icon name={selected ? "bone" : "focus"} />
                </span>
                <div>
                  <span className="eyebrow">{t("selection")}</span>
                  <strong>
                    {selected
                      ? selected.name[language]
                      : t(combinedView ? "selectCombinedPart" : "noneSelected")}
                  </strong>
                  <small>
                    {selected
                      ? selected.latinName
                      : t(combinedView ? "combinedHint" : "hint")}
                  </small>
                </div>
                {selected ? (
                  <button
                    className="selection-open"
                    onClick={() => useAppStore.setState({ panelOpen: true })}
                  >
                    {t("openDetails")}
                    <Icon name="arrow" />
                  </button>
                ) : (
                  <span className="selection-number">
                    {combinedView ? "206 + 676 + 220" : "206"}
                    <span>↗</span>
                  </span>
                )}
              </div>
            )}
            <div className="viewer-help">
              <span className="desktop-controls">{t("controls")}</span>
              <span className="touch-controls">{t("touchControls")}</span>
              <span>
                <i className="status-dot" />
                {t(
                  region === "all" && group === "all"
                    ? "allVisible"
                    : "filtered",
                )}
              </span>
            </div>
          </div>
        </main>
        <footer className="app-footer">
          <span>
            {t(
              combinedView
                ? "combinedDisclaimer"
                : showCirculation
                  ? "circulationDisclaimer"
                  : showVisceral
                    ? "visceralDisclaimer"
                    : "education",
            )}
          </span>
          {!showCirculation && (
            <button onClick={() => setInfo("credits")}>
              {t("modelCredit")} ↗
            </button>
          )}
          <span>{t("copyright")}</span>
        </footer>
      </div>
      <BoneTooltip
        circulationPart={hoveredCirculationPart}
        circulationDetailsOpen={circulationDetailsOpen}
        visceralPart={hoveredVisceralPart}
        visceralDetailsOpen={visceralDetailsOpen}
      />
      <DetailsPanel />
      <CirculationDetailsPanel
        part={circulationPart}
        open={circulationDetailsOpen}
        isolateSelected={isolateCirculationPart}
        onClose={() => setCirculationDetailsOpen(false)}
        onIsolate={() => setIsolateCirculationPart((isolated) => !isolated)}
      />
      <VisceralDetailsPanel
        part={visceralPart}
        open={visceralDetailsOpen}
        isolateSelected={isolateVisceralPart}
        onClose={() => setVisceralDetailsOpen(false)}
        onIsolate={() => setIsolateVisceralPart((isolated) => !isolated)}
      />
      {info && <InfoDialog kind={info} onClose={closeInfo} />}
      {xrayOpen && <XrayLab onClose={closeXray} />}
    </>
  );
}
