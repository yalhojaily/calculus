// خريطة الكتاب كاملة، مأخوذة من فهرس كتاب Gilbert Strang: Calculus (الطبعة الثالثة، MIT OpenCourseWare).
// يصبح الدرس "متاحاً" عندما يوجد ملف MDX بنفس المعرّف `id` في src/content/lessons.
//
// أرقام الصفحات هنا هي أرقام الكتاب المطبوعة. صفحة ملف PDF = صفحة الكتاب + PDF_OFFSET.

export const PDF_OFFSET = 13;
export const OCW_VIDEOS = 'https://ocw.mit.edu/resources/res-18-005-highlights-of-calculus-spring-2010/';

export interface Section {
  id: string; // "2.3"
  titleAr: string;
  titleEn: string;
  /** أول وآخر صفحة في الكتاب المطبوع */
  pages: [number, number];
  slug: string;
  prereqs: string[];
}

export interface Chapter {
  number: number;
  titleAr: string;
  titleEn: string;
  /** المرحلة: تفاضل بمتغير واحد، تكامل، متسلسلات، متعدد المتغيرات… */
  part: PartKey;
  sections: Section[];
}

export type PartKey = 'big' | 'diff' | 'int' | 'more' | 'multi';

export const parts: Record<PartKey, { ar: string; color: string }> = {
  big: { ar: 'الصورة الكبيرة', color: 'var(--f1)' },
  diff: { ar: 'التفاضل', color: 'var(--f2)' },
  int: { ar: 'التكامل', color: 'var(--area)' },
  more: { ar: 'الأسية والمتسلسلات والقطبية', color: 'var(--violet)' },
  multi: { ar: 'متعدد المتغيرات', color: 'var(--teal)' },
};

/** [id, عربي, English, صفحة البداية, متطلبات إضافية غير القسم السابق] */
type Raw = [id: string, ar: string, en: string, start: number, extra?: string[]];

