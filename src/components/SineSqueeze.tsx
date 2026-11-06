import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';
import { MathText } from './MathText';

/** 2.4 — الضغط: cos h ≤ (sin h)/h ≤ 1، ومن الدائرة: sin h < h < tan h. */
export default function SineSqueeze() {
  const [h, setH] = useState(0.8);
  const [deg, setDeg] = useState<'rad' | 'deg'>('rad');
  const k = deg === 'rad' ? 1 : Math.PI / 180;
  const sinc = (s: number) => (s === 0 ? 1 : Math.sin(k * s) / s);
  const range = deg === 'rad' ? 1.6 : 90;

  const gRef = usePlot({ xMin: -range, xMax: range, yMin: deg === 'rad' ? 0 : -0.002, yMax: deg === 'rad' ? 1.12 : 0.022 }, (p) => {
    p.axes({ xLabel: 'h', yLabel: '' });
    if (deg === 'rad') {
      p.fn(() => 1, p.c['ink-3'], { width: 1.6, dash: [4, 4] });
      p.fn(Math.cos, p.c.violet, { width: 2 });
      p.fn((s) => (s === 0 ? 0 : (1 - Math.cos(s)) / s), p.c.area, { width: 2, dash: [5, 4] });
    }
    p.fn(sinc, p.c.f1, { width: 3 });
    p.point(h, sinc(h), p.c.f1, 6);
    if (deg === 'rad') p.point(h, Math.cos(h), p.c.violet, 5);
  }, [h, deg]);

  const c = Math.cos(h), s = Math.sin(h), t = Math.tan(h);
  const R = 1.25;
  const cRef = usePlot({ xMin: -0.15, xMax: R + 0.15, yMin: -0.15, yMax: Math.min(2.2, Math.max(R, t) + 0.15) }, (p) => {
    p.pad = { l: 8, r: 8, t: 8, b: 8 };
    const C = p.c;
    p.line(0, 0, R + 0.1, 0, C['ink-3'], { width: 1 });
    p.curve(Math.cos, Math.sin, 0, Math.PI / 2, C['ink-2'], { width: 1.4 });
    // المثلث الكبير مساحته ½ tan h
    p.line(1, 0, 1, t, C.area, { width: 3 });
    p.line(0, 0, 1, t, C['ink-2'], { width: 1.2 });
    // القوس h والضلع sin h
    p.curve((u) => Math.cos(u), (u) => Math.sin(u), 0, h, C.f2, { width: 4 });
    p.line(c, 0, c, s, C.f1, { width: 3 });
    p.line(0, 0, c, s, C.ink, { width: 1.4 });
    p.text('sin h', c, s / 2, C.f1, { align: 'right', base: 'middle', dx: -5 });
    p.text('h', Math.cos(h / 2) + 0.05, Math.sin(h / 2), C.f2, { base: 'middle' });
    p.text('tan h', 1, Math.min(t, 2) / 2 + 0.1, C.area, { dx: 6, base: 'middle' });
  }, [h]);

  return (
    <Widget title="لماذا (sin h)/h → 1؟ «الضغط»" hint={deg === 'rad' ? 'يسار: الضلع $\\sin h$ (الأزرق) أقصر من القوس $h$ (البرتقالي)، وهو بدوره أقصر من $\\tan h$ (الأخضر)، لأن مساحة القطاع $\\tfrac12 h$ أصغر من مساحة المثلث الكبير $\\tfrac12 \\tan h$. يمين: لذلك تُحصر $\\frac{\\sin h}{h}$ (الأزرق) بين $\\cos h$ (البنفسجي) و $1$، وكلاهما يقترب من $1$. والأخضر المتقطع $\\frac{1 - \\cos h}{h} \\to 0$.' : 'بالدرجات **لا** تقترب النسبة من $1$ بل من $\\pi/180 \\approx 0.01745$. لهذا تُقاس الزوايا بالراديان في التفاضل والتكامل: بالدرجات تصبح مشتقة $\\sin x$ هي $\\frac{\\pi}{180}\\cos x$.'}>
      <Choice value={deg} onChange={setDeg} options={[{ v: 'rad', label: 'راديان' }, { v: 'deg', label: 'درجات' }]} />
      <div className="cv-row">
        <div><Canvas refEl={cRef} ratio={1} label="الدائرة: sin h أقل من h أقل من tan h" /><MathText as="div" className="cv-cap">{"$\\sin h \\lt h \\lt \\tan h$"}</MathText></div>
        <div><Canvas refEl={gRef} ratio={1} label="رسم sin h على h" /><div className="cv-cap f1">(sin h)/h</div></div>
      </div>
      <div className="controls">
        <Slider label="$h$" value={h} min={deg === 'rad' ? 0.02 : 0.5} max={deg === 'rad' ? 1.5 : 85} step={deg === 'rad' ? 0.01 : 0.5} onChange={setH} show={(v) => (deg === 'rad' ? fmt(v, 2) : `${fmt(v, 1)}°`)} />
      </div>
      <Readout items={deg === 'rad' ? [
        { label: '$\\cos h$', value: fmt(c, 5), color: 'var(--violet)' },
        { label: '$\\frac{\\sin h}{h}$', value: fmt(s / h, 5), color: 'var(--f1)' },
        { label: '$\\frac{1 - \\cos h}{h}$', value: fmt((1 - c) / h, 5), color: 'var(--area)' },
      ] : [{ label: '$\\frac{\\sin h°}{h}$', value: fmt(Math.sin(k * h) / h, 6), color: 'var(--f1)' }, { label: '$\\pi/180$', value: fmt(Math.PI / 180, 6) }]} />
    </Widget>
  );
}
