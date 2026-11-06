import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

const ps = [
  { v: 1, label: '$p = 1$' },
  { v: 2, label: '$p = 2$' },
  { v: 3, label: '$p = 3$' },
  { v: 0.5, label: '$p = \\tfrac12$' },
];

/** 5.3 — مجموع القوى مقابل التكامل: Σ j^p ≈ n^{p+1}/(p+1)، والفرق «زوايا» المستطيلات. */
export default function SumPowers() {
  const [p, setP] = useState(2);
  const [n, setN] = useState(6);
  let S = 0;
  for (let j = 1; j <= n; j++) S += j ** p;
  const I = n ** (p + 1) / (p + 1), D = S - I, E = D / I;
  const ref = usePlot({ xMin: -0.05 * n, xMax: n * 1.05, yMin: -0.05 * n ** p, yMax: n ** p * 1.08 }, (pl) => {
    pl.axes({ xLabel: 'x', yLabel: 'v' });
    const stroke = n <= 40;
    for (let j = 1; j <= n; j++) pl.rect(j - 1, 0, j, j ** p, pl.c.f2, { alpha: 0.35, stroke });
    pl.fillUnder((x) => x ** p, 0, n, pl.c.area, 0.45);
    pl.fn((x) => x ** p, pl.c.f1, { width: 2.6, from: 0, to: n });
  }, [p, n]);
  return (
    <Widget title="المجموع مقابل التكامل" hint="المستطيلات (عرض كل منها 1 وارتفاعها $j^p$) مجموعها $S_n = 1^p + 2^p + \cdots + n^p$. المساحة الخضراء تحت $x^p$ هي $I_n = \dfrac{n^{p+1}}{p+1}$ **بلا حدود تصحيح**. الفرق $D$ هو الزوايا البرتقالية فوق المنحنى، والخطأ النسبي $E = D/I$ يصغر مثل $1/n$. **راقب $nE$**: إلى أي عدد $C(p)$ يقترب؟">
      <Choice value={p} onChange={setP} options={ps} />
      <Canvas refEl={ref} ratio={0.55} label="مستطيلات مجموع القوى ومنحنى x^p" />
      <div className="controls">
        <Slider label="$n$" value={n} min={1} max={400} step={1} onChange={setN} />
      </div>
      <Readout items={[
        { label: '$S_n$', value: fmt(S, 2), color: 'var(--f2)' },
        { label: '$I_n$', value: fmt(I, 2), color: 'var(--area)' },
        { label: '$D = S - I$', value: fmt(D, 2) },
        { label: '$E = D/I$', value: fmt(E, 5) },
        { label: '$nE$', value: fmt(n * E, 4), color: 'var(--red)' },
      ]} />
      <MathText as="div" className="verdict">{p === 2 ? 'الصيغة الدقيقة: $1^2 + \\cdots + n^2 = \\tfrac13 n^3 + \\tfrac12 n^2 + \\tfrac16 n$. ومع $n = 100$ يكون $S = 338350$ والتكامل $333333\\tfrac13$.' : p === 1 ? 'غاوس: $1 + \\cdots + n = \\tfrac12 n(n + 1) = \\tfrac12 n^2 + \\tfrac12 n$. التكامل يعطي $\\tfrac12 n^2$ فقط، والفرق $D = \\tfrac12 n$.' : 'لا صيغة بسيطة هنا، **لكن الحاسوب يجمع دون صيغة**. والتكامل لا يهتم بأن تكون $p$ عدداً صحيحاً.'}</MathText>
    </Widget>
  );
}
