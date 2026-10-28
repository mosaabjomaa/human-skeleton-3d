import { L } from "./types.ts";
import type { BoneSeed, Localized } from "./types.ts";
import type { Note } from "./boneNotes.ts";
import { notes } from "./boneNotes.ts";
const major: Record<
  string,
  [Localized, Localized, Localized, Localized, Localized]
> = {
  humerus: [
    L("Upper arm, between shoulder and elbow.", "الذراع بين الكتف والمرفق."),
    L(
      "Head, tubercles, deltoid tuberosity, trochlea and capitulum.",
      "الرأس والحديبتان والخشونة الدالية والبكرة والرؤيس.",
    ),
    L("Scapula, radius and ulna.", "لوح الكتف والكعبرة والزند."),
    L(
      "Rotator cuff, deltoid, pectoralis major and several arm muscles.",
      "الكفة المدورة والدالية والصدرية الكبرى وعدة عضلات ذراعية.",
    ),
    L(
      "Surgical-neck injuries can affect the axillary nerve; shaft injuries may affect the radial nerve.",
      "قد تؤذي كسور العنق الجراحي العصب الإبطي، وكسور الجسم العصب الكعبري.",
    ),
  ],
  radius: [
    L(
      "Lateral forearm on the thumb side.",
      "الجانب الوحشي للساعد من جهة الإبهام.",
    ),
    L(
      "Head, radial tuberosity, styloid process and ulnar notch.",
      "الرأس والخشونة الكعبرية والناتئ الإبري والثلمة الزندية.",
    ),
    L("Humerus, ulna, scaphoid and lunate.", "العضد والزند والزورقي والهلالي."),
    L(
      "Biceps inserts on the radial tuberosity; pronators and brachioradialis also attach.",
      "ترتكز ذات الرأسين على الخشونة الكعبرية؛ وتتصل الكابتان والعضدية الكعبرية أيضًا.",
    ),
    L(
      "Distal radius fractures often follow a fall on an outstretched hand.",
      "تحدث كسور النهاية البعيدة للكعبرة كثيرًا بعد السقوط على اليد الممدودة.",
    ),
  ],
  ulna: [
    L(
      "Medial forearm on the little-finger side.",
      "الجانب الإنسي للساعد من جهة الخنصر.",
    ),
    L(
      "Olecranon, coronoid process, trochlear notch and distal head.",
      "الزج والناتئ الإكليلي والثلمة البكرية والرأس البعيد.",
    ),
    L(
      "Humerus and radius; an articular disc separates it from the carpals.",
      "العضد والكعبرة؛ ويفصله قرص مفصلي عن عظام الرسغ.",
    ),
    L(
      "Triceps inserts on the olecranon; brachialis on the coronoid region.",
      "ترتكز ثلاثية الرؤوس على الزج والعضدية على المنطقة الإكليلية.",
    ),
    L(
      "An ulnar shaft fracture can accompany a radial-head dislocation.",
      "قد يترافق كسر جسم الزند مع خلع رأس الكعبرة.",
    ),
  ],
  femur: [
    L("Thigh, between hip and knee.", "الفخذ بين مفصلي الورك والركبة."),
    L(
      "Head, neck, trochanters, linea aspera and condyles.",
      "الرأس والعنق والمدوران والخط الخشن واللقمتان.",
    ),
    L("Hip bone, tibia and patella.", "عظم الورك والظنبوب والرضفة."),
    L(
      "Gluteal muscles, iliopsoas, adductors and vasti have important attachments.",
      "له ارتكازات مهمة للألوية والحرقفية القطنية والمقربات والعضلات الواسعة.",
    ),
    L(
      "Femoral-neck fractures may compromise blood supply to the head.",
      "قد تؤثر كسور عنق الفخذ في تروية الرأس.",
    ),
  ],
  tibia: [
    L(
      "Medial, weight-bearing bone of the leg.",
      "العظم الإنسي الحامل للوزن في الساق.",
    ),
    L(
      "Plateau, tibial tuberosity, anterior crest and medial malleolus.",
      "الهضبة والخشونة الظنبوبية والعرف الأمامي والكعب الإنسي.",
    ),
    L("Femur, fibula and talus.", "الفخذ والشظية والقعب."),
    L(
      "The patellar ligament attaches to the tibial tuberosity; leg muscles attach to the shaft.",
      "يرتكز الرباط الرضفي على الخشونة الظنبوبية وتتصل عضلات الساق بالجسم.",
    ),
    L(
      "Its subcutaneous anterior surface is vulnerable in open fractures.",
      "يجعل سطحه الأمامي القريب من الجلد الكسور المفتوحة مهمة سريريًا.",
    ),
  ],
  fibula: [
    L("Slender lateral bone of the leg.", "العظم النحيل الوحشي من الساق."),
    L(
      "Head, neck, shaft and lateral malleolus.",
      "الرأس والعنق والجسم والكعب الوحشي.",
    ),
    L(
      "Tibia and talus; no direct articulation with the femur.",
      "الظنبوب والقعب؛ ولا تتمفصل مباشرة مع الفخذ.",
    ),
    L(
      "Biceps femoris attaches to the head; fibularis muscles arise along the shaft.",
      "ترتكز ذات الرأسين الفخذية على الرأس وتنشأ العضلات الشظوية من الجسم.",
    ),
    L(
      "The common fibular nerve is vulnerable near the neck.",
      "يكون العصب الشظوي المشترك معرضًا للأذية قرب العنق.",
    ),
  ],
  clavicle: [
    L(
      "Anterior shoulder girdle between sternum and scapula.",
      "مقدمة الحزام الكتفي بين القص ولوح الكتف.",
    ),
    L(
      "Sternal end, acromial end, conoid tubercle and subclavian groove.",
      "النهاية القصية والنهاية الأخرمية والحديبة المخروطية والثلم تحت الترقوة.",
    ),
    L("Sternum and scapular acromion.", "القص وأخرم لوح الكتف."),
    L(
      "Sternocleidomastoid, pectoralis major, deltoid, trapezius and subclavius attach here.",
      "تتصل بها القصية الترقوية الخشائية والصدرية الكبرى والدالية وشبه المنحرفة وتحت الترقوة.",
    ),
    L(
      "The middle shaft is a frequent fracture region.",
      "يشيع الكسر في المنطقة الوسطى من الجسم.",
    ),
  ],
  scapula: [
    L(
      "Posterior shoulder girdle over the upper ribs.",
      "خلف الحزام الكتفي فوق الأضلاع العلوية.",
    ),
    L(
      "Spine, acromion, coracoid, glenoid cavity and fossae.",
      "الشوكة والأخرم والناتئ الغرابي والجوف الحقاني والحفر.",
    ),
    L("Humerus and clavicle.", "العضد والترقوة."),
    L(
      "Rotator cuff muscles, serratus anterior, trapezius and rhomboids attach here.",
      "ترتكز عليه عضلات الكفة المدورة والمنشارية الأمامية وشبه المنحرفة والمعينيتان.",
    ),
    L(
      "Scapular fractures can accompany substantial shoulder trauma.",
      "قد تترافق كسوره مع رضوض كتفية شديدة.",
    ),
  ],
  hip: [
    L("Lateral pelvic ring.", "الجزء الوحشي من الحلقة الحوضية."),
    L(
      "Ilium, ischium and pubis unite around the acetabulum; obturator foramen.",
      "تلتحم الحرقفة والإسك والعانة حول الحُق؛ وتوجد الثقبة السدادية.",
    ),
    L(
      "Sacrum, opposite pubis and femoral head.",
      "العجز والعانة المقابلة ورأس الفخذ.",
    ),
    L(
      "Gluteal, adductor, abdominal and pelvic-floor muscles attach across its surfaces.",
      "تتصل بسطوحه العضلات الألوية والمقربة والبطنية وعضلات قاع الحوض.",
    ),
    L(
      "Pelvic-ring injuries may involve major vessels and nearby organs.",
      "قد تشمل إصابات الحلقة الحوضية أوعية كبيرة وأعضاء مجاورة.",
    ),
  ],
  patella: [
    L(
      "Anterior knee within the quadriceps tendon.",
      "مقدمة الركبة داخل وتر العضلة رباعية الرؤوس.",
    ),
    L(
      "Base, apex and posterior articular facets.",
      "القاعدة والذروة والوجيهات المفصلية الخلفية.",
    ),
    L(
      "Femur only; it does not articulate with the tibia.",
      "الفخذ فقط؛ ولا تتمفصل مع الظنبوب.",
    ),
    L(
      "Embedded in the quadriceps tendon and continuous with the patellar ligament.",
      "تندمج في وتر رباعية الرؤوس وتتصل بالرباط الرضفي.",
    ),
    L(
      "Fracture or dislocation can affect the knee extensor mechanism.",
      "قد يؤثر الكسر أو الخلع في جهاز بسط الركبة.",
    ),
  ],
};

