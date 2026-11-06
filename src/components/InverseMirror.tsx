import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

interface G { label: string; g: (x: number) => number; d: (x: number) => number; xr: [number, number]; a: [number, number]; a0: number; view: View; note: string }

const pw2 = (x: number) => { const j = Math.floor(x); return 2 ** j * (1 + (x - j)); };
const fns: Record<string, G> = {
  lin: { label: '$y = 3x$', g: (x) => 3 * x, d: () => 3, xr: [-0.8, 2.6], a: [-0.6, 2.5], a0: 2, view: { xMin: -2.5, xMax: 8, yMin: -2.5, yMax: 8 }, note: 'المثال 5: الميلان $3$ و $\\tfrac13$، وحاصل ضربهما $1$. النقطة $(2, 6)$ على $y = 3x$ تنعكس إلى $(6, 2)$ على $x = \\tfrac13 y$.' },
  cube: { label: '$y = x^3$', g: (x) => x ** 3, d: (x) => 3 * x * x, xr: [-1.7, 1.7], a: [-1.6, 1.6], a0: 1.2, view: { xMin: -3.2, xMax: 3.2, yMin: -3.2, yMax: 3.2 }, note: 'المثال 6: $\\dfrac{dx}{dy} = \\dfrac{1}{3x^2} = \\dfrac{1}{3y^{2/3}}$. عند $x = 0$ الميل صفر، **فميل المعكوس لانهائي**: المماس الأفقي ينعكس رأسياً.' },
  sqrt: { label: '$y = \\sqrt{x}$', g: Math.sqrt, d: (x) => 1 / (2 * Math.sqrt(x)), xr: [0, 6], a: [0.05, 5.5], a0: 4, view: { xMin: -0.8, xMax: 6.5, yMin: -0.8, yMax: 6.5 }, note: 'المثال 3: المعكوس $x = y^2$، **لكن بشرط** $y \\ge 0$. مجال الدالة يساوي مدى معكوسها. الزوج $(4, 2)$ للأولى هو $(2, 4)$ للثانية.' },
  exp: { label: '$y = 2^x$', g: (x) => 2 ** x, d: (x) => Math.LN2 * 2 ** x, xr: [-3, 2.6], a: [-2.5, 2.5], a0: 0, view: { xMin: -3.2, xMax: 6.5, yMin: -3.2, yMax: 6.5 }, note: 'الأُسّي ميله $cy$ مع $c = 0.693\\ldots$ (لوغاريتم 2 الطبيعي). والمعكوس $x = \\log_2 y$ ميله $\\dfrac{1}{cy}$. المتقطع: النموذج الخطي المجزّأ من الفصل 1.' },
  temp: { label: 'فهرنهايت ← مئوي', g: (x) => (5 / 9) * (x - 32), d: () => 5 / 9, xr: [-20, 110], a: [-15, 105], a0: 50, view: { xMin: -40, xMax: 115, yMin: -40, yMax: 115 }, note: 'المثال 2: $y = \\tfrac59(x - 32)$ تطرح أولاً وتضرب أخيراً. المعكوس $x = \\tfrac95 y + 32$ يضرب أولاً ويجمع أخيراً. $50°F$ تقابل $10°C$.' },
};

/** 4.3 — الدالة العكسية انعكاس في الخط 45°، وميلها مقلوب الميل. */
export default function InverseMirror() {
  const [k, setK] = useState('cube');
  const G = fns[k];
  const [a, setA] = useState(G.a0);
  const clock = useClock(3, { loop: false });
  const t = clock.t;
  const b = G.g(a), m = G.d(a);
  const L = (x: number, y: number): [number, number] => [x + (y - x) * t, y + (x - y) * t];
  const ref = usePlot(G.view, (p) => {
    p.axes();
    const V = G.view;
    p.line(V.xMin, V.xMin, V.xMax, V.xMax, p.c['ink-3'], { width: 1.2, dash: [5, 5] });
    if (k === 'exp') {
      p.curve((s) => L(s, pw2(s))[0], (s) => L(s, pw2(s))[1], G.xr[0], G.xr[1], p.c.violet, { width: 1.6, dash: [5, 4], n: 400 });
    }
    // الأصل باهتاً بعد بدء القلب، ثم المنحنى المتحرك
    if (t > 0) p.curve((s) => s, (s) => G.g(s), G.xr[0], G.xr[1], p.c.f1, { width: 1.4, dash: [3, 4] });
    p.curve((s) => L(s, G.g(s))[0], (s) => L(s, G.g(s))[1], G.xr[0], G.xr[1], t < 1 ? p.c.f1 : p.c.f2, { width: 3, n: 300 });
    const [px, py] = L(a, b);
    // المماس: يُرسم كقطعة عبر النقطة باتجاه (1, m) المنعكس
    const dir0: [number, number] = [1, m], dir: [number, number] = [dir0[0] + (dir0[1] - dir0[0]) * t, dir0[1] + (dir0[0] - dir0[1]) * t];
    const n = Math.hypot(dir[0], dir[1]) || 1, R = (V.xMax - V.xMin) * 0.25;
    p.line(px - (dir[0] / n) * R, py - (dir[1] / n) * R, px + (dir[0] / n) * R, py + (dir[1] / n) * R, p.c.red, { width: 2 });
    if (t > 0 && t < 1) p.line(a, b, b, a, p.c['ink-3'], { width: 1, dash: [2, 4] });
    p.point(px, py, p.c.red, 6);
  }, [k, a, t]);
  return (
    <Widget title="الدالة العكسية في المرآة" hint="الخط المتقطع $45°$ مرآة. اضغط **اقلب**: كل نقطة $(x, y)$ تنتقل إلى $(y, x)$، فيصبح رسم $y = g(x)$ رسم $x = g^{-1}(y)$. المماس الأحمر ينقلب معه: الميل $m$ يصير $1/m$. **ميل المعكوس ضرب ميل الدالة يساوي 1.**">
      <Choice value={k} onChange={(v) => { setK(v); setA(fns[v].a0); clock.reset(); }} options={Object.entries(fns).map(([v, g]) => ({ v, label: g.label }))} />
      <Canvas refEl={ref} ratio={0.75} label="منحنى الدالة ومعكوسها" />
      <AnimControls clock={clock} label="اقلب" />
      <div className="controls">
        <Slider label="$x$" value={a} min={G.a[0]} max={G.a[1]} step={(G.a[1] - G.a[0]) / 500} onChange={setA} show={(v) => fmt(v, 2)} color="var(--red)" />
      </div>
      <Readout items={[
        { label: '$(x, y)$', value: `(${fmt(a, 2)}, ${fmt(b, 2)})`, color: 'var(--f1)' },
        { label: '$dy/dx$', value: fmt(m, 4), color: 'var(--f1)' },
        { label: '$dx/dy$', value: Math.abs(m) < 1e-9 ? '∞' : fmt(1 / m, 4), color: 'var(--f2)' },
        { label: 'حاصل الضرب', value: Math.abs(m) < 1e-9 ? '—' : '1' },
      ]} />
      <MathText as="div" className="verdict">{G.note}</MathText>
    </Widget>
  );
}