const raw: { n: number; ar: string; en: string; part: PartKey; s: Raw[] }[] = [
  {
    n: 0, ar: 'أبرز أفكار التفاضل والتكامل', en: 'Highlights of Calculus', part: 'big',
    s: [
      ['0.1', 'المسافة والسرعة = الارتفاع والميل', 'Distance and Speed = Height and Slope', 1],
      ['0.2', 'الميل المتغيّر للدالتين y = x² و y = xⁿ', 'The Changing Slope of y = x² and y = xⁿ', 9],
      ['0.3', 'الدالة الأسية y = eˣ', 'The Exponential y = eˣ', 15],
      ['0.4', 'ملخصات المحاضرات وتمارين', 'Video Summaries and Practice Problems', 23],
      ['0.5', 'الرسوم البيانية والحاسبات البيانية', 'Graphs and Graphing Calculators', 45],
    ],
  },
  {
    n: 1, ar: 'مدخل إلى التفاضل والتكامل', en: 'Introduction to Calculus', part: 'big',
    s: [
      ['1.1', 'السرعة والمسافة', 'Velocity and Distance', 51, ['0.1']],
      ['1.2', 'تفاضل وتكامل بلا نهايات', 'Calculus Without Limits', 59],
      ['1.3', 'السرعة عند لحظة', 'The Velocity at an Instant', 67, ['0.2']],
      ['1.4', 'الحركة الدائرية', 'Circular Motion', 73],
      ['1.5', 'مراجعة لحساب المثلثات', 'A Review of Trigonometry', 80],
      ['1.6', 'ألف نقطة من الضوء', 'A Thousand Points of Light', 85],
    ],
  },
  {
    n: 2, ar: 'المشتقات', en: 'Derivatives', part: 'diff',
    s: [
      ['2.1', 'مشتقة الدالة', 'The Derivative of a Function', 87, ['1.3']],
      ['2.2', 'القوى وكثيرات الحدود', 'Powers and Polynomials', 94],
      ['2.3', 'الميل والمماس', 'The Slope and the Tangent Line', 102],
      ['2.4', 'مشتقة الجيب وجيب التمام', 'The Derivative of the Sine and Cosine', 109, ['1.5']],
      ['2.5', 'قواعد الضرب والقسمة والقوة', 'The Product and Quotient and Power Rules', 116],
      ['2.6', 'النهايات', 'Limits', 123],
      ['2.7', 'الدوال المتصلة', 'Continuous Functions', 131],
    ],
  },
  {
    n: 3, ar: 'تطبيقات المشتقة', en: 'Applications of the Derivative', part: 'diff',
    s: [
      ['3.1', 'التقريب الخطي', 'Linear Approximation', 138, ['2.3']],
      ['3.2', 'مسائل القيم العظمى والصغرى', 'Maximum and Minimum Problems', 143],
      ['3.3', 'المشتقة الثانية: الانحناء والتسارع', 'Second Derivatives: Bending and Acceleration', 153],
      ['3.4', 'الرسوم البيانية', 'Graphs', 160],
      ['3.5', 'القطوع المكافئة والناقصة والزائدة', 'Parabolas, Ellipses, and Hyperbolas', 170],
      ['3.6', 'التكرار xₙ₊₁ = F(xₙ)', 'Iterations xₙ₊₁ = F(xₙ)', 179],
      ['3.7', 'طريقة نيوتن (والفوضى)', "Newton's Method (and Chaos)", 187],
      ['3.8', 'مبرهنة القيمة المتوسطة وقاعدة لوبيتال', "The Mean Value Theorem and l'Hôpital's Rule", 197],
    ],
  },
  {
    n: 4, ar: 'المشتقات بقاعدة السلسلة', en: 'Derivatives by the Chain Rule', part: 'diff',
    s: [
      ['4.1', 'قاعدة السلسلة', 'The Chain Rule', 204, ['2.5']],
      ['4.2', 'الاشتقاق الضمني والمعدلات المرتبطة', 'Implicit Differentiation and Related Rates', 211],
      ['4.3', 'الدوال العكسية ومشتقاتها', 'Inverse Functions and Their Derivatives', 216],
      ['4.4', 'الدوال المثلثية العكسية', 'Inverses of Trigonometric Functions', 223, ['2.4']],
    ],
  },
  {
    n: 5, ar: 'التكاملات', en: 'Integrals', part: 'int',
    s: [
      ['5.1', 'فكرة التكامل', 'The Idea of the Integral', 229, ['1.2']],
      ['5.2', 'الدوال الأصلية', 'Antiderivatives', 234, ['2.5']],
      ['5.3', 'الجمع مقابل التكامل', 'Summation versus Integration', 240],
      ['5.4', 'التكاملات غير المحددة والتعويض', 'Indefinite Integrals and Substitutions', 249, ['4.1']],
      ['5.5', 'التكامل المحدد', 'The Definite Integral', 254],
      ['5.6', 'خصائص التكامل والقيمة المتوسطة', 'Properties of the Integral and Average Value', 260],
      ['5.7', 'المبرهنة الأساسية وتطبيقاتها', 'The Fundamental Theorem and Its Applications', 267, ['2.1']],
      ['5.8', 'التكامل العددي', 'Numerical Integration', 275],
    ],
  },
  {
    n: 6, ar: 'الأسيّات واللوغاريتمات', en: 'Exponentials and Logarithms', part: 'more',
    s: [
      ['6.1', 'نظرة عامة', 'An Overview', 284, ['0.3', '4.3']],
      ['6.2', 'الدالة الأسية eˣ', 'The Exponential eˣ', 292],
      ['6.3', 'النمو والاضمحلال في العلوم والاقتصاد', 'Growth and Decay in Science and Economics', 299],
      ['6.4', 'اللوغاريتمات', 'Logarithms', 310],
      ['6.5', 'المعادلات القابلة للفصل ومنها المعادلة اللوجستية', 'Separable Equations Including the Logistic Equation', 317, ['5.4']],
      ['6.6', 'القوى بدل الأسيّات', 'Powers Instead of Exponentials', 326],
      ['6.7', 'الدوال الزائدية', 'Hyperbolic Functions', 336],
    ],
  },
  {
    n: 7, ar: 'تقنيات التكامل', en: 'Techniques of Integration', part: 'int',
    s: [
      ['7.1', 'التكامل بالتجزئة', 'Integration by Parts', 342, ['5.7', '2.5']],
      ['7.2', 'التكاملات المثلثية', 'Trigonometric Integrals', 348],
      ['7.3', 'التعويضات المثلثية', 'Trigonometric Substitutions', 355, ['4.4']],
      ['7.4', 'الكسور الجزئية', 'Partial Fractions', 362],
      ['7.5', 'التكاملات المعتلّة', 'Improper Integrals', 367],
    ],
  },
  {
    n: 8, ar: 'تطبيقات التكامل', en: 'Applications of the Integral', part: 'int',
    s: [
      ['8.1', 'المساحات والحجوم بالشرائح', 'Areas and Volumes by Slices', 373, ['5.7']],
      ['8.2', 'طول منحنى مستوٍ', 'Length of a Plane Curve', 383],
      ['8.3', 'مساحة السطح الدوراني', 'Area of a Surface of Revolution', 388],
      ['8.4', 'الاحتمالات والتفاضل والتكامل', 'Probability and Calculus', 391],
      ['8.5', 'الكتل والعزوم', 'Masses and Moments', 399],
      ['8.6', 'القوة والشغل والطاقة', 'Force, Work, and Energy', 406],
    ],
  },
  {
    n: 9, ar: 'الإحداثيات القطبية والأعداد المركبة', en: 'Polar Coordinates and Complex Numbers', part: 'more',
    s: [
      ['9.1', 'الإحداثيات القطبية', 'Polar Coordinates', 412, ['1.5']],
      ['9.2', 'المعادلات القطبية ورسومها', 'Polar Equations and Graphs', 416],
      ['9.3', 'الميل والطول والمساحة للمنحنيات القطبية', 'Slope, Length, and Area for Polar Curves', 421, ['8.2']],
      ['9.4', 'الأعداد المركبة', 'Complex Numbers', 425],
    ],
  },
  {
    n: 10, ar: 'المتسلسلات اللانهائية', en: 'Infinite Series', part: 'more',
    s: [
      ['10.1', 'المتسلسلة الهندسية', 'The Geometric Series', 433, ['0.3']],
      ['10.2', 'اختبارات التقارب: المتسلسلات الموجبة', 'Convergence Tests: Positive Series', 440, ['7.5']],
      ['10.3', 'اختبارات التقارب: كل المتسلسلات', 'Convergence Tests: All Series', 448],
      ['10.4', 'متسلسلة تايلور للدوال eˣ و sin x و cos x', 'The Taylor Series for eˣ, sin x, and cos x', 452, ['6.2']],
      ['10.5', 'متسلسلات القوى', 'Power Series', 458],
    ],
  },
  {
    n: 11, ar: 'المتجهات والمصفوفات', en: 'Vectors and Matrices', part: 'multi',
    s: [
      ['11.1', 'المتجهات والضرب النقطي', 'Vectors and Dot Products', 466, ['1.5']],
      ['11.2', 'المستويات والإسقاطات', 'Planes and Projections', 476],
      ['11.3', 'الضرب الاتجاهي والمحددات', 'Cross Products and Determinants', 486],
      ['11.4', 'المصفوفات والمعادلات الخطية', 'Matrices and Linear Equations', 496],
      ['11.5', 'الجبر الخطي', 'Linear Algebra', 507],
    ],
  },
  {
    n: 12, ar: 'الحركة على منحنى', en: 'Motion Along a Curve', part: 'multi',
    s: [
      ['12.1', 'متجه الموضع', 'The Position Vector', 517, ['11.1', '2.1']],
      ['12.2', 'الحركة في المستوى: المقذوفات والدويريات', 'Plane Motion: Projectiles and Cycloids', 525],
      ['12.3', 'الانحناء والمتجه العمودي', 'Curvature and Normal Vector', 531],
      ['12.4', 'الإحداثيات القطبية وحركة الكواكب', 'Polar Coordinates and Planetary Motion', 537, ['9.1']],
    ],
  },
  {
    n: 13, ar: 'المشتقات الجزئية', en: 'Partial Derivatives', part: 'multi',
    s: [
      ['13.1', 'السطوح ومنحنيات المستوى', 'Surfaces and Level Curves', 545, ['11.2']],
      ['13.2', 'المشتقات الجزئية', 'Partial Derivatives', 549, ['2.1']],
      ['13.3', 'المستويات المماسة والتقريبات الخطية', 'Tangent Planes and Linear Approximations', 554, ['3.1']],
      ['13.4', 'المشتقات الاتجاهية والتدرّج', 'Directional Derivatives and Gradients', 565],
      ['13.5', 'قاعدة السلسلة', 'The Chain Rule', 574, ['4.1']],
      ['13.6', 'القيم العظمى والصغرى ونقاط السرج', 'Maxima, Minima, and Saddle Points', 582, ['3.2']],
      ['13.7', 'القيود ومضاعفات لاغرانج', 'Constraints and Lagrange Multipliers', 592],
    ],
  },
  {
    n: 14, ar: 'التكاملات المتعددة', en: 'Multiple Integrals', part: 'multi',
    s: [
      ['14.1', 'التكاملات الثنائية', 'Double Integrals', 599, ['13.2', '5.5']],
      ['14.2', 'التحويل إلى إحداثيات أنسب', 'Change to Better Coordinates', 607, ['9.1']],
      ['14.3', 'التكاملات الثلاثية', 'Triple Integrals', 616],
      ['14.4', 'الإحداثيات الأسطوانية والكروية', 'Cylindrical and Spherical Coordinates', 622],
    ],
  },
  {
    n: 15, ar: 'حساب المتجهات', en: 'Vector Calculus', part: 'multi',
    s: [
      ['15.1', 'الحقول المتجهة', 'Vector Fields', 631, ['13.4']],
      ['15.2', 'التكاملات الخطية', 'Line Integrals', 637, ['12.1']],
      ['15.3', 'مبرهنة غرين', "Green's Theorem", 646, ['14.1']],
      ['15.4', 'التكاملات السطحية', 'Surface Integrals', 657],
      ['15.5', 'مبرهنة التباعد', 'The Divergence Theorem', 667, ['14.3']],
      ['15.6', 'مبرهنة ستوكس ودوران F', "Stokes' Theorem and the Curl of F", 674],
    ],
  },
  {
    n: 16, ar: 'الرياضيات بعد التفاضل والتكامل', en: 'Mathematics after Calculus', part: 'more',
    s: [['16', 'الرياضيات بعد التفاضل والتكامل', 'Mathematics after Calculus', 681, ['15.6']]],
  },
];

