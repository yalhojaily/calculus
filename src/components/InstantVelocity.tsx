import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

const fns: Record<string, { label: string; f: (t: number) => number; v: (t: number) => number; ave: string; inst: string; yMax: number }> = {
  sq: { label: '$f = t^2$', f: (t) => t * t, v: (t) => 2 * t, ave: '2t + h', inst: '2t', yMax: 130 },
  lin: { label: '$f = 3t + t^2$', f: (t) => 3 * t + t * t, v: (t) => 3 + 2 * t, ave: '3 + 2t + h', inst: '3 + 2t', yMax: 170 },
  half: { label: '$f = \\tfrac12 t^2$', f: (t) => t * t / 2, v: (t) => t, ave: 't + \\tfrac12 h', inst: 't', yMax: 70 },
};

/** 1.3 — السرعة المتوسطة بين t و t + h، ثم h → 0. مثال الكتاب: t = 10. */
export default function InstantVelocity() {
  const [k, setK] = useState('sq');
  const [t0, setT0] = useState(10);
  const [lh, setLh] = useState(0); // h = 10^lh
  const F = fns[k];
  const h = 10 ** lh;
  const ave = (F.f(t0 + h) - F.f(t0)) / h;
  const ref = usePlot({ xMin: -0.4, xMax: 12, yMin: -6, yMax: F.yMax }, (p) => {
    p.axes({ xLabel: 't', yLabel: 'f' });
    p.fn(F.f, p.c.f1, { width: 3, from: 0 });
    p.lineThrough(t0, F.f(t0), F.v(t0), p.c.f2, { width: 1.4, dash: [2, 5] });
    p.lineThrough(t0, F.f(t0), ave, p.c.f2, { width: 2.4 });
    p.point(t0, F.f(t0), p.c.f1, 6);
    p.point(t0 + h, F.f(t0 + h), p.c.f2, 5);
  }, [k, t0, h]);

  const rows = [1, 0.5, 0.1, 0.01, 0.001, 0.000001];
  return (
    <Widget title="من السرعة المتوسطة إلى السرعة عند لحظة" hint="الخط المتصل هو الخط القاطع بين $t$ و $t + h$، وميله السرعة **المتوسطة**. صغّر $h$ فيقترب ميله من ميل المماس المنقّط، وهو السرعة **عند اللحظة** $t$، أي قراءة عدّاد السرعة.">
      <Choice value={k} onChange={setK} options={Object.entries(fns).map(([v, f]) => ({ v, label: f.label }))} />
      <Canvas refEl={ref} label="الخط القاطع والمماس" />
      <div className="controls">
        <Slider label="اللحظة $t$" value={t0} min={1} max={10} step={0.5} onChange={setT0} show={(v) => fmt(v)} color="var(--f1)" />
        <Slider label="الخطوة $h$" value={lh} min={-3} max={0.3} step={0.05} onChange={setLh} show={() => fmt(h, 3)} color="var(--f2)" />
      </div>
      <Readout items={[
        { label: 'السرعة المتوسطة $\\frac{f(t+h) - f(t)}{h}$', value: fmt(ave, 4), color: 'var(--f2)' },
        { label: 'السرعة عند اللحظة', value: fmt(F.v(t0), 4), color: 'var(--f1)' },
      ]} />
      <MathText as="div" className="verdict">{`$v_{\\text{ave}} = ${F.ave} \\;\\longrightarrow\\; v(t) = ${F.inst}$ عندما $h \\to 0$`}</MathText>
      <table>
        <thead><tr><th>h</th>{rows.map((r) => <td key={r}>{r}</td>)}</tr></thead>
        <tbody><tr><th>v ave</th>{rows.map((r) => <td key={r}>{fmt((F.f(t0 + r) - F.f(t0)) / r, 6)}</td>)}</tr></tbody>
      </table>
    </Widget>
  );
}
