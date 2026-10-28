import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/useAppStore";
import { Icon } from "./Icon";
export function ViewControls() {
  const { t } = useTranslation();
  const isolate = useAppStore((s) => s.isolate);
  const wireframe = useAppStore((s) => s.wireframe);
  const rotate = useAppStore((s) => s.autoRotate);
  const explode = useAppStore((s) => s.explode);
  const selected = useAppStore((s) => s.selectedId);
  return (
    <div className="view-controls">
      <div className="view-controls-title">
        <Icon name="layers" />
        <span>{t("viewControls")}</span>
      </div>
      <label
        className={!selected ? "control-toggle is-disabled" : "control-toggle"}
        title={t("isolateHelp")}
      >
        <span>{t("isolate")}</span>
        <input
          type="checkbox"
          checked={isolate}
          disabled={!selected}
          onChange={() => useAppStore.getState().toggle("isolate")}
        />
        <i />
      </label>
      <label className="control-toggle">
        <span>{t("wireframe")}</span>
        <input
          type="checkbox"
          checked={wireframe}
          onChange={() => useAppStore.getState().toggle("wireframe")}
        />
        <i />
      </label>
      <label className="control-toggle">
        <span>{t("autoRotate")}</span>
        <input
          type="checkbox"
          checked={rotate}
          onChange={() => useAppStore.getState().toggle("autoRotate")}
        />
        <i />
      </label>
      <div className="explode-control">
        <label htmlFor="explode-slider">
          {t("explode")}
          <span>{Math.round(explode * 100)}%</span>
        </label>
        <input
          id="explode-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={explode}
          onChange={(event) =>
            useAppStore.getState().setExplode(Number(event.target.value))
          }
        />
        <div>
          <span>{t("assembled")}</span>
          <span>{t("separated")}</span>
        </div>
      </div>
      <button
        className="reset-button"
        onClick={() => useAppStore.getState().reset()}
      >
        <Icon name="reset" />
        {t("reset")}
      </button>
    </div>
  );
}
