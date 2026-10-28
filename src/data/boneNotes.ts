import { L } from "./types.ts";
import type { Localized } from "./types.ts";
export interface Note {
  summary: Localized;
  features: Localized;
  action: Localized;
  joints: Localized;
  muscles: Localized;
  clinical: Localized;
  fact: Localized;
  supply?: Localized;
  development?: Localized;
}
const note = (
  summary: Localized,
  features: Localized,
  action: Localized,
  joints: Localized,
  muscles: Localized,
  clinical: Localized,
  fact: Localized,
  supply?: Localized,
): Note => ({
  summary,
  features,
  action,
  joints,
  muscles,
  clinical,
  fact,
  supply,
});
// Original concise educational notes. Regional statements are explicitly distinguished
// from bone-specific landmarks; no diagnostic or treatment recommendations are given.
export const notes: Record<string, Note> = {
  frontal: note(
    L(
      "Forms the forehead and part of the orbital roof.",
      "يشكّل الجبهة وجزءًا من سقف الحجاج.",
    ),
    L(
      "Supraorbital margin, glabella and frontal sinus.",
      "الحافة فوق الحجاج والثلمة الجبهية والجيب الجبهي.",
    ),
    L(
      "Protects the anterior brain and supports the upper orbit.",
      "يحمي القسم الأمامي من الدماغ ويدعم أعلى الحجاج.",
    ),
    L(
      "Parietal, sphenoid, ethmoid, nasal, maxillary, lacrimal and zygomatic bones.",
      "الجداري والوتدي والغربالي والأنفي والفك العلوي والدمعي والوجني.",
    ),
    L(
      "The temporal lines contribute to temporalis attachment.",
      "تسهم الخطوط الصدغية في ارتكاز العضلة الصدغية.",
    ),
    L(
      "Frontal injury can involve the frontal sinus or orbital roof.",
      "قد تشمل إصابته الجيب الجبهي أو سقف الحجاج.",
    ),
    L(
      "The two frontal halves normally unite early in life.",
      "يلتحم نصفا العظم الجبهي عادة في الطفولة المبكرة.",
    ),
  ),
  parietal: note(
    L(
      "A paired bone in the roof and side of the cranium.",
      "عظم مزدوج في سقف القحف وجانبه.",
    ),
    L(
      "Parietal eminence, temporal lines and meningeal grooves.",
      "الحدبة الجدارية والخطوط الصدغية وأثلام الأوعية السحائية.",
    ),
    L("Forms a protective cranial vault.", "يسهم في تكوين قبة القحف الواقية."),
    L(
      "Opposite parietal, frontal, occipital, temporal and sphenoid.",
      "الجداري المقابل والجبهي والقذالي والصدغي والوتدي.",
    ),
    L(
      "Temporalis attaches below the temporal line.",
      "ترتكز العضلة الصدغية أسفل الخط الصدغي.",
    ),
    L(
      "A fracture can be associated with intracranial injury.",
      "قد يترافق الكسر مع أذية داخل القحف.",
    ),
    L(
      "The sagittal suture separates the two parietal bones.",
      "يفصل الدرز السهمي بين العظمين الجداريين.",
    ),
  ),
  temporal: note(
    L(
      "Forms the inferolateral skull and houses hearing structures.",
      "يشكّل القسم السفلي الوحشي للقحف ويحتوي بنى السمع.",
    ),
    L(
      "Mastoid and styloid processes, petrous part and mandibular fossa.",
      "الناتئان الخشائي والإبري والجزء الصخري والحفرة الفكية.",
    ),
    L(
      "Protects the ear and contributes to the jaw joint.",
      "يحمي الأذن ويسهم في مفصل الفك.",
    ),
    L(
      "Mandible, parietal, occipital, sphenoid and zygomatic.",
      "الفك السفلي والجداري والقذالي والوتدي والوجني.",
    ),
    L(
      "Sternocleidomastoid attaches to the mastoid process.",
      "ترتكز القصية الترقوية الخشائية على الناتئ الخشائي.",
    ),
    L(
      "Temporal fractures may affect hearing, balance or the facial nerve.",
      "قد تؤثر كسوره في السمع أو التوازن أو العصب الوجهي.",
    ),
    L(
      "The petrous part encloses the bony labyrinth.",
      "يحتوي الجزء الصخري التيه العظمي.",
    ),
  ),
  occipital: note(
    L(
      "Forms the posterior skull and much of its base.",
      "يشكّل مؤخر القحف وجزءًا كبيرًا من قاعدته.",
    ),
    L(
      "Foramen magnum, occipital condyles and nuchal lines.",
      "الثقبة العظمى واللقمتان القذاليتان والخطوط القفوية.",
    ),
    L(
      "Protects the hindbrain and links the skull to the neck.",
      "يحمي الدماغ الخلفي ويربط القحف بالعنق.",
    ),
    L(
      "Atlas, parietal, temporal and sphenoid.",
      "الأطلس والجداري والصدغي والوتدي.",
    ),
    L(
      "Trapezius and several suboccipital muscles attach here.",
      "ترتكز عليه شبه المنحرفة وعدة عضلات تحت قذالية.",
    ),
    L(
      "Skull-base trauma can involve the foramen magnum region.",
      "قد تشمل رضوض قاعدة القحف منطقة الثقبة العظمى.",
    ),
    L(
      "The spinal cord continues through the foramen magnum.",
      "يمتد النخاع الشوكي عبر الثقبة العظمى.",
    ),
  ),
  sphenoid: note(
    L(
      "A central skull-base bone extending into both orbits.",
      "عظم مركزي في قاعدة القحف يمتد إلى الحجاجين.",
    ),
    L(
      "Greater and lesser wings, sella turcica and pterygoid plates.",
      "الجناحان الكبيران والصغيران والسرج التركي والصفيحتان الجناحيتان.",
    ),
    L(
      "Connects several cranial bones and supports the pituitary region.",
      "يربط عظامًا قحفية متعددة ويدعم منطقة الغدة النخامية.",
    ),
    L(
      "Frontal, parietal, temporal, occipital, ethmoid and facial bones.",
      "الجبهي والجداري والصدغي والقذالي والغربالي وعظام وجهية.",
    ),
    L(
      "Pterygoid muscles arise from its pterygoid region.",
      "تنشأ العضلات الجناحية من منطقته الجناحية.",
    ),
    L(
      "Skull-base lesions can affect nearby cranial nerve passages.",
      "قد تؤثر آفات قاعدة القحف في ممرات الأعصاب القحفية المجاورة.",
    ),
    L(
      "Its shape is often compared with a butterfly.",
      "يشبّه شكله غالبًا بالفراشة.",
    ),
  ),
  ethmoid: note(
    L(
      "A delicate bone between the nasal cavity and the orbits.",
      "عظم رقيق بين التجويف الأنفي والحجاجين.",
    ),
    L(
      "Cribriform plate, crista galli and perpendicular plate.",
      "الصفيحة المصفوية وعرف الديك والصفيحة العمودية.",
    ),
    L(
      "Supports nasal structures and allows olfactory nerve passage.",
      "يدعم بنى الأنف ويتيح مرور ألياف العصب الشمي.",
    ),
    L(
      "Frontal, sphenoid, vomer, maxilla and adjacent orbital bones.",
      "الجبهي والوتدي والمحراث والفك العلوي وعظام الحجاج المجاورة.",
    ),
    L(
      "No major skeletal muscle belly inserts on the cribriform plate.",
      "لا ترتكز كتلة عضلية هيكلية رئيسية على الصفيحة المصفوية.",
    ),
    L(
      "A damaged cribriform plate can be associated with loss of smell or a CSF leak.",
      "قد تترافق أذية الصفيحة المصفوية مع فقد الشم أو تسرّب السائل الدماغي الشوكي.",
    ),
    L(
      "Superior and middle nasal conchae belong to this bone.",
      "المحارتان الأنفيتان العلوية والوسطى جزء من هذا العظم.",
    ),
  ),
  nasal: note(
    L(
      "A small paired bone in the bridge of the nose.",
      "عظم صغير مزدوج في جسر الأنف.",
    ),
    L(
      "Thin external plate and an internal surface for nasal support.",
      "صفيحة خارجية رقيقة وسطح داخلي داعم للأنف.",
    ),
    L(
      "Supports the upper external nose.",
      "يدعم الجزء العلوي من الأنف الخارجي.",
    ),
    L(
      "Opposite nasal, frontal, maxilla and ethmoid.",
      "الأنفي المقابل والجبهي والفك العلوي والغربالي.",
    ),
    L(
      "Small nasal muscles attach through adjacent facial soft tissues.",
      "تتصل العضلات الأنفية الصغيرة عبر الأنسجة الوجهية المجاورة.",
    ),
    L(
      "Nasal fractures are common after direct facial trauma.",
      "تشيع كسور الأنف بعد الرضوض الوجهية المباشرة.",
    ),
    L(
      "Most of the lower external nose is cartilage, not nasal bone.",
      "معظم القسم السفلي من الأنف الخارجي غضروفي لا عظمي.",
    ),
  ),
  maxilla: note(
    L(
      "A paired upper-jaw bone supporting the upper teeth.",
      "عظم مزدوج في الفك العلوي يحمل الأسنان العلوية.",
    ),
    L(
      "Alveolar process, palatine process, infraorbital foramen and maxillary sinus.",
      "الناتئ السنخي والناتئ الحنكي والثقبة تحت الحجاج والجيب الفكي.",
    ),
    L(
      "Supports chewing, the palate and the orbital floor.",
      "يدعم المضغ والحنك وأرضية الحجاج.",
    ),
    L(
      "Opposite maxilla and surrounding nasal, orbital and palatal bones.",
      "الفك العلوي المقابل وعظام الأنف والحجاج والحنك المحيطة.",
    ),
    L(
      "Several facial muscles and part of buccinator attach here.",
      "ترتكز عليه عضلات وجهية وجزء من العضلة المبوقة.",
    ),
    L(
      "Midface fractures may involve the maxilla and its supporting buttresses.",
      "قد تشمل كسور منتصف الوجه الفك العلوي ودعاماته.",
    ),
    L(
      "The paired palatine processes form the anterior hard palate.",
      "يشكّل الناتئان الحنكيان القسم الأمامي من الحنك الصلب.",
    ),
  ),
  zygomatic: note(
    L(
      "The cheekbone, contributing to the lateral orbit.",
      "العظم الوجني الذي يسهم في الجدار الوحشي للحجاج.",
    ),
    L(
      "Frontal and temporal processes and an orbital surface.",
      "الناتئان الجبهي والصدغي والسطح الحجاجي.",
    ),
    L(
      "Supports the cheek and transmits masticatory forces.",
      "يدعم الوجنة وينقل قوى المضغ.",
    ),
    L(
      "Frontal, maxilla, temporal and sphenoid.",
      "الجبهي والفك العلوي والصدغي والوتدي.",
    ),
    L(
      "Masseter arises partly from the zygomatic arch.",
      "تنشأ الماضغة جزئيًا من القوس الوجنية.",
    ),
    L(
      "Zygomatic injuries may alter the contour of the cheek or orbit.",
      "قد تغيّر إصابات الوجني شكل الوجنة أو الحجاج.",
    ),
    L(
      "It forms the anterior portion of the zygomatic arch.",
      "يشكّل القسم الأمامي من القوس الوجنية.",
    ),
  ),
  lacrimal: note(
    L(
      "A thin bone in the medial wall of the orbit.",
      "عظم رقيق في الجدار الإنسي للحجاج.",
    ),
    L(
      "Posterior lacrimal crest and lacrimal groove.",
      "العرف الدمعي الخلفي والثلم الدمعي.",
    ),
    L(
      "Contributes to the housing of the tear-drainage pathway.",
      "يسهم في إحاطة مسار تصريف الدموع.",
    ),
    L(
      "Frontal, ethmoid, maxilla and inferior nasal concha.",
      "الجبهي والغربالي والفك العلوي والمحارة الأنفية السفلية.",
    ),
    L(
      "The lacrimal part of orbicularis oculi has attachments nearby.",
      "توجد قربه ارتكازات القسم الدمعي للعضلة الدويرية العينية.",
    ),
    L(
      "Medial orbital trauma may affect the lacrimal drainage system.",
      "قد تؤثر رضوض الحجاج الإنسي في جهاز تصريف الدموع.",
    ),
    L("It is among the smallest facial bones.", "يُعد من أصغر عظام الوجه."),
  ),
  palatine: note(
    L(
      "An L-shaped bone at the back of the hard palate.",
      "عظم على شكل حرف L في خلف الحنك الصلب.",
    ),
    L("Horizontal and perpendicular plates.", "الصفيحتان الأفقية والعمودية."),
    L(
      "Separates the posterior nasal and oral cavities.",
      "يفصل جزئيًا بين خلف التجويفين الأنفي والفموي.",
    ),
    L(
      "Opposite palatine, maxilla, sphenoid, ethmoid, vomer and inferior concha.",
      "الحنكي المقابل والفك العلوي والوتدي والغربالي والمحراث والمحارة السفلية.",
    ),
    L(
      "Palatal muscles attach in the adjacent palatal region.",
      "ترتكز عضلات الحنك في المنطقة الحنكية المجاورة.",
    ),
    L(
      "Palatal defects can affect separation of the oral and nasal spaces.",
      "قد تؤثر عيوب الحنك في الفصل بين الحيزين الفموي والأنفي.",
    ),
    L(
      "A small process contributes to the orbital floor.",
      "يسهم ناتئ صغير منه في أرضية الحجاج.",
    ),
  ),
  concha: note(
    L(
      "An independent curved bone on the lateral nasal wall.",
      "عظم مستقل منحني على الجدار الوحشي للتجويف الأنفي.",
    ),
    L(
      "Curved lamina and lacrimal, maxillary and ethmoidal processes.",
      "صفيحة منحنية ونواتئ دمعية وفكية وغربالية.",
    ),
    L(
      "Increases mucosal surface for conditioning inspired air.",
      "يزيد سطح الغشاء المخاطي لتهيئة الهواء المستنشق.",
    ),
    L(
      "Maxilla, lacrimal, ethmoid and palatine.",
      "الفك العلوي والدمعي والغربالي والحنكي.",
    ),
    L(
      "Not a major site of skeletal muscle insertion.",
      "ليس موضعًا رئيسيًا لارتكاز العضلات الهيكلية.",
    ),
    L(
      "Mucosal swelling over a concha can narrow nasal airflow.",
      "قد يؤدي تورّم المخاطية فوق المحارة إلى تضيق مجرى الهواء الأنفي.",
    ),
    L(
      "Unlike the superior and middle conchae, it is a separate bone.",
      "بخلاف المحارتين العلوية والوسطى فهو عظم مستقل.",
    ),
  ),
  vomer: note(
    L(
      "A midline plate forming part of the nasal septum.",
      "صفيحة ناصفة تشكّل جزءًا من الحاجز الأنفي.",
    ),
    L(
      "A thin quadrilateral plate with superior wings.",
      "صفيحة رقيقة رباعية الشكل ذات جناحين علويين.",
    ),
    L(
      "Supports separation of the two nasal cavities.",
      "يدعم الفصل بين التجويفين الأنفيين.",
    ),
    L(
      "Sphenoid, ethmoid, paired maxillae and palatines.",
      "الوتدي والغربالي وعظما الفك العلوي والحنك.",
    ),
    L(
      "No major muscle inserts directly on its septal plate.",
      "لا ترتكز عضلة رئيسية مباشرة على صفيحته الحاجزية.",
    ),
    L(
      "It may contribute to a deviated bony nasal septum.",
      "قد يسهم في انحراف القسم العظمي من الحاجز الأنفي.",
    ),
    L(
      "Its name refers to the shape of a ploughshare.",
      "يشير اسمه اللاتيني إلى شكل سكة المحراث.",
    ),
  ),
  mandible: note(
    L(
      "The lower-jaw bone, bearing the lower teeth.",
      "عظم الفك السفلي الذي يحمل الأسنان السفلية.",
    ),
    L(
      "Body, ramus, condylar and coronoid processes and mandibular canal.",
      "الجسم والفرع والناتئان اللقمي والإكليلي والقناة الفكية.",
    ),
    L(
      "Enables jaw movement for mastication and speech.",
      "يتيح حركة الفك للمضغ والكلام.",
    ),
    L(
      "The temporal bones at the temporomandibular joints.",
      "العظمان الصدغيان في المفصلين الفكيين الصدغيين.",
    ),
    L(
      "Masseter, temporalis and pterygoid muscles attach to it.",
      "ترتكز عليه الماضغة والصدغية والعضلات الجناحية.",
    ),
    L(
      "Common fracture sites include the condylar region, angle and body.",
      "تشمل مواضع الكسر الشائعة المنطقة اللقمية والزاوية والجسم.",
    ),
    L(
      "The adult mandible develops from paired embryonic halves.",
      "يتطور الفك السفلي البالغ من نصفين جنينيين.",
    ),
  ),
  malleus: note(
    L(
      "The lateral ossicle of the middle ear.",
      "العظيمة الوحشية من عظيمات الأذن الوسطى.",
    ),
    L("Head, neck and handle (manubrium).", "الرأس والعنق والقبضة."),
    L(
      "Transfers vibration from the tympanic membrane to the incus.",
      "تنقل الاهتزاز من غشاء الطبل إلى السندان.",
    ),
    L(
      "Incus; its handle is attached to the tympanic membrane.",
      "السندان؛ وتتصل قبضتها بغشاء الطبل.",
    ),
    L(
      "Tensor tympani inserts on the malleus.",
      "ترتكز العضلة الموترة للطبل على المطرقة.",
    ),
    L(
      "Disruption of the ossicular chain may cause conductive hearing loss.",
      "قد يسبب انقطاع سلسلة العظيمات نقص سمع توصيليًا.",
    ),
    L("Its name means hammer.", "يعني اسمها المطرقة."),
    L(
      "Small tympanic arterial branches supply the mucosa and bone; tensor tympani receives a branch of V3.",
      "تغذيها فروع شريانية طبلية صغيرة؛ وتتلقى العضلة الموترة للطبل فرعًا من العصب الفكي السفلي.",
    ),
  ),
  incus: note(
    L(
      "The middle link in the auditory ossicular chain.",
      "العظيمة الوسطى في سلسلة عظيمات السمع.",
    ),
    L(
      "Body, short limb and long limb.",
      "الجسم والساق القصيرة والساق الطويلة.",
    ),
    L(
      "Transfers vibration from malleus to stapes.",
      "تنقل الاهتزاز من المطرقة إلى الركاب.",
    ),
    L("Malleus and stapes.", "المطرقة والركاب."),
    L(
      "No muscle directly inserts on the incus.",
      "لا ترتكز عضلة مباشرة على السندان.",
    ),
    L(
      "Its long process can be damaged by middle-ear disease.",
      "قد تتأذى ساقها الطويلة بأمراض الأذن الوسطى.",
    ),
    L("Its name means anvil.", "يعني اسمها السندان."),
    L(
      "Small mucosal vessels of the middle ear supply the ossicle; it has no attached motor muscle.",
      "تغذيها أوعية مخاطية صغيرة في الأذن الوسطى، ولا تتصل بها عضلة حركية.",
    ),
  ),
  stapes: note(
    L(
      "The medial ossicle adjoining the oval window.",
      "العظيمة الإنسية المجاورة للنافذة البيضوية.",
    ),
    L("Head, two crura and footplate.", "الرأس والساقان والقاعدة."),
    L(
      "Transmits vibration to the inner-ear fluids through the oval window.",
      "تنقل الاهتزاز إلى سوائل الأذن الداخلية عبر النافذة البيضوية.",
    ),
    L(
      "Incus; the footplate is secured at the oval window.",
      "السندان؛ وتثبت القاعدة في النافذة البيضوية.",
    ),
    L("Stapedius inserts on its neck.", "ترتكز العضلة الركابية على عنقها."),
    L(
      "Fixation of the footplate can cause conductive hearing loss.",
      "قد يسبب تثبت القاعدة نقص سمع توصيليًا.",
    ),
    L(
      "The stapes is the smallest bone in the human body.",
      "الركاب أصغر عظم في جسم الإنسان.",
    ),
    L(
      "Small tympanic vessels supply the region; stapedius receives the facial nerve.",
      "تغذي المنطقة أوعية طبلية صغيرة؛ وتعصّب العضلة الركابية ألياف من العصب الوجهي.",
    ),
  ),
  hyoid: note(
    L(
      "A U-shaped bone in the anterior neck.",
      "عظم على شكل حدوة في مقدمة العنق.",
    ),
    L(
      "Body, greater horns and lesser horns.",
      "الجسم والقرنان الكبيران والقرنان الصغيران.",
    ),
    L(
      "Provides anchorage for tongue and laryngeal movement.",
      "يوفر ارتكازًا لحركة اللسان والحنجرة.",
    ),
    L(
      "No direct bony articulation; suspended by muscles and ligaments.",
      "لا يتمفصل مباشرة مع عظم آخر؛ يعلّق بعضلات وأربطة.",
    ),
    L(
      "Suprahyoid, infrahyoid and tongue muscles attach here.",
      "ترتكز عليه عضلات فوق اللامية وتحت اللامية وعضلات اللسان.",
    ),
    L(
      "Fracture is uncommon and may accompany severe neck trauma.",
      "كسره غير شائع وقد يرافق رضوض العنق الشديدة.",
    ),
    L(
      "It is the only bone without a direct bony joint.",
      "هو العظم الوحيد الذي لا يتصل بمفصل عظمي مباشر.",
    ),
  ),
};
