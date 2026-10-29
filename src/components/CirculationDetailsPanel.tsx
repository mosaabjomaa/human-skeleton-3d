import { useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { CirculationPart } from "./CirculatoryAtlasModel";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { Icon } from "./Icon";
import { formatCirculationName } from "../utils/circulationName";
import { getSpecificFunction } from "../utils/circulationDetails";

export function CirculationDetailsPanel({
  part,
  open,
  isolateSelected,
  onClose,
  onIsolate,
}: {
  part: CirculationPart | null;
  open: boolean;
  isolateSelected: boolean;
  onClose: () => void;
  onIsolate: () => void;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useFocusTrap(ref, open, onClose);
  if (!part) return null;

  const sourceName = formatCirculationName(part.name, "en");
  const name = formatCirculationName(
    part.name,
    language === "ar" ? "ar" : "en",
  );
  const typeLabel = t(
    part.type === "artery"
      ? "arteryLabel"
      : part.type === "vein"
        ? "veinLabel"
        : part.type === "heart"
          ? "heartLabel"
          : "otherLabel",
  );
  const circuitLabel = t(
    part.circuit === "pulmonary"
      ? "pulmonaryCircuit"
      : part.circuit === "systemic"
        ? "systemicCircuit"
        : "bothCircuits",
  );
  const sideLabel = t(
    part.side === "right" ? "right" : part.side === "left" ? "left" : "midline",
  );
  const route = t(
    part.circuit === "pulmonary"
      ? "pulmonaryFlow"
      : part.circuit === "systemic"
        ? "systemicFlow"
        : "completeFlow",
  );
  const detailSections = [
    {
      title: t("fields.overview"),
      text: t("circulationDetailsOverview", { name: sourceName }),
    },
    {
      title: t("fields.location"),
      text: t("circulationDetailsLocation", {
        name: sourceName,
        side: sideLabel,
        circuit: circuitLabel,
      }),
    },
    {
      title: t("fields.function"),
      text: t(`circulationFunction.${getSpecificFunction(part, sourceName)}`),
    },
    { title: t("circulationRouteTitle"), text: route },
    {
      title: t("fields.clinical"),
      text: t("circulationDetailsCaveat"),
    },
  ];

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="detail-overlay">
          <motion.button
            className="detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label={t("close")}
            tabIndex={-1}
            onClick={onClose}
          />
          <motion.aside
            ref={ref}
            className="details-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="circulation-title"
            initial={
              reduced ? false : { opacity: 0, x: language === "ar" ? -35 : 35 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: language === "ar" ? -25 : 25 }}
            transition={{ duration: 0.24 }}
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <div className="detail-top">
              <span className="eyebrow">{t("circulationDetailsTitle")}</span>
              <button
                className="icon-button"
                onClick={onClose}
                aria-label={t("close")}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="detail-heading">
              <span className="bone-category">{typeLabel}</span>
              <h2 id="circulation-title">{name}</h2>
              {language === "ar" && name !== sourceName && (
                <p className="latin-name" lang="en" dir="ltr">
                  {sourceName}
                </p>
              )}
              <div className="bone-tags">
                <span>{circuitLabel}</span>
                <span>{sideLabel}</span>
              </div>
            </div>
            <div className="detail-actions">
              <button
                className={isolateSelected ? "active" : ""}
                onClick={() => {
                  onIsolate();
                  onClose();
                }}
              >
                <Icon name="focus" />
                {t("isolateCirculationPart")}
              </button>
              <a
                href={`${import.meta.env.BASE_URL}models/circulatory-provenance.json`}
                target="_blank"
                rel="noreferrer"
              >
                ID / {part.id}
              </a>
            </div>
            <div className="detail-scroll">
              {detailSections.map((section, index) => (
                <details
                  key={section.title}
                  open={index < 4}
                  className="anatomy-section"
                >
                  <summary>
                    {section.title}
                    <span>+</span>
                  </summary>
                  <p>{section.text}</p>
                </details>
              ))}
              <div className="reference-card">
                <span className="eyebrow">{t("reference")}</span>
                <p>{t("circulationDetailsReference")}</p>
                <a
                  href={`${import.meta.env.BASE_URL}models/circulatory-provenance.json`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("circulationSourceLink")} ↗
                </a>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
