# رفع OSSEO ونشره على GitHub Pages

## المتطلبات

حساب GitHub وGit مثبت على جهازك. الأوامر أدناه تنفذ من مجلد المشروع، وليس المجلد الأب.

## 1. إنشاء مستودع

من GitHub اختر New repository، سمّه `human-skeleton-3d` واختر Public إذا ستستخدم GitHub Pages المجاني. لا تضف README أو gitignore من GitHub لأن المشروع يحتويهما. بعدها Create repository.

## 2. الرفع من طرفية VS Code

افتح مجلد المشروع في VS Code ثم Terminal → New Terminal:

```powershell
cd C:\Users\HP\Documents\Codex\2026-10-24\fd\human-skeleton-3d
git init
git add .
git commit -m "Prepare OSSEO anatomy atlas and research X-ray model"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/human-skeleton-3d.git
git push -u origin main
```

بدّل `YOUR_USERNAME` باسم حسابك. إذا سميت المستودع اسمًا آخر بدّل اسم المستودع في الرابط أيضًا. عند طلب تسجيل الدخول، أكمله بمتصفح GitHub؛ لا تضع كلمة السر أو أي token داخل الملفات.

إذا قال Git إنه لا يعرف اسمك وبريدك، نفذ مرة واحدة داخل المشروع باستخدام معلوماتك، ثم أعد commit وpush:

```powershell
git config user.name "Your Name"
git config user.email "YOUR_GITHUB_EMAIL"
```

لا تضغط الملفات كلها داخل ZIP ثم ترفع ZIP إلى المستودع؛ GitHub لا يفك ضغطه تلقائيًا. استخدم الأوامر حتى ترتفع ملفات المصدر وهيكل المجلدات كما هي. `.gitignore` يستبعد `node_modules` وبيئة Python والداتا والكاش والملفات المؤقتة وملفات الأسرار؛ اتركه موجودًا.

## 3. نشر الموقع

1. افتح المستودع على GitHub.
2. Settings → Pages.
3. تحت Build and deployment اختر Source: **GitHub Actions**.
4. افتح Actions واختر **Publish OSSEO to GitHub Pages**. إذا لم يبدأ تلقائيًا، اختر Run workflow على فرع main.
5. انتظر نجاح النشر بالعلامة الخضراء. افتح رابط الموقع من صفحة Pages أو من نتيجة deployment.

الرابط المعتاد:

```text
https://YOUR_USERNAME.github.io/human-skeleton-3d/
```

هذا رابط الموقع الذي يفتح على الجوال؛ رابط `github.com/...` يعرض ملفات الكود فقط. بعد أي تعديل لاحق:

```powershell
git add .
git commit -m "Update website"
git push
```

سيتكرر البناء والنشر تلقائيًا.

## ما الذي يعمل على الرابط؟

المجسم والعظام والبحث والتفاصيل واللغة العربية تعمل كواجهة ثابتة. GitHub Pages **لا يشغل Python**؛ لذلك تحليل الأشعة لا يعمل بمجرد رفع المستودع. الواجهة توضح عند عدم وجود خدمة تحليل متصلة، ولا تعرض نتيجة وهمية.

## ربط تحليل الأشعة لاحقًا

تحتاج استضافة Python مستقلة تدعم PyTorch وبذاكرة مناسبة، وليس Colab كخادم دائم. ارفع كود API والأوزان والتقرير المشار إليهما في `ml/artifacts/active-model.json`. الخادم يشغل:

```text
python -m uvicorn server:app --app-dir ml --host 0.0.0.0 --port PORT
```

استبدل PORT بالمنفذ الذي تعطيك إياه الاستضافة. إعداد الحزم والأوزان والترخيص والحدود موضح في `ml/README.md`. قبل تعريض الخدمة للعامة يلزم إعداد التحكم بالوصول وحدود الطلبات وCORS للأصل المحدد لموقعك؛ التهيئة الحالية محلية ولا نفترض أن نشر خادم طبي للعامة آمن بمجرد تغيير عنوان الاستماع.

بعد توفر HTTPS API، ضع عنوان أصل الخادم بدون `/api/xray` في:

Settings → Secrets and variables → Actions → Variables → New repository variable

```text
Name: VITE_XRAY_API_URL
Value: https://YOUR-API-HOST
```

ثم أعد Run workflow. هذا العنوان عام ومضمّن في الواجهة؛ لا تضع فيه token أو API key. يلزم السماح لأصل GitHub Pages في إعداد CORS للخادم عند تشغيله على أصل مختلف. النموذج الحالي ما زال تجريبيًا ولم يحقق هدف التقييم الداخلي؛ ربط الاستضافة لا يحسن دقته.

مصدر إعداد Pages: https://vite.dev/guide/static-deploy#github-pages
