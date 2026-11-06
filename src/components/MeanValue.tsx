import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Fn { label: string; f: (x: number) => number; d: (x: number) => number; view: View; ab: [number, number]; range: [number, number] }

const fns: Record<string, Fn> = {
  cubic: { label: '$x^3 - 3x$', f: (x) => x ** 3 - 3 * x, d: (x) => 3 * x * x - 3, view: { xMin: -2.6, xMax: 2.6, yMin: -5, yMax: 5 }, ab: [-2, 1.5], range: [-2.4, 2.4] },
  sqrt: { label: '$\\sqrt{x}$', f: Math.sqrt, d: (x) => 1 / (2 * Math.sqrt(x)), view: { xMin: -2, xMax: 110, yMin: -1, yMax: 12 }, ab: [0, 100], range: [0, 105] },
  sin: { label: '$\\sin x$', f: Math.sin, d: Math.cos, view: { xMin: -0.3, xMax: 6.6, yMin: -1.5, yMax: 1.5 }, ab: [0.5, 5], range: [0, 6.3] },
};

/** 3.8 — مبرهنة القيمة المتوسطة: نقطة c يكون فيها المماس موازياً للقاطع. */
export default function MeanValue() {
  const [k, setK] = useState('cubic');
  const F = fns[k];
  const [a, setA] = useState(F.ab[0]);
  const [b, setB] = useState(F.ab[1]);
  const m = (F.f(b) - F.f(a)) / (b - a);
  // جذور f'(c) = m داخل (a, b)
  const cs: number[] = [];
  const N = 2000;
  for (let i = 1; i < N; i++) {
    const x1 = a + ((b - a) * (i - 1)) / N, x2 = a + ((b - a) * i) / N;
    const g1 = F.d(x1) - m, g2 = F.d(x2) - m;
    if (Number.isFinite(g1) && Number.isFinite(g2) && g1 * g2 <= 0) { let lo = x1, hi = x2; for (let j = 0; j < 40; j++) { const md = (lo + hi) / 2; if ((F.d(lo) - m) * (F.d(md) - m) <= 0) hi = md; else lo = md; } cs.push((lo + hi) / 2); }
  }
  const ref = usePlot(F.view, (p) => {
    p.axes();
    p.fn(F.f, p.c.f1, { width: 3, from: k === 'sqrt' ? 0 : F.view.xMin });
    p.line(a, F.f(a), b, F.f(b), p.c.f2, { width: 2.4 });
    for (const c of cs) { p.lineThrough(c, F.f(c), m, p.c.area, { width: 1.6, dash: [6, 4] }); p.point(c, F.f(c), p.c.area, 6); }
    p.point(a, F.f(a), p.c.f2, 6);
    p.point(b, F.f(b), p.c.f2, 6);
  }, [k, a, b]);
  return (
    <Widget title="مبرهنة القيمة المتوسطة: المماس يوازي القاطع" hint="البرتقالي: القاطع من $a$ إلى $b$، وميله **الميل المتوسط** $\frac{f(b) - f(a)}{b - a}$. الأخضر: كل نقطة $c$ بينهما يكون عندها **الميل اللحظي** $f'(c)$ مساوياً له تماماً. المبرهنة تضمن وجود نقطة واحدة على الأقل، لكنها **لا تقول أين**: ليست مبرهنة بنّاءة.">
      <Choice value={k} onChange={(v) => { setK(v); setA(fns[v].ab[0]); setB(fns[v].ab[1]); }} options={Object.entries(fns).map(([v, f]) => ({ v, label: f.label }))} />
      <Canvas refEl={ref} label="القاطع والمماسات الموازية له" />
      <div className="controls">
        <Slider label="$a$" value={a} min={F.range[0]} max={b - 0.1} step={0.01} onChange={setA} show={(v) => fmt(v)} color="var(--f2)" />
        <Slider label="$b$" value={b} min={a + 0.1} max={F.range[1]} step={0.01} onChange={setB} show={(v) => fmt(v)} color="var(--f2)" />
      </div>
      <Readout items={[
        { label: 'الميل المتوسط', value: fmt(m, 4), color: 'var(--f2)' },
        { label: 'النقاط $c$', value: cs.length ? cs.map((c) => fmt(c, 3)).join(' · ') : '—', color: 'var(--area)' },
      ]} />
    </Widget>
  );
}
