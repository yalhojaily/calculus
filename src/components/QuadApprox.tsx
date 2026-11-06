import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Fn { label: string; f: (x: number) => number; d1: number; d2: number; a: number; view: View; tex: string }

const fns: Record<string, Fn> = {
  cos: { label: '$\\cos x$', f: Math.cos, d1: 0, d2: -1, a: 0, view: { xMin: -3, xMax: 3, yMin: -1.6, yMax: 1.6 }, tex: '\\cos x \\approx 1 - \\tfrac12 x^2' },
  geo: { label: '$\\dfrac{1}{1 - x}$', f: (x) => 1 / (1 - x), d1: 1, d2: 2, a: 0, view: { xMin: -1, xMax: 0.9, yMin: 0, yMax: 6 }, tex: '\\dfrac{1}{1 - x} \\approx 1 + x + x^2' },
  sqrt: { label: '$\\sqrt{x}$ عند $1$', f: Math.sqrt, d1: 0.5, d2: -0.25, a: 1, view: { xMin: 0, xMax: 3, yMin: 0, yMax: 2 }, tex: '\\sqrt{x} \\approx 1 + \\tfrac12(x - 1) - \\tfrac18(x - 1)^2' },
  pow: { label: '$(1 + x)^{3}$', f: (x) => (1 + x) ** 3, d1: 3, d2: 6, a: 0, view: { xMin: -1.5, xMax: 1, yMin: -1, yMax: 8 }, tex: '(1 + x)^n \\approx 1 + nx + \\tfrac12 n(n - 1)x^2' },
};

/** 3.3 — التقريب التربيعي: المماس لا ينحني، والقطع المكافئ ينحني مع الدالة. */
export default function QuadApprox() {
  const [k, setK] = useState('cos');
  const F = fns[k];
  const [x, setX] = useState(F.a + 0.5);
  const a = F.a, fa = F.f(a);
  const L = (s: number) => fa + F.d1 * (s - a);
  const Q = (s: number) => L(s) + 0.5 * F.d2 * (s - a) ** 2;
  const ref = usePlot(F.view, (p) => {
    p.axes();
    p.fn(F.f, p.c.f1, { width: 3.4, from: k === 'sqrt' ? 0 : F.view.xMin });
    p.fn(L, p.c.f2, { width: 1.8, dash: [6, 4] });
    p.fn(Q, p.c.area, { width: 2.4 });
    p.line(x, F.view.yMin, x, F.view.yMax, p.c['ink-3'], { width: 1, dash: [3, 4] });
    p.point(a, fa, p.c.ink, 5);
  }, [k, x]);
  const y = F.f(x);
  return (
    <Widget title="خطي أم تربيعي؟" hint="البرتقالي المتقطع: **المماس** $f(a) + f'(a)(x - a)$، لا يستطيع أن ينحني، فيبتعد عن المنحنى. الأخضر: **التقريب التربيعي** يضيف $\tfrac12 f''(a)(x - a)^2$، فينحني مع الدالة. حيث $f'' \lt 0$ يكون المماس **فوق** المنحنى، وحيث $f'' \gt 0$ يكون **تحته**.">
      <Choice value={k} onChange={(v) => { setK(v); setX(fns[v].a + 0.5); }} options={Object.entries(fns).map(([v, f]) => ({ v, label: f.label }))} />
      <Canvas refEl={ref} label="الدالة وتقريباها" />
      <div className="controls">
        <Slider label="$x$" value={x} min={F.view.xMin + 0.05} max={F.view.xMax - 0.05} step={0.01} onChange={setX} show={(v) => fmt(v)} />
      </div>
      <Readout items={[
        { label: '$f(x)$', value: fmt(y, 5), color: 'var(--f1)' },
        { label: 'خطأ الخطي', value: fmt(y - L(x), 5), color: 'var(--f2)' },
        { label: 'خطأ التربيعي', value: fmt(y - Q(x), 5), color: 'var(--area)' },
      ]} />
      <MathText as="div" className="verdict">{`$${F.tex}$`}</MathText>
    </Widget>
  );
}
