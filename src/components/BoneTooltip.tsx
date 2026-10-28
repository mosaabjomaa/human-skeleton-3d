import { useCallback, useEffect, useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import { boneById } from "../data/bones";
export function BoneTooltip() {
  const id = useAppStore((s) => s.hoveredId);
  const open = useAppStore((s) => s.panelOpen);
  const language = useAppStore((s) => s.language);
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
    document.documentElement.classList.toggle("bone-hovered", !!id && !open);
    if (id && !open) place();
    return () => document.documentElement.classList.remove("bone-hovered");
  }, [id, open, place]);
  if (!id || open) return null;
  const bone = boneById[id];
  return (
    <div
      className="bone-tooltip"
      role="tooltip"
      ref={ref}
      style={{ opacity: 0 }}
    >
      <span>{bone.latinName}</span>
      <strong>{bone.name[language]}</strong>
      <p>{bone.shortDescription[language]}</p>
    </div>
  );
}
