import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

const fs = [
  { name: 'y = 2x', f: (x: number) => 2 * x, col: 'f1' as const },
  { name: 'y = x²', f: (x: number) => x * x, col: 'f2' as const },
  { name: 'y = 2ˣ', f: (x: number) => 2 ** x, col: 'area' as const },
];

/** 0.1 — سباق ثلاث دوال: خطية، تربيعية، أسية. من يسبق؟ */
export default function GrowthRace() {
  const [x, setX] = useState(1);
  const [zoom, setZoom] = useState<'near' | 'far'>('near');
  const view = zoom === 'near' ? { xMin: -0.2, xMax: 5, yMin: -1, yMax: 34 } : { xMin: -0.3, xMax: 10.5, yMin: -40, yMax: 1100 };
  const ref = usePlot(view, (p) => {
    p.axes();
    for (const g of fs) p.fn(g.f, p.c[g.col], { width: 2.6 });
    p.line(x, view.yMin, x, view.yMax, p.c['ink-3'], { width: 1, dash: [4, 4] });
    for (const g of fs) p.point(x, g.f(x), p.c[g.col]);
    const lab = zoom === 'near' ? 4.6 : 9.6;
    for (const g of fs) {
      const yy = g.f(lab);
      if (yy < view.yMax) p.text(g.name, lab, yy, p.c[g.col], { align: 'right', dx: -4, dy: -6 });
    }
  }, [x, zoom]);

  const vals = fs.map((g) => g.f(x));
  const lead = vals.indexOf(Math.max(...vals));
  const ties = vals.filter((v) => Math.abs(v - vals[lead]) < 1e-6).length > 1;
  return (
    <Widget title="سباق الدوال الثلاث" hint="عند $x = 2$ تتساوى الثلاث في $y = 4$، وعند $x = 4$ تلحق $2^x$ بـ $x^2$ في $16$. بعدها تبقى الأسية في المقدّمة إلى الأبد.">
      <Choice value={zoom} onChange={setZoom} options={[{ v: 'near', label: 'قريب: $0 \\le x \\le 5$' }, { v: 'far', label: 'بعيد: $0 \\le x \\le 10$' }]} />
      <Canvas refEl={ref} label="رسوم y=2x و y=x² و y=2^x" />
      <div className="controls">
        <Slider label="$x$" value={x} min={0} max={zoom === 'near' ? 5 : 10} step={0.05} onChange={setX} show={(v) => fmt(v)} />
      </div>
      <Readout items={fs.map((g, i) => ({ label: `$${['2x', 'x^2', '2^x'][i]}$`, value: fmt(vals[i]), color: `var(--${g.col})` }))} />
      <div className="verdict">
        {ties ? 'تعادل عند هذه النقطة!' : <>في المقدّمة الآن: <b className="ltr">{fs[lead].name}</b></>}
      </div>
    </Widget>
  );
}
