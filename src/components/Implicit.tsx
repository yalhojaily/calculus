import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type P2 = (s: number) => [number, number];
interface Curve {
  label: string; view: View; pieces: { P: P2; s: [number, number] }[]; P: P2; s: [number, number]; s0: number;
  Fx: (x: number, y: number) => number; Fy: (x: number, y: number) => number; id: string; note: string;
}

const curves: Record<string, Curve> = {
  quintic: {
    label: '$y^5 + xy = 3$', view: { xMin: -4, xMax: 8, yMin: -2, yMax: 2.2 },
    pieces: [{ P: (y) => [3 / y - y ** 4, y], s: [0.37, 1.5] }, { P: (y) => [3 / y - y ** 4, y], s: [-1.45, -0.37] }],
    P: (y) => [3 / y - y ** 4, y], s: [0.4, 1.45], s0: 1,
    Fx: (_x, y) => y, Fy: (x, y) => 5 * y ** 4 + x,
    id: '5y^4\\,y\' + x\\,y\' + y = 0', note: 'لا صيغة لـ $y$ (غالوا: معادلات الدرجة الخامسة بلا صيغة حلّ). ومع ذلك عند $(2, 1)$: $5y\' + 2y\' + 1 = 0$، فالميل $-\\tfrac17$.',
  },
  circle: {
    label: '$x^2 + y^2 = 25$', view: { xMin: -8, xMax: 8, yMin: -6, yMax: 6 },
    pieces: [{ P: (s) => [5 * Math.cos(s), 5 * Math.sin(s)], s: [0, 2 * Math.PI] }],
    P: (s) => [5 * Math.cos(s), 5 * Math.sin(s)], s: [0.05, 2 * Math.PI - 0.05], s0: 0.93,
    Fx: (x) => 2 * x, Fy: (_x, y) => 2 * y,
    id: '2x + 2y\\,y\' = 0', note: 'المثال 4: الميل $-x/y$، وميل نصف القطر $y/x$، وحاصل ضربهما $-1$: **المماس عمودي على نصف القطر**. عند $(4, 3)$ الميل $-\\tfrac43$.',
  },
  hyper: {
    label: '$xy = 2$', view: { xMin: -5, xMax: 5, yMin: -4, yMax: 4 },
    pieces: [{ P: (s) => [s, 2 / s], s: [0.45, 5] }, { P: (s) => [s, 2 / s], s: [-5, -0.45] }],
    P: (s) => [s, 2 / s], s: [0.5, 4.8], s0: 2,
    Fx: (_x, y) => y, Fy: (x) => x,
    id: 'x\\,y\' + y = 0', note: 'ضمنياً: $y\' = -y/x$. وصراحةً: $y = 2/x$ و $y\' = -2/x^2$. **الجوابان متفقان**: عند $x = 2$ كلاهما $-\\tfrac12$.',
  },
  cubic: {
    label: '$x^3 + y^3 = 2$', view: { xMin: -3, xMax: 3, yMin: -2.4, yMax: 2.4 },
    pieces: [{ P: (s) => [s, Math.cbrt(2 - s ** 3)], s: [-3, 3] }],
    P: (s) => [s, Math.cbrt(2 - s ** 3)], s: [-2.6, 2.6], s0: 1,
    Fx: (x) => 3 * x * x, Fy: (_x, y) => 3 * y * y,
    id: '3x^2 + 3y^2\\,y\' = 0', note: 'الميل $-x^2/y^2$، وعند $(1, 1)$ يساوي $-1$. وحيث يقطع المنحنى المحور $y = 0$ يصبح المماس **رأسياً**: القسمة على $y^2 = 0$.',
  },
};

/** 4.2 — الاشتقاق الضمني: اشتق المعادلة كما هي، ثم حلّ لـ dy/dx. */
export default function Implicit() {
  const [k, setK] = useState('quintic');
  const C = curves[k];
  const [s, setS] = useState(C.s0);
  const [x, y] = C.P(s);
  const fy = C.Fy(x, y);
  const m = Math.abs(fy) < 1e-9 ? Infinity : -C.Fx(x, y) / fy;
  const ref = usePlot(C.view, (p) => {
    p.axes();
    for (const pc of C.pieces) p.curve((t) => pc.P(t)[0], (t) => pc.P(t)[1], pc.s[0], pc.s[1], p.c.f1, { width: 3 });
    if (Number.isFinite(m)) p.lineThrough(x, y, m, p.c.f2, { width: 2 });
    else p.line(x, C.view.yMin, x, C.view.yMax, p.c.f2, { width: 2 });
    if (k === 'circle') p.line(0, 0, x, y, p.c['ink-3'], { width: 1.4, dash: [4, 4] });
    p.point(x, y, p.c.f2, 6);
  }, [k, s]);
  return (
    <Widget title="الاشتقاق الضمني" hint="لا نحتاج أن نحلّ لـ $y$. **اشتق كل حد** بالنسبة لـ $x$، وحيث تظهر $y$ اضربها في $y' = dy/dx$ (قاعدة السلسلة)، ثم حلّ لـ $y'$. البرتقالي: المماس بالميل الناتج، عند النقطة التي تحرّكها.">
      <Choice value={k} onChange={(v) => { setK(v); setS(curves[v].s0); }} options={Object.entries(curves).map(([v, c]) => ({ v, label: c.label }))} />
      <Canvas refEl={ref} ratio={0.6} label="منحنى معرّف ضمنياً ومماسه" />
      <div className="controls">
        <Slider label="حرّك النقطة على المنحنى" value={s} min={C.s[0]} max={C.s[1]} step={(C.s[1] - C.s[0]) / 600} onChange={setS} show={() => `(${fmt(x, 2)}, ${fmt(y, 2)})`} color="var(--f2)" />
      </div>
      <Readout items={[
        { label: '$x$', value: fmt(x, 3), color: 'var(--f1)' },
        { label: '$y$', value: fmt(y, 3), color: 'var(--f1)' },
        { label: "$y'$", value: Number.isFinite(m) ? fmt(m, 4) : '∞ (رأسي)', color: 'var(--f2)' },
      ]} />
      <MathText as="div" className="verdict">{`$${C.id}$ · ${C.note}`}</MathText>
    </Widget>
  );
}
