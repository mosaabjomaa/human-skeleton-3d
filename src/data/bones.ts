import { L } from "./types.ts";
import type { Bone, BoneSeed, BoneGroup, Language, Details } from "./types.ts";
import { locationFor, noteFor } from "./regionalNotes.ts";
export type { Bone, BoneGroup, Language, DetailKey } from "./types.ts";
const seeds: BoneSeed[] = [];
function add(
  id: string,
  en: string,
  ar: string,
  latin: string,
  group: BoneGroup,
  type: Bone["boneType"],
  source: string | string[],
  note = id,
  side: Bone["side"] = "midline",
) {
  seeds.push({
    id,
    en,
    ar,
    latin,
    group,
    type,
    source: Array.isArray(source) ? source : [source],
    note,
    side,
  });
}
function pair(
  id: string,
  en: string,
  ar: string,
  latin: string,
  group: BoneGroup,
  type: Bone["boneType"],
  source = en,
  note = id,
) {
  for (const side of ["right", "left"] as const)
    add(
      `${id}_${side}`,
      `${side === "left" ? "Left" : "Right"} ${en.toLowerCase()}`,
      id.startsWith("hand_") || id.startsWith("foot_")
        ? `${ar} من ${id.startsWith("hand_") ? "اليد" : "القدم"} ${side === "left" ? "اليسرى" : "اليمنى"}`
        : `${ar} ${["radius", "fibula", "clavicle", "patella", "malleus", "concha"].includes(id) ? (side === "left" ? "اليسرى" : "اليمنى") : side === "left" ? "الأيسر" : "الأيمن"}`,
      latin,
      group,
      type,
      `${source}.${side === "left" ? "l" : "r"}`,
      note,
      side,
    );
}
add(
  "frontal",
  "Frontal bone",
  "العظم الجبهي",
  "Os frontale",
  "skull",
  "flat",
  "Frontal bone",
);
pair(
  "parietal",
  "Parietal bone",
  "العظم الجداري",
  "Os parietale",
  "skull",
  "flat",
);
pair(
  "temporal",
  "Temporal bone",
  "العظم الصدغي",
  "Os temporale",
  "skull",
  "irregular",
);
add(
  "occipital",
  "Occipital bone",
  "العظم القذالي",
  "Os occipitale",
  "skull",
  "flat",
  "Occipital bone",
);
add(
  "sphenoid",
  "Sphenoid bone",
  "العظم الوتدي",
  "Os sphenoidale",
  "skull",
  "irregular",
  "Sphenoid bone",
);
add(
  "ethmoid",
  "Ethmoid bone",
  "العظم الغربالي",
  "Os ethmoidale",
  "skull",
  "irregular",
  "Ethmoid bone",
);
for (const [id, en, ar, latin, source] of [
  ["nasal", "Nasal bone", "العظم الأنفي", "Os nasale", "Nasal bone"],
  ["maxilla", "Maxilla", "الفك العلوي", "Maxilla", "Maxilla"],
  [
    "zygomatic",
    "Zygomatic bone",
    "العظم الوجني",
    "Os zygomaticum",
    "Zygomatic bone",
  ],
  [
    "lacrimal",
    "Lacrimal bone",
    "العظم الدمعي",
    "Os lacrimale",
    "Lacrimal bone",
  ],
  [
    "palatine",
    "Palatine bone",
    "العظم الحنكي",
    "Os palatinum",
    "Palatine bone",
  ],
  [
    "concha",
    "Inferior nasal concha",
    "المحارة الأنفية السفلية",
    "Concha nasalis inferior",
    "Inferior nasal concha bone",
  ],
] as const)
  pair(
    id,
    en,
    ar,
    latin,
    "skull",
    id === "nasal" || id === "lacrimal" ? "flat" : "irregular",
    source,
  );
add("vomer", "Vomer", "عظم المحراث", "Vomer", "skull", "flat", "Vomer");
add(
  "mandible",
  "Mandible",
  "الفك السفلي",
  "Mandibula",
  "skull",
  "irregular",
  "Mandible",
);
for (const [id, en, ar, latin] of [
  ["malleus", "Malleus", "المطرقة", "Malleus"],
  ["incus", "Incus", "السندان", "Incus"],
  ["stapes", "Stapes", "الركاب", "Stapes"],
] as const)
  pair(id, en, ar, latin, "skull", "irregular");
