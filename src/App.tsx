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
import { InfoDialog } from "./components/InfoDialog";
import { Icon } from "./components/Icon";
import { useAppStore } from "./store/useAppStore";
import { boneById } from "./data/bones";
import i18n from "./i18n";
import { XrayLab } from "./components/XrayLab";
export default function App() {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const selectedId = useAppStore((s) => s.selectedId);
  const panelOpen = useAppStore((s) => s.panelOpen);
  const view = useAppStore((s) => s.view);
  const region = useAppStore((s) => s.region);
  const group = useAppStore((s) => s.group);
  const [info, setInfo] = useState<"help" | "credits" | null>(null);
  const [xrayOpen, setXrayOpen] = useState(false);
  const closeXray = useCallback(() => setXrayOpen(false), []);
  const closeInfo = useCallback(() => setInfo(null), []);
  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.title =
      language === "ar"
        ? "OSSEO — أطلس الهيكل العظمي"
        : "OSSEO — The human skeleton atlas";
  }, [language]);
  const selected = selectedId ? boneById[selectedId] : null;
  return (
    <>
      <div className="atlas-shell" inert={panelOpen || !!info || xrayOpen}>
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
              <Icon name="bone" />
            </span>
            <span>
              OSSEO<small>{t("atlas")}</small>
            </span>
          </a>
          <div className="header-center">
            <span className="tiny-cross">+</span>
            {t("edition")}
            <span className="header-line" />
          </div>
          <div className="header-actions">
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
        <main className="workspace">
          <Sidebar />
          <div className="viewport-area">
            <div className="viewport-heading">
              <span className="eyebrow">
                <i className="status-dot" />
                {t("explore")}
              </span>
              <h1>{t("headline")}</h1>
              <p>{t("intro")}</p>
            </div>
            <div className="viewer">
              <Suspense
                fallback={
                  <div className="atlas-loader">
                    <div className="loader-symbol">✳</div>
                    <h2>{t("loading")}</h2>
                    <p>{t("loadingDetail")}</p>
                  </div>
                }
              >
                <Scene />
              </Suspense>
              <div className="vertical-measure" aria-hidden="true">
                <span>01</span>
                <i />
                <span>206</span>
              </div>
              <div
                className="orientation-switch"
                role="group"
                aria-label={t("viewControls")}
              >
                {(["front", "back", "left", "right"] as const).map((value) => (
                  <button
                    key={value}
                    aria-pressed={view === value}
                    onClick={() => useAppStore.getState().setView(value)}
                  >
                    {t(value)}
                  </button>
                ))}
              </div>
              <div className="viewer-legend">
                <span className="legend-dot" />
                {t("modelVerified")}
                <small>{t("modelInfo")}</small>
              </div>
            </div>
            <ViewControls />
            <div className="selection-strip">
              <span className="selection-icon">
                <Icon name={selected ? "bone" : "focus"} />
              </span>
              <div>
                <span className="eyebrow">{t("selection")}</span>
                <strong>
                  {selected ? selected.name[language] : t("noneSelected")}
                </strong>
                <small>{selected ? selected.latinName : t("hint")}</small>
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
                  206<span>↗</span>
                </span>
              )}
            </div>
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
          <span>{t("education")}</span>
          <button onClick={() => setInfo("credits")}>
            {t("modelCredit")} ↗
          </button>
          <span>{t("copyright")}</span>
        </footer>
      </div>
      <BoneTooltip />
      <DetailsPanel />
      {info && <InfoDialog kind={info} onClose={closeInfo} />}
      {xrayOpen && <XrayLab onClose={closeXray} />}
    </>
  );
}
