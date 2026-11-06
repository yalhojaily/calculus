import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Slider, Widget, usePlot } from './ui';

interface Fn { label: string; f: (x: number) => number; d: (x: number) => number; view: View; range: [number, number]; a: number }

const fns: Record<string, Fn> = {
  quartic: { label: '$x^4 - x^2 + 3$', f: (x) => x ** 4 - x * x + 3, d: (x) => 4 * x ** 3 - 2 * x, view: { xMin: -2, xMax: 2, yMin: 0, yMax: 7.5 }, range: [-1.5, 1.5], a: 1 },
  cubic: { label: '$x^3 - 2$', f: (x) => x ** 3 - 2, d: (x) => 3 * x * x, view: { xMin: -1, xMax: 3.6, yMin: -4, yMax: 28 }, range: [-0.8, 3], a: 2 },
  coaster: { label: 'الأفعوانية $x^2 + 4$', f: (x) => x * x + 4, d: (x) => 2 * x, view: { xMin: -3.2, xMax: 3.2, yMin: -1.2, yMax: 14 }, range: [-3, 3], a: 1 },
};

const sgn = (v: number) => (v < 0 ? `- ${fmt(-v, 3)}` : `+ ${fmt(v, 3)}`);

/** 2.3 — المماس والعمودي عند x = a بصيغة النقطة والميل. */
export default function TangentNormal() {
  const [k, setK] = useState('quartic');
  const F = fns[k];
  const [a, setA] = useState(F.a);
  const [normal, setNormal] = useState(false);
  const m = F.d(a), y0 = F.f(a);
  const ref = usePlot(F.view, (p) => {
    p.axes();
    p.fn(F.f, p.c.f1, { width: 3 });
    p.lineThrough(a, y0, m, p.c.f2, { width: 2.2 });
    if (normal && Math.abs(m) > 1e-9) p.lineThrough(a, y0, -1 / m, p.c.violet, { width: 2, dash: [6, 4] });
    if (k === 'coaster') p.point(0, 0, p.c.area, 7);
    p.point(a, y0, p.c.f1, 6);
  }, [k, a, normal]);

  const hitsOrigin = k === 'coaster' && Math.abs(y0 - m * a) < 0.05;
  return (
    <Widget title="المماس والعمودي عند نقطة" hint={k === 'coaster' ? 'أنت على أفعوانية مسارها $y = x^2 + 4$، وصديقك عند $(0, 0)$ (النقطة الخضراء). إذا قفزت ستسير على **المماس**. من أين تقفز لتصل إليه؟ حرّك $a$ حتى يمرّ المماس بالأصل.' : 'المماس يمر بالنقطة $(a, f(a))$ بميل $m = f\'(a)$. صيغة النقطة والميل $y - f(a) = m(x - a)$ تُظهر مباشرة أن $y = f(a)$ عند $x = a$. والعمودي ميله $-1/m$: ميلا الخطين المتعامدين حاصل ضربهما $-1$.'}>
      <Choice value={k} onChange={(v) => { setK(v); setA(fns[v].a); }} options={Object.entries(fns).map(([v, f]) => ({ v, label: f.label }))} />
      <Canvas refEl={ref} label="منحنى مع المماس" />
      <div className="controls">
        <Slider label="النقطة $a$" value={a} min={F.range[0]} max={F.range[1]} step={0.05} onChange={setA} show={(v) => fmt(v)} color="var(--f1)" />
        <label className="sl"><span className="sl-label">العمودي</span><input type="checkbox" checked={normal} onChange={(e) => setNormal(e.target.checked)} style={{ justifySelf: 'start', width: 'auto' }} /><span /></label>
      </div>
      <MathText as="div" className="verdict">{`المماس: $y - ${fmt(y0, 3)} = ${fmt(m, 3)}(x ${sgn(-a)})$${normal && Math.abs(m) > 1e-9 ? ` · العمودي: $y - ${fmt(y0, 3)} = ${fmt(-1 / m, 3)}(x ${sgn(-a)})$` : ''}`}</MathText>
      {hitsOrigin && <div className="verdict">✓ المماس يمرّ بصديقك! اقفز من <i className="ltr">x = {fmt(a)}</i>.</div>}
    </Widget>
  );
}