add(
  "hyoid",
  "Hyoid bone",
  "العظم اللامي",
  "Os hyoideum",
  "skull",
  "irregular",
  "Hyoid bone",
);
for (const [prefix, total, label, arabic, latin] of [
  ["C", 7, "Cervical", "الرقبية", "cervicalis"],
  ["T", 12, "Thoracic", "الصدرية", "thoracica"],
  ["L", 5, "Lumbar", "القطنية", "lumbalis"],
] as const) {
  for (let i = 1; i <= total; i++) {
    const key = `${prefix}${i}`;
    const special = key === "C1" ? "atlas" : key === "C2" ? "axis" : "vertebra";
    add(
      key,
      `${label} vertebra ${key}${key === "C1" ? " · Atlas" : key === "C2" ? " · Axis" : ""}`,
      `الفقرة ${arabic} ${i}${key === "C1" ? " · الأطلس" : key === "C2" ? " · المحور" : ""}`,
      `Vertebra ${latin} ${i}`,
      "spine",
      "irregular",
      key === "C1"
        ? "Atlas (C1)"
        : key === "C2"
          ? "Axis (C2)"
          : `Vertebra ${key}`,
      special,
    );
  }
}
add("sacrum", "Sacrum", "العجز", "Os sacrum", "spine", "irregular", "Sacrum");
add(
  "coccyx",
  "Coccyx",
  "العصعص",
  "Os coccygis",
  "spine",
  "irregular",
  "Coccyx",
);
const ordinal = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
  "Eleventh",
  "Twelfth",
];
for (let i = 1; i <= 12; i++)
  pair(
    `rib_${i}`,
    `Rib ${i}`,
    `الضلع ${i}`,
    `Costa ${i}`,
    "thorax",
    "flat",
    `${ordinal[i - 1]} rib`,
    "rib",
  );
add("sternum", "Sternum", "القص", "Sternum", "thorax", "flat", [
  "Manubrium of sternum",
  "Body of sternum",
  "Xiphoid process",
]);
pair("clavicle", "Clavicle", "الترقوة", "Clavicula", "shoulder", "long");
pair("scapula", "Scapula", "لوح الكتف", "Scapula", "shoulder", "flat");
for (const [id, en, ar, latin] of [
  ["humerus", "Humerus", "عظم العضد", "Humerus"],
  ["radius", "Radius", "الكعبرة", "Radius"],
  ["ulna", "Ulna", "الزند", "Ulna"],
] as const)
  pair(id, en, ar, latin, "upper", "long");
for (const [id, en, ar, latin, source] of [
  [
    "scaphoid",
    "Scaphoid",
    "العظم الزورقي الرسغي",
    "Os scaphoideum",
    "Scaphoid bone",
  ],
  ["lunate", "Lunate", "العظم الهلالي", "Os lunatum", "Lunate bone"],
  [
    "triquetrum",
    "Triquetrum",
    "العظم المثلثي",
    "Os triquetrum",
    "Triquetrum bone",
  ],
  ["pisiform", "Pisiform", "العظم الحمصي", "Os pisiforme", "Pisiform bone"],
  [
    "trapezium",
    "Trapezium",
    "العظم شبه المنحرف",
    "Os trapezium",
    "Trapezium bone",
  ],
  [
    "trapezoid",
    "Trapezoid",
    "العظم شبه المنحرف الصغير",
    "Os trapezoideum",
    "Trapezoid bone",
  ],
  ["capitate", "Capitate", "العظم الكبير", "Os capitatum", "Capitate bone"],
  ["hamate", "Hamate", "العظم الخطافي", "Os hamatum", "Hamate bone"],
] as const)
  pair(
    id,
    en,
    ar,
    latin,
    "upper",
    id === "pisiform" ? "sesamoid" : "short",
    source,
  );
for (let i = 1; i <= 5; i++)
  pair(
    `metacarpal_${i}`,
    `Metacarpal ${i}`,
    `عظم مشط اليد ${i}`,
    `Os metacarpale ${i}`,
    "upper",
    "long",
    `${ordinal[i - 1]} metacarpal bone`,
    "metacarpal",
  );
