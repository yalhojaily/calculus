import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Fn { label: string; f: (x: number) => number; d: (x: number) => number; a: number; dx: [number, number]; view: View; tex: string }

const fns: Record<string, Fn> = {
  sqrt: { label: '$\\sqrt{x}$ عند $100$', f: Math.sqrt, d: (x) => 1 / (2 * Math.sqrt(x)), a: 100, dx: [-60, 300], view: { xMin: 0, xMax: 420, yMin: 0, yMax: 27 }, tex: '\\sqrt{x} \\approx 10 + \\tfrac{1}{20}(x - 100)' },
  pow: { label: '$(1 + x)^{100}$ عند $0$', f: (x) => (1 + x) ** 100, d: (x) => 100 * (1 + x) ** 99, a: 0, dx: [-0.02, 0.02], view: { xMin: -0.022, xMax: 0.022, yMin: 0, yMax: 3.2 }, tex: '(1 + x)^{100} \\approx 1 + 100x' },
  sq: { label: '$x^2$ عند $2$', f: (x) => x * x, d: (x) => 2 * x, a: 2, dx: [-1, 1], view: { xMin: 0.5, xMax: 3.5, yMin: 0, yMax: 10 }, tex: 'dy = 4\\,dx' },
  sin: { label: '$\\sin x$ عند $0$', f: Math.sin, d: Math.cos, a: 0, dx: [-1.5, 1.5], view: { xMin: -1.8, xMax: 1.8, yMin: -1.5, yMax: 1.5 }, tex: '\\sin x \\approx x' },
};

/** 3.1 — التقريب الخطي: Y = f(a) + f'(a)(x − a). Δy على المنحنى مقابل dy على المماس. */
export default function LinearApprox() {
  const [k, setK] = useState('sqrt');
  const F = fns[k];
  const [dx, setDx] = useState(k === 'sqrt' ? 2 : F.dx[1] / 2);
  const a = F.a, x = a + dx;
  const y = F.f(x), Y = F.f(a) + F.d(a) * dx;
  const ref = usePlot(F.view, (p) => {
    p.axes();
    p.fn(F.f, p.c.f1, { width: 3, from: Math.max(F.view.xMin, k === 'sqrt' ? 0 : F.view.xMin) });
    p.lineThrough(a, F.f(a), F.d(a), p.c.f2, { width: 2 });
    p.line(a, F.f(a), x, F.f(a), p.c.violet, { width: 2 });
    p.line(x, F.f(a), x, Y, p.c.f2, { width: 4 });
    p.line(x + (F.view.xMax - F.view.xMin) * 0.006, F.f(a), x + (F.view.xMax - F.view.xMin) * 0.006, y, p.c.f1, { width: 2.5 });
    p.text('dx', a + dx / 2, F.f(a), p.c.violet, { align: 'center', base: dx >= 0 ? 'top' : 'bottom', dy: dx >= 0 ? 4 : -4 });
    p.point(a, F.f(a), p.c.ink, 5);
    p.point(x, y, p.c.f1, 5);
    p.point(x, Y, p.c.f2, 5);
  }, [k, dx]);
  const err = y - Y;
  return (
    <Widget title="التقريب الخطي: اتبع المماس بدل المنحنى" hint="البرتقالي الرأسي $dy$: التغيّر على **المماس** $= f'(a)\,dx$. الأزرق الرأسي $\Delta y$: التغيّر الحقيقي على **المنحنى**. الفرق بينهما من رتبة $(dx)^2$: **تقريب خطي، وخطأ تربيعي**. ضاعف $dx$ وراقب الخطأ يتضاعف أربع مرات تقريباً.">
      <Choice value={k} onChange={(v) => { setK(v); setDx(v === 'sqrt' ? 2 : fns[v].dx[1] / 2); }} options={Object.entries(fns).map(([v, f]) => ({ v, label: f.label }))} />
      <Canvas refEl={ref} label="المنحنى ومماسه" />
      <div className="controls">
        <Slider label="الخطوة $dx = \Delta x$" value={dx} min={F.dx[0]} max={F.dx[1]} step={(F.dx[1] - F.dx[0]) / 400} onChange={setDx} show={(v) => fmt(v, 4)} color="var(--violet)" />
      </div>
      <Readout items={[
        { label: '$y = f(a + dx)$ الحقيقي', value: fmt(y, 6), color: 'var(--f1)' },
        { label: '$Y$ على المماس', value: fmt(Y, 6), color: 'var(--f2)' },
        { label: 'الخطأ $y - Y$', value: fmt(err, 6) },
        { label: 'الخطأ ÷ $(dx)^2$', value: dx === 0 ? '—' : fmt(err / (dx * dx), 4) },
      ]} />
      <MathText as="div" className="verdict">{`$${F.tex}$`}</MathText>
    </Widget>
  );
}
