import { useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { bones, boneById } from "../data/bones";
import type { DetailKey } from "../data/types";
import { useAppStore } from "../store/useAppStore";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { Icon } from "./Icon";
const fields: DetailKey[] = [
  "overview",
  "location",
  "landmarks",
  "function",
  "articulations",
  "muscles",
  "supply",
  "clinical",
  "development",
  "fact",
];
export function DetailsPanel() {
  const { t } = useTranslation();
  const id = useAppStore((s) => s.selectedId);
  const open = useAppStore((s) => s.panelOpen);
  const language = useAppStore((s) => s.language);
  const close = useAppStore((s) => s.closePanel);
  const isolate = useAppStore((s) => s.isolate);
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useFocusTrap(ref, open, close);
  const bone = id ? boneById[id] : null;
  if (!bone) return null;
  const related = bones.filter((item) => item.group === bone.group);
  const index = related.findIndex((item) => item.id === id);
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
            onClick={close}
          />
          <motion.aside
            ref={ref}
            className="details-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bone-title"
            initial={
              reduced ? false : { opacity: 0, x: language === "ar" ? -35 : 35 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: language === "ar" ? -25 : 25 }}
            transition={{ duration: 0.24 }}
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <div className="detail-top">
              <span className="eyebrow">{t("selection")}</span>
              <button
                className="icon-button"
                onClick={close}
                aria-label={t("close")}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="detail-heading">
              <span className="bone-category">{t(`groups.${bone.group}`)}</span>
              <h2 id="bone-title">{bone.name[language]}</h2>
              <p className="latin-name" lang="la" dir="ltr">
                {bone.latinName}
              </p>
              <div className="bone-tags">
                <span>{t(`types.${bone.boneType}`)}</span>
                <span>{t(bone.side)}</span>
                <span>{t(bone.region)}</span>
              </div>
            </div>
            <div className="detail-actions">
              <button
                className={isolate ? "active" : ""}
                onClick={() => {
                  useAppStore.getState().toggle("isolate");
                  close();
                }}
              >
                <Icon name="focus" />
                {t("isolate")}
              </button>
              <a
                href={`${import.meta.env.BASE_URL}models/provenance.json`}
                target="_blank"
                rel="noreferrer"
              >
                ID / {bone.id}
              </a>
            </div>
            <div className="detail-scroll">
              {fields.map((field) => (
                <details
                  key={field}
                  open={field === "overview" || field === "location"}
                  className="anatomy-section"
                >
                  <summary>
                    {t(`fields.${field}`)}
                    <span>+</span>
                  </summary>
                  <p>{bone.details[language][field]}</p>
                </details>
              ))}
              <div className="reference-card">
                <span className="eyebrow">{t("reference")}</span>
                <p>{t("regionalNote")}</p>
                <p>{t("clinicalReview")}</p>
                <a href={bone.sources[0]} target="_blank" rel="noreferrer">
                  {t("sources")} ↗
                </a>
              </div>
            </div>
            <div className="related-navigation">
              <button
                onClick={() =>
                  useAppStore
                    .getState()
                    .selectBone(
                      related[(index - 1 + related.length) % related.length].id,
                    )
                }
                aria-label={t("previous")}
              >
                <Icon name="chevron" className="previous-chevron" />
                {t("previous")}
              </button>
              <span>
                {index + 1} / {related.length}
              </span>
              <button
                onClick={() =>
                  useAppStore
                    .getState()
                    .selectBone(related[(index + 1) % related.length].id)
                }
                aria-label={t("next")}
              >
                {t("next")}
                <Icon name="chevron" />
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
