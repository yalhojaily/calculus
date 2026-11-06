import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

const vs: Record<string, { label: string; v: (x: number) => number; v0: string }> = {
  cos: { label: '$v = \\cos x$', v: Math.cos, v0: '1' },
  exp: { label: '$v = e^x$', v: Math.exp, v0: '1' },
  sin: { label: '$v = \\sin x$', v: Math.sin, v0: '0' },
  lin: { label: '$v = 2 + x$', v: (x) => 2 + x, v0: '2' },
};

/** 7.1 — دالة دلتا: نتوء عرضه ε وارتفاعه 1/ε مساحته 1. مضروباً في v(x) تقترب مساحته من v(0). */
export default function DeltaSpike() {
  const [k, setK] = useState('cos');
  const V = vs[k];
  const [eps, setEps] = useState(0.5);
  const h = 1 / eps;
  let area = 0; const N = 400;
  for (let i = 0; i < N; i++) { const x = -eps / 2 + (eps * (i + 0.5)) / N; area += V.v(x) * h * (eps / N); }
  const ref = usePlot({ xMin: -2, xMax: 2, yMin: -1.2, yMax: Math.min(Math.max(h * 1.1, 3), 22) }, (p) => {
    p.axes();
    p.fn(V.v, p.c.f1, { width: 2.4 });
    p.rect(-eps / 2, 0, eps / 2, h, p.c.f2, { alpha: 0.25 });
    p.fn((x) => (Math.abs(x) <= eps / 2 ? V.v(x) * h : NaN), p.c.area, { width: 3, from: -eps / 2, to: eps / 2 });
    p.fillUnder((x) => V.v(x) * h, -eps / 2, eps / 2, p.c.area, 0.35);
  }, [k, eps]);
  return (
    <Widget title="دالة دلتا: نتوء مساحته 1" hint="البرتقالي نتوء عرضه $\varepsilon$ وارتفاعه $1/\varepsilon$: **مساحته 1 دائماً**. صغّر $\varepsilon$ فيصير أطول وأنحف. الأخضر حاصل ضربه في الدالة الملساء $v(x)$ (الأزرق). مع النتوء الأنحف لا يرى النتوء إلا **قيمة $v$ عند الصفر**، فتقترب المساحة من $v(0)$.">
      <Choice value={k} onChange={setK} options={Object.entries(vs).map(([v, q]) => ({ v, label: q.label }))} />
      <Canvas refEl={ref} ratio={0.55} label="نتوء يقترب من دالة دلتا" />
      <div className="controls">
        <Slider label="العرض $\varepsilon$" value={eps} min={0.05} max={2} step={0.005} onChange={setEps} show={(v) => fmt(v, 3)} color="var(--f2)" />
      </div>
      <Readout items={[
        { label: 'مساحة النتوء', value: '1', color: 'var(--f2)' },
        { label: 'مساحة $v \\cdot$ النتوء', value: fmt(area, 5), color: 'var(--area)' },
        { label: '$v(0)$', value: V.v0, color: 'var(--f1)' },
      ]} />
      <MathText as="div" className="verdict">{'7B: $\\displaystyle\\int_{-A}^{A} v(x)\\,\\delta(x)\\,dx = v(0)$. **لا نستطيع التعامل مع $\\delta$ مباشرةً**: ضرب اللانهاية خطر في أقل تقدير. إنها معروفة بتكاملاتها فقط، ومنها نبرهن هذا بالتجزئة.'}</MathText>
    </Widget>
  );
}
