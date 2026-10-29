import { useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { VisceralPart } from "./VisceralAtlasModel";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { Icon } from "./Icon";
import { formatVisceralName } from "../utils/visceralName";
import {
  getVisceralFunctionKey,
  getVisceralRouteKey,
} from "../utils/visceralDetails";

export function VisceralDetailsPanel({
  part,
  open,
  isolateSelected,
  onClose,
  onIsolate,
}: {
  part: VisceralPart | null;
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

  const sourceName = formatVisceralName(part.name, "en");
  const name = formatVisceralName(part.name, language);
  const systemLabel = t(
    part.system === "respiratory"
      ? "respiratorySystem"
      : part.system === "digestive"
        ? "digestiveSystem"
        : "sharedSystem",
  );
  const categoryLabel = t(`visceralCategories.${part.category}`);
  const sideLabel = t(
    part.side === "right" ? "right" : part.side === "left" ? "left" : "midline",
  );
  const detailSections = [
    {
      title: t("fields.overview"),
      text: t("visceralDetailsOverview", {
        name: sourceName,
        system: systemLabel,
      }),
    },
    {
      title: t("fields.location"),
      text: t("visceralDetailsLocation", {
        category: categoryLabel,
      }),
    },
    {
      title: t("fields.function"),
      text: t(`visceralFunction.${getVisceralFunctionKey(part)}`),
    },
    {
      title: t("visceralRouteTitle"),
      text: t(`visceralRoute.${getVisceralRouteKey(part)}`),
    },
    {
      title: t("fields.clinical"),
      text: t("visceralDetailsCaveat"),
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
            aria-labelledby="visceral-title"
            initial={
              reduced ? false : { opacity: 0, x: language === "ar" ? -35 : 35 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: language === "ar" ? -25 : 25 }}
            transition={{ duration: 0.24 }}
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <div className="detail-top">
              <span className="eyebrow">{t("visceralDetailsTitle")}</span>
              <button
                className="icon-button"
                onClick={onClose}
                aria-label={t("close")}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="detail-heading">
              <span className="bone-category">{systemLabel}</span>
              <h2 id="visceral-title">{name}</h2>
              {language === "ar" && name !== sourceName && (
                <p className="latin-name" lang="en" dir="ltr">
                  {sourceName}
                </p>
              )}
              <div className="bone-tags">
                <span>{categoryLabel}</span>
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
                {t("isolateVisceralPart")}
              </button>
              <a
                href={`${import.meta.env.BASE_URL}models/visceral-provenance.json`}
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
                <p>{t("visceralDetailsReference")}</p>
                <a
                  href={`${import.meta.env.BASE_URL}models/visceral-provenance.json`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("visceralSourceLink")} ↗
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
