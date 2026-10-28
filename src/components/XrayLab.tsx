import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { bones } from "../data/bones";
import { useAppStore } from "../store/useAppStore";
import { useFocusTrap } from "../hooks/useFocusTrap";
import "./XrayLab.css";
const apiBase = (import.meta.env.VITE_XRAY_API_URL || "").trim().replace(/\/$/, "");
const hostedWithoutApi = import.meta.env.PROD && !apiBase;

interface Metrics {
  box_precision_iou50: number;
  box_recall_iou50: number;
  image_sensitivity: number;
  image_specificity: number;
  images: number;
}
interface Health {
  ready: boolean;
  progress?: {
    epochs_completed: number;
    epochs_planned: number;
    stage: string;
  };
  report: null | {
    meets_engineering_target?: boolean;
    id: string;
    algorithm: string;
    split_counts: Record<string, number>;
    test: Metrics;
    threshold: number;
  };
}
interface Result {
  detections: { box: number[]; score: number }[];
  model: string;
  status: string;
}

export function XrayLab({ onClose }: { onClose: () => void }) {
  const ar = useAppStore((s) => s.language) === "ar";
  const language = ar ? "ar" : "en";
  const txt = (en: string, arabic: string) => (ar ? arabic : en);
  const ref = useRef<HTMLDivElement>(null);
  const request = useRef<AbortController | null>(null);
  const upload = useRef<HTMLInputElement>(null);
  useFocusTrap(ref, true, onClose);
  const [health, setHealth] = useState<Health | null>(null);
  const [connection, setConnection] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [bone, setBone] = useState("");
  const [sample, setSample] = useState("");
  const check = useCallback(async () => {
    if (hostedWithoutApi) { setHealth(null); setConnection("not-configured"); return; }
    try {
      const r = await fetch(`${apiBase}/api/xray/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!r.ok) throw new Error();
      setHealth(await r.json());
      setConnection("");
    } catch {
      setConnection("offline");
      setHealth(null);
    }
  }, []);
  useEffect(() => {
    const initial = window.setTimeout(() => void check(), 0);
    const interval = window.setInterval(() => void check(), 10000);
    return () => {
      clearInterval(interval);
      clearTimeout(initial);
      request.current?.abort();
    };
  }, [check]);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);
  function choose(next: File | undefined, source = "") {
    request.current?.abort();
    setBusy(false);
    setResult(null);
    setError("");
    setSample(source);
    setBone("");
    if (!next) return;
    setFile(null);
    setPreview("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(next.type) ||
      next.size > 12 * 1024 * 1024
    ) {
      setError(
        txt(
          "Choose a JPG, PNG or WebP image under 12 MB. DICOM is not supported.",
          "اختار صورة JPG أو PNG أو WebP أصغر من 12 ميغابايت. DICOM غير مدعوم.",
        ),
      );
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }
  async function loadSample(kind: string) {
    try {
      const r = await fetch(`${apiBase}/api/xray/sample/${kind}`);
      if (!r.ok) throw new Error();
      choose(
        new File([await r.blob()], "fracatlas-example.jpg", {
          type: "image/jpeg",
        }),
        kind,
      );
      setConsent(true);
    } catch {
      setError(
        txt(
          "Example unavailable. Start the ML server.",
          "المثال غير متوفر. شغّل سيرفر النموذج.",
        ),
      );
    }
  }
  async function analyze() {
    if (!file || !consent || busy) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setResult(null);
    const body = new FormData();
    body.append("file", file);
    try {
      const r = await fetch(`${apiBase}/api/xray/analyze`, {
        method: "POST",
        body,
        signal: controller.signal,
      });
      const data = await r.json();
      if (!r.ok)
        throw new Error(
          typeof data.detail === "string" ? data.detail : "Request failed",
        );
      if (!controller.signal.aborted) setResult(data);
    } catch (e) {
      if (!controller.signal.aborted)
        setError(
          txt("Analysis failed. ", "تعذر التحليل. ") +
            (e instanceof Error ? e.message : ""),
        );
    } finally {
      if (request.current === controller) setBusy(false);
    }
  }
  function showBone() {
    if (!bone) return;
    useAppStore.getState().selectBone(bone);
    useAppStore.setState({ panelOpen: false, isolate: false });
    onClose();
  }
  const percent = (n: number) => `${(100 * n).toFixed(1)}%`;
  return createPortal(
    <div className="xray-overlay">
      <div
        className="xray-lab"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="xray-title"
        dir={ar ? "rtl" : "ltr"}
      >
        <header className="xray-header">
          <div>
            <span className="eyebrow">OSSEO / RESEARCH LAB</span>
            <h2 id="xray-title">{txt("X-ray explorer", "مختبر الأشعة")}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label={txt("Close", "إغلاق")}
            className="xray-close"
          >
            ×
          </button>
        </header>
        <p className="xray-notice">
          {txt(
            "Experimental ML output, not a diagnosis. Do not use it to decide treatment or rule out injury. A clinician must review the original study.",
            "نتائج تعلم آلي تجريبية وليست تشخيصًا. لا تعتمد عليها للعلاج أو لنفي الإصابة؛ يلزم مراجعة الصور الأصلية عند مختص.",
          )}
        </p>
        <div className="xray-columns">
          <section className="xray-study">
            <div className="xray-section-label">
              01 / {txt("RADIOGRAPH", "صورة الأشعة")}
            </div>
            <p className="xray-caption">
              {txt(
                "Research scope: arm/hand, leg, hip and shoulder radiographs. Other body regions and DICOM are unsupported.",
                "النطاق التجريبي: أشعة الذراع واليد والرجل والحوض والكتف. باقي مناطق الجسم وملفات DICOM غير مدعومة.",
              )}
            </p>
            <input
              className="xray-native-input"
              tabIndex={-1}
              ref={upload}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => choose(e.target.files?.[0])}
              aria-label={txt("Upload X-ray", "رفع صورة أشعة")}
              disabled={busy}
            />
            {file && (
              <button disabled={busy} onClick={() => upload.current?.click()}>
                {txt("Choose another image", "اختيار صورة أخرى")}
              </button>
            )}
            <div
              className="xray-drop"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!busy) choose(e.dataTransfer.files[0]);
              }}
            >
              {preview ? (
                <div className="xray-image">
                  <img
                    src={preview}
                    alt={txt("Uploaded radiograph", "صورة الأشعة المرفوعة")}
                    onError={() => {
                      setError(txt("Invalid image", "الصورة غير صالحة"));
                      setFile(null);
                      setPreview("");
                    }}
                  />
                  {result?.detections.map((d, i) => (
                    <span
                      key={i}
                      className="xray-box"
                      style={{
                        left: `${d.box[0] * 100}%`,
                        top: `${d.box[1] * 100}%`,
                        width: `${(d.box[2] - d.box[0]) * 100}%`,
                        height: `${(d.box[3] - d.box[1]) * 100}%`,
                      }}
                    >
                      <b>
                        {i + 1} / {d.score.toFixed(2)}
                      </b>
                    </span>
                  ))}
                </div>
              ) : (
                <button
                  className="xray-upload"
                  onClick={() => upload.current?.click()}
                >
                  <span>＋</span>
                  <strong>
                    {txt("Choose a radiograph", "اختار صورة أشعة")}
                  </strong>
                  <small>JPG · PNG · WEBP / 12 MB</small>
                </button>
              )}
            </div>
            {sample && (
              <p className="xray-caption">
                {txt(
                  "Public held-out FracAtlas example. Dataset label: ",
                  "مثال عام من مجموعة اختبار FracAtlas. تسمية البيانات: ",
                )}
                {sample === "fractured"
                  ? txt("fractured", "كسر")
                  : txt("non-fractured", "بدون كسر مصنّف")}
                .{" "}
                {txt(
                  "This label is not a model prediction.",
                  "هذه التسمية من البيانات، وليست توقع النموذج.",
                )}
              </p>
            )}
            <div className="xray-examples">
              <span>{txt("Try dataset examples:", "جرّب من البيانات:")}</span>
              <button
                disabled={!health?.ready || busy}
                onClick={() => void loadSample("fractured")}
              >
                {txt("Fracture label", "مثال كسر")}
              </button>
              <button
                disabled={!health?.ready || busy}
                onClick={() => void loadSample("non-fractured")}
              >
                {txt("Negative label", "مثال سلبي")}
              </button>
            </div>
            <label className="xray-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              {txt(
                "I am using an anonymized image for research. Uploads go to the local ML server and are not saved.",
                "أستخدم صورة منزوعة المعلومات الشخصية للبحث. تُرسل لسيرفر النموذج المحلي ولا يتم حفظها.",
              )}
            </label>
            <button
              className="xray-analyze"
              onClick={() => void analyze()}
              disabled={!health?.ready || !file || !consent || busy}
            >
              {busy
                ? txt("Analyzing…", "جاري التحليل…")
                : txt("Run research model ↗", "تشغيل النموذج التجريبي ↗")}
            </button>
            {busy && (
              <button
                onClick={() => {
                  request.current?.abort();
                  setBusy(false);
                }}
              >
                {txt("Cancel", "إلغاء")}
              </button>
            )}
            {error && (
              <p className="xray-error" role="alert">
                {error}
              </p>
            )}
          </section>
          <section className="xray-findings" aria-live="polite">
            {health?.report && (
              <p className="xray-notice">
                {txt(
                  `Internal test: correct box proposals ${percent(health.report.test.box_precision_iou50)}; fracture boxes recovered ${percent(health.report.test.box_recall_iou50)}. This performance is limited and is not clinical validation.`,
                  `الاختبار الداخلي: نسبة المواقع الصحيحة بين الاقتراحات ${percent(health.report.test.box_precision_iou50)}؛ نسبة الكسور التي التقطها ${percent(health.report.test.box_recall_iou50)}. الأداء محدود وهذا ليس اعتمادًا طبيًا.`,
                )}
                {health.report.meets_engineering_target === false && <strong>{txt(' The internal evaluation target was not met.', ' لم يحقق النموذج هدف التقييم الداخلي.')}</strong>}
              </p>
            )}
            <div className="xray-section-label">
              02 / {txt("RESEARCH OUTPUT", "النتيجة التجريبية")}
            </div>
            {!health?.ready && (
              <div className="xray-card">
                <h3>
                  {health
                    ? txt("Model preparation in progress", "جاري تجهيز النموذج")
                    : hostedWithoutApi
                      ? txt("X-ray service is not connected", "خدمة تحليل الأشعة غير مربوطة")
                    : connection
                      ? txt(
                          "ML server is offline",
                          "سيرفر الذكاء الاصطناعي غير مشغّل",
                        )
                      : txt(
                          "Connecting to local model…",
                          "جاري الاتصال بالنموذج المحلي…",
                        )}
                </h3>
                <p>
                  {health
                    ? txt(
                        "The server is connected. Training and evaluation must finish before analysis is enabled. This page reconnects automatically.",
                        "السيرفر متصل. لازم يكتمل التدريب والتقييم قبل تفعيل التحليل. الصفحة تفحص الجاهزية تلقائيًا.",
                      )
                    : hostedWithoutApi ? txt('The anatomy atlas is available. X-ray analysis needs a separately hosted service connected to this site.', 'المجسم ومعلومات العظام متاحة. تحليل الأشعة يحتاج ربط هذه النسخة بخدمة تحليل مستضافة.') : txt(
                        "The website and ML server run separately. Start the API below; this page reconnects automatically.",
                        "الموقع وسيرفر الذكاء الاصطناعي يعملان بشكل منفصل. شغّل الأمر التالي؛ الصفحة تعيد الاتصال تلقائيًا.",
                      )}
                </p>
                {health?.progress && (
                  <p>
                    {health.progress.stage === "evaluation"
                      ? txt(
                          "Training finished. Evaluating held-out images…",
                          "اكتمل التدريب. جاري تقييم صور الاختبار…",
                        )
                      : txt(
                          `Completed training rounds: ${health.progress.epochs_completed} / ${health.progress.epochs_planned}`,
                          `جولات التدريب المكتملة: ${health.progress.epochs_completed} من أصل ${health.progress.epochs_planned}`,
                        )}
                  </p>
                )}
                {!health && !hostedWithoutApi && <code>npm run ml:serve</code>}
                <button onClick={() => void check()}>
                  {txt("Check connection", "فحص الاتصال")}
                </button>
              </div>
            )}
            {health?.ready && !result && (
              <div className="xray-card">
                <span className="xray-live">
                  ● {txt("LOCAL MODEL READY", "النموذج المحلي جاهز")}
                </span>
                <h3>
                  {txt("Explore candidate regions", "استكشف مناطق الاشتباه")}
                </h3>
                <p>
                  {txt(
                    "A real trained detector proposes boxes. It cannot determine bruise, hairline subtype, bone identity or laterality.",
                    "النموذج المدرّب يقترح مربعات للاشتباه. لا يحدد الرضّة أو نوع الشعر أو اسم العظمة أو جهتها.",
                  )}
                </p>
              </div>
            )}
            {result && (
              <div className="xray-card">
                <span className="xray-live">
                  {txt("UNVALIDATED OUTPUT", "نتيجة غير معتمدة طبيًا")}
                </span>
                <h3>
                  {result.detections.length
                    ? txt(
                        `${result.detections.length} candidate region(s)`,
                        `${result.detections.length} مناطق اشتباه تجريبية`,
                      )
                    : txt(
                        "No candidate above threshold",
                        "لا توجد منطقة تجاوزت عتبة النموذج",
                      )}
                </h3>
                <p>
                  {txt(
                    "Neither result confirms nor excludes a fracture. Scores are raw model scores, not the probability that you have an injury.",
                    "النتيجة لا تؤكد ولا تنفي وجود كسر. الأرقام درجات للنموذج وليست احتمال إصابتك.",
                  )}
                </p>
                <ul>
                  {result.detections.map((d, i) => (
                    <li key={i}>
                      {txt("Region", "منطقة")} {i + 1}: {txt("score", "درجة")}{" "}
                      {d.score.toFixed(3)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="xray-card">
              <h3>{txt("Locate on the atlas", "تحديد العظمة على المجسم")}</h3>
              <p>
                {txt(
                  "Choose the bone and side yourself. The atlas highlights the whole bone; it does not place the detected fracture at an exact 3D point.",
                  "اختار العظمة والجهة بنفسك. المجسم يضيء العظمة كاملة؛ لا يحدد نقطة الكسر ثلاثية الأبعاد.",
                )}
              </p>
              <select
                aria-label={txt("Confirm bone and side", "تأكيد العظمة والجهة")}
                value={bone}
                onChange={(e) => setBone(e.target.value)}
              >
                <option value="">
                  {txt("Confirm bone + side…", "اختار العظمة والجهة…")}
                </option>
                {bones
                  .filter((b) =>
                    ["upper", "lower", "shoulder", "pelvis"].includes(b.group),
                  )
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name[language]}
                    </option>
                  ))}
              </select>
              <button disabled={!bone} onClick={showBone}>
                {txt("Highlight confirmed bone →", "إضاءة العظمة المختارة ←")}
              </button>
            </div>
            {health?.report && (
              <details className="xray-card">
                <summary>
                  {txt(
                    "Model evaluation & limitations",
                    "تقييم النموذج وحدوده",
                  )}
                </summary>
                <p>{health.report.algorithm}</p>
                <p>FracAtlas v7 / CC BY 4.0</p>
                <p>
                  {txt("Train / validation / test", "تدريب / تحقق / اختبار")}:{" "}
                  {Object.values(health.report.split_counts).join(" / ")}
                </p>
                <dl className="xray-metrics">
                  <dt>
                    {txt("Box precision (IoU ≥ 0.5)", "دقة مربعات الكشف")}
                  </dt>
                  <dd>{percent(health.report.test.box_precision_iou50)}</dd>
                  <dt>
                    {txt("Box recall (IoU ≥ 0.5)", "استرجاع مربعات الكشف")}
                  </dt>
                  <dd>{percent(health.report.test.box_recall_iou50)}</dd>
                  <dt>{txt("Image sensitivity", "حساسية الصور")}</dt>
                  <dd>{percent(health.report.test.image_sensitivity)}</dd>
                  <dt>{txt("Image specificity", "نوعية الصور")}</dt>
                  <dd>{percent(health.report.test.image_specificity)}</dd>
                </dl>
                <p>
                  {txt(
                    "Internal image-level test only; patient separation is unverified. No external clinical validation. Limited to hand/arm, leg, hip and shoulder images. Unsupported: skull, spine, chest, DICOM, bruise classification, reliable hairline exclusion, automated 3D registration.",
                    "اختبار داخلي على مستوى الصور فقط؛ فصل المرضى غير موثّق. لا يوجد تحقق سريري خارجي. النطاق اليد والذراع والرجل والحوض والكتف. غير مدعوم: الجمجمة والعمود الفقري والصدر وDICOM وتصنيف الرضوض ونفي الشعر والتطابق التلقائي مع المجسم.",
                  )}
                </p>
                <a
                  href="https://doi.org/10.6084/m9.figshare.22363012.v7"
                  target="_blank"
                  rel="noreferrer"
                >
                  {txt("Dataset & attribution ↗", "مصدر البيانات ونسبتها ↗")}
                </a>
              </details>
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
