import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

/** 10.1 — المتسلسلة الهندسية: المجموع الجزئي (1 − xⁿ)/(1 − x) يقترب من 1/(1 − x) فقط حين |x| < 1. */
export default function GeometricSeries() {
  const [x, setX] = useState(0.5);
  const [n, setN] = useState(4);
  const S = (t: number, m: number) => { let s = 0, p = 1; for (let i = 0; i < m; i++) { s += p; p *= t; } return s; };
  const graph = usePlot({ xMin: -1.6, xMax: 1.2, yMin: -1.5, yMax: 8 }, (p) => {
    p.axes({ xLabel: 'x', yLabel: 'y' });
    p.rect(-1, p.view.yMin, 1, p.view.yMax, p.c.area, { alpha: 0.07, stroke: false });
    p.fn((t) => 1 / (1 - t), p.c.f1, { width: 3, to: 0.995 });
    for (let m = 1; m < n; m++) p.fn((t) => S(t, m), p.c['ink-3'], { width: 1 });
    p.fn((t) => S(t, n), p.c.f2, { width: 2.6 });
    p.line(x, p.view.yMin, x, p.view.yMax, p.c.violet, { width: 1, dash: [4, 3] });
    p.point(x, S(x, n), p.c.f2, 5);
    if (x < 1) p.point(x, 1 / (1 - x), p.c.f1, 5);
  }, [x, n]);
  const sums = usePlot({ xMin: 0, xMax: 21, yMin: -3, yMax: 8 }, (p) => {
    p.axes({ xLabel: 'n', yLabel: 's', xStep: 5 });
    if (Math.abs(x) < 1) p.line(0, 1 / (1 - x), 21, 1 / (1 - x), p.c.f1, { width: 1.6, dash: [5, 4] });
    for (let m = 1; m <= 20; m++) p.point(m, Math.max(-3.2, Math.min(8.3, S(x, m))), m <= n ? p.c.f2 : p.c['ink-3'], m === n ? 6 : 3.5);
  }, [x, n]);
  const sn = S(x, n), lim = 1 / (1 - x);
  const verdict = Math.abs(x) < 1 ? `$|x| \\lt 1$: **المتسلسلة تتقارب**. المجاميع الجزئية تقترب من $1/(1 - x) = ${fmt(lim, 4)}$، لأن $x^n \\to 0$ في $s_n = \\dfrac{1 - x^n}{1 - x}$.` : x >= 1 ? 'عند $x \\ge 1$ **تتباعد** إلى اللانهاية: $1 + 1 + 1 + \\cdots$. الدالة $1/(1 - x)$ سليمة لـ $x \\gt 1$، لكن المتسلسلة استسلمت.' : 'عند $x \\le -1$ **تتذبذب** ولا تتقارب. عند $x = -1$: $1 - 1 + 1 - \\cdots$ يقفز بين 1 و 0، ومتوسطه على الأقل $\\tfrac12 = 1/(1 - (-1))$.';
  return (
    <Widget title="المتسلسلة الهندسية" hint="$1 + x + x^2 + \cdots + x^{n-1} = \dfrac{1 - x^n}{1 - x}$: اضرب في $1 - x$ فيُلغى كل شيء بين $1$ في البداية و $x^n$ في النهاية. يسار: المجموع الجزئي (البرتقالي) يقترب من $1/(1 - x)$ (الأزرق) **داخل الشريط $-1 \lt x \lt 1$ فقط**. يمين: المجاميع الجزئية عند $x$ المختار.">
      <div className="cv-row">
        <div><Canvas refEl={graph} ratio={0.85} label="المجاميع الجزئية والدالة 1/(1 − x)" /><div className="cv-cap">دوال: sₙ(x)</div></div>
        <div><Canvas refEl={sums} ratio={0.85} label="المجاميع الجزئية عند x المختار" /><div className="cv-cap">أعداد: s₁, s₂, …</div></div>
      </div>
      <div className="controls">
        <Slider label="$x$" value={x} min={-1.4} max={1.1} step={0.01} onChange={setX} show={(v) => fmt(v, 2)} color="var(--violet)" />
        <Slider label="عدد الحدود $n$" value={n} min={1} max={20} step={1} onChange={setN} />
      </div>
      <Readout items={[
        { label: '$s_n$', value: fmt(sn, 5), color: 'var(--f2)' },
        { label: '$x^n$', value: fmt(x ** n, 5) },
        { label: '$1/(1 - x)$', value: x === 1 ? '∞' : fmt(lim, 5), color: 'var(--f1)' },
      ]} />
      <MathText as="div" className="verdict">{verdict}</MathText>
    </Widget>
  );
}
