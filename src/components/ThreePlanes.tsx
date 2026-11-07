import { useCallback, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { type Cam, type V3, add, cross, dot, draw3, len, mul, useOrbit } from '../lib/three';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Widget, useClock, usePlot } from './ui';

type K = 'rows' | 'cols';
// النظام: x + y = 1، x + 2z = 0، 2y + 2z = -4 → الحل (2, −1, −1)
const R: V3[] = [[1, 1, 0], [1, 0, 2], [0, 2, 2]];
const d: V3 = [1, 0, -4];
const sol: V3 = [2, -1, -1];

/** 11.5 — ثلاث معادلات في ثلاثة مجاهيل: ثلاثة مستويات تلتقي في نقطة (الصفوف)، أو تركيبة xa + yb + zc = d (الأعمدة). */
export default function ThreePlanes() {
  const [k, setK] = useState<K>('rows');
  const [cam, setCam0] = useState<Cam>({ az: 0.9, el: 0.35 });
  const setCam = useCallback((f: (c: Cam) => Cam) => setCam0(f), []);
  const clock = useClock(4, { loop: false });
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -3.6, 3.6, -3.2, 3.4);
    const g = draw3(p, cam);
    g.floor(3, 1); g.axes(3);
    const cols = [p.c.f1, p.c.f2, p.c.area];
    if (k === 'rows') {
      R.forEach((N, i) => {
        const n2 = dot(N, N);
        const e: V3 = Math.abs(N[2]) < 0.9 * Math.sqrt(n2) ? [0, 0, 1] : [1, 0, 0];
        let u = cross(N, e); u = mul(1 / len(u), u); let v = cross(N, u); v = mul(1 / len(v), v);
        const c0 = sol;
        const S = 1.5, cr = (a: number, b: number): V3 => add(c0, add(mul(S * a, u), mul(S * b, v)));
        g.poly([cr(-1, -1), cr(1, -1), cr(1, 1), cr(-1, 1)], cols[i], 0.17);
      });
      // خط تقاطع المستويين الأولين
      const dir = cross(R[0], R[1]); const dn = mul(2.6 / len(dir), dir);
      g.line(add(sol, mul(-1, dn)), add(sol, dn), p.c.violet, { width: 2.4 });
      g.point(sol, p.c.red, 7);
      g.text('(2, −1, −1)', sol, p.c.red, { dx: 8, dy: 4 });
    } else {
      const s = clock.t * 3; // نبني التركيبة: x a ثم y b ثم z c
      const w = [Math.min(1, s), Math.max(0, Math.min(1, s - 1)), Math.max(0, Math.min(1, s - 2))];
      [0, 1, 2].forEach((i) => { const col: V3 = [R[0][i], R[1][i], R[2][i]]; g.arrow([0, 0, 0], col, cols[i], { width: 1.4 }); g.text('abc'[i], col, cols[i], { dx: 5 }); });
      let at: V3 = [0, 0, 0];
      [0, 1, 2].forEach((i) => { const col: V3 = [R[0][i], R[1][i], R[2][i]]; const step = mul(sol[i] * w[i], col); if (w[i] > 0) { g.arrow(at, add(at, step), cols[i], { width: 3.2 }); at = add(at, step); } });
      g.point(d, p.c.red, 7); g.text('d = (1, 0, −4)', d, p.c.red, { dx: 8 });
    }
  }, [k, cam, clock.t]);
  useOrbit(ref, setCam);
  return (
    <Widget title="ثلاث معادلات وثلاثة مجاهيل" hint="$x + y = 1$ و $x + 2z = 0$ و $2y + 2z = -4$. **الصفوف:** كل معادلة مستوى. أول مستويين يتقاطعان في خط (البنفسجي)، والمستوى الثالث يقطع ذلك الخط في نقطة الحل. **الأعمدة:** $x\mathbf a + y\mathbf b + z\mathbf c = \mathbf d$، حيث $\mathbf a, \mathbf b, \mathbf c$ أعمدة المصفوفة. اسحب الرسم لتديره.">
      <Choice value={k} onChange={(v) => { setK(v); clock.reset(); }} options={[{ v: 'rows', label: 'صورة الصفوف' }, { v: 'cols', label: 'صورة الأعمدة' }]} />
      <Canvas refEl={ref} ratio={0.75} label="ثلاثة مستويات تلتقي في نقطة" />
      {k === 'cols' && <AnimControls clock={clock} label="ركّب الأعمدة" />}
      <Readout items={[
        { label: '$\\det A$', value: '−6' },
        { label: 'الحل $(x, y, z)$', value: '(2, −1, −1)', color: 'var(--red)' },
        ...(k === 'cols' ? [{ label: 'التركيبة', value: '2a − b − c = d', color: 'var(--red)' }] : []),
      ]} />
      <MathText as="div" className="verdict">{k === 'rows' ? 'المستوى $x + y = 1$ يقطع رأسياً عبر خط، لأن $z$ غائب فيأخذ أي قيمة. و $x + 2z = 0$ يمر بالأصل ويحوي المحور $y$ كله. **حين $\\det A \\ne 0$ تلتقي المستويات الثلاثة في نقطة واحدة.** وفي الحالة الشاذة قد تتوازى أو تلتقي في خط.' : '**الحل نفسه من زاوية أخرى:** مرتان العمود الأول، ناقص الثاني، ناقص الثالث: $2(1, 1, 0) - (1, 0, 2) - (0, 2, 2) = (1, 0, -4)$. وفي الحالة الشاذة تقع الأعمدة الثلاثة في مستوى واحد (صندوق حجمه صفر)، فلا تصل تركيباتها إلى كل $\\mathbf d$.'}</MathText>
    </Widget>
  );
}
