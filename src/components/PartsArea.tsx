import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Pr { label: string; u: (x: number) => number; v: (x: number) => number; du: (x: number) => number; dv: (x: number) => number; xr: [number, number]; ab: [number, number]; view: View; note: string }
const prs: Record<string, Pr> = {
  ln: { label: '$\\int \\ln x\\,dx$', u: Math.log, v: (x) => x, du: (x) => 1 / x, dv: () => 1, xr: [1, 4], ab: [1, Math.E], view: { xMin: -0.15, xMax: 1.5, yMin: -0.2, yMax: 4.3 }, note: '$u = \\ln x$ و $v = x$. المساحة الصعبة $\\int u\\,dv = \\int \\ln x\\,dx$ **استُبدلت** بالسهلة $\\int v\\,du = \\int x \\cdot \\tfrac1x\\,dx = \\int 1\\,dx$.' },
  xcos: { label: '$\\int x\\cos x\\,dx$', u: (x) => x, v: Math.sin, du: () => 1, dv: Math.cos, xr: [0.05, 1.55], ab: [0.2, 1.4], view: { xMin: -0.1, xMax: 1.7, yMin: -0.1, yMax: 1.15 }, note: 'المثال 2: $u = x$ و $dv = \\cos x\\,dx$، فـ $v = \\sin x$. **أعطِ $u$ مشتقة لطيفة، وأعطِ $dv$ تكاملاً لطيفاً.**' },
  atan: { label: '$\\int \\tan^{-1} x\\,dx$', u: Math.atan, v: (x) => x, du: (x) => 1 / (1 + x * x), dv: () => 1, xr: [0, 3], ab: [0.3, 2.5], view: { xMin: -0.1, xMax: 1.4, yMin: -0.1, yMax: 3.2 }, note: 'المثال 4: $u = \\tan^{-1} x$ و $v = x$. والتكامل الباقي $\\int \\dfrac{x\\,dx}{1 + x^2} = \\tfrac12\\ln(1 + x^2)$. **كل الدوال العكسية المألوفة تُكامَل هكذا.**' },
};

const simpson = (f: (x: number) => number, a: number, b: number, n = 200) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };

/** 7.1 — هندسة التكامل بالتجزئة: المساحتان ∫u dv و ∫v du تملآن الفرق بين المستطيلين u(b)v(b) و u(a)v(a). */
export default function PartsArea() {
  const [k, setK] = useState('ln');
  const P = prs[k];
  const [a, setA] = useState(P.ab[0]);
  const [b, setB] = useState(P.ab[1]);
  const Iudv = simpson((x) => P.u(x) * P.dv(x), a, b);
  const Ivdu = simpson((x) => P.v(x) * P.du(x), a, b);
  const ref = usePlot(P.view, (p) => {
    p.axes({ xLabel: 'u', yLabel: 'v' });
    const ctx = p.ctx, N = 120;
    const seg = (fill: string, toAxis: 'u' | 'v') => {
      ctx.beginPath();
      if (toAxis === 'v') { ctx.moveTo(p.X(0), p.Y(P.v(a))); for (let i = 0; i <= N; i++) { const x = a + ((b - a) * i) / N; ctx.lineTo(p.X(P.u(x)), p.Y(P.v(x))); } ctx.lineTo(p.X(0), p.Y(P.v(b))); }
      else { ctx.moveTo(p.X(P.u(a)), p.Y(0)); for (let i = 0; i <= N; i++) { const x = a + ((b - a) * i) / N; ctx.lineTo(p.X(P.u(x)), p.Y(P.v(x))); } ctx.lineTo(p.X(P.u(b)), p.Y(0)); }
      ctx.closePath(); ctx.fillStyle = fill; ctx.globalAlpha = 0.4; ctx.fill(); ctx.globalAlpha = 1;
    };
    seg(p.c.f2, 'v'); // ∫u dv: يسار المنحنى
    seg(p.c.area, 'u'); // ∫v du: تحت المنحنى
    p.rect(0, 0, P.u(a), P.v(a), p.c.ink, { alpha: 0.12 });
    p.line(0, P.v(b), P.u(b), P.v(b), p.c.ink, { width: 1.2, dash: [4, 3] });
    p.line(P.u(b), 0, P.u(b), P.v(b), p.c.ink, { width: 1.2, dash: [4, 3] });
    p.curve(P.u, P.v, P.xr[0], P.xr[1], p.c.f1, { width: 3 });
    p.point(P.u(a), P.v(a), p.c.red, 5); p.point(P.u(b), P.v(b), p.c.red, 5);
  }, [k, a, b]);
  const uvb = P.u(b) * P.v(b), uva = P.u(a) * P.v(a);
  return (
    <Widget title="هندسة التكامل بالتجزئة" hint="المنحنى الأزرق النقاط $(u(x), v(x))$ من $x = a$ إلى $x = b$. البرتقالي **يسار** المنحنى هو $\int u\,dv$، والأخضر **تحته** هو $\int v\,du$. معاً يملآن المستطيل الكبير $u(b)v(b)$ ناقص المستطيل الصغير $u(a)v(a)$ (الرمادي). فـ $\int u\,dv = \big[uv\big]_a^b - \int v\,du$.">
      <Choice value={k} onChange={(v) => { setK(v); setA(prs[v].ab[0]); setB(prs[v].ab[1]); }} options={Object.entries(prs).map(([v, q]) => ({ v, label: q.label }))} />
      <Canvas refEl={ref} ratio={0.75} label="المساحتان في التكامل بالتجزئة" />
      <div className="controls">
        <Slider label="$a$" value={a} min={P.xr[0]} max={b - 0.05} step={0.005} onChange={setA} show={(v) => fmt(v, 3)} color="var(--red)" />
        <Slider label="$b$" value={b} min={a + 0.05} max={P.xr[1]} step={0.005} onChange={setB} show={(v) => fmt(v, 3)} color="var(--red)" />
      </div>
      <Readout items={[
        { label: '$\\int u\\,dv$', value: fmt(Iudv, 4), color: 'var(--f2)' },
        { label: '$\\int v\\,du$', value: fmt(Ivdu, 4), color: 'var(--area)' },
        { label: 'المجموع', value: fmt(Iudv + Ivdu, 4) },
        { label: '$u(b)v(b) - u(a)v(a)$', value: fmt(uvb - uva, 4) },
      ]} />
      <MathText as="div" className="verdict">{P.note}</MathText>
    </Widget>
  );
}
