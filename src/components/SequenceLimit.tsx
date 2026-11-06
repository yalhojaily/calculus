import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Seq { label: string; a: (n: number) => number; L: number | null; yr: [number, number]; note: string }

const harmonic = (n: number) => { let s = 0; for (let k = 1; k <= n; k++) s += 1 / k; return s; };
const rec = (n: number) => { let a = 10; for (let k = 2; k <= n; k++) a = a / 2 + 4; return a; };

const seqs: Record<string, Seq> = {
  ratio: { label: '$\\frac{n - 3}{n + 3}$', a: (n) => (n - 3) / (n + 3), L: 1, yr: [-0.6, 1.3], note: 'لـ $n$ الكبيرة نتجاهل الـ 3: $a_n \\to 1$.' },
  rec: { label: '$a_n = \\tfrac12 a_{n-1} + 4$', a: rec, L: 8, yr: [5, 11], note: 'ابدأ من $a_1 = 10$ (أو من أي عدد): الحدود تقترب من $8$ لأن $8 = \\tfrac12 \\cdot 8 + 4$.' },
  sq2: { label: '$\\frac{n^2}{2^n}$', a: (n) => n * n / 2 ** n, L: 0, yr: [-0.2, 1.8], note: 'تصعد أولاً ($\\tfrac12, 1, \\tfrac98, 1, \\ldots$) ثم تنزل إلى الصفر: $2^n$ تنمو في النهاية أسرع من $n^2$.' },
  zeros: { label: '$1, 0, \\tfrac12, 0, \\tfrac13, \\ldots$', a: (n) => (n % 2 === 1 ? 2 / (n + 1) : 0), L: 0, yr: [-0.2, 1.1], note: 'لا تتناقص بانتظام، لكنها **تبقى** في النهاية تحت أي $\\varepsilon$. هذا كل ما يطلبه التعريف.' },
  alt: { label: '$\\frac{(-1)^{n+1}}{n}$', a: (n) => (n % 2 ? 1 : -1) / n, L: 0, yr: [-0.6, 1.1], note: 'تقترب من الصفر من **الجهتين**: نقيس المسافة $|a_n - L|$.' },
  harm: { label: '$1 + \\tfrac12 + \\cdots + \\tfrac1n$', a: harmonic, L: null, yr: [0, 6], note: 'الخطوات بين الحدود تصغر إلى الصفر، ومع ذلك **لا تتقارب**: المتسلسلة التوافقية تتجاوز أي حدّ ($a_{5000}$ تتجاوز $9$). صِغر الخطوات **ضروري** للتقارب لكنه **غير كافٍ**.' },
};

/** 2.6 — تعريف التقارب: لأي ε يوجد N بحيث |aₙ − L| < ε لكل n > N. */
export default function SequenceLimit() {
  const [k, setK] = useState('sq2');
  const [le, setLe] = useState(-1); // ε = 10^le
  const S = seqs[k];
  const eps = 10 ** le;
  const M = 60;
  const vals = Array.from({ length: M }, (_, i) => S.a(i + 1));
  let N: number | null = null;
  if (S.L !== null) {
    // آخر n يكون فيه الحدّ خارج الشريط (نفحص إلى 5000)
    let last = 0;
    for (let n = 1; n <= 5000; n++) if (Math.abs(S.a(n) - S.L) >= eps) last = n;
    N = last;
  }
  const ref = usePlot({ xMin: -1, xMax: M + 1, yMin: S.yr[0], yMax: S.yr[1] }, (p) => {
    p.axes({ xLabel: 'n', yLabel: 'aₙ', xStep: 10 });
    if (S.L !== null) {
      p.rect(-1, S.L - eps, M + 1, S.L + eps, p.c.area, { alpha: 0.2, stroke: false });
      p.line(-1, S.L, M + 1, S.L, p.c.area, { width: 1, dash: [4, 4] });
      if (N !== null && N <= M) p.line(N + 0.5, S.yr[0], N + 0.5, S.yr[1], p.c.f2, { width: 1.5, dash: [3, 3] });
    }
    vals.forEach((v, i) => p.point(i + 1, v, S.L !== null && Math.abs(v - S.L) >= eps ? p.c.red : p.c.f1, 3.5));
  }, [k, le]);

  return (
    <Widget title="متى «تقترب» متتالية من نهاية؟" hint={S.note}>
      <Choice value={k} onChange={setK} options={Object.entries(seqs).map(([v, s]) => ({ v, label: s.label }))} />
      <Canvas refEl={ref} label="حدود المتتالية وشريط ε" />
      <div className="controls">
        <Slider label="التسامح $\varepsilon$" value={le} min={-3} max={0} step={0.1} onChange={setLe} show={() => fmt(eps, 4)} color="var(--area)" />
      </div>
      <Readout items={S.L === null ? [{ label: 'النهاية', value: 'لا توجد', color: 'var(--red)' }, { label: '$a_{5000}$', value: fmt(harmonic(5000), 4) }] : [
        { label: 'النهاية $L$', value: fmt(S.L) },
        { label: 'بعد أي $N$ تبقى كل الحدود داخل الشريط؟', value: N === 0 ? 'من البداية' : `N = ${N}`, color: 'var(--f2)' },
      ]} />
    </Widget>
  );
}
