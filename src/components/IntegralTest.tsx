import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

/** 10.2 — اختبار التكامل: مستطيلات 1/nᵖ فوق المنحنى x⁻ᵖ وتحته. يتقاربان معاً (p > 1) أو يتباعدان معاً. */
export default function IntegralTest() {
  const [p, setP] = useState(1);
  const [n, setN] = useState(10);
  const a = (k: number) => k ** -p;
  let s = 0; for (let k = 1; k <= n; k++) s += a(k);
  const I = (b: number) => (Math.abs(p - 1) < 1e-9 ? Math.log(b) : (b ** (1 - p) - 1) / (1 - p));
  const lo = I(n + 1), hi = 1 + I(n);
  const ref = usePlot({ xMin: 0, xMax: Math.max(10.5, n + 1.5), yMin: -0.06, yMax: 1.15 }, (pl) => {
    pl.axes({ xLabel: 'x', yLabel: 'y', xStep: n > 20 ? 5 : 1 });
    for (let k = 1; k <= n; k++) pl.rect(k, 0, k + 1, a(k), pl.c.f2, { alpha: 0.35 });
    pl.fillUnder((x) => x ** -p, 1, n + 1, pl.c.area, 0.35);
    pl.fn((x) => x ** -p, pl.c.f1, { width: 2.6, from: 0.85 });
  }, [p, n]);
  const conv = p > 1;
  const H = (m: number) => { let h = 0; for (let k = 1; k <= m; k++) h += 1 / k; return h; };
  return (
    <Widget title="اختبار التكامل" hint="كل حد $a_n = 1/n^p$ مساحة مستطيل عرضه 1 (البرتقالي)، **والمستطيل فوق المنحنى** $y = 1/x^p$ بين $n$ و $n + 1$. فالمجموع أكبر من المساحة تحت المنحنى، وأصغر منها زائد الحد الأول: $\int_1^{n+1}\dfrac{dx}{x^p} \lt s_n \lt 1 + \int_1^n\dfrac{dx}{x^p}$. **المتسلسلة والتكامل يحاصر كل منهما الآخر.**">
      <Canvas refEl={ref} ratio={0.5} label="مستطيلات المتسلسلة والمساحة تحت المنحنى" />
      <div className="controls">
        <Slider label="$p$" value={p} min={0.5} max={3} step={0.05} onChange={setP} show={(v) => fmt(v, 2)} color="var(--f1)" />
        <Slider label="عدد الحدود $n$" value={n} min={1} max={60} step={1} onChange={setN} />
      </div>
      <Readout items={[
        { label: '$\\int_1^{n+1} x^{-p}\\,dx$', value: fmt(lo, 4), color: 'var(--area)' },
        { label: '$s_n = \\sum_1^n n^{-p}$', value: fmt(s, 4), color: 'var(--f2)' },
        { label: '$1 + \\int_1^{n} x^{-p}\\,dx$', value: fmt(hi, 4) },
        { label: 'المتسلسلة كاملة', value: conv ? `منتهية، أقل من ${fmt(p / (p - 1), 3)}` : '∞', color: conv ? 'var(--area)' : 'var(--red)' },
      ]} />
      <MathText as="div" className="verdict">{conv ? `**$p = ${fmt(p, 2)} \\gt 1$: التكامل منتهٍ** ($\\int_1^\\infty x^{-p}dx = 1/(p - 1)$)، فالمتسلسلة تتقارب، ومجموعها أقل من $1 + \\tfrac{1}{p - 1} = \\tfrac{p}{p - 1}$. ${Math.abs(p - 2) < 0.03 ? 'لـ $p = 2$ وجد أويلر المجموع $\\pi^2/6 \\approx 1.645$.' : 'مع $p = 2$ وجد أويلر المجموع $\\pi^2/6$، ومع $p = 3$ ما زال المجموع مجهولاً.'}` : `**$p \\le 1$: المساحة لانهائية، والمتسلسلة تتباعد.** للمتسلسلة التوافقية ($p = 1$) المجموع بين $\\ln(n + 1)$ و $1 + \\ln n$. لو أضاف حاسوب مليون حد في الثانية لمليون سنة لما بلغ المجموع 46. (والفرق $s_n - \\ln n$ يقترب من ثابت أويلر $0.577$: هنا $${fmt(H(n) - Math.log(n), 4)}$.)`}</MathText>
    </Widget>
  );
}
