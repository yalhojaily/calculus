import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

const fact = (n: number) => { let r = 1; for (let k = 2; k <= n; k++) r *= k; return r; };
const partial = (N: number) => (x: number) => { let s = 0; for (let k = 0; k <= N; k++) s += x ** k / fact(k); return s; };

/** 0.3 — بناء eˣ حداً حداً: كل حد جديد يصلح المشتقة، والمشتقة تحتاج حداً جديداً… */
export default function ExpSeries() {
  const [N, setN] = useState(2);
  const [x, setX] = useState(1);
  const S = partial(N);
  const dS = partial(N - 1); // مشتقة المجموع الجزئي = المجموع السابق
  const view = { xMin: -3, xMax: 3, yMin: -2, yMax: 12 };
  const ref = usePlot(view, (p) => {
    p.axes();
    p.fn(Math.exp, p.c.f1, { width: 5, dash: [] });
    p.fn(Math.exp, p.c.card, { width: 2 });
    if (N >= 1) p.fn(dS, p.c.f2, { width: 1.6, dash: [5, 4] });
    p.fn(S, p.c.f2, { width: 2.8 });
    p.point(x, S(x), p.c.f2);
    p.point(x, Math.exp(x), p.c.f1, 4);
    p.text('eˣ', 2.4, Math.exp(2.4), p.c.f1, { dx: -14 });
  }, [N, x]);

  const terms = Array.from({ length: N + 1 }, (_, k) => ({ k, v: x ** k / fact(k) }));
  const tex = ['1', 'x', '\\tfrac{x^2}{2}', '\\tfrac{x^3}{6}', '\\tfrac{x^4}{24}', '\\tfrac{x^5}{120}'];
  const seriesTex = Array.from({ length: N + 1 }, (_, k) => tex[k] ?? `\\tfrac{x^{${k}}}{${k}!}`).join(' + ');
  return (
    <Widget
      title="بناء الدالة eˣ من القوى xⁿ"
      hint={`المجموع الآن: $y = ${seriesTex}$. الخط البرتقالي المتقطّع هو مشتقته، وهي أقصر بحدّ واحد. كلما زادت الحدود اقترب الاثنان من $e^x$ (الأزرق المجوّف)، فتصبح الدالة مساوية لميلها.`}
    >
      <Canvas refEl={ref} label="المجاميع الجزئية لمتسلسلة e^x" />
      <div className="controls">
        <Slider label="عدد الحدود بعد 1" value={N} min={0} max={10} step={1} onChange={setN} color="var(--f2)" />
        <Slider label="$x$" value={x} min={-3} max={3} step={0.05} onChange={setX} show={(v) => fmt(v)} />
      </div>
      <Readout
        items={[
          { label: 'المجموع الجزئي عند $x$', value: fmt(S(x), 5), color: 'var(--f2)' },
          { label: '$e^x$ الحقيقية', value: fmt(Math.exp(x), 5), color: 'var(--f1)' },
          { label: 'المجموع عند $x = 1$ (يقترب من $e$)', value: fmt(partial(N)(1), 6) },
        ]}
      />
      <table>
        <thead><tr><th>n</th>{terms.map((t) => <td key={t.k}>{t.k}</td>)}</tr></thead>
        <tbody><tr><th>xⁿ/n!</th>{terms.map((t) => <td key={t.k}>{fmt(t.v, 4)}</td>)}</tr></tbody>
      </table>
    </Widget>
  );
}
