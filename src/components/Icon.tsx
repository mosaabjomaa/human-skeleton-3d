import type { SVGProps } from "react";
const paths: Record<string, string> = {
  search: "M21 21L16 16M18 10A8 8 0 1 1 2 10A8 8 0 1 1 18 10",
  close: "M6 6L18 18M18 6L6 18",
  reset: "M4 11A8 8 0 1 1 6 18M4 4V11H11",
  rotate: "M4 8L8 4L12 8M8 4V13A6 6 0 1 0 14 7",
  layers: "M12 3L22 9L12 15L2 9ZM2 13L12 19L22 13M2 17L12 23L22 17",
  focus:
    "M3 9V3H9M15 3H21V9M21 15V21H15M9 21H3V15M12 8A4 4 0 1 0 12 16A4 4 0 1 0 12 8",
  arrow: "M5 12H19M14 6L20 12L14 18",
  chevron: "M9 5L16 12L9 19",
  globe:
    "M21 12A9 9 0 1 1 3 12A9 9 0 1 1 21 12M3 12H21M12 3Q5 12 12 21Q19 12 12 3",
  menu: "M4 6H20M4 12H20M4 18H20",
  help: "M9 8A3 3 0 1 1 14 10Q12 11 12 14M12 18H12.01M22 12A10 10 0 1 1 2 12A10 10 0 1 1 22 12",
  bone: "M9 8L16 15Q20 12 21 16Q24 19 20 21Q17 23 15 19L8 12Q4 15 3 11Q0 8 4 6Q6 3 9 5Q11 6 9 8",
  vessels:
    "M12 21V12M12 12L7 7M12 12L17 7M7 7V3M7 7L4 10M17 7V3M17 7L20 10M12 15L8 18M12 15L16 18",
};
export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d={paths[name] || paths.bone}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
