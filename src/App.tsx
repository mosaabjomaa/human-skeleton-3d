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
export default function App() {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const selectedId = useAppStore((s) => s.selectedId);
  const panelOpen = useAppStore((s) => s.panelOpen);
  const view = useAppStore((s) => s.view);
  const region = useAppStore((s) => s.region);
  const group = useAppStore((s) => s.group);
  const [displayMode, setDisplayMode] = useState<
    "skeleton" | "circulation" | "combined"
  >("skeleton");
  const circulatoryPreview = displayMode === "circulation";
  const combinedView = displayMode === "combined";
  const showSkeleton = displayMode !== "circulation";
  const showCirculation = displayMode !== "skeleton";
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
        combined: "OSSEO — مجسم تشريحي متكامل",
      },
      en: {
        skeleton: "OSSEO — The human skeleton atlas",
        circulation: "OSSEO — Circulatory system model",
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
    setDisplayMode(mode);
  };
  const selectCirculationPart = (
    part: CirculationPart,
    focus: CirculationFocus,
  ) => {
    setHoveredCirculationPart(null);
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
  const hoverCirculationPart = useCallback(
    (part: CirculationPart | null) => setHoveredCirculationPart(part),
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
  useEffect(() => {
    return useAppStore.subscribe((state, previous) => {
      if (!state.selectedId || state.selectedId === previous.selectedId) return;
      setCirculationPart(null);
      setCirculationFocus(null);
      setIsolateCirculationPart(false);
      setCirculationDetailsOpen(false);
    });
  }, []);
  return (
    <>
      <div
        className="atlas-shell"
        inert={panelOpen || circulationDetailsOpen || !!info || xrayOpen}
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
            <div
              className="display-mode-switch"
              role="group"
              aria-label={t("modelView")}
            >
              {(["skeleton", "circulation", "combined"] as const).map(
                (mode) => (
                  <button
                    key={mode}
                    className="preview-switch"
                    onClick={() => setMode(mode)}
                    aria-label={t(
                      mode === "skeleton"
                        ? "showSkeleton"
                        : mode === "circulation"
                          ? "showCirculation"
                          : "showCombined",
                    )}
                    title={t(
                      mode === "skeleton"
                        ? "showSkeleton"
                        : mode === "circulation"
                          ? "showCirculation"
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
                            : "layers"
                      }
                    />
                    <span>
                      {t(
                        mode === "skeleton"
                          ? "showSkeleton"
                          : mode === "circulation"
                            ? "showCirculation"
                            : "showCombined",
                      )}
                    </span>
                  </button>
                ),
              )}
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
            circulatoryPreview
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
                      : "explore",
                )}
              </span>
              <h1>
                {t(
                  combinedView
                    ? "combinedHeadline"
                    : circulatoryPreview
                      ? "circulationHeadline"
                      : "headline",
                )}
              </h1>
              <p>
                {t(
                  combinedView
                    ? "combinedIntro"
                    : circulatoryPreview
                      ? "circulationIntro"
                      : "intro",
                )}
              </p>
            </div>
            {showCirculation && (
              <div className="circulation-tools">
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
                        updateCirculationFilters(value, circulationVesselType)
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
                  {(["all", "artery", "vein"] as CirculationVesselType[]).map(
                    (value) => (
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
                    ),
                  )}
                </div>
                <label className="circulation-isolate">
                  <input
                    type="checkbox"
                    checked={isolateCirculationPart}
                    disabled={!circulationPart}
                    onChange={() => {
                      setHoveredCirculationPart(null);
                      setIsolateCirculationPart((isolated) => !isolated)
                    }}
                  />
                  <span>{t("isolateCirculationPart")}</span>
                </label>
              </div>
            )}
            <div
              className={
                showCirculation ? "viewer circulation-viewer" : "viewer"
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
                            : "loadingDetail",
                      )}
                    </p>
                  </div>
                }
              >
                <Scene
                  showSkeleton={showSkeleton}
                  showCirculation={showCirculation}
                  circuit={circulationCircuit}
                  vesselType={circulationVesselType}
                  selectedPartId={circulationPart?.id ?? null}
                  circulationFocus={circulationFocus}
                  isolateSelected={isolateCirculationPart}
                  onSelectPart={selectCirculationPart}
                  onHoverPart={hoverCirculationPart}
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
                      useAppStore.getState().setView(value);
                    }}
                  >
                    {t(value)}
                  </button>
                ))}
              </div>
              {showCirculation ? (
                <div className="viewer-legend circulation-legend">
                  {combinedView && (
                    <>
                      <span className="legend-dot" />
                      {t("boneCount")}
                    </>
                  )}
                  <span className="vessel-key artery-key" />
                  {t("arteryCount")}
                  <span className="vessel-key vein-key" />
                  {t("veinCount")}
                  <span className="vessel-key heart-key" />
                  {t("heartCount")}
                  <small>{t("circulationDisclaimer")}</small>
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
            ) : showCirculation && !showSkeleton ? (
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
                    {combinedView ? "206 + 676" : "206"}
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
            {t(showCirculation ? "circulationDisclaimer" : "education")}
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
      />
      <DetailsPanel />
      <CirculationDetailsPanel
        part={circulationPart}
        open={circulationDetailsOpen}
        isolateSelected={isolateCirculationPart}
        onClose={() => setCirculationDetailsOpen(false)}
        onIsolate={() => setIsolateCirculationPart((isolated) => !isolated)}
      />
      {info && <InfoDialog kind={info} onClose={closeInfo} />}
      {xrayOpen && <XrayLab onClose={closeXray} />}
    </>
  );
}
