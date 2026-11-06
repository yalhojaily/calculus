import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Ex { label: string; top: (x: number) => number; bot: (x: number) => number; a: number; b: number; exact: number; view: View; horiz?: { left: (y: number) => number; right: (y: number) => number; c: number; d: number }; note: string }
const exs: Record<string, Ex> = {
  par: { label: '$6x$ و $3x^2$', top: (x) => 6 * x, bot: (x) => 3 * x * x, a: 0, b: 2, exact: 4, view: { xMin: -0.2, xMax: 2.4, yMin: -0.5, yMax: 13 }, horiz: { left: (y) => y / 6, right: (y) => Math.sqrt(y / 3), c: 0, d: 12 }, note: 'المثال 1: نقطتا التقاطع من $6x = 3x^2$، أي $x = 0$ و $x = 2$. المساحة $\\int_0^2 (6x - 3x^2)\\,dx = 4$: **الأعلى ناقص الأسفل**.' },
  circ: { label: 'الدائرة والخط $45°$', top: (x) => Math.sqrt(Math.max(0, 1 - x * x)), bot: (x) => x, a: 0, b: Math.SQRT1_2, exact: Math.PI / 8, view: { xMin: -0.15, xMax: 1.15, yMin: -0.1, yMax: 1.1 }, note: 'المثال 2: الخط يلقى الدائرة حيث $2x^2 = 1$، أي $x = 1/\\sqrt2$. المساحة $\\pi/8$ (ثُمن الدائرة). أصعب مما يُتوقع لشكل مألوف: تحتاج $x = \\sin\\theta$.' },
  ln: { label: '$y = \\ln x$ حتى $x = e$', top: Math.log, bot: () => 0, a: 1, b: Math.E, exact: 1, view: { xMin: -0.2, xMax: 3.1, yMin: -0.2, yMax: 1.25 }, horiz: { left: Math.exp, right: () => Math.E, c: 0, d: 1 }, note: 'المثال 3: بشرائح رأسية $\\int_1^e \\ln x\\,dx$ (بالتجزئة). وبشرائح أفقية $\\int_0^1 (e - e^y)\\,dy$، وأنا شخصياً أختار $y$. الجواب 1 في الحالتين.' },
};

/** 8.1 — المساحة بين منحنيين: شرائح رأسية (تكامل x) أو أفقية (تكامل y). */
export default function AreaBetween() {
  const [k, setK] = useState('par');
  const E = exs[k];
  const [dir, setDir] = useState<'v' | 'h'>('v');
  const [n, setN] = useState(10);
  const d = dir === 'h' && E.horiz ? 'h' : 'v';
  let sum = 0;
  const ref2 = usePlot(E.view, (p) => {
    p.axes();
    if (d === 'v') {
      const h = (E.b - E.a) / n;
      for (let i = 0; i < n; i++) { const x = E.a + (i + 0.5) * h; p.rect(x - h / 2, E.bot(x), x + h / 2, E.top(x), p.c.area, { alpha: 0.4, stroke: n <= 60 }); }
    } else {
      const H = E.horiz!; const h = (H.d - H.c) / n;
      for (let i = 0; i < n; i++) { const y = H.c + (i + 0.5) * h; p.rect(H.left(y), y - h / 2, H.right(y), y + h / 2, p.c.violet, { alpha: 0.4, stroke: n <= 60 }); }
    }
    p.fn(E.top, p.c.f1, { width: 2.6 });
    p.fn(E.bot, p.c.f2, { width: 2.6 });
  }, [k, d, n]);
  if (d === 'v') { const h = (E.b - E.a) / n; for (let i = 0; i < n; i++) { const x = E.a + (i + 0.5) * h; sum += (E.top(x) - E.bot(x)) * h; } }
  else { const H = E.horiz!; const h = (H.d - H.c) / n; for (let i = 0; i < n; i++) { const y = H.c + (i + 0.5) * h; sum += (H.right(y) - H.left(y)) * h; } }
  return (
    <Widget title="المساحة بين منحنيين" hint="الشريط الرأسي ارتفاعه **الأعلى ناقص الأسفل** $v(x) - w(x)$ وعرضه $dx$. ويمكن التقطيع أفقياً أيضاً: الشريط طوله **اليمين ناقص اليسار** وسُمكه $dy$. اختر ما يجعل التكامل أسهل.">
      <Choice value={k} onChange={setK} options={Object.entries(exs).map(([v, e]) => ({ v, label: e.label }))} />
      <Choice value={d} onChange={setDir} options={[{ v: 'v', label: 'شرائح رأسية (تكامل $x$)' }, ...(E.horiz ? [{ v: 'h' as const, label: 'شرائح أفقية (تكامل $y$)' }] : [])]} />
      <Canvas refEl={ref2} ratio={0.6} label="المساحة بين المنحنيين بالشرائح" />
      <div className="controls">
        <Slider label="عدد الشرائح" value={n} min={2} max={120} step={1} onChange={setN} />
      </div>
      <Readout items={[
        { label: 'مجموع الشرائح', value: fmt(sum, 5), color: d === 'v' ? 'var(--area)' : 'var(--violet)' },
        { label: 'المساحة الدقيقة', value: fmt(E.exact, 5), color: 'var(--f1)' },
      ]} />
      <MathText as="div" className="verdict">{E.note}</MathText>
    </Widget>
  );
}
