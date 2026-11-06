import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Choice, Readout, Widget, usePlot } from './ui';

const steps = [
  { v: 4, label: 'سنوات (4)' },
  { v: 16, label: 'أرباع (16)' },
  { v: 208, label: 'أسابيع (208)' },
  { v: 1461, label: 'أيام (1461)' },
] as const;

/** 5.1 — دخل شركة معدّله √x مليون في السنة: المتفائل والمتشائم يقتربان من 16/3. */
export default function IncomeRect() {
  const [n, setN] = useState<number>(4);
  const [who, setWho] = useState<'opt' | 'pes' | 'both'>('opt');
  const dx = 4 / n;
  let R = 0, L = 0;
  for (let j = 1; j <= n; j++) { R += Math.sqrt(j * dx) * dx; L += Math.sqrt((j - 1) * dx) * dx; }
  const exact = 16 / 3;
  const ref = usePlot({ xMin: -0.15, xMax: 4.3, yMin: -0.12, yMax: 2.25 }, (p) => {
    p.axes({ xLabel: 'x (years)', yLabel: '$ / year', xStep: 1 });
    const stroke = n <= 60;
    for (let j = 1; j <= n; j++) {
      const x0 = (j - 1) * dx, x1 = j * dx;
      if (who !== 'pes') p.rect(x0, 0, x1, Math.sqrt(x1), p.c.f2, { alpha: who === 'both' ? 0.18 : 0.3, stroke });
      if (who !== 'opt') p.rect(x0, 0, x1, Math.sqrt(x0), p.c.area, { alpha: 0.4, stroke });
    }
    p.fn(Math.sqrt, p.c.f1, { width: 3, from: 0, to: 4 });
  }, [n, who]);
  return (
    <Widget title="الدخل الحقيقي: مستطيلات تحت الجذر" hint="معدل الدخل بعد $x$ سنة هو $\sqrt{x}$ مليون في السنة. **المتفائل** (البرتقالي) يستعمل المعدل في نهاية كل فترة فيبالغ، و**المتشائم** (الأخضر) يستعمله في بدايتها فيقصّر. كلما قسّمنا الزمن أدق اقترب الاثنان من المساحة الحقيقية تحت المنحنى.">
      <Choice value={n} onChange={setN} options={steps.map((s) => ({ v: s.v as number, label: s.label }))} />
      <Choice value={who} onChange={setWho} options={[{ v: 'opt', label: 'المتفائل' }, { v: 'pes', label: 'المتشائم' }, { v: 'both', label: 'كلاهما' }]} />
      <Canvas refEl={ref} ratio={0.5} label="مستطيلات الدخل تحت منحنى الجذر" />
      <Readout items={[
        { label: 'المتفائل (أطراف يمنى)', value: fmt(R, 4), color: 'var(--f2)' },
        { label: 'المتشائم (أطراف يسرى)', value: fmt(L, 4), color: 'var(--area)' },
        { label: 'الفرق = آخر مستطيل', value: fmt(R - L, 4) },
        { label: 'المساحة الدقيقة $16/3$', value: fmt(exact, 4), color: 'var(--f1)' },
      ]} />
    </Widget>
  );
}