/** آخر صفحة في متن الكتاب (بعدها جدول التكاملات والفهرس) */
const LAST_PAGE = 682;

const slugOf = (id: string) => `s${id.replace('.', '-')}`;

const flat = raw.flatMap((c) => c.s.map((s) => ({ c, s })));

export const curriculum: Chapter[] = raw.map((c) => ({
  number: c.n,
  titleAr: c.ar,
  titleEn: c.en,
  part: c.part,
  sections: c.s.map(([id, ar, en, start, extra = []], i) => {
    const k = flat.findIndex((f) => f.s[0] === id);
    const nextStart = k + 1 < flat.length ? flat[k + 1].s[3] : LAST_PAGE + 1;
    const prev = i > 0 ? [c.s[i - 1][0]] : [];
    return {
      id,
      titleAr: ar,
      titleEn: en,
      pages: [start, nextStart - 1] as [number, number],
      slug: slugOf(id),
      prereqs: [...prev, ...extra],
    };
  }),
}));

export const allSections: Section[] = curriculum.flatMap((c) => c.sections);

export const sectionById = (id: string) => allSections.find((s) => s.id === id);

export const chapterOf = (id: string) => curriculum.find((c) => c.sections.some((s) => s.id === id))!;

export const sectionHref = (base: string, s: Section) => `${base.replace(/\/$/, '')}/lessons/${s.slug}/`;

export function neighbors(id: string) {
  const i = allSections.findIndex((s) => s.id === id);
  return { prev: allSections[i - 1], next: allSections[i + 1] };
}

export const pdfPage = (bookPage: number) => bookPage + PDF_OFFSET;
