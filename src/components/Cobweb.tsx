import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface It { label: string; F: (x: number) => number; dF: (x: number) => number; view: View; x0: number; range: [number, number]; fixed: number[] }

const its: Record<string, It> = {
  cos: { label: '$\\cos x$', F: Math.cos, dF: (x) => -Math.sin(x), view: { xMin: -0.1, xMax: 1.6, yMin: -0.1, yMax: 1.3 }, x0: 1, range: [0, 1.55], fixed: [0.739085] },
  lin: { label: '$\\tfrac12 x + 4$', F: (x) => x / 2 + 4, dF: () => 0.5, view: { xMin: -1, xMax: 13, yMin: -1, yMax: 13 }, x0: 0, range: [0, 12], fixed: [8] },
  sq: { label: '$x^2$', F: (x) => x * x, dF: (x) => 2 * x, view: { xMin: -0.1, xMax: 1.4, yMin: -0.1, yMax: 1.4 }, x0: 0.9, range: [0, 1.1], fixed: [0, 1] },
  rep: { label: '$2x - 1$', F: (x) => 2 * x - 1, dF: () => 2, view: { xMin: -1, xMax: 3, yMin: -1, yMax: 3 }, x0: 1.05, range: [0.5, 1.5], fixed: [1] },
  osc: { label: '$1 - \\tfrac32 x$', F: (x) => 1 - 1.5 * x, dF: () => -1.5, view: { xMin: -1.2, xMax: 1.6, yMin: -1.2, yMax: 1.6 }, x0: 0.45, range: [0, 0.8], fixed: [0.4] },
};

/** 3.6 — التكرار x(n+1) = F(x(n)) في صورة «بيت العنكبوت»: جذب إذا |F'(x*)| < 1، وتنافر إذا > 1. */
export default function Cobweb() {
  const [k, setK] = useState('cos');
  const I = its[k];
  const [x0, setX0] = useState(I.x0);
  const [n, setN] = useState(12);
  const xs = [x0];
  for (let i = 0; i < n; i++) { const v = I.F(xs[i]); xs.push(Number.isFinite(v) ? v : NaN); }
  const ref = usePlot(I.view, (p) => {
    p.axes();
    p.lineThrough(0, 0, 1, p.c['ink-3'], { width: 1.4 });
    p.fn(I.F, p.c.f1, { width: 3 });
    for (let i = 0; i < n; i++) {
      const a = xs[i], b = xs[i + 1];
      if (!Number.isFinite(b) || Math.abs(b) > 1e3) break;
      p.line(a, a, a, b, p.c.f2, { width: 1.6 });
      p.line(a, b, b, b, p.c.f2, { width: 1.6 });
    }
    for (const f of I.fixed) p.point(f, f, Math.abs(I.dF(f)) < 1 ? p.c.area : p.c.red, 6);
    p.point(x0, x0, p.c.f2, 5);
  }, [k, x0, n]);
  const last = xs[xs.length - 1];
  return (
    <Widget title="بيت العنكبوت: هل يتقارب التكرار؟" hint="من $(x_0, x_0)$ على القطر اصعد أو انزل إلى المنحنى، فتحصل على $x_1 = F(x_0)$، ثم أفقياً إلى القطر، وكرّر. النقاط الثابتة حيث يقطع المنحنى القطر $y = x$. **خضراء** إذا كانت $|F'(x^*)| \lt 1$ (جاذبة)، و**حمراء** إذا كانت $\gt 1$ (طاردة). والميل السالب يجعل بيت العنكبوت حلزونياً بدل الدرج.">
      <Choice value={k} onChange={(v) => { setK(v); setX0(its[v].x0); }} options={Object.entries(its).map(([v, i]) => ({ v, label: `$x_{n+1} = ${i.label.slice(1, -1)}$` }))} />
      <Canvas refEl={ref} ratio={0.8} label="مخطط بيت العنكبوت" />
      <div className="controls">
        <Slider label="البداية $x_0$" value={x0} min={I.range[0]} max={I.range[1]} step={0.01} onChange={setX0} show={(v) => fmt(v)} color="var(--f2)" />
        <Slider label="عدد الخطوات" value={n} min={1} max={40} step={1} onChange={setN} />
      </div>
      <Readout items={[
        { label: `$x_{${n}}$`, value: Number.isFinite(last) && Math.abs(last) < 1e6 ? fmt(last, 6) : '∞', color: 'var(--f2)' },
        ...I.fixed.map((f) => ({ label: `$F'(x^*)$ عند $x^* = ${fmt(f, 4)}$`, value: fmt(I.dF(f), 4), color: Math.abs(I.dF(f)) < 1 ? 'var(--area)' : 'var(--red)' })),
      ]} />
    </Widget>
  );
}
