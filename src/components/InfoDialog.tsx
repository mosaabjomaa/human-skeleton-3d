import { useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { Icon } from "./Icon";
export function InfoDialog({
  kind,
  onClose,
}: {
  kind: "help" | "credits";
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  return createPortal(
    <div className="info-overlay">
      <button
        className="info-backdrop"
        onClick={onClose}
        aria-label={t("close")}
        tabIndex={-1}
      />
      <div
        className="info-dialog"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-title"
      >
        <button
          className="icon-button"
          onClick={onClose}
          aria-label={t("close")}
        >
          <Icon name="close" />
        </button>
        <span className="eyebrow">OSSEO / FIELD NOTES</span>
        <h2 id="info-title">
          {t(kind === "help" ? "helpTitle" : "attributionTitle")}
        </h2>
        <p>{t(kind === "help" ? "helpBody" : "attributionBody")}</p>
        {kind === "credits" && (
          <>
            <p>{t("clinicalReview")}</p>
            <a
              href={`${import.meta.env.BASE_URL}CREDITS.md`}
              target="_blank"
              rel="noreferrer"
            >
              {t("licenseLink")} ↗
            </a>
            <a href={`${import.meta.env.BASE_URL}models/skeleton.glb`} download>
              {t("downloadModel")} ↓
            </a>
          </>
        )}
        <button className="primary-button" onClick={onClose}>
          {t("understood")}
          <Icon name="arrow" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
