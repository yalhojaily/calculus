import { useCallback, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { type Cam, type V3, draw3, useOrbit } from '../lib/three';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type K = 'tet' | 'para';

/** 14.3 — التكامل الثلاثي: الحجم ∫∫∫ dV. نقطّع الجسم أفقياً: مساحة المقطع A(z) ثم ∫ A(z) dz. */
export default function TripleSlices() {
  const [k, setK] = useState<K>('tet');
  const [z, setZ] = useState(0.4);
  const [cam, setCam0] = useState<Cam>({ az: 0.75, el: 0.4 });
  const setCam = useCallback((f: (c: Cam) => Cam) => setCam0(f), []);
  const H = k === 'tet' ? 1 : 4;
  const A = (s: number) => (k === 'tet' ? 0.5 * (1 - s) ** 2 : Math.PI * (4 - s)); // مقطع الهرم مثلث، ومقطع المجسم المكافئ قرص
  const V = (s: number) => (k === 'tet' ? (1 - (1 - s) ** 3) / 6 : Math.PI * (4 * s - (s * s) / 2));
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    const g = draw3(p, cam);
    if (k === 'tet') {
      fitEqual(p, -1, 1.5, -0.6, 1.4);
      g.axes(1.3);
      const O: V3 = [0, 0, 0], X: V3 = [1, 0, 0], Y: V3 = [0, 1, 0], Z: V3 = [0, 0, 1];
      [[O, X, Y], [O, X, Z], [O, Y, Z], [X, Y, Z]].forEach((f) => g.poly(f as V3[], p.c.f1, 0.12));
      const s = 1 - z; // المقطع عند z: المثلث x + y ≤ 1 − z
      g.poly([[0, 0, z], [s, 0, z], [0, s, z]], p.c.red, 0.6);
    } else {
      fitEqual(p, -2.6, 2.6, -1.8, 3.6);
      const zs = 0.7;
      g.axes(3);
      for (let i = 0; i < 24; i++) { const t0 = (2 * Math.PI * i) / 24, t1 = (2 * Math.PI * (i + 1)) / 24; for (let j = 0; j < 10; j++) { const r0 = (2 * j) / 10, r1 = (2 * (j + 1)) / 10; const zz = (r: number) => zs * (4 - r * r); g.line([r0 * Math.cos(t0), r0 * Math.sin(t0), zz(r0)], [r1 * Math.cos(t0), r1 * Math.sin(t0), zz(r1)], p.c.f1, { width: 0.6 }); g.line([r1 * Math.cos(t0), r1 * Math.sin(t0), zz(r1)], [r1 * Math.cos(t1), r1 * Math.sin(t1), zz(r1)], p.c.f1, { width: 0.6 }); } }
      const R = Math.sqrt(Math.max(0, 4 - z)), pts: V3[] = [];
      for (let i = 0; i <= 48; i++) { const t = (2 * Math.PI * i) / 48; pts.push([R * Math.cos(t), R * Math.sin(t), zs * z]); }
      g.poly(pts, p.c.red, 0.55);
    }
  }, [k, z, cam]);
  useOrbit(ref, setCam);
  return (
    <Widget title="التكامل الثلاثي بالمقاطع" hint={k === 'tet' ? 'الهرم الثلاثي تحت المستوى $x + y + z = 1$ في الربع الأول. **ثلاثة تكاملات، والحدود من الداخل إلى الخارج:** $z$ من 0 إلى $1 - x - y$، ثم $y$ من 0 إلى $1 - x$، ثم $x$ من 0 إلى 1. أو اقطع أفقياً: عند الارتفاع $z$ المقطع مثلث (الأحمر) مساحته $\\tfrac12(1 - z)^2$.' : 'الجسم تحت المجسم المكافئ $z = 4 - x^2 - y^2$ وفوق $z = 0$. **المقطع الأفقي قرص** نصف قطره $\\sqrt{4 - z}$، مساحته $\\pi(4 - z)$. والحجم $\\int_0^4\\pi(4 - z)\\,dz = 8\\pi$. اسحب الرسم لتديره.'}>
      <Choice value={k} onChange={(v) => { setK(v); setZ(v === 'tet' ? 0.4 : 1.5); }} options={[{ v: 'tet', label: 'هرم ثلاثي' }, { v: 'para', label: 'مجسم مكافئ' }]} />
      <Canvas refEl={ref} ratio={0.75} label="جسم ومقطعه الأفقي" />
      <div className="controls"><Slider label="ارتفاع المقطع $z$" value={z} min={0} max={H * 0.98} step={H / 200} onChange={setZ} show={(v) => fmt(v, 2)} color="var(--red)" /></div>
      <Readout items={[
        { label: 'مساحة المقطع $A(z)$', value: fmt(A(z), 4), color: 'var(--red)' },
        { label: 'الحجم حتى $z$: $\\int_0^z A$', value: fmt(V(z), 4) },
        { label: 'الحجم الكلي', value: k === 'tet' ? '1/6' : `8π ≈ ${fmt(8 * Math.PI, 4)}`, color: 'var(--f1)' },
      ]} />
      <MathText as="div" className="verdict">{k === 'tet' ? '$\\int_0^1\\int_0^{1-x}\\int_0^{1-x-y}dz\\,dy\\,dx$: الداخلي $1 - x - y$، والأوسط $\\tfrac12(1 - x)^2$، والخارجي $\\tfrac16$. **سدس المكعب.** وبالمقاطع: $\\int_0^1\\tfrac12(1 - z)^2dz = \\tfrac16$. ولأي تكامل ثلاثي ست ترتيبات ممكنة لـ $dx\\,dy\\,dz$، وكلها تعطي الجواب نفسه.' : '**نصف حجم الأسطوانة المحيطة** ($\\pi\\cdot 4\\cdot 4 = 16\\pi$). وفي الإحداثيات الأسطوانية (القسم 14.4): $\\int_0^{2\\pi}\\int_0^2(4 - r^2)\\,r\\,dr\\,d\\theta = 2\\pi\\left[2r^2 - \\tfrac14r^4\\right]_0^2 = 8\\pi$.'}</MathText>
    </Widget>
  );
}