export function noteFor(seed: BoneSeed): Note {
  if (notes[seed.note]) return notes[seed.note];
  const specific = major[seed.note];
  if (specific) {
    return {
      summary: L(
        `${seed.en} is a structural bone of the ${seed.group === "upper" ? "upper limb" : seed.group === "lower" ? "lower limb" : seed.group === "shoulder" ? "shoulder girdle" : "pelvic girdle"}.`,
        `${seed.ar} عنصر عظمي بنيوي ضمن ${seed.group === "upper" ? "الطرف العلوي" : seed.group === "lower" ? "الطرف السفلي" : seed.group === "shoulder" ? "الحزام الكتفي" : "الحزام الحوضي"}.`,
      ),
      features: specific[1],
      action: L(
        "Provides attachment and mechanical leverage while transmitting forces through its region.",
        "يوفر مواضع ارتكاز ورافعة ميكانيكية وينقل القوى عبر منطقته.",
      ),
      joints: specific[2],
      muscles: specific[3],
      clinical: specific[4],
      fact:
        seed.note === "patella"
          ? L("It is the largest sesamoid bone.", "هو أكبر عظم سمسماني.")
          : seed.note === "femur"
            ? L(
                "The femur is the longest bone in the body.",
                "الفخذ أطول عظم في الجسم.",
              )
            : seed.note === "fibula"
              ? L(
                  "It stabilizes the ankle despite carrying relatively little axial load.",
                  "تسهم في ثبات الكاحل رغم حملها مقدارًا قليلًا نسبيًا من الحمل المحوري.",
                )
              : L(
                  "Shape and surface landmarks reflect the forces applied by joints and muscles.",
                  "يعكس شكل العظم ومعالم سطحه القوى التي تنقلها المفاصل والعضلات.",
                ),
      supply:
        seed.note === "femur"
          ? L(
              "Nutrient branches and circumflex femoral vessels contribute; retinacular vessels are important to the head. Periosteal sensory fibers accompany regional nerves.",
              "تسهم الشرايين المغذية والفخذية الدائرة؛ وللأوعية القيدية أهمية في تروية الرأس. ترافق الألياف الحسية السمحاقية الأعصاب الناحية.",
            )
          : undefined,
    };
  }
  if (seed.note === "sternum")
    return {
      summary: L(
        "The midline breastbone of the anterior thorax.",
        "عظم القص الناصف في مقدمة الصدر.",
      ),
      features: L(
        "Manubrium, body, xiphoid process and sternal angle.",
        "القبضة والجسم والناتئ الرهابي والزاوية القصية.",
      ),
      action: L(
        "Protects thoracic organs and anchors the anterior rib cage.",
        "يحمي أعضاء الصدر ويثبّت مقدمة القفص الصدري.",
      ),
      joints: L(
        "Clavicles and costal cartilages; the parts of the sternum have developmental junctions.",
        "الترقوتان والغضاريف الضلعية؛ وبين أجزاء القص اتصالات تطورية.",
      ),
      muscles: L(
        "Pectoralis major, sternocleidomastoid, sternohyoid and transversus thoracis have attachments here.",
        "تتصل به الصدرية الكبرى والقصية الترقوية الخشائية والقصية اللامية والمستعرضة الصدرية.",
      ),
      clinical: L(
        "Direct anterior chest trauma can fracture the sternum.",
        "قد تسبب رضوض مقدمة الصدر المباشرة كسر القص.",
      ),
      fact: L(
        "Its three anatomical parts are composed into one selectable adult bone in this atlas.",
        "جُمعت أجزاؤه التشريحية الثلاثة في عظم بالغ واحد قابل للتحديد في هذا الأطلس.",
      ),
    };
  if (seed.group === "spine") {
    const special =
      seed.note === "atlas"
        ? L(
            "Ring with lateral masses and anterior and posterior arches; no typical vertebral body.",
            "حلقة بكتلتين جانبيتين وقوسين أمامية وخلفية؛ دون جسم فقري نموذجي.",
          )
        : seed.note === "axis"
          ? L(
              "Dens (odontoid process), body and large spinous process.",
              "السِّن والجسم والناتئ الشوكي الكبير.",
            )
          : seed.note === "sacrum"
            ? L(
                "Fused sacral segments, promontory, canal and sacral foramina.",
                "قطع عجزية ملتحمة وبارزة وقناة وثقوب عجزية.",
              )
            : seed.note === "coccyx"
              ? L(
                  "Small fused or partly fused terminal segments; variable adult shape.",
                  "قطع نهائية صغيرة ملتحمة أو ملتحمة جزئيًا مع تنوع في الشكل عند البالغين.",
                )
              : L(
                  "Body, vertebral arch, vertebral foramen and articular processes; regional shape varies.",
                  "الجسم والقوس والثقبة الفقرية والنواتئ المفصلية؛ ويختلف الشكل بحسب المنطقة.",
                );
    return {
      summary: L(
        `${seed.en} belongs to the supporting axis of the spine.`,
        `${seed.ar} من المحور الداعم للعمود الفقري.`,
      ),
      features: special,
      action:
        seed.note === "sacrum"
          ? L(
              "Transfers spinal load to the pelvic ring.",
              "ينقل أحمال العمود الفقري إلى الحلقة الحوضية.",
            )
          : seed.note === "coccyx"
            ? L(
                "Provides attachment for pelvic-floor and ligamentous structures.",
                "يوفر ارتكازًا لبنى قاع الحوض والأربطة.",
              )
            : L(
                "Contributes to spinal support, controlled motion and protection of neural structures.",
                "يسهم في الدعم والحركة المضبوطة وحماية البنى العصبية.",
              ),
      joints:
        seed.note === "atlas"
          ? L("Occipital condyles and axis.", "اللقمتان القذاليتان والمحور.")
          : seed.note === "axis"
            ? L("Atlas and C3.", "الأطلس والفقرة الرقبية الثالثة.")
            : seed.note === "sacrum"
              ? L(
                  "L5, the two hip bones and coccyx.",
                  "الفقرة القطنية الخامسة وعظما الورك والعصعص.",
                )
              : seed.note === "coccyx"
                ? L(
                    "Sacrum; variable joints between coccygeal segments.",
                    "العجز؛ واتصالات متغيرة بين القطع العصعصية.",
                  )
                : L(
                    "Adjacent vertebrae; thoracic vertebrae also articulate with ribs. C1–C2 lack a typical intervertebral disc.",
                    "الفقرات المجاورة؛ وتتمفصل الفقرات الصدرية أيضًا مع الأضلاع. ولا يوجد قرص فقري نموذجي بين الأطلس والمحور.",
                  ),
      muscles:
        seed.note === "coccyx"
          ? L(
              "Coccygeus and portions of levator ani attach near the coccyx.",
              "ترتكز العصعصية وأجزاء من رافعة الشرج قرب العصعص.",
            )
          : L(
              "Deep segmental back muscles attach to processes; specific attachments vary by vertebral level.",
              "تتصل عضلات الظهر القطعية العميقة بالنواتئ، وتختلف الارتكازات بحسب المستوى.",
            ),
      clinical:
        seed.note === "coccyx"
          ? L(
              "A fall onto the buttocks may cause coccygeal pain or fracture.",
              "قد يسبب السقوط على الإليتين ألمًا أو كسرًا عصعصيًا.",
            )
          : L(
              "Fracture or degeneration can affect stability and adjacent neural structures; risk depends on level and injury pattern.",
              "قد يؤثر الكسر أو التنكس في الثبات والبنى العصبية المجاورة، بحسب المستوى ونمط الإصابة.",
            ),
      fact:
        seed.note === "atlas"
          ? L(
              "The atlas supports the head without a typical vertebral body.",
              "يحمل الأطلس الرأس من دون جسم فقري نموذجي.",
            )
          : L(
              "The adult vertebral column is conventionally counted as 24 vertebrae, one sacrum and one coccyx.",
              "يُحسب العمود الفقري البالغ اصطلاحًا 24 فقرة وعجزًا وعصعصًا.",
            ),
    };
  }
  if (seed.group === "thorax")
    return {
      summary: L(
        "A curved bone in the thoracic cage.",
        "عظم منحني في القفص الصدري.",
      ),
      features: L(
        "Head, shaft and costal groove; ribs 1, 2, 11 and 12 have atypical features.",
        "الرأس والجسم والثلم الضلعي؛ وللأضلاع الأول والثاني والحادي عشر والثاني عشر صفات غير نموذجية.",
      ),
      action: L(
        "Protects thoracic organs and contributes to breathing mechanics.",
        "يحمي أعضاء الصدر ويسهم في آلية التنفس.",
      ),
      joints: L(
        "The corresponding thoracic region posteriorly; anterior attachment depends on rib number: 1–7 direct cartilage, 8–10 indirect, 11–12 free.",
        "يتصل خلفيًا بالمنطقة الصدرية الموافقة؛ وأماميًا تكون الأضلاع 1–7 مباشرة عبر الغضروف و8–10 غير مباشرة و11–12 حرة.",
      ),
      muscles: L(
        "Intercostal muscles attach along rib borders; additional attachments vary by rib level.",
        "ترتكز العضلات الوربية على حواف الأضلاع، وتختلف الارتكازات الإضافية بحسب المستوى.",
      ),
      clinical: L(
        "A fractured rib may endanger the pleura or regional neurovascular bundle.",
        "قد يهدد كسر الضلع الجنبة أو الحزمة الوعائية العصبية المجاورة.",
      ),
      fact: L(
        "The costal groove helps shelter the intercostal vessels and nerve.",
        "يساعد الثلم الضلعي في حماية الأوعية والعصب الوربيين.",
      ),
    };
  const hand = seed.group === "upper";
  const phalanx = seed.note.includes("phalanx");
  const met = seed.note === "metacarpal" || seed.note === "metatarsal";
  return {
    summary: L(
      `${seed.en} contributes to the articulated framework of the ${hand ? "hand" : "foot"}.`,
      `يسهم ${seed.ar} في الإطار المفصلي لـ${hand ? "اليد" : "القدم"}.`,
    ),
    features:
      phalanx || met
        ? L(
            "A base, shaft and head or distal tuft, with articular surfaces appropriate to its position.",
            "قاعدة وجسم ورأس أو خصلة نهائية، مع سطوح مفصلية تلائم موضع العظم.",
          )
        : L(
            "Multiple articular facets, ligament attachment areas and a region-specific shape.",
            "وجيهات مفصلية متعددة ومواضع اتصال أربطة وشكل خاص بالمنطقة.",
          ),
    action: hand
      ? L(
          "Supports grip and coordinated movements of the wrist or digits.",
          "يدعم القبض والحركات المنسقة للرسغ أو الأصابع.",
        )
      : L(
          "Contributes to weight transfer, balance and adaptation of the foot during gait.",
          "يسهم في نقل الوزن والتوازن وتكيّف القدم أثناء المشي.",
        ),
    joints: phalanx
      ? L(
          "The adjacent phalanges or the corresponding metacarpal/metatarsal; the thumb and great toe have no middle phalanx.",
          "السلاميات المجاورة أو عظم المشط الموافق؛ ولا توجد سلامى وسطى للإبهام أو إبهام القدم.",
        )
      : met
        ? L(
            `Proximally the ${hand ? "distal carpal row" : "tarsals"}, distally the proximal phalanx, with side-to-side contacts depending on the ray.`,
            `تتصل قريبًا بـ${hand ? "الصف الرسغي البعيد" : "عظام الرصغ"} وبعيدًا بالسلامى القريبة؛ وتختلف الاتصالات الجانبية بحسب الإصبع.`,
          )
        : seed.note === "talus"
          ? L(
              "Tibia, fibula, calcaneus and navicular.",
              "الظنبوب والشظية والعقب والزورقي.",
            )
          : seed.note === "calcaneus"
            ? L("Talus and cuboid.", "القعب والمكعب.")
            : L(
                `Neighboring ${hand ? "carpal and selected metacarpal" : "tarsal and selected metatarsal"} bones; facet patterns differ between individual bones.`,
                `عظام ${hand ? "الرسغ وبعض عظام مشط اليد" : "الرصغ وبعض عظام مشط القدم"} المجاورة؛ وتختلف أنماط الوجيهات بين العظام.`,
              ),
    muscles:
      seed.note === "talus"
        ? L(
            "No muscles attach directly to the talus.",
            "لا ترتكز عضلات مباشرة على القعب.",
          )
        : seed.note === "calcaneus"
          ? L(
              "The Achilles tendon inserts posteriorly; plantar muscles attach inferiorly.",
              "يرتكز وتر أخيل خلفيًا وتتصل عضلات أخمصية بالسطح السفلي.",
            )
          : seed.note === "pisiform"
            ? L(
                "Embedded in the flexor carpi ulnaris tendon.",
                "يندمج في وتر مثنية الرسغ الزندية.",
              )
            : phalanx
              ? L(
                  "Flexor, extensor and intrinsic muscle tendons attach in patterns specific to each digit and segment.",
                  "ترتكز أوتار المثنيات والباسطات والعضلات القصيرة وفق أنماط خاصة بكل إصبع وقطعة.",
                )
              : L(
                  "Muscle or tendon attachments vary by individual bone; capsular and ligament attachments stabilize the region.",
                  "تختلف الارتكازات العضلية والوترية بحسب العظم، وتثبّت المحفظة والأربطة المنطقة.",
                ),
    clinical:
      seed.note === "scaphoid"
        ? L(
            "A waist fracture can interrupt retrograde supply to the proximal pole.",
            "قد يقطع كسر الخصر التروية الراجعة إلى القطب القريب.",
          )
        : seed.note === "talus"
          ? L(
              "Neck fractures can jeopardize blood supply to the talar body.",
              "قد تهدد كسور العنق تروية جسم القعب.",
            )
          : seed.note === "calcaneus"
            ? L(
                "Falls from height may cause an intra-articular calcaneal fracture.",
                "قد يسبب السقوط من ارتفاع كسرًا عقبيًا داخل المفصل.",
              )
            : L(
                "Fracture, dislocation and repetitive-load injury patterns depend on the specific bone and mechanism.",
                "تختلف أنماط الكسور والخلوع وإصابات الحمل المتكرر بحسب العظم وآلية الإصابة.",
              ),
    fact:
      seed.note === "pisiform"
        ? L(
            "A carpal bone that is also classified as sesamoid.",
            "عظم رسغي يُصنّف أيضًا عظمًا سمسمانيًا.",
          )
        : seed.note === "talus"
          ? L(
              "Transfers weight from the leg to the foot without direct muscle attachment.",
              "ينقل الوزن من الساق إلى القدم دون ارتكاز عضلي مباشر.",
            )
          : phalanx
            ? L(
                "There are fourteen phalanges in each hand and each foot.",
                "توجد أربع عشرة سلامى في كل يد وكل قدم.",
              )
            : L(
                `Each ${hand ? "hand has eight carpals and five metacarpals" : "foot has seven tarsals and five metatarsals"}.`,
                `تحتوي كل ${hand ? "يد على ثمانية عظام رسغية وخمسة عظام مشطية" : "قدم على سبعة عظام رصغية وخمسة عظام مشطية"}.`,
              ),
  };
}
export function locationFor(seed: BoneSeed): Localized {
  if (major[seed.note]) return major[seed.note][0];
  return L(
    `${seed.en}; ${seed.side === "left" ? "anatomical left" : seed.side === "right" ? "anatomical right" : "midline"} of the ${seed.group === "skull" ? "head and associated skeleton" : seed.group === "spine" ? "vertebral column" : seed.group === "thorax" ? "thoracic cage" : seed.group === "upper" ? "upper limb" : "lower limb"}.`,
    `${seed.ar}؛ ${seed.side === "left" ? "الجهة التشريحية اليسرى" : seed.side === "right" ? "الجهة التشريحية اليمنى" : "الخط الناصف"} ضمن ${seed.group === "skull" ? "عظام الرأس وملحقاتها" : seed.group === "spine" ? "العمود الفقري" : seed.group === "thorax" ? "القفص الصدري" : seed.group === "upper" ? "الطرف العلوي" : "الطرف السفلي"}.`,
  );
}