function phalanges(part: "hand" | "foot") {
  const group = part === "hand" ? "upper" : "lower";
  const digitNames =
    part === "hand"
      ? [
          "Thumb",
          "Index finger",
          "Middle finger",
          "Ring finger",
          "Little finger",
        ]
      : ["Great toe", "Second toe", "Third toe", "Fourth toe", "Fifth toe"];
  for (let digit = 1; digit <= 5; digit++)
    for (const segment of ["proximal", "middle", "distal"] as const) {
      if (digit === 1 && segment === "middle") continue;
      const en = `${digitNames[digit - 1]} · ${segment} phalanx`;
      const ar = `السلامى ${segment === "proximal" ? "القريبة" : segment === "middle" ? "الوسطى" : "البعيدة"} للإصبع ${digit}`;
      const cap = segment[0].toUpperCase() + segment.slice(1);
      pair(
        `${part}_${digit}_${segment}`,
        en,
        ar,
        `Phalanx ${segment === "proximal" ? "proximalis" : segment === "middle" ? "media" : "distalis"} ${part === "hand" ? "manus" : "pedis"} ${digit}`,
        group,
        "long",
        `${cap} phalanx of ${ordinal[digit - 1].toLowerCase()} finger of ${part}`,
        "phalanx_" + segment,
      );
    }
}
phalanges("hand");
pair(
  "hip",
  "Hip bone",
  "عظم الورك",
  "Os coxae",
  "pelvis",
  "irregular",
  "Hip bone",
);
for (const [id, en, ar, latin, type] of [
  ["femur", "Femur", "عظم الفخذ", "Femur", "long"],
  ["patella", "Patella", "الرضفة", "Patella", "sesamoid"],
  ["tibia", "Tibia", "الظنبوب", "Tibia", "long"],
  ["fibula", "Fibula", "الشظية", "Fibula", "long"],
] as const)
  pair(id, en, ar, latin, "lower", type);
for (const [id, en, ar, latin, source] of [
  ["talus", "Talus", "القعب", "Talus", "Talus"],
  ["calcaneus", "Calcaneus", "العقب", "Calcaneus", "Calcaneus"],
  [
    "navicular",
    "Navicular",
    "العظم الزورقي الرصغي",
    "Os naviculare",
    "Navicular bone",
  ],
  ["cuboid", "Cuboid", "العظم المكعب", "Os cuboideum", "Cuboid bone"],
  [
    "medial_cuneiform",
    "Medial cuneiform",
    "العظم الإسفيني الإنسي",
    "Os cuneiforme mediale",
    "Medial cuneiform bone",
  ],
  [
    "intermediate_cuneiform",
    "Intermediate cuneiform",
    "العظم الإسفيني المتوسط",
    "Os cuneiforme intermedium",
    "Intermediate cuneiform bone",
  ],
  [
    "lateral_cuneiform",
    "Lateral cuneiform",
    "العظم الإسفيني الوحشي",
    "Os cuneiforme laterale",
    "Lateral cuneiform bone",
  ],
] as const)
  pair(id, en, ar, latin, "lower", "short", source);
for (let i = 1; i <= 5; i++)
  pair(
    `metatarsal_${i}`,
    `Metatarsal ${i}`,
    `عظم مشط القدم ${i}`,
    `Os metatarsale ${i}`,
    "lower",
    "long",
    `${ordinal[i - 1]} metatarsal bone`,
    "metatarsal",
  );
phalanges("foot");

