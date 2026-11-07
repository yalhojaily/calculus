# التفاضل والتكامل مع Strang

موقع عربي تفاعلي يشرح كتاب **Calculus** (الطبعة الثالثة) لـ Gilbert Strang من MIT، قسماً قسماً، مع صفحات الكتاب الأصلية بجانب الشرح.

الكتاب منشور مجاناً على [MIT OpenCourseWare](https://ocw.mit.edu) بترخيص CC BY-NC-SA.

**الحالة:** الفصول 0 إلى 13 مكتملة (81 درساً). خريطة الكتاب كاملة (17 فصلاً، 92 قسماً)، وكل قسم لم يُشرح بعد له صفحة تعرض صفحاته من الكتاب.

## فكرة كل درس

1. **الصورة الكبيرة**: الحدس أولاً، بطريقة Strang: الدالة (1) هي المسافة، والدالة (2) هي السرعة.
2. **جرّب بنفسك**: محاكاة على canvas، وكل حركة فيها تشغيل وإيقاف وإبطاء (0.25× إلى 2×).
3. **مثال محلول**: يظهر خطوة خطوة.
4. **توقّف وتحقّق**: أسئلة مع تصحيح فوري وشرح.
5. **تمارين من الكتاب**: مع أزرار تفتح الصفحة المقصودة.
6. **📖 لوحة الكتاب**: صفحات القسم الأصلية بجانب الشرح، مع وضع داكن للقراءة ليلاً.

**نظام الألوان ثابت في الموقع كله:** الأزرق للدالة (1) أي الارتفاع أو المسافة، والبرتقالي للدالة (2) أي الميل أو السرعة، والأخضر للمساحة.

## البنية

```
src/
  data/curriculum.ts      خريطة الكتاب: كل الفصول والأقسام، صفحاتها، متطلباتها (PDF page = book page + 13)
  content/lessons/*.mdx   درس لكل قسم (frontmatter: id, summary, objectives, minutes, video)
  components/
    ui.tsx                usePlot, useClock (تشغيل/إيقاف/سرعة), Slider, Readout, Widget, Choice
    BookPanel.tsx         لوحة صفحات الكتاب
    QuickCheck, StepReveal, Callout, Term, BookRef
    GrowthRace, DistanceSpeed, SecantTangent, ExpSeries, Compound,
    MaxMin, RiemannSum, Newton, ZoomIn, ChainCalc,
    FunctionShift, Differences, TaxBrackets, InstantVelocity,
    CircleShadow, UnitCircle, SinN,
    DerivativeGraph, Pascal, Elasticity, TangentNormal, RedLight,
    SineSlope, SineSqueeze, ProductArea, RuleCheck,
    SequenceLimit, EpsilonDelta, Discontinuities,
    LinearApprox, Expressway, Profit, QuadApprox, GraphAnatomy,
    SquareWave, Conics, Cobweb, Logistic, NewtonChaos,
    MeanValue, LHopital,
    ChainRule, Implicit, RelatedRates, InverseMirror, InverseTrig,
    Telescope, IncomeRect, AreaFunction, SumPowers, Substitution,
    UpperLower, AverageValue, Rings, NumericalRules,
    ExpSlope, LogPaper, SlopeField, MoneyFlow, LogArea, SCurve,
    EulerSteps, HyperbolaCircle,
    PartsArea, DeltaSpike, Orthogonal, Mercator, CircleSub,
    PartialFrac, ImproperArea, AreaBetween, Revolution, ArcLength,
    Distributions, CentralLimit, Centroid, RollingRace, ForceWork,
    PolarCoords, PolarGraph, MarsLoop, PolarConic, PolarArea,
    ComplexPlane, ComplexSpiral, GeometricSeries, SeriesRace,
    IntegralTest, ConvergenceLab, Rearrange, TaylorPoly, EulerSeries,
    ConvergenceRadius, VectorCombo, DotProject, PlaneNormal, CrossBox,
    TwoLines, MatrixMap, ThreePlanes, SpaceCurve, Projectile, Cycloid,
    Osculating, KeplerOrbit, SurfaceContour, PartialPlane, GradientMap,
    ChainPath, QuadForm, LagrangeWidget    ← محاكاة قابلة لإعادة الاستخدام
  lib/plot.ts             محرك رسم صغير على canvas (محاور، منحنيات، مساحات، مماسات، أسهم، منحنيات بارامترية)
  lib/polar.ts            مقياس متساوٍ للمحورين، شبكة قطبية، ورسم r = F(θ) بلون للجزء السالب
  lib/three.ts            إسقاط ثلاثي الأبعاد ودوران بالسحب، المتجهات، رسم السطوح z = f(x, y) وخطوط التساوي
  lib/bidi.ts             عزل المقاطع اللاتينية (y = x²) داخل العناوين العربية
  lib/progress.ts         التقدّم في localStorage
scripts/render_pages.py   يحوّل public/book.pdf إلى صور صفحات (public/pages/, غير محفوظة في git)
tests/                    اختبارات خريطة الكتاب
```

### لماذا صور الصفحات بدل PDF.js أو استخراج النص؟

- **النص المستخرج** يشوّه الرياضيات: `y = x²` تخرج `y D x 2`.
- **PDF.js** (وهو أيضاً عارض Firefox المدمج) يرسم هذا الكتاب بحروف ناقصة، لأن خطوط Times وHelvetica غير مضمّنة في الملف.
- **Poppler** يرسم الصفحات صحيحة. والصور بـ 16 درجة رمادي (≈55KB للصفحة) تعمل في كل متصفح وعلى الجوال.

## إضافة درس

1. اكتب `src/content/lessons/<id>-<slug>.mdx` بنفس frontmatter الدروس الموجودة (`id` يطابق `curriculum.ts`).
2. استخدم المحاكاة الموجودة أو أضف مكوّناً جديداً بـ `usePlot` و `useClock`.
3. الدرس يظهر في الخريطة تلقائياً.

### ملاحظات للكتابة في MDX

- ضع `summary` و `objectives` في frontmatter بين علامتي اقتباس مفردتين، لأن النقطتين `:` تكسران YAML. وضع `id` بين علامتي اقتباس (`"2.6"`)، وإلا قُرئ عدداً.
- لا تكتب `\$` داخل الرياضيات (مثل `$\$20$`)، فهي تُربك محلّل الرياضيات. اكتب المبالغ بالعربية: «20,350 دولار».
- لا تكتب جملة عربية كاملة داخل معادلة `$$...$$`، لأن المعادلات تُعرض من اليسار لليمين.

## الأوامر

```bash
npm install
python3 scripts/render_pages.py   # مرة واحدة: صور صفحات الكتاب (يحتاج poppler-utils و Pillow)
npm run dev                       # http://localhost:4321/calculus/
npm test
npm run build
```

الدفع إلى `main` ينشر الموقع على GitHub Pages: من Settings ثم Pages ثم Source اختر **GitHub Actions**. سير العمل يولّد صور الصفحات ويحفظها في الذاكرة المؤقتة.
