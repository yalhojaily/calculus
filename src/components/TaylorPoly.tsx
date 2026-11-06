import { useEffect, useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

const fact = (n: number) => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
// معامل (x − a)ⁿ في متسلسلة 1/(x − c) لعدد مركب c = (cr, ci): (−1)ⁿ / (a − c)ⁿ⁺¹
const invPow = (re: number, im: number, m: number) => { const r = Math.hypot(re, im) ** -m, th = -m * Math.atan2(im, re); return [r * Math.cos(th), r * Math.sin(th)]; };
interface F { label: string; f: (x: number) => number; c: (n: number, a: number) => number; view: View; aRange: [number, number]; a0: number; R: (a: number) => number; note: string }
const fs: Record<string, F> = {
  exp: { label: '$e^x$', f: Math.exp, c: (n, a) => Math.exp(a) / fact(n), view: { xMin: -4, xMax: 4, yMin: -3, yMax: 12 }, aRange: [-2, 2], a0: 0, R: () => Infinity, note: 'كل مشتقات $e^x$ هي $e^x$، فالمعاملات $e^a/n!$. **المضروب يجعل المتسلسلة تتقارب لكل $x$.** حول $a = 1$: $e^x = e\\left(1 + (x - 1) + \\tfrac{(x - 1)^2}{2!} + \\cdots\\right)$، أي $e^x = e\\cdot e^{x - 1}$.' },
  sin: { label: '$\\sin x$', f: Math.sin, c: (n, a) => Math.sin(a + (n * Math.PI) / 2) / fact(n), view: { xMin: -10, xMax: 10, yMin: -2.5, yMax: 2.5 }, aRange: [-3, 3], a0: 0, R: () => Infinity, note: 'حول 0 المشتقات $0, 1, 0, -1, \\ldots$: $\\sin x = x - \\tfrac{x^3}{3!} + \\tfrac{x^5}{5!} - \\cdots$، **قوى فردية فقط**. المجاميع الجزئية تبتعد أكثر فأكثر قبل أن تفقد الاتصال بالمنحنى.' },
  cos: { label: '$\\cos x$', f: Math.cos, c: (n, a) => Math.cos(a + (n * Math.PI) / 2) / fact(n), view: { xMin: -10, xMax: 10, yMin: -2.5, yMax: 2.5 }, aRange: [-3, 3], a0: 0, R: () => Infinity, note: 'المثال 2: حل $y\'\' = -y$ بـ $y = 1$، $y\' = 0$: **قوى زوجية فقط** بإشارات متناوبة، $1 - \\tfrac{x^2}{2!} + \\tfrac{x^4}{4!} - \\cdots$. وبإشارات موجبة كلها نحصل على $\\cosh x$.' },
  geo: { label: '$1/(1 - x)$', f: (x) => 1 / (1 - x), c: (n, a) => (1 - a) ** -(n + 1), view: { xMin: -2.5, xMax: 2.5, yMin: -4, yMax: 8 }, aRange: [-1.5, 0.8], a0: 0, R: (a) => Math.abs(1 - a), note: 'المتسلسلة الهندسية. **الدالة تنفجر عند $x = 1$، فتتوقف المتسلسلة هناك**: نصف قطر التقارب هو البعد من الأساس $a$ إلى $1$. خارج الفترة (المظللة) تبتعد المجاميع الجزئية مهما أضفت.' },
  ln: { label: '$\\ln(1 + x)$', f: (x) => Math.log(1 + x), c: (n, a) => (n === 0 ? Math.log(1 + a) : ((n % 2 ? 1 : -1) / n) * (1 + a) ** -n), view: { xMin: -1.5, xMax: 3.5, yMin: -3, yMax: 2.5 }, aRange: [-0.5, 2], a0: 0, R: (a) => 1 + a, note: '$x - \\tfrac12 x^2 + \\tfrac13 x^3 - \\cdots$: **المعاملات $1/n$ لا $1/n!$**. الدالة تنفجر عند $x = -1$، فنصف القطر $1 + a$. عند $x = 1$ (طرف الفترة) تتقارب ببطء إلى $\\ln 2$.' },
  bell: { label: '$1/(1 + x^2)$', f: (x) => 1 / (1 + x * x), c: (n, a) => (n % 2 ? -1 : 1) * invPow(a, -1, n + 1)[1], view: { xMin: -3, xMax: 3, yMin: -1, yMax: 2 }, aRange: [-2, 2], a0: 0, R: (a) => Math.hypot(a, 1), note: '**لغز:** الدالة لا تفشل أبداً على المحور الحقيقي، **ومع ذلك نصف القطر 1** حول $a = 0$: $1 - x^2 + x^4 - \\cdots$ يتوقف عند $|x| = 1$. السبب في الأعداد المركبة: الدالة تنفجر عند $x = \\pm i$ (القسم 10.5). حرّك $a$: نصف القطر $\\sqrt{1 + a^2}$، البعد إلى $\\pm i$.' },
  sqrt: { label: '$\\sqrt{1 + x}$', f: (x) => Math.sqrt(1 + x), c: (n, a) => { let b = 1; for (let i = 0; i < n; i++) b *= (0.5 - i) / (i + 1); return b * (1 + a) ** (0.5 - n); }, view: { xMin: -1.5, xMax: 3.5, yMin: -1, yMax: 3 }, aRange: [-0.5, 2], a0: 0, R: (a) => 1 + a, note: 'المتسلسلة ذات الحدين مع $p = \\tfrac12$: $1 + \\tfrac12 x - \\tfrac18 x^2 + \\tfrac1{16}x^3 - \\cdots$. **المعاملات لا تتوقف** لأن $p$ ليس عدداً صحيحاً موجباً. المشتقات العليا تنفجر عند $x = -1$، فنصف القطر $1 + a$.' },
};

/** 10.4 / 10.5 — كثيرات حدود تايلور: كل حد يطابق مشتقة عند الأساس a. شغّل لتضيف الحدود. */
export default function TaylorPoly({ initial = 'exp', only, showA = true }: { initial?: keyof typeof fs; only?: (keyof typeof fs)[]; showA?: boolean }) {
  const [k, setK] = useState<string>(initial);
  const F = fs[k];
  const [a, setA] = useState(F.a0);
  const [n, setN] = useState(3);
  const clock = useClock(8, { loop: false });
  const NMAX = 24;
  useEffect(() => { setA(fs[k].a0); }, [k]);
  useEffect(() => { if (clock.playing) setN(Math.round(clock.t * NMAX)); }, [clock.t]); // eslint-disable-line react-hooks/exhaustive-deps
  const cs = Array.from({ length: NMAX + 1 }, (_, i) => F.c(i, a));
  const P = (x: number, m: number) => { let s = 0, q = 1; for (let i = 0; i <= m; i++) { s += cs[i] * q; q *= x - a; } return s; };
  const R = F.R(a);
  const ref = usePlot(F.view, (p) => {
    p.axes({ xLabel: 'x', yLabel: 'y' });
    if (Number.isFinite(R)) p.rect(a - R, p.view.yMin, a + R, p.view.yMax, p.c.area, { alpha: 0.1, stroke: false });
    for (let m = Math.max(0, n - 3); m < n; m++) p.fn((x) => P(x, m), p.c['ink-3'], { width: 1 });
    p.fn(F.f, p.c.f1, { width: 3.2 });
    p.fn((x) => P(x, n), p.c.f2, { width: 2.4 });
    p.point(a, F.f(a), p.c.red, 6);
  }, [k, a, n]);
  const tex: string[] = [];
  cs.slice(0, Math.min(n, 5) + 1).forEach((c, i) => {
    if (Math.abs(c) < 1e-12) return;
    const base = i === 0 ? '' : a === 0 ? 'x' : `(x ${a > 0 ? '-' : '+'} ${fmt(Math.abs(a), 2)})`;
    const pow = i > 1 ? `^{${i}}` : '';
    const mag = Math.abs(c), num = i > 0 && Math.abs(mag - 1) < 1e-9 ? '' : fmt(mag, 4);
    tex.push(`${tex.length ? (c < 0 ? ' - ' : ' + ') : c < 0 ? '-' : ''}${num}${base}${pow}`);
  });
  const formula = `$P_{${n}}(x) = ${tex.join('') || '0'}${n > 5 ? ' + \\cdots' : ''}$`;
  const keys = (only ?? Object.keys(fs)) as string[];
  return (
    <Widget title="كثيرات حدود تايلور" hint="**10L:** $f(x) = \sum \dfrac{f^{(n)}(a)}{n!}(x - a)^n$. الحد $n$ يطابق المشتقة النونية عند الأساس $a$ (النقطة الحمراء) دون أن يفسد المشتقات السابقة. الأزرق الدالة، والبرتقالي المجموع الجزئي حتى $(x - a)^n$، والرمادي ما قبله. **المظلل فترة التقارب** $|x - a| \lt r$.">
      {keys.length > 1 && <Choice value={k} onChange={setK} options={keys.map((v) => ({ v, label: fs[v].label }))} />}
      <Canvas refEl={ref} ratio={0.55} label="الدالة ومجاميع تايلور الجزئية" />
      <AnimControls clock={clock} label="أضف الحدود" />
      <div className="controls">
        <Slider label="الدرجة $n$" value={n} min={0} max={NMAX} step={1} onChange={setN} />
        {showA && <Slider label="الأساس $a$" value={a} min={F.aRange[0]} max={F.aRange[1]} step={0.05} onChange={setA} show={(v) => fmt(v, 2)} color="var(--red)" />}
      </div>
      <Readout items={[
        { label: 'نصف قطر التقارب $r$', value: Number.isFinite(R) ? fmt(R, 3) : '∞', color: 'var(--area)' },
      ]} />
      <div className="ltr" style={{ margin: "12px 0 4px", textAlign: "center", overflowX: "auto" }}><MathText>{formula}</MathText></div>
      <MathText as="div" className="verdict">{F.note}</MathText>
    </Widget>
  );
}
