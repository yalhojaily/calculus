import { useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { contourMap } from '../lib/three';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface P { label: string; f: (x: number, y: number) => number; gradf: (x: number, y: number) => [number, number]; levels: number[]; curve: (t: number) => [number, number]; gradg: (x: number, y: number) => [number, number]; t0: number; t1: number; tStar: number[]; note: string; box: number }
const ps: Record<string, P> = {
  ex1: { label: 'أصغر $x^2 + y^2$ على $2x + y = 5$', f: (x, y) => x * x + y * y, gradf: (x, y) => [2 * x, 2 * y], levels: [1, 2, 3, 5, 7, 9, 12], curve: (t) => [t, 5 - 2 * t], gradg: () => [2, 1], t0: 0.4, t1: 3.6, tStar: [2], box: 4, note: 'أقرب نقطة على المستقيم إلى الأصل. عند الحل **يمس المستقيمُ دائرةَ تساوٍ**، فالتدرّجان متوازيان: $(2x, 2y) = \\lambda(2, 1)$. مع $2x + y = 5$: $(x, y) = (2, 1)$، و $f = 5$، و $\\lambda = 2$.' },
  ex2: { label: 'أكبر $xy$ على الدائرة $x^2 + y^2 = 2$', f: (x, y) => x * y, gradf: (x, y) => [y, x], levels: [-1.5, -1, -0.5, 0.5, 1, 1.5], curve: (t) => [Math.SQRT2 * Math.cos(t), Math.SQRT2 * Math.sin(t)], gradg: (x, y) => [2 * x, 2 * y], t0: 0, t1: 2 * Math.PI, tStar: [Math.PI / 4, (5 * Math.PI) / 4], box: 2, note: '$(y, x) = \\lambda(2x, 2y)$ يعطي $y^2 = x^2$. **العظمى $f = 1$ عند $(1, 1)$ و $(-1, -1)$**، والصغرى $-1$ عند $(1, -1)$ و $(-1, 1)$. عند الأربع تمس الدائرةُ قطعاً زائداً $xy = c$.' },
};

/** 13.7 — مضاعفات لاغرانج: على القيد g = k، القيمة القصوى لـ f حيث ∇f = λ∇g (خط التساوي يمس القيد). */
export default function LagrangeWidget() {
  const [k, setK] = useState('ex1');
  const P = ps[k];
  const [t, setT] = useState(P.t0 + 0.25 * (P.t1 - P.t0));
  const [x, y] = P.curve(t);
  const [fa, fb] = P.gradf(x, y), [ga, gb] = P.gradg(x, y);
  const cross = fa * gb - fb * ga; // صفر حين يتوازيان
  const lam = (fa * ga + fb * gb) / (ga * ga + gb * gb);
  const B = P.box;
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, k === 'ex1' ? -0.5 : -B, B, k === 'ex1' ? -0.5 : -B, k === 'ex1' ? 5.2 : B);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    contourMap(p, P.f, P.levels, [-B - 1, B + 1], [-B - 1, B + 6], { n: 100, width: 1.1 });
    p.curve((s) => P.curve(s)[0], (s) => P.curve(s)[1], P.t0, P.t1, p.c.ink, { width: 3 });
    P.tStar.forEach((s) => { const [a, b] = P.curve(s); p.point(a, b, p.c.area, 5); });
    const nf = Math.hypot(fa, fb) || 1, ng = Math.hypot(ga, gb) || 1;
    p.arrow(x, y, x + (0.8 * fa) / nf, y + (0.8 * fb) / nf, p.c.red, { width: 3 });
    p.arrow(x, y, x + (0.6 * ga) / ng, y + (0.6 * gb) / ng, p.c.violet, { width: 2.4 });
    p.point(x, y, p.c.ink, 6);
  }, [k, t]);
  const par = Math.abs(cross) < 0.04 * Math.hypot(fa, fb) * Math.hypot(ga, gb);
  return (
    <Widget title="مضاعفات لاغرانج" hint="نبحث عن أصغر (أو أكبر) $f$ **بشرط** البقاء على المنحنى $g = k$ (الأسود). حرّك النقطة على القيد. **الأحمر $\nabla f$ والبنفسجي $\nabla g$.** ما دام لـ $\nabla f$ مركّبة على امتداد القيد نستطيع أن نحسّن $f$. **عند القيمة القصوى يتوازيان: 13N** $\nabla f = \lambda\nabla g$، وخط تساوي $f$ يمس القيد.">
      <Choice value={k} onChange={(v) => { setK(v); setT(ps[v].t0 + 0.25 * (ps[v].t1 - ps[v].t0)); }} options={Object.keys(ps).map((v) => ({ v, label: ps[v].label }))} />
      <Canvas refEl={ref} ratio={0.85} label="خطوط تساوي f والقيد والتدرّجان" />
      <div className="controls"><Slider label="الموضع على القيد" value={t} min={P.t0} max={P.t1} step={(P.t1 - P.t0) / 400} onChange={setT} show={() => `(${fmt(x, 2)}, ${fmt(y, 2)})`} /></div>
      <Readout items={[
        { label: '$f$', value: fmt(P.f(x, y), 4), color: 'var(--f1)' },
        { label: '$\\nabla f$', value: `(${fmt(fa, 2)}, ${fmt(fb, 2)})`, color: 'var(--red)' },
        { label: '$\\nabla g$', value: `(${fmt(ga, 2)}, ${fmt(gb, 2)})`, color: 'var(--violet)' },
        { label: 'متوازيان؟', value: par ? `نعم، λ = ${fmt(lam, 3)}` : 'لا', color: par ? 'var(--area)' : undefined },
      ]} />
      <MathText as="div" className="verdict">{P.note + ' **13O: دالة لاغرانج** $L = f - \\lambda(g - k)$: مشتقاتها الثلاث صفر تعطي $\\nabla f = \\lambda\\nabla g$ والقيد نفسه. و $\\lambda$ معدل تغير القيمة المثلى إذا غيّرنا $k$.'}</MathText>
    </Widget>
  );
}
