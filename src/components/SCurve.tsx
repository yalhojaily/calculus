import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

/** 6.5 — المعادلة اللوجستية y′ = cy − by²: منحنى S، والانقلاب عند c/2b، والاستقرار عند c/b. مع خط y. */
export default function SCurve() {
  const [c, setC] = useState(0.029);
  const [b, setB] = useState(2.9); // بوحدة 10⁻¹² لكل سنة، و y بالمليار
  const [y0, setY0] = useState(3);
  const bb = b * 1e-3; // y بالمليار: b × 10⁻¹² × 10⁹
  const yinf = c / bb;
  const Y = (t: number) => c / (bb + Math.exp(-c * t) * (c - bb * y0) / y0);
  const t0 = 1930, T = 300;
  const yMax = Math.max(yinf, y0) * 1.15;
  const tInf = Math.log(((c - bb * y0) / y0) / bb) / c; // حيث y = c/2b
  const ref = usePlot({ xMin: t0 - 10, xMax: t0 + T, yMin: -yMax * 0.04, yMax }, (p) => {
    p.axes({ xLabel: 'year', yLabel: 'billions', xStep: 50 });
    p.line(t0 - 10, yinf, t0 + T, yinf, p.c.red, { width: 1.2, dash: [5, 4] });
    p.line(t0 - 10, yinf / 2, t0 + T, yinf / 2, p.c['ink-3'], { width: 1, dash: [2, 4] });
    p.fn((t) => y0 * Math.exp(c * (t - t0)), p.c.f1, { width: 1.4, dash: [4, 4], from: t0, to: t0 + T });
    p.fn((t) => Y(t - t0), p.c.f2, { width: 3, from: t0, to: t0 + T });
    if (Number.isFinite(tInf) && tInf > 0) p.point(t0 + tInf, yinf / 2, p.c.area, 6);
    p.point(t0, y0, p.c.f2, 5);
  }, [c, b, y0]);
  const line = usePlot({ xMin: -yMax * 0.05, xMax: yMax * 1.05, yMin: -1, yMax: 1 }, (p) => {
    p.line(-yMax * 0.05, 0, yMax * 1.05, 0, p.c.ink, { width: 2 });
    const f = (y: number) => c * y - bb * y * y;
    for (let i = 1; i < 12; i++) {
      const y = (yMax * i) / 12; const v = f(y); if (Math.abs(v) < 1e-6) continue;
      const d = (v > 0 ? 1 : -1) * yMax * 0.035;
      p.arrow(y - d, 0.35, y + d, 0.35, v > 0 ? p.c.area : p.c.red);
    }
    p.point(0, 0, p.c['ink-3'], 6); p.text('0', 0, 0, p.c.ink, { align: 'center', base: 'top', dy: 8 });
    p.point(yinf, 0, p.c.red, 7); p.text('c/b', yinf, 0, p.c.red, { align: 'center', base: 'top', dy: 8 });
  }, [c, b, y0]);
  return (
    <Widget title="منحنى S والمعادلة اللوجستية" hint="البرتقالي $y' = cy - by^2$، والأزرق المتقطع النمو الأسي وحده $y_0 e^{ct}$. حد المنافسة $-by^2$ صغير في البداية ثم **يبطئ النمو** حتى يتوقف عند $y_\infty = c/b$ (الأحمر). نقطة الانقلاب (الأخضر) **في منتصف الطريق** $c/2b$، وهناك أسرع نمو. أسفل: **خط $y$**، والأسهم تُظهر اتجاه حركة $y$: كلها تتجه إلى الحالة المستقرة $c/b$ وتبتعد عن الصفر.">
      <Canvas refEl={ref} ratio={0.5} label="منحنى S لسكان العالم" />
      <Canvas refEl={line} ratio={0.12} label="خط y مع أسهم الاتجاه" />
      <div className="controls">
        <Slider label="معدل النمو الطبيعي $c$" value={c} min={0.01} max={0.06} step={0.001} onChange={setC} show={(v) => fmt(v, 3)} />
        <Slider label="المنافسة $b$ (×10⁻¹²)" value={b} min={1} max={8} step={0.1} onChange={setB} show={(v) => fmt(v, 1)} />
        <Slider label="السكان عام 1930 (مليار)" value={y0} min={0.5} max={14} step={0.1} onChange={setY0} show={(v) => fmt(v, 1)} color="var(--f2)" />
      </div>
      <Readout items={[
        { label: '$y_\\infty = c/b$ (مليار)', value: fmt(yinf, 2), color: 'var(--red)' },
        { label: 'الانقلاب $c/2b$', value: fmt(yinf / 2, 2), color: 'var(--area)' },
        { label: 'سنة الانقلاب', value: Number.isFinite(tInf) && tInf > 0 ? fmt(t0 + tInf, 0) : '—', color: 'var(--area)' },
        { label: "$y'$ عام 1930 (مليون/سنة)", value: fmt((c * y0 - bb * y0 * y0) * 1000, 0), color: 'var(--f2)' },
      ]} />
    </Widget>
  );
}
