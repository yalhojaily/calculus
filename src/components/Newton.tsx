import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Choice, Slider, Widget, usePlot } from './ui';

interface Fn { label: string; f: (x: number) => number; d: (x: number) => number; root: string; view: { xMin: number; xMax: number; yMin: number; yMax: number }; start: [number, number, number] }

const fns: Record<string, Fn> = {
  sq: { label: '$x^2 - 1.2 = 0$', f: (x) => x * x - 1.2, d: (x) => 2 * x, root: '√1.2 = 1.0954451…', view: { xMin: -0.2, xMax: 2.6, yMin: -1.5, yMax: 5 }, start: [0.3, 2.5, 1] },
  quartic: { label: '$x^4 - 11x^3 + 5x - 2 = 0$', f: (x) => x ** 4 - 11 * x ** 3 + 5 * x - 2, d: (x) => 4 * x ** 3 - 33 * x * x + 5, root: '≈ 10.9598939', view: { xMin: 8.5, xMax: 12.7, yMin: -1700, yMax: 2600 }, start: [9, 12.5, 12] },
};

/** 0.4 / 3.7 — طريقة نيوتن: اتبع المماس حتى يقطع المحور، ثم كرّر. */
export default function Newton({ start = 'sq' }: { start?: 'sq' | 'quartic' }) {
  const [k, setK] = useState<keyof typeof fns>(start);
  const F = fns[k];
  const [x0, setX0] = useState(F.start[2]);
  const [steps, setSteps] = useState(0);
  const xs = [x0];
  for (let i = 0; i < steps; i++) {
    const x = xs[i];
    xs.push(x - F.f(x) / F.d(x));
  }
  const ref = usePlot(F.view, (p) => {
    p.axes();
    p.fn(F.f, p.c.f1, { width: 3 });
    for (let i = 0; i < steps; i++) {
      const a = xs[i];
      p.line(a, 0, a, F.f(a), p.c['ink-3'], { width: 1, dash: [3, 3] });
      p.line(a, F.f(a), xs[i + 1], 0, p.c.f2, { width: 2 });
      p.point(a, F.f(a), p.c.f1, 4);
    }
    xs.forEach((x, i) => p.point(x, 0, i === xs.length - 1 ? p.c.f2 : p.c['ink-3'], i === xs.length - 1 ? 6 : 4));
  }, [k, x0, steps]);

  return (
    <Widget title="طريقة نيوتن: المماس يدلّك على الجذر" hint="من التخمين $a$ نرسم المماس، وحيث يقطع المحور يكون التخمين الجديد: $x_{\text{new}} = a - \frac{f(a)}{f'(a)}$. لاحظ كيف يتضاعف عدد الخانات الصحيحة تقريباً في كل خطوة.">
      <Choice value={k} onChange={(v) => { setK(v); setX0(fns[v].start[2]); setSteps(0); }} options={Object.entries(fns).map(([v, f]) => ({ v: v as keyof typeof fns, label: f.label }))} />
      <Canvas refEl={ref} label="خطوات طريقة نيوتن" />
      <div className="controls">
        <Slider label="التخمين الأول $a$" value={x0} min={F.start[0]} max={F.start[1]} step={0.05} onChange={(v) => { setX0(v); }} show={(v) => fmt(v)} />
      </div>
      <div className="anim">
        <button className="btn btn-primary" onClick={() => setSteps((s) => Math.min(s + 1, 8))} disabled={steps >= 8}>خطوة نيوتن ←</button>
        <button className="btn btn-ghost" onClick={() => setSteps(0)}>↺ من جديد</button>
        <span className="ltr" style={{ color: 'var(--ink-3)', fontSize: '0.88rem' }}>root {F.root}</span>
      </div>
      <table>
        <thead><tr><th>step</th><th>x</th><th>f(x)</th></tr></thead>
        <tbody>
          {xs.map((x, i) => (
            <tr key={i} className={i === xs.length - 1 ? 'hl' : ''}><td>{i}</td><td>{x.toFixed(10)}</td><td>{F.f(x).toExponential(2)}</td></tr>
          ))}
        </tbody>
      </table>
    </Widget>
  );
}
