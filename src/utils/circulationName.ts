export function formatCirculationName(name: string, language: "en" | "ar") {
  const formatted = name
    .replaceAll("_", " ")
    .replace(/\.(?:r|l)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (language === "en") return formatted;
  const normalized = formatted.toLowerCase();
  const arabicNames: [RegExp, string][] = [
    [/right atrium/, "الأذين الأيمن"],
    [/left atrium/, "الأذين الأيسر"],
    [/right ventricle/, "البطين الأيمن"],
    [/left ventricle/, "البطين الأيسر"],
    [/pulmonary trunk/, "الجذع الرئوي"],
    [/right pulmonary artery/, "الشريان الرئوي الأيمن"],
    [/left pulmonary artery/, "الشريان الرئوي الأيسر"],
    [/right superior pulmonary vein/, "الوريد الرئوي العلوي الأيمن"],
    [/right inferior pulmonary vein/, "الوريد الرئوي السفلي الأيمن"],
    [/left superior pulmonary vein/, "الوريد الرئوي العلوي الأيسر"],
    [/left inferior pulmonary vein/, "الوريد الرئوي السفلي الأيسر"],
    [/superior vena cava/, "الوريد الأجوف العلوي"],
    [/inferior vena cava/, "الوريد الأجوف السفلي"],
    [/tricuspid valve/, "الصمام ثلاثي الشرفات"],
    [/mitral valve/, "الصمام التاجي"],
    [/aortic valve/, "الصمام الأبهري"],
    [/pulmonary valve/, "الصمام الرئوي"],
    [/aorta/, "الأبهر"],
  ];
  return (
    arabicNames.find(([pattern]) => pattern.test(normalized))?.[1] ?? formatted
  );
}
