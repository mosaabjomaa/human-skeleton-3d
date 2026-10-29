import inventory from "./body-systems-inventory.json";
export type BodySystem =
  | "muscular"
  | "nervous"
  | "integumentary"
  | "urinary"
  | "reproductive"
  | "endocrine"
  | "lymphatic";
export interface BodyPart {
  id: string;
  name: string;
  system: BodySystem;
  category: string;
  layer: string | null;
  side: "left" | "right" | "midline";
  asset: string;
}
export const bodyParts = inventory.structures as BodyPart[];
export const bodySystems: BodySystem[] = [
  "muscular",
  "nervous",
  "integumentary",
  "urinary",
  "reproductive",
  "endocrine",
  "lymphatic",
];
export const systemInfo: Record<
  BodySystem,
  {
    name: [string, string];
    color: string;
    overview: [string, string];
    route: [string, string];
    location: [string, string];
    source: string;
    limit: [string, string];
  }
> = {
  lymphatic: {
    name: ["Lymphatic system", "الجهاز اللمفاوي والمناعي"],
    color: "#6ec270",
    overview: [
      "Lymphatic vessels return interstitial fluid to the bloodstream; lymphoid organs support immune surveillance and responses.",
      "تعيد الأوعية اللمفاوية السائل الخلالي إلى الدم وتدعم الأعضاء اللمفاوية المراقبة والاستجابات المناعية.",
    ],
    route: [
      "Interstitial fluid → lymphatic vessels → lymph nodes → lymphatic trunks and ducts → venous circulation.",
      "السائل الخلالي ← الأوعية اللمفاوية ← العقد اللمفاوية ← الجذوع والقنوات اللمفاوية ← الدورة الوريدية.",
    ],
    location: [
      "Lymphatic structures occur throughout the body. The spleen lies in the left upper abdomen and the thymus in the anterior upper thorax.",
      "تتوزع البنى اللمفاوية عبر الجسم. يقع الطحال أعلى البطن يسارًا والتيموس في القسم الأمامي العلوي من الصدر.",
    ],
    source: "21-introduction",
    limit: [
      "Selected lymph node groups and lymphoid organs are shown, not every microscopic vessel or immune cell. Spleen impressions and borders are landmarks.",
      "تظهر مجموعات مختارة من العقد والأعضاء اللمفاوية، وليس كل الأوعية المجهرية أو الخلايا المناعية. طبعات الطحال وحوافه معالم تشريحية.",
    ],
  },
  muscular: {
    name: ["Muscular system", "الجهاز العضلي"],
    color: "#b35d58",
    overview: [
      "Skeletal muscles generate movement, stabilize joints and produce heat. This atlas includes muscles and associated tendinous structures.",
      "تنتج العضلات الهيكلية الحركة وتثبّت المفاصل وتولّد الحرارة. يشمل المجسم عضلات وبنى وترية مرتبطة بها.",
    ],
    route: [
      "Motor nerve signal → muscle activation → force through tendon → movement or stabilization.",
      "إشارة عصبية حركية ← تنشيط العضلة ← نقل القوة عبر الوتر ← حركة أو تثبيت.",
    ],
    location: [
      "Distributed across the head, trunk and limbs; attachment and action differ by muscle.",
      "تتوزع في الرأس والجذع والأطراف؛ يختلف الارتكاز والعمل بحسب العضلة.",
    ],
    source: "11-introduction",
    limit: [
      "Layer filters are educational groupings, not a complete dissection plane. Exact origins, insertions and innervation are not provided for every mesh.",
      "فلاتر الطبقات تقسيم تعليمي وليست مستويات تشريح كاملة. لا تتوفر بيانات المنشأ والارتكاز والتعصيب الخاصة بكل مجسم.",
    ],
  },
  nervous: {
    name: ["Nervous system", "الجهاز العصبي"],
    color: "#e6bf6b",
    overview: [
      "The brain and spinal cord integrate information; peripheral nerves carry sensory and motor signals.",
      "يدمج الدماغ والنخاع الشوكي المعلومات، وتنقل الأعصاب الطرفية الإشارات الحسية والحركية.",
    ],
    route: [
      "Sensory receptors → peripheral sensory pathways → central processing → motor or autonomic output.",
      "مستقبلات حسية ← مسارات حسية طرفية ← معالجة مركزية ← استجابة حركية أو ذاتية.",
    ],
    location: [
      "Central structures lie in the cranial cavity and vertebral canal; peripheral nerves extend through the body.",
      "تقع البنى المركزية داخل القحف والقناة الفقرية وتمتد الأعصاب الطرفية عبر الجسم.",
    ],
    source: "13-introduction",
    limit: [
      "This is a structural atlas, not a map of every neural pathway or a tool for assessing nerve injury.",
      "هذا أطلس بنيوي وليس خريطة لكل المسارات العصبية أو أداة لتقييم إصابات الأعصاب.",
    ],
  },
  integumentary: {
    name: ["Integumentary system", "الجهاز اللحافي — الجلد"],
    color: "#d99b82",
    overview: [
      "Skin forms a protective barrier, contributes to temperature regulation and sensation, and supports vitamin D synthesis.",
      "يشكّل الجلد حاجزًا واقيًا ويسهم في تنظيم الحرارة والإحساس وتصنيع فيتامين د.",
    ],
    route: [
      "External environment → skin barrier and sensory receptors → protective, sensory and thermoregulatory responses.",
      "البيئة الخارجية ← الحاجز الجلدي والمستقبلات الحسية ← استجابات وقائية وحسية وتنظيم الحرارة.",
    ],
    location: [
      "Covers the external body surface; named meshes predominantly represent surface regions.",
      "يغطي سطح الجسم الخارجي؛ تمثل أغلب الأجزاء المسماة مناطق سطحية.",
    ],
    source: "5-introduction",
    limit: [
      "Surface regions do not represent microscopic epidermal and dermal layers. Glands and follicles are not all modeled.",
      "المناطق السطحية لا تمثل طبقات البشرة والأدمة المجهرية. لا تظهر جميع الغدد والجريبات.",
    ],
  },
  urinary: {
    name: ["Urinary system", "الجهاز البولي"],
    color: "#5ba6a1",
    overview: [
      "Kidneys regulate fluid, electrolyte and acid-base balance and remove waste; the urinary passages transport and store urine.",
      "تنظم الكليتان السوائل والشوارد والتوازن الحمضي القاعدي وتطرحان الفضلات، وتنقل المسالك البولية البول وتخزّنه.",
    ],
    route: [
      "Kidneys → ureters → urinary bladder → urethra.",
      "الكليتان ← الحالبان ← المثانة البولية ← الإحليل.",
    ],
    location: [
      "Kidneys are retroperitoneal in the posterior abdomen; the bladder lies in the pelvis.",
      "تقع الكليتان خلف الصفاق في الجزء الخلفي من البطن، وتقع المثانة في الحوض.",
    ],
    source: "25-introduction",
    limit: [
      "The source includes organ surfaces and landmarks, not individual nephrons or a complete microscopic filtration model.",
      "يشمل المصدر أسطح الأعضاء ومعالمها، وليس النفرونات المفردة أو نموذج الترشيح المجهري الكامل.",
    ],
  },
  reproductive: {
    name: ["Male reproductive system", "الجهاز التناسلي الذكري"],
    color: "#b9779c",
    overview: [
      "Testes produce sperm and testosterone; ducts transport sperm and accessory glands contribute to seminal fluid.",
      "تنتج الخصيتان النطاف والتستوستيرون، وتنقل القنوات النطاف وتسهم الغدد الملحقة في السائل المنوي.",
    ],
    route: [
      "Testis → epididymis → ductus deferens → ejaculatory duct → urethra.",
      "الخصية ← البربخ ← الأسهر ← القناة الدافقة ← الإحليل.",
    ],
    location: [
      "Includes structures in the pelvis and external genital region. Location and relationships vary by structure.",
      "يشمل بنى في الحوض والمنطقة التناسلية الخارجية، وتختلف العلاقات التشريحية حسب الجزء.",
    ],
    source: "27-introduction",
    limit: [
      "Only male anatomy is available in this source. Female reproductive organs are not included; this view does not represent both sexes.",
      "المصدر المتاح ذكري فقط. الأعضاء التناسلية الأنثوية غير موجودة؛ هذا العرض لا يمثل تشريح الجنسين.",
    ],
  },
  endocrine: {
    name: ["Endocrine system", "جهاز الغدد الصماء"],
    color: "#8e79bd",
    overview: [
      "Endocrine glands release hormones into blood to coordinate metabolism, growth, reproduction and responses to stress.",
      "تفرز الغدد الصماء الهرمونات إلى الدم لتنسيق الاستقلاب والنمو والتكاثر والاستجابة للإجهاد.",
    ],
    route: [
      "Regulatory signal → endocrine gland → hormone in blood → receptor-bearing target tissue → feedback.",
      "إشارة تنظيمية ← غدة صماء ← هرمون في الدم ← نسيج هدف يحمل المستقبلات ← تغذية راجعة.",
    ],
    location: [
      "Represented glands include structures in the head, neck and above the kidneys. Select a gland to locate it.",
      "تشمل الغدد المعروضة بنى في الرأس والعنق وفوق الكليتين. اختر الغدة لتحديد موقعها.",
    ],
    source: "17-introduction",
    limit: [
      "Not every endocrine tissue is represented. Microscopic islets, hormone levels and endocrine diagnoses cannot be inferred from this model.",
      "لا تظهر جميع الأنسجة الصماء. لا يمكن استنتاج الجزر المجهرية أو مستويات الهرمونات أو التشخيص من المجسم.",
    ],
  },
};
export const categories: Record<string, [string, string]> = {
  nodes: ["Lymph node groups", "مجموعات العقد اللمفاوية"],
  spleen: ["Spleen and landmarks", "الطحال ومعالمه"],
  thymus: ["Thymus", "الغدة التيموسية"],
  tonsils: ["Tonsils", "اللوزتان"],
  vessels: ["Lymphatic vessels", "الأوعية اللمفاوية"],
  all: ["All structures", "كل البنى"],
  superficial: ["Superficial group", "المجموعة السطحية"],
  deep: ["Deep group", "المجموعة العميقة"],
  central: ["Central nervous structures", "البنى العصبية المركزية"],
  peripheral: ["Peripheral nerves", "الأعصاب الطرفية"],
  skin: ["Skin regions", "مناطق الجلد"],
  hair: ["Hair regions", "مناطق الشعر"],
  nails: ["Nails", "الأظافر"],
  kidneys: ["Kidneys and landmarks", "الكلى ومعالمها"],
  urinaryTract: ["Urinary passages", "المسالك البولية"],
  gonads: ["Gonads", "الغدد التناسلية"],
  ducts: ["Ducts", "القنوات"],
  accessoryGlands: ["Accessory glands", "الغدد الملحقة"],
  external: ["External / associated structures", "بنى خارجية ومرتبطة"],
  glands: ["Glands and landmarks", "الغدد ومعالمها"],
  pituitary: ["Pituitary", "النخامى"],
};
const translated: Record<string, string> = {
  kidney: "كلية",
  "urinary bladder": "المثانة البولية",
  testis: "الخصية",
  epididymis: "البربخ",
  "thyroid gland": "الغدة الدرقية",
  "suprarenal gland": "الغدة الكظرية",
  prostate: "البروستاتا",
  "ductus deferens": "الأسهر",
  "spinal cord": "النخاع الشوكي",
  brain: "الدماغ",
  "optic nerve (ii)": "العصب البصري (II)",
  "olfactory nerve (i)": "العصب الشمي (I)",
  "optic chiasm": "التصالب البصري",
  "optic tract": "السبيل البصري",
  deltoid: "العضلة الدالية",
  "biceps brachii": "العضلة ذات الرأسين العضدية",
  "triceps brachii": "العضلة ثلاثية الرؤوس العضدية",
  "pectoralis major": "العضلة الصدرية الكبرى",
  trapezius: "العضلة شبه المنحرفة",
  "rectus abdominis": "العضلة المستقيمة البطنية",
  "gluteus maximus": "العضلة الألوية الكبرى",
  sartorius: "العضلة الخياطية",
  gastrocnemius: "العضلة التوأمية",
  soleus: "العضلة النعلية",
  eyebrow: "الحاجب",
  "frontal region": "المنطقة الجبهية",
  "occipital region": "المنطقة القذالية",
  "parietal region": "المنطقة الجدارية",
  "temporal region": "المنطقة الصدغية",
};
export function partName(part: BodyPart, ar: boolean) {
  const base = part.name.replace(/\.[rlj]$/i, "");
  if (!ar) return base + (part.side === "midline" ? "" : ` · ${part.side}`);
  const name = translated[base.toLowerCase()] || base;
  return (
    name +
    (part.side === "midline"
      ? ""
      : part.side === "left"
        ? " · يسار"
        : " · يمين")
  );
}
export function partFunction(part: BodyPart, ar: boolean) {
  const n = part.name.toLowerCase(),
    i = ar ? 1 : 0;
  if (part.system === "endocrine" && /suprarenal|adrenal/.test(n))
    return ar
      ? "تنتج قشرة الكظر هرمونات ستيرويدية وينتج اللب الكاتيكولامينات؛ أسطح الغدة معالم تشريحية وليست أعضاء منفصلة."
      : "The adrenal cortex produces steroid hormones and the medulla catecholamines; gland surfaces are anatomical landmarks, not separate organs.";
  if (part.system === "lymphatic")
    return /spleen/i.test(n)
      ? ar
        ? "يرشح الطحال الدم ويسهم في الاستجابة المناعية وإزالة كريات الدم الحمراء الهرمة. أسطحه وطبعاته معالم تشريحية."
        : "The spleen filters blood, supports immune responses and removes aging red blood cells. Surfaces and impressions are landmarks."
      : /thymus/i.test(n)
        ? ar
          ? "تدعم التيموس نضج الخلايا اللمفاوية التائية وانتقاءها، ويتغير حجمها مع العمر."
          : "The thymus supports T-cell maturation and selection and changes in size with age."
        : /tonsil/i.test(n)
          ? ar
            ? "تشارك اللوزتان في الاستجابة المناعية لمستضدات واردة عبر الفم والبلعوم."
            : "Tonsils participate in immune responses to antigens entering through the mouth and pharynx."
          : ar
            ? "تسهم البنى اللمفاوية في نقل اللمف أو ترشيحه والمراقبة المناعية، حسب نوع البنية."
            : "Lymphatic structures transport or filter lymph and support immune surveillance, depending on structure type.";
  const rules: [RegExp, [string, string]][] = [
    [
      /kidney|renal/,
      [
        "Kidney tissue filters plasma and regulates water, electrolytes and acid-base balance; surface landmarks locate the organ rather than filter on their own.",
        "يرشح نسيج الكلية البلازما وينظم الماء والشوارد والحموضة؛ تحدد المعالم السطحية موقع العضو ولا ترشح بذاتها.",
      ],
    ],
    [
      /bladder/,
      [
        "The urinary bladder stores urine until voiding. Its apex and surfaces are anatomical landmarks.",
        "تخزن المثانة البول حتى التبول؛ قمتها وأسْطحها معالم تشريحية.",
      ],
    ],
    [
      /ureter/,
      [
        "The ureter transports urine from the renal pelvis to the urinary bladder by muscular contractions.",
        "ينقل الحالب البول من حوض الكلية إلى المثانة بتقلصات عضلية.",
      ],
    ],
    [
      /urethra/,
      [
        "The urethra conducts urine from the bladder to the exterior; the male urethra also conducts semen.",
        "ينقل الإحليل البول من المثانة إلى الخارج، وينقل الإحليل الذكري السائل المنوي أيضًا.",
      ],
    ],
    [
      /thyroid|pyramidal lobe/,
      [
        "Thyroid follicular cells produce thyroid hormones involved in metabolic regulation; the isthmus and lobes describe gland anatomy.",
        "تنتج الخلايا الجريبية الدرقية هرمونات تسهم في تنظيم الاستقلاب؛ يصف البرزخ والفصوص تشريح الغدة.",
      ],
    ],
    [
      /suprarenal|adrenal/,
      [
        "The adrenal cortex produces steroid hormones, while the medulla produces catecholamines; this mesh shows organ anatomy, not hormone activity.",
        "تنتج قشرة الكظر هرمونات ستيرويدية وينتج اللب الكاتيكولامينات؛ يعرض المجسم التشريح وليس النشاط الهرموني.",
      ],
    ],
    [
      /hypophys|pituitary/,
      [
        "Pituitary hormones help regulate growth, reproductive function and other endocrine glands; control differs between anterior and posterior portions.",
        "تسهم هرمونات النخامى في تنظيم النمو والتكاثر وغدد أخرى، ويختلف التنظيم بين جزأيها الأمامي والخلفي.",
      ],
    ],
    [
      /testis/,
      [
        "Testicular tissue produces sperm and testosterone. Borders and poles shown here are anatomical landmarks.",
        "ينتج نسيج الخصية النطاف والتستوستيرون. الحواف والأقطاب المعروضة معالم تشريحية.",
      ],
    ],
    [
      /epididymis/,
      [
        "The epididymis supports sperm maturation and storage before passage into the ductus deferens.",
        "يسهم البربخ في نضج النطاف وتخزينها قبل مرورها إلى الأسهر.",
      ],
    ],
    [
      /prostate|seminal/,
      [
        "Accessory reproductive glands contribute secretions to seminal fluid; their roles differ by gland.",
        "تسهم الغدد التناسلية الملحقة بإفرازات في السائل المنوي وتختلف أدوارها حسب الغدة.",
      ],
    ],
    [
      /optic|chiasm/,
      [
        "Part of the visual pathway carrying and organizing retinal signals toward central visual structures; crossing occurs at the optic chiasm.",
        "جزء من المسار البصري ينقل وينظم إشارات الشبكية نحو البنى البصرية المركزية، ويحدث العبور في التصالب البصري.",
      ],
    ],
    [
      /olfactory/,
      [
        "Part of the olfactory pathway involved in transmitting smell-related sensory information.",
        "جزء من المسار الشمي يشارك في نقل المعلومات الحسية المرتبطة بالشم.",
      ],
    ],
  ];
  for (const [pattern, text] of rules) if (pattern.test(n)) return text[i];
  return systemInfo[part.system].overview[i];
}
