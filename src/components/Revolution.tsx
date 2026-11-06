import { useEffect, useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

interface S { label: string; f: (x: number) => number; d: (x: number) => number; a: number; b: number; ymax: number; vol: string; area: string; note: string }
const ss: Record<string, S> = {
  head: { label: 'المصباح $\\sqrt{x}$', f: Math.sqrt, d: (x) => 0.5 / Math.sqrt(Math.max(x, 1e-9)), a: 0, b: 2, ymax: 1.6, vol: 'π ∫ x dx = 2π', area: '', note: 'المثال 8: تدوير $y = \\sqrt{x}$ حول المحور $x$ يصنع «مصباحاً أمامياً». الشرائح أقراص مساحتها $\\pi y^2 = \\pi x$، والحجم $\\int_0^2 \\pi x\\,dx = 2\\pi$.' },
  cone: { label: 'مخروط', f: (x) => x / 2, d: () => 0.5, a: 0, b: 2, ymax: 1.2, vol: '⅓ π r² h', area: '', note: 'الخط المائل يصنع مخروطاً. نصف القطر ينخفض خطياً، **والمساحة تربيعياً**: ومن تكامل $x^2$ يأتي العامل $\\tfrac13$.' },
  sphere: { label: 'كرة', f: (x) => Math.sqrt(Math.max(0, 1 - x * x)), d: (x) => -x / Math.sqrt(Math.max(1e-9, 1 - x * x)), a: -1, b: 1, ymax: 1.2, vol: '4/3 π R³', area: '4π R²', note: 'نصف الدائرة يصنع كرة. **أرخميدس:** مساحة الحزام بين $x = a$ و $x = b$ على كرة نصف قطرها $R$ هي $2\\pi R(b - a)$، تتناسب مع العرض فقط! (حرّك الطرفين.)' },
  loaf: { label: 'رغيف $\\sin x$', f: Math.sin, d: Math.cos, a: 0, b: Math.PI, ymax: 1.2, vol: 'π²/2', area: '', note: 'التمرين 18: تدوير $y = \\sin x$ من 0 إلى $\\pi$ يصنع رغيف خبز. الحجم $\\pi\\int_0^\\pi \\sin^2 x\\,dx = \\pi^2/2$. **ولا ننسى $\\cos^2$ مرة أخرى.**' },
};

const simp = (g: (x: number) => number, a: number, b: number, n = 300) => { if (b <= a) return 0; const h = (b - a) / n; let s = g(a) + g(b); for (let i = 1; i < n; i++) s += g(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };

/** 8.1 / 8.3 — المجسم الدوراني: المنحنى يدور حول المحور x، والحجم بالأقراص، ومساحة السطح بالأحزمة. */
export default function Revolution() {
  const [k, setK] = useState('head');
  const S = ss[k];
  const [a, setA] = useState(S.a);
  const [b, setB] = useState(S.b);
  const [x0, setX0] = useState((S.a + S.b) / 2);
  const clock = useClock(5, { loop: false });
  useEffect(() => { clock.setT(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const phi = 2 * Math.PI * clock.t;
  // إسقاط مائل: النقطة (x, r cos θ, r sin θ) تظهر عند (x + 0.22 r sin θ, r cos θ)
  const P = (x: number, r: number, th: number): [number, number] => [x + 0.22 * r * Math.sin(th), r * Math.cos(th)];
  const ref = usePlot({ xMin: S.a - 0.3, xMax: S.b + 0.45, yMin: -S.ymax, yMax: S.ymax }, (p) => {
    p.axes({ xLabel: 'x' });
    const ctx = p.ctx;
    // حلقات عند نقاط x: أقواس من 0 إلى φ
    const nRings = 16;
    for (let i = 0; i <= nRings; i++) {
      const x = S.a + ((S.b - S.a) * i) / nRings, r = S.f(x);
      if (r <= 1e-6) continue;
      ctx.beginPath();
      for (let j = 0; j <= 60; j++) { const th = (phi * j) / 60; const [X, Y] = P(x, r, th); if (j === 0) ctx.moveTo(p.X(X), p.Y(Y)); else ctx.lineTo(p.X(X), p.Y(Y)); }
      ctx.strokeStyle = x >= a && x <= b ? p.c.f1 : p.c['ink-3']; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.2; ctx.stroke(); ctx.globalAlpha = 1;
    }
    // المنحنى الأصلي والمنحنى المُدار بزاوية φ
    p.curve((x) => x, S.f, S.a, S.b, p.c.f1, { width: 3 });
    p.curve((x) => P(x, S.f(x), phi)[0], (x) => P(x, S.f(x), phi)[1], S.a, S.b, p.c.f2, { width: 2.4, n: 200 });
    // القرص عند x0
    const r0 = S.f(x0);
    ctx.beginPath();
    for (let j = 0; j <= 80; j++) { const th = (2 * Math.PI * j) / 80; const [X, Y] = P(x0, r0, th); if (j === 0) ctx.moveTo(p.X(X), p.Y(Y)); else ctx.lineTo(p.X(X), p.Y(Y)); }
    ctx.closePath(); ctx.fillStyle = p.c.area; ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1;
    p.line(a, -S.ymax, a, S.ymax, p.c['ink-3'], { width: 1, dash: [3, 4] });
    p.line(b, -S.ymax, b, S.ymax, p.c['ink-3'], { width: 1, dash: [3, 4] });
  }, [k, a, b, x0, phi]);
  const V = simp((x) => Math.PI * S.f(x) ** 2, a, b);
  const A = simp((x) => 2 * Math.PI * S.f(x) * Math.sqrt(1 + S.d(x) ** 2), a + (k === 'sphere' ? 1e-6 : 0), b - (k === 'sphere' ? 1e-6 : 0), 2000);
  return (
    <Widget title="المجسم الدوراني: أقراص وأحزمة" hint="الأزرق المنحنى $y = f(x)$، وحين تضغط **دوِّر** يكنس المنحنى البرتقالي السطح حول المحور $x$. كل شريحة **قرص** نصف قطره $y$ (الأخضر)، مساحته $\pi y^2$ وحجمه $\pi y^2\,dx$. ومساحة السطح تجمع **أحزمة** طولها المائل $ds$ ومحيطها $2\pi y$: $\int 2\pi y\,ds$.">
      <Choice value={k} onChange={(v) => { setK(v); const q = ss[v]; setA(q.a); setB(q.b); setX0((q.a + q.b) / 2); }} options={Object.entries(ss).map(([v, q]) => ({ v, label: q.label }))} />
      <Canvas refEl={ref} ratio={0.62} label="المنحنى يدور حول المحور x" />
      <AnimControls clock={clock} label="دوِّر" />
      <div className="controls">
        <Slider label="$a$" value={a} min={S.a} max={b - 0.02} step={0.005} onChange={setA} show={(v) => fmt(v, 2)} />
        <Slider label="$b$" value={b} min={a + 0.02} max={S.b} step={0.005} onChange={setB} show={(v) => fmt(v, 2)} />
        <Slider label="الشريحة عند $x$" value={x0} min={S.a} max={S.b} step={0.005} onChange={setX0} show={(v) => fmt(v, 2)} color="var(--area)" />
      </div>
      <Readout items={[
        { label: 'مساحة القرص $\\pi y^2$', value: fmt(Math.PI * S.f(x0) ** 2, 4), color: 'var(--area)' },
        { label: 'الحجم $\\int \\pi y^2\\,dx$', value: fmt(V, 4), color: 'var(--f1)' },
        { label: 'مساحة السطح $\\int 2\\pi y\\,ds$', value: fmt(A, 4), color: 'var(--f2)' },
        ...(k === 'sphere' ? [{ label: '$2\\pi R(b - a)$', value: fmt(2 * Math.PI * (b - a), 4) }] : []),
      ]} />
      <MathText as="div" className="verdict">{S.note}</MathText>
    </Widget>
  );
}