const regionSupply = {
  skull: L(
    "Regional branches of the carotid circulation supply the craniofacial periosteum and bone. Sensory innervation is mainly trigeminal, with cervical contributions posteriorly; details differ between skull bones.",
    "تغذي فروع من الدوران السباتي سمحاق القحف والوجه والعظم. التعصيب الحسي غالبًا ثلاثي التوائم مع مساهمات رقبية خلفية؛ وتختلف التفاصيل بحسب العظم.",
  ),
  spine: L(
    "Segmental cervical, intercostal, lumbar or sacral vessels contribute according to level. Recurrent meningeal and regional spinal nerve branches supply periosteal and ligamentous tissues.",
    "تسهم أوعية رقبية أو وربية أو قطنية أو عجزية بحسب المستوى. وتعصّب الفروع السحائية الراجعة وفروع الأعصاب الشوكية الأنسجة السمحاقية والرباطية.",
  ),
  thorax: L(
    "Intercostal vessels and internal thoracic branches supply the chest wall. Intercostal nerves provide regional sensory and motor branches; periosteum is pain-sensitive.",
    "تروي الأوعية الوربية وفروع الصدرية الداخلية جدار الصدر. وتوفر الأعصاب الوربية فروعًا حسية وحركية ناحية؛ والسمحاق حساس للألم.",
  ),
  shoulder: L(
    "The suprascapular, scapular anastomotic and thoracoacromial networks contribute according to bone. Periosteal sensory branches accompany regional nerves.",
    "تسهم الشبكات فوق الكتفية والمفاغرات الكتفية والصدرية الأخرمية بحسب العظم. وترافق الفروع الحسية السمحاقية الأعصاب الناحية.",
  ),
  upper: L(
    "Nutrient and periosteal vessels arise from regional brachial, radial, ulnar or interosseous networks. Fine articular and periosteal sensory branches vary with location.",
    "تنشأ الأوعية المغذية والسمحاقية من الشبكات العضدية أو الكعبرية أو الزندية أو بين العظمية بحسب الموضع. وتختلف الفروع الحسية المفصلية والسمحاقية الناحية.",
  ),
  pelvis: L(
    "Internal and external iliac branches contribute to pelvic bone perfusion. Regional periosteal innervation accompanies lumbosacral nerves; this is a regional overview.",
    "تسهم فروع الحرقفيين الداخلي والخارجي في تروية عظام الحوض. يرافق التعصيب السمحاقي الناحي الأعصاب القطنية العجزية؛ وهذا وصف ناحي عام.",
  ),
  lower: L(
    "Regional femoral, popliteal, tibial and fibular arterial networks provide nutrient and periosteal supply. Articular and periosteal sensory nerves accompany local neurovascular structures.",
    "توفر الشبكات الفخذية والمأبضية والظنبوبية والشظوية التروية المغذية والسمحاقية بحسب المنطقة. وترافق الأعصاب الحسية المفصلية والسمحاقية البنى الوعائية العصبية الموضعية.",
  ),
};
function development(seed: BoneSeed) {
  if (
    seed.group === "skull" &&
    !["hyoid", "malleus", "incus", "stapes"].includes(seed.note)
  )
    return L(
      "Most cranial-vault and facial bones develop mainly by intramembranous ossification; skull-base elements include endochondral development. Adult sutures and fusion patterns vary.",
      "تتطور معظم عظام قبة القحف والوجه أساسًا بالتعظم الغشائي، وتشمل عناصر قاعدة القحف التعظم داخل الغضروف. وتتنوع أنماط الدروز والالتحام.",
    );
  if (seed.note === "clavicle")
    return L(
      "Has both intramembranous and endochondral contributions; its medial epiphysis matures relatively late.",
      "يسهم في نشأتها التعظم الغشائي وداخل الغضروف؛ وتنضج مشاشتها الإنسية متأخرًا نسبيًا.",
    );
  return L(
    "Develops predominantly through endochondral ossification of a cartilage model. Growth centers and fusion timing depend on the bone and individual; the model represents adult anatomy.",
    "يتطور أساسًا بالتعظم داخل الغضروف انطلاقًا من نموذج غضروفي. تختلف مراكز النمو ومواعيد الالتحام بحسب العظم والفرد؛ ويمثل المجسم تشريحًا بالغًا.",
  );
}
const base = "https://openstax.org/books/anatomy-and-physiology-2e/pages/";
export const bones: Bone[] = seeds.map((seed) => {
  const note = noteFor(seed);
  const details = Object.fromEntries(
    (["en", "ar"] as Language[]).map((lang) => [
      lang,
      {
        overview: note.summary[lang],
        location: locationFor(seed)[lang],
        landmarks: note.features[lang],
        function: note.action[lang],
        articulations: note.joints[lang],
        muscles: note.muscles[lang],
        supply: (note.supply || regionSupply[seed.group])[lang],
        clinical: note.clinical[lang],
        development: (note.development || development(seed))[lang],
        fact: note.fact[lang],
      } satisfies Details,
    ]),
  ) as Bone["details"];
  return {
    id: seed.id,
    meshName: seed.id,
    sourceNames: seed.source.map((name) => name + ".001"),
    name: L(seed.en, seed.ar),
    latinName: seed.latin,
    region: ["skull", "spine", "thorax"].includes(seed.group)
      ? "axial"
      : "appendicular",
    group: seed.group,
    boneType: seed.type,
    side: seed.side || "midline",
    shortDescription: note.summary,
    details,
    sources: [
      base +
        {
          skull: "7-2-the-skull",
          spine: "7-3-the-vertebral-column",
          thorax: "7-4-the-thoracic-cage",
          shoulder: "8-1-the-pectoral-girdle",
          upper: "8-2-bones-of-the-upper-limb",
          pelvis: "8-3-the-pelvic-girdle-and-pelvis",
          lower: "8-4-bones-of-the-lower-limb",
        }[seed.group],
    ],
  };
});
export const boneById = Object.fromEntries(
  bones.map((bone) => [bone.id, bone]),
) as Record<string, Bone>;
export const boneGroups: BoneGroup[] = [
  "skull",
  "spine",
  "thorax",
  "shoulder",
  "upper",
  "pelvis",
  "lower",
];
if (bones.length !== 206 || new Set(bones.map((bone) => bone.id)).size !== 206)
  throw new Error(
    "The anatomical inventory must contain exactly 206 unique bones.",
  );
