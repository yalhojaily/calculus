import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Ex { label: string; f: (x: number) => number; g: (x: number) => number; df: (x: number) => number; dg: (x: number) => number; a: number; L: string; view: View; note: string }

const exs: Record<string, Ex> = {
  lines: { label: '$\\dfrac{6(x - a)}{2(x - a)}$', f: (x) => 6 * (x - 1), g: (x) => 2 * (x - 1), df: () => 6, dg: () => 2, a: 1, L: '3', view: { xMin: 0, xMax: 2, yMin: -6, yMax: 6 }, note: 'خطان يهبطان إلى الصفر: النسبة **بالضبط** $6/2$، نسبة الميلين.' },
  tan: { label: '$\\dfrac{\\tan x}{\\sin x}$', f: Math.tan, g: Math.sin, df: (x) => 1 / Math.cos(x) ** 2, dg: Math.cos, a: 0, L: '1', view: { xMin: -1, xMax: 1, yMin: -1.6, yMax: 1.6 }, note: 'المثال 5: $\\dfrac{\\sec^2 x}{\\cos x} \\to \\dfrac11 = 1$.' },
  cos: { label: '$\\dfrac{1 - \\cos x}{x}$', f: (x) => 1 - Math.cos(x), g: (x) => x, df: Math.sin, dg: () => 1, a: 0, L: '0', view: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 }, note: 'المثال 4 («صديق قديم»): $\\dfrac{\\sin x}{1} \\to 0$.' },
  twice: { label: '$\\dfrac{x - \\sin x}{1 - \\cos x}$', f: (x) => x - Math.sin(x), g: (x) => 1 - Math.cos(x), df: (x) => 1 - Math.cos(x), dg: Math.sin, a: 0, L: '0', view: { xMin: -1.5, xMax: 1.5, yMin: -0.6, yMax: 0.6 }, note: 'المثال 6: $f\'/g\' = \\dfrac{1 - \\cos x}{\\sin x}$ ما زالت $0/0$، **فطبّق القاعدة مرة ثانية**: $\\dfrac{\\sin x}{\\cos x} \\to 0$.' },
};

/** 3.8 — قاعدة لوبيتال: حين تذهب f و g معاً إلى الصفر، يتحكّم ميلاهما في نسبتهما. */
export default function LHopital() {
  const [k, setK] = useState('tan');
  const E = exs[k];
  const [x, setX] = useState(E.a + 0.5);
  const ref = usePlot(E.view, (p) => {
    p.axes();
    p.fn(E.f, p.c.f1, { width: 3 });
    p.fn(E.g, p.c.f2, { width: 3 });
    p.lineThrough(E.a, 0, E.df(E.a), p.c.f1, { width: 1, dash: [4, 4] });
    p.lineThrough(E.a, 0, E.dg(E.a), p.c.f2, { width: 1, dash: [4, 4] });
    p.line(x, E.view.yMin, x, E.view.yMax, p.c['ink-3'], { width: 1, dash: [3, 4] });
    p.point(x, E.f(x), p.c.f1, 5);
    p.point(x, E.g(x), p.c.f2, 5);
    p.point(E.a, 0, p.c.ink, 5);
  }, [k, x]);
  const h = Math.abs(x - E.a);
  return (
    <Widget title="قاعدة لوبيتال: سباق إلى الصفر" hint="الأزرق $f$ والبرتقالي $g$، وكلاهما يذهب إلى الصفر عند $x = a$. قرب $a$ يقترب كلٌّ منهما من **مماسه** (المتقطع)، فتقترب نسبتهما من نسبة الميلين $f'(a)/g'(a)$. **ليست قاعدة القسمة**: نشتق $f$ و $g$ كلاً على حدة. وتصلح فقط مع $0/0$.">
      <Choice value={k} onChange={(v) => { setK(v); setX(exs[v].a + 0.5); }} options={Object.entries(exs).map(([v, e]) => ({ v, label: e.label }))} />
      <Canvas refEl={ref} label="الدالتان f و g قرب a" />
      <div className="controls">
        <Slider label="$x$" value={x} min={E.view.xMin + 0.02} max={E.view.xMax - 0.02} step={0.005} onChange={(v) => setX(Math.abs(v - E.a) < 0.004 ? E.a + 0.004 : v)} show={(v) => fmt(v, 3)} />
      </div>
      <Readout items={[
        { label: '$f(x)/g(x)$', value: fmt(E.f(x) / E.g(x), 5), color: 'var(--f1)' },
        { label: "$f'(x)/g'(x)$", value: h < 1e-9 ? '—' : fmt(E.df(x) / E.dg(x), 5), color: 'var(--f2)' },
        { label: 'النهاية', value: E.L },
      ]} />
      <MathText as="div" className="verdict">{E.note}</MathText>
    </Widget>
  );
}
