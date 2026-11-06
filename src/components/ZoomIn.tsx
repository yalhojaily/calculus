import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Fn { label: string; f: (x: number) => number; d: (x: number) => number; x0: number; span: [number, number] }

const fns: Record<string, Fn> = {
  sin: { label: '$\\sin x$', f: Math.sin, d: Math.cos, x0: 1, span: [-3, 4] },
  cube: { label: '$x^3 - x$', f: (x) => x ** 3 - x, d: (x) => 3 * x * x - 1, x0: 0.8, span: [-2, 2] },
  race: { label: '$3^x - x^3$', f: (x) => 3 ** x - x ** 3, d: (x) => Math.log(3) * 3 ** x - 3 * x * x, x0: 3, span: [1.5, 4] },
};

/** 0.5 — كبّر حول نقطة: المنحنى الأملس يبدو مستقيماً، وميل هذا المستقيم هو المشتقة. */
export default function ZoomIn() {
  const [k, setK] = useState<keyof typeof fns>('sin');
  const F = fns[k];
  const [x0, setX0] = useState(F.x0);
  const [z, setZ] = useState(0); // 0..3 → تكبير 10^z
  const zoom = 10 ** z;
  const hw = (F.span[1] - F.span[0]) / 2 / zoom;
  const y0 = F.f(x0);
  const view = { xMin: x0 - hw, xMax: x0 + hw, yMin: y0 - hw * 0.62, yMax: y0 + hw * 0.62 };
  const ref = usePlot(view, (p) => {
    p.axes();
    p.lineThrough(x0, y0, F.d(x0), p.c.f2, { width: 1.4, dash: [6, 5] });
    p.fn(F.f, p.c.f1, { width: 3 });
    p.point(x0, y0, p.c.f1, 5);
  }, [k, x0, z]);

  return (
    <Widget title="كبّر حتى يستقيم المنحنى" hint="عند تكبير ×100 أو ×1000 لا يكاد المنحنى الأزرق يختلف عن المماس البرتقالي. هذا معنى أن الدالة «قابلة للاشتقاق»: من قريب جداً تبدو خطاً مستقيماً، وميله هو المشتقة.">
      <Choice value={k} onChange={(v) => { setK(v); setX0(fns[v].x0); setZ(0); }} options={Object.entries(fns).map(([v, f]) => ({ v: v as keyof typeof fns, label: f.label }))} />
      <Canvas refEl={ref} label="تكبير حول نقطة على المنحنى" />
      <div className="controls">
        <Slider label="التكبير" value={z} min={0} max={3} step={0.05} onChange={setZ} show={() => `×${fmt(zoom, 0)}`} color="var(--f2)" />
        <Slider label="النقطة $x_0$" value={x0} min={F.span[0]} max={F.span[1]} step={0.01} onChange={setX0} show={(v) => fmt(v)} />
      </div>
      <Readout items={[{ label: '$y(x_0)$', value: fmt(y0, 4), color: 'var(--f1)' }, { label: "الميل $y'(x_0)$", value: fmt(F.d(x0), 4), color: 'var(--f2)' }]} />
    </Widget>
  );
}
