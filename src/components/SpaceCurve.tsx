import { useCallback, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { type Cam, type V3, add, draw3, len, mul, useOrbit } from '../lib/three';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Widget, useClock, usePlot } from './ui';

interface C { label: string; R: (t: number) => V3; v: (t: number) => V3; a: (t: number) => V3; t0: number; t1: number; box: number; sc: number; note: string }
const cs: Record<string, C> = {
  cubic: { label: '$t\\mathbf i + t^2\\mathbf j + t^3\\mathbf k$', R: (t) => [t, t * t, t ** 3], v: (t) => [1, 2 * t, 3 * t * t], a: (t) => [0, 2, 6 * t], t0: -1.2, t1: 1.2, box: 2.2, sc: 0.35, note: 'السرعة $\\mathbf v = \\mathbf i + 2t\\mathbf j + 3t^2\\mathbf k$. عند $t = 0$ تكون $\\mathbf v = \\mathbf i$: المماس على المحور $x$. وعند $t = 1$ تكون $\\mathbf i + 2\\mathbf j + 3\\mathbf k$ والمنحنى يتسلق. **الظل على المستوى $xy$** (الرمادي) نحذف منه مركّبة $\\mathbf k$: قطع مكافئ.' },
  circle: { label: 'دائرة $r\\cos\\omega t$، $r\\sin\\omega t$', R: (t) => [2 * Math.cos(t), 2 * Math.sin(t), 0], v: (t) => [-2 * Math.sin(t), 2 * Math.cos(t), 0], a: (t) => [-2 * Math.cos(t), -2 * Math.sin(t), 0], t0: 0, t1: 2 * Math.PI, box: 2.6, sc: 0.5, note: 'المثالان 5 و 6: الحركة المنتظمة على دائرة. **السرعة مماسية بطول $\\omega r$**، والتسارع $-\\omega^2\\mathbf R$ يشير إلى المركز بطول $\\omega^2 r$. لا دواسة وقود ولا مكابح: **كل التسارع من الانعطاف**. السرعة ثابتة، لكن متجه السرعة يتغير.' },
  helix: { label: 'حلزون $\\cos t\\,\\mathbf i + \\sin t\\,\\mathbf j + t\\mathbf k$', R: (t) => [Math.cos(t), Math.sin(t), t / 2.5], v: (t) => [-Math.sin(t), Math.cos(t), 0.4], a: (t) => [-Math.cos(t), -Math.sin(t), 0], t0: 0, t1: 4 * Math.PI, box: 2.6, sc: 0.8, note: 'المثال 7 (برفع أبطأ في الرسم): السرعة $-\\sin t\\,\\mathbf i + \\cos t\\,\\mathbf j + \\mathbf k$ والانطلاق $\\sqrt2$ **ثابت**. التسارع أفقي ويشير إلى المحور. ظل الحلزون دائرة. وفي نصف لفة الظل يقطع $\\pi$ والحلزون $\\sqrt2\\,\\pi$، بسبب ميله $45°$.' },
  line: { label: 'مستقيم $\\mathbf R_0 + t\\mathbf v$', R: (t) => [t, 2 + t, 1 + 2 * t].map((x, i) => (i === 1 ? x - 2 : x)) as V3, v: () => [1, 1, 2], a: () => [0, 0, 0], t0: -1.2, t1: 1, box: 2.4, sc: 0.5, note: 'المثال 3 (مُزاحاً إلى الأصل ليظهر): $x = t$، $y = t$، $z = 1 + 2t$. **السرعة ثابتة والتسارع صفر.** بلا الوسيط $t$ نعرف أين لا متى: $x/1 = y/1 = (z - 1)/2$ هو المستقيم نفسه، لكن لا نعرف السرعة.' },
};

/** 12.1 — متجه الموضع R(t)، والسرعة v = dR/dt مماسية، والتسارع a = dv/dt. */
export default function SpaceCurve() {
  const [k, setK] = useState('cubic');
  const C = cs[k];
  const [cam, setCam0] = useState<Cam>({ az: 0.8, el: 0.4 });
  const setCam = useCallback((f: (c: Cam) => Cam) => setCam0(f), []);
  const clock = useClock(8, { loop: true });
  const t = C.t0 + (C.t1 - C.t0) * clock.t;
  const R = C.R(t), v = C.v(t), a = C.a(t);
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    const B = C.box; fitEqual(p, -B, B, -B * 0.8, B * 1.15);
    const g = draw3(p, cam);
    g.floor(2, 1); g.axes(B * 0.9);
    const N = 160, pts: V3[] = [];
    for (let i = 0; i <= N; i++) pts.push(C.R(C.t0 + ((C.t1 - C.t0) * i) / N));
    for (let i = 0; i < N; i++) { g.line([pts[i][0], pts[i][1], 0], [pts[i + 1][0], pts[i + 1][1], 0], p.c['ink-3'], { width: 1 }); g.line(pts[i], pts[i + 1], p.c.f1, { width: 2.6 }); }
    g.line([R[0], R[1], 0], R, p.c['ink-3'], { width: 1, dash: [3, 3] });
    g.arrow([0, 0, 0], R, p.c.ink, { width: 1.2, head: 6 });
    g.arrow(R, add(R, mul(C.sc, v)), p.c.f2, { width: 3 });
    if (len(a) > 1e-9) g.arrow(R, add(R, mul(C.sc * 0.6, a)), p.c.red, { width: 2.2 });
    g.point(R, p.c.f1, 6);
    g.text('v', add(R, mul(C.sc, v)), p.c.f2, { dx: 5 });
  }, [k, cam, t]);
  useOrbit(ref, setCam);
  return (
    <Widget title="متجه الموضع والسرعة والتسارع" hint="$\mathbf R(t) = x(t)\mathbf i + y(t)\mathbf j + z(t)\mathbf k$ يحدد موضع الجسم عند كل لحظة $t$. **السرعة $\mathbf v = d\mathbf R/dt$ مماسية للمنحنى** (البرتقالي)، لأن $\Delta\mathbf R/\Delta t$ يصطف مع المماس حين تقترب النقطتان. والتسارع $\mathbf a = d\mathbf v/dt$ (الأحمر) معدل تغير **متجه** السرعة، لا الانطلاق وحده. اسحب الرسم لتديره.">
      <Choice value={k} onChange={(v2) => { setK(v2); clock.reset(); }} options={Object.keys(cs).map((v2) => ({ v: v2, label: cs[v2].label }))} />
      <Canvas refEl={ref} ratio={0.75} label="منحنى في الفضاء مع متجهي السرعة والتسارع" />
      <AnimControls clock={clock} label="تحرّك" />
      <Readout items={[
        { label: '$t$', value: fmt(t, 2) },
        { label: '$\\mathbf v$', value: `(${v.map((x) => fmt(x, 2)).join(', ')})`, color: 'var(--f2)' },
        { label: 'الانطلاق $|\\mathbf v| = ds/dt$', value: fmt(len(v), 3), color: 'var(--f2)' },
        { label: '$\\mathbf a$', value: `(${a.map((x) => fmt(x, 2)).join(', ')})`, color: 'var(--red)' },
        { label: 'المماس $\\mathbf T = \\mathbf v/|\\mathbf v|$', value: `(${v.map((x) => fmt(x / len(v), 2)).join(', ')})` },
      ]} />
      <MathText as="div" className="verdict">{C.note}</MathText>
    </Widget>
  );
}
