import { useCallback, useEffect, useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import { boneById } from "../data/bones";
import type { CirculationPart } from "./CirculatoryAtlasModel";
import { formatCirculationName } from "../utils/circulationName";
import { getSpecificFunction } from "../utils/circulationDetails";
import type { VisceralPart } from "./VisceralAtlasModel";
import { formatVisceralName } from "../utils/visceralName";
import { getVisceralFunctionKey } from "../utils/visceralDetails";
import { useTranslation } from "react-i18next";
export function BoneTooltip({
  circulationPart = null,
  circulationDetailsOpen = false,
  visceralPart = null,
  visceralDetailsOpen = false,
}: {
  circulationPart?: CirculationPart | null;
  circulationDetailsOpen?: boolean;
  visceralPart?: VisceralPart | null;
  visceralDetailsOpen?: boolean;
}) {
  const { t } = useTranslation();
  const id = useAppStore((s) => s.hoveredId);
  const panelOpen = useAppStore((s) => s.panelOpen);
  const language = useAppStore((s) => s.language);
  const open = panelOpen || circulationDetailsOpen || visceralDetailsOpen;
  const hovered = !!id || !!circulationPart || !!visceralPart;
  const ref = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const place = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    const width = element.offsetWidth,
      height = element.offsetHeight;
    const x =
      language === "ar"
        ? pointer.current.x - width - 18
        : pointer.current.x + 18;
    element.style.left = `${Math.max(10, Math.min(innerWidth - width - 10, x))}px`;
    element.style.top = `${Math.max(10, Math.min(innerHeight - height - 10, pointer.current.y + 18))}px`;
    element.style.opacity = "1";
  }, [language]);
  useEffect(() => {
    let frame = 0;
    function move(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      pointer.current = { x: event.clientX, y: event.clientY };
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          place();
        });
    }
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
    };
  }, [place]);
  useEffect(() => {
    document.documentElement.classList.toggle("bone-hovered", hovered && !open);
    if (hovered && !open) place();
    return () => document.documentElement.classList.remove("bone-hovered");
  }, [hovered, open, place]);
  const bone = !circulationPart && !visceralPart && id ? boneById[id] : null;
  if ((!bone && !circulationPart && !visceralPart) || open) return null;
  const circulationName = circulationPart
    ? formatCirculationName(circulationPart.name, language)
    : null;
  const circulationType = circulationPart
    ? t(
        circulationPart.type === "artery"
          ? "arteryLabel"
          : circulationPart.type === "vein"
            ? "veinLabel"
            : circulationPart.type === "heart"
              ? "heartLabel"
              : "otherLabel",
      )
    : null;
  const circulationDescription =
    circulationPart && circulationName
      ? t(
          `circulationFunction.${getSpecificFunction(
            circulationPart,
            formatCirculationName(circulationPart.name, "en"),
          )}`,
        )
      : null;
  const visceralName = visceralPart
    ? formatVisceralName(visceralPart.name, language)
    : null;
  const visceralDescription = visceralPart
    ? t(`visceralFunction.${getVisceralFunctionKey(visceralPart)}`)
    : null;
  return (
    <div
      className="bone-tooltip"
      role="tooltip"
      ref={ref}
      style={{ opacity: 0 }}
    >
      <span>
        {bone?.latinName ??
          (circulationPart
            ? `${circulationType} · ${t(
                circulationPart.circuit === "pulmonary"
                  ? "pulmonaryCircuit"
                  : circulationPart.circuit === "systemic"
                    ? "systemicCircuit"
                    : "bothCircuits",
              )}`
            : `${t(`visceralCategories.${visceralPart?.category}`)} · ${t(
                visceralPart?.side === "right"
                  ? "right"
                  : visceralPart?.side === "left"
                    ? "left"
                    : "midline",
              )}`)}
      </span>
      <strong>{bone?.name[language] ?? circulationName ?? visceralName}</strong>
      <p>
        {bone?.shortDescription[language] ??
          circulationDescription ??
          visceralDescription}
      </p>
    </div>
  );
}
