import { useCallback, useMemo, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { type Cam, type V3, add, depth, draw3, mul, useOrbit } from '../lib/three';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Fd { label: string; F: (x: number, y: number, z: number) => V3; div: (x: number, y: number, z: number) => number; note: string }
const fields: Record<string, Fd> = {
  R: { label: '$x\\mathbf i + y\\mathbf j + z\\mathbf k$', F: (x, y, z) => [x, y, z], div: () => 3, note: '**المثال 2:** $\\operatorname{div}\\mathbf R = 1 + 1 + 1 = 3$ في كل مكان، **فالتدفق ثلاثة أضعاف الحجم** لأي جسم. الوجوه الثلاثة عند الأصل تدفقها صفر، لأن $\\mathbf R$ يسير موازياً لها.' },
  S: { label: '$-y\\mathbf i + x\\mathbf j$', F: (x, y) => [-y, x, 0], div: () => 0, note: '**المثال 1:** حقل الدوران تباعده صفر: **ما يدخل من وجه يخرج من آخر**. التدفق الكلي صفر مهما كان الصندوق.' },
  B: { label: '$x^2\\mathbf i + y\\mathbf j + 2\\mathbf k$', F: (x, y) => [x * x, y, 2], div: (x) => 2 * x + 1, note: '**التمرين 11:** $\\operatorname{div}\\mathbf F = 2x + 1$، و $\\iiint(2x + 1)\\,dV = a^4 + a^3$. الحقل الثابت $2\\mathbf k$ يدخل من الأسفل ويخرج من الأعلى بالقدر نفسه.' },
  Z: { label: '$z^2\\mathbf k$', F: (_x, _y, z) => [0, 0, z * z], div: (_x, _y, z) => 2 * z, note: '$\\operatorname{div} = 2z$: المصدر يقوى صعوداً. **كل التدفق من الوجه العلوي** ($a^2\\cdot a^2$)، والوجه السفلي عند $z = 0$ لا يعبره شيء.' },
};
const faces: { name: string; n: V3; pt: (a: number, s: number, t: number) => V3 }[] = [
  { name: 'x = a', n: [1, 0, 0], pt: (a, s, t) => [a, s, t] }, { name: 'x = 0', n: [-1, 0, 0], pt: (_a, s, t) => [0, s, t] },
  { name: 'y = a', n: [0, 1, 0], pt: (a, s, t) => [s, a, t] }, { name: 'y = 0', n: [0, -1, 0], pt: (_a, s, t) => [s, 0, t] },
  { name: 'z = a', n: [0, 0, 1], pt: (a, s, t) => [s, t, a] }, { name: 'z = 0', n: [0, 0, -1], pt: (_a, s, t) => [s, t, 0] },
];
const M = 30;

/** 15.5 — مبرهنة التباعد: التدفق الخارج عبر الوجوه الستة = ∭ div F dV. */
export default function FluxCube() {
  const [k, setK] = useState('R');
  const [a, setA] = useState(1.2);
  const [cam, setCam0] = useState<Cam>({ az: 0.75, el: 0.42 });
  const setCam = useCallback((f: (c: Cam) => Cam) => setCam0(f), []);
  const fd = fields[k];
  const flux = useMemo(() => faces.map((fc) => { const h = a / M; let s = 0; for (let i = 0; i < M; i++) for (let j = 0; j < M; j++) { const F = fd.F(...fc.pt(a, (i + 0.5) * h, (j + 0.5) * h)); s += (F[0] * fc.n[0] + F[1] * fc.n[1] + F[2] * fc.n[2]) * h * h; } return s; }), [fd, a]);
  const vol = useMemo(() => { const m = 20, h = a / m; let s = 0; for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) for (let l = 0; l < m; l++) s += fd.div((i + 0.5) * h, (j + 0.5) * h, (l + 0.5) * h) * h ** 3; return s; }, [fd, a]);
  const tot = flux.reduce((x, y) => x + y, 0);
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -1.6, 2.4, -1.1, 2.6);
    const g = draw3(p, cam);
    g.floor(2, 0.5); g.axes(2.3);
    const fm = Math.max(1e-9, ...flux.map(Math.abs));
    // الوجوه من الأبعد إلى الأقرب
    const order = faces.map((fc, i) => ({ fc, i, d: depth(cam, fc.pt(a, a / 2, a / 2)) })).sort((x, y) => x.d - y.d);
    for (const { fc, i } of order) {
      const pts = [fc.pt(a, 0, 0), fc.pt(a, a, 0), fc.pt(a, a, a), fc.pt(a, 0, a)];
      const v = flux[i]; const s = Math.abs(v) / fm;
      g.poly(pts, Math.abs(v) < 1e-6 ? p.c['ink-3'] : v > 0 ? p.c.teal : p.c.red, 0.08 + 0.3 * s, true);
      // أسهم الحقل على الوجه
      for (const s1 of [0.25, 0.75]) for (const t1 of [0.25, 0.75]) {
        const P0 = fc.pt(a, s1 * a, t1 * a); const F = fd.F(...P0); const l = Math.hypot(...F); if (l < 1e-9) continue;
        const fn = F[0] * fc.n[0] + F[1] * fc.n[1] + F[2] * fc.n[2];
        g.arrow(P0, add(P0, mul((0.35 * Math.tanh(l)) / l, F)), Math.abs(fn) < 1e-9 ? p.c['ink-3'] : fn > 0 ? p.c.teal : p.c.red, { width: 1.6, head: 5 });
      }
    }
  }, [k, a, cam, flux]);
  useOrbit(ref, setCam);
  return (
    <Widget title="مبرهنة التباعد: تدفق الصندوق" hint="المكعب $0 \le x, y, z \le a$ في الحقل $\mathbf F$. **التدفق عبر كل وجه $\iint\mathbf F\cdot\mathbf n\,dS$**: أخضر إن خرج الحقل، وأحمر إن دخل، وأشد لوناً كلما كبر. **مجموع الوجوه الستة يساوي $\iiint\operatorname{div}\mathbf F\,dV$**: ما يخرج من الحد هو ما ينبع في الداخل. اسحب الرسم لتديره.">
      <Choice value={k} onChange={setK} options={Object.keys(fields).map((v) => ({ v, label: fields[v].label }))} />
      <Canvas refEl={ref} ratio={0.8} label="مكعب في حقل متجه وتدفق كل وجه" />
      <div className="controls">
        <Slider label="طول الضلع $a$" value={a} min={0.3} max={1.8} step={0.01} onChange={setA} show={(v) => fmt(v, 2)} />
      </div>
      <Readout items={[
        { label: 'مجموع الوجوه $\\oiint\\mathbf F\\cdot\\mathbf n\\,dS$', value: fmt(tot, 4), color: 'var(--teal)' },
        { label: '$\\iiint\\operatorname{div}\\mathbf F\\,dV$', value: fmt(vol, 4), color: 'var(--violet)' },
        { label: 'متوسط التباعد (التدفق ÷ الحجم)', value: fmt(tot / a ** 3, 3) },
      ]} />
      <MathText as="div" className="verdict">{`**الوجوه:** ${faces.map((fc, i) => `$${fc.name}\\to ${fmt(flux[i], 3)}$`).join('، ')}. ` + fd.note + ' **صغّر $a$:** التدفق ÷ الحجم يقترب من $\\operatorname{div}\\mathbf F$ عند الأصل. هذا تعريف التباعد.'}</MathText>
    </Widget>
  );
}
