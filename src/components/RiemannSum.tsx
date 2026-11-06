import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Fn { label: string; s: (t: number) => number; F: (t: number) => number; b: number; view: View; }

const fns: Record<string, Fn> = {
  lin: { label: '$s = t$', s: (t) => t, F: (t) => t * t / 2, b: 4, view: { xMin: -0.2, xMax: 4.3, yMin: -0.4, yMax: 4.5 } },
  sq: { label: '$s = t^2$', s: (t) => t * t, F: (t) => t ** 3 / 3, b: 2, view: { xMin: -0.1, xMax: 2.2, yMin: -0.3, yMax: 4.5 } },
  sin: { label: '$s = \\sin t$', s: Math.sin, F: (t) => 1 - Math.cos(t), b: Math.PI, view: { xMin: -0.15, xMax: 3.4, yMin: -0.15, yMax: 1.2 } },
};

/** 0.4 / 5.x — التكامل كمجموع مستطيلات: كلما ضاقت المستطيلات اقترب المجموع من المساحة. */
export default function RiemannSum() {
  const [k, setK] = useState<keyof typeof fns>('lin');
  const [n, setN] = useState(4);
  const [rule, setRule] = useState<'left' | 'right' | 'mid'>('right');
  const F = fns[k];
  const dt = F.b / n;
  const at = (i: number) => (rule === 'left' ? i * dt : rule === 'right' ? (i + 1) * dt : (i + 0.5) * dt);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += F.s(at(i)) * dt;
  const exact = F.F(F.b) - F.F(0);

  const ref = usePlot(F.view, (p) => {
    p.axes({ xLabel: 't', yLabel: 's' });
    for (let i = 0; i < n; i++) p.rect(i * dt, 0, (i + 1) * dt, F.s(at(i)), p.c.area, { alpha: 0.28, stroke: n <= 80 });
    p.fn(F.s, p.c.f2, { width: 3 });
  }, [k, n, rule]);

  return (
    <Widget title="المساحة تحت منحنى السرعة = مجموع شرائح" hint="كل مستطيل = (سرعة) × (زمن قصير $\Delta t$) = مسافة صغيرة. مجموعها يقترب من المساحة الحقيقية $\int s\,dt$، وهي المسافة الكلية.">
      <Choice value={k} onChange={setK} options={Object.entries(fns).map(([v, f]) => ({ v: v as keyof typeof fns, label: f.label }))} />
      <Canvas refEl={ref} label="مجموع مستطيلات تحت منحنى" />
      <div className="controls">
        <Slider label="عدد المستطيلات $n$" value={n} min={1} max={200} step={1} onChange={setN} color="var(--area)" />
        <Choice value={rule} onChange={setRule} options={[{ v: 'left', label: 'الطرف الأيسر' }, { v: 'mid', label: 'المنتصف' }, { v: 'right', label: 'الطرف الأيمن' }]} />
      </div>
      <Readout
        items={[
          { label: '$\\Delta t$', value: fmt(dt, 4) },
          { label: 'مجموع المستطيلات', value: fmt(sum, 5), color: 'var(--area)' },
          { label: 'المساحة الدقيقة', value: fmt(exact, 5), color: 'var(--f1)' },
          { label: 'الخطأ', value: fmt(sum - exact, 5) },
        ]}
      />
    </Widget>
  );
}
