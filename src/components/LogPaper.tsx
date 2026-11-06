import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Widget, usePlot } from './ui';

type Scale = 'lin' | 'semi' | 'loglog';
interface Data { label: string; pts: [number, number][]; f?: (x: number) => number; xr: [number, number]; note: Record<Scale, string> }
const sets: Record<string, Data> = {
  exp: {
    label: '$2 \\cdot 10^x$', f: (x) => 2 * 10 ** x, xr: [0.05, 1.2], pts: [0.1, 0.3, 0.5, 0.7, 0.9, 1.1].map((x) => [x, 2 * 10 ** x] as [number, number]),
    note: { lin: 'على ورق عادي يصعد الأسّي **تقريباً رأسياً**، ولا يظهر الأساس في الرسم.', semi: 'على ورق نصف لوغاريتمي: $\\log y = \\log A + x\\log b$ **خط مستقيم**. الميل $\\log b$، وهنا 1 لأن $b = 10$.', loglog: 'على ورق لوغاريتمي مزدوج **ليس مستقيماً**: هذا ليس قوة.' },
  },
  data: {
    label: 'بيانات مقيسة', xr: [0, 1.05], pts: [[0, 4], [0.2, 3.2], [0.4, 2.4], [0.6, 2], [0.8, 1.6], [1, 1.3]],
    f: (x) => 4 * 10 ** (-x / 2),
    note: { lin: 'من البيانات وحدها: هل هي أسّية؟ صعب أن تعرف على ورق عادي.', semi: 'النقاط **قريبة من خط** ميله سالب: $\\log b \\lt 0$، فـ $b \\lt 1$. الميل نصف السابق، فالنموذج $y \\approx 4 \\cdot 10^{-x/2}$.', loglog: 'على اللوغاريتمي المزدوج لا تصطفّ النقاط. **النموذج أسّي لا قوة.**' },
  },
  pow: {
    label: '$x^3/8$ و $4\\sqrt x$ و $32/x$', xr: [0.5, 10], pts: [],
    note: { lin: 'ثلاث قوى $Ax^k$ تمر كلها بالنقطة $(4, 8)$.', semi: 'على نصف اللوغاريتمي **القوى ليست مستقيمة**.', loglog: '$\\log y = \\log A + k\\log x$: **خطوط مستقيمة ميولها $k = 3, \\tfrac12, -1$**. الأس هو الميل، والأساس لا يهم.' },
  },
};
const pows: [(x: number) => number, string][] = [[(x) => x ** 3 / 8, 'f1'], [(x) => 4 * Math.sqrt(x), 'f2'], [(x) => 32 / x, 'area']];

/** 6.1 — الورق اللوغاريتمي: Ab^x مستقيم على نصف اللوغاريتمي، و Ax^k مستقيم على اللوغاريتمي المزدوج. */
export default function LogPaper() {
  const [k, setK] = useState('exp');
  const [sc, setSc] = useState<Scale>('semi');
  const D = sets[k];
  const ly = sc !== 'lin', lx = sc === 'loglog';
  const T = (x: number, y: number): [number, number] => [lx ? Math.log10(x) : x, ly ? Math.log10(y) : y];
  const ys = k === 'pow' ? [0.01, 130] : k === 'exp' ? [0.8, 35] : [1, 4.5];
  const xr = lx ? [Math.log10(Math.max(D.xr[0], 0.05)), Math.log10(D.xr[1])] : D.xr;
  const yr = ly ? [Math.log10(ys[0]), Math.log10(ys[1])] : [k === 'pow' ? 0 : 0, ys[1]];
  const ref = usePlot({ xMin: xr[0] - 0.05 * (xr[1] - xr[0]), xMax: xr[1] + 0.05 * (xr[1] - xr[0]), yMin: yr[0] - 0.05 * (yr[1] - yr[0]), yMax: yr[1] }, (p) => {
    p.axes({ xLabel: lx ? 'log x' : 'x', yLabel: ly ? 'log y' : 'y' });
    const draw = (f: (x: number) => number, col: string) => {
      const x0 = Math.max(D.xr[0], lx ? 0.05 : D.xr[0]);
      p.curve((s) => T(x0 + (D.xr[1] - x0) * s, 1)[0], (s) => { const y = f(x0 + (D.xr[1] - x0) * s); return ly ? Math.log10(Math.max(y, 1e-6)) : y; }, 0, 1, col, { width: 2.6, n: 300 });
    };
    if (k === 'pow') for (const [f, c] of pows) draw(f, p.c[c as 'f1']);
    else if (D.f) draw(D.f, p.c.f1);
    for (const [x, y] of D.pts) { const [X, Y] = T(Math.max(x, 0.05), y); p.point(X, Y, p.c.f2, 5); }
    if (k === 'pow') { const [X, Y] = T(4, 8); p.point(X, Y, p.c.ink, 5); }
  }, [k, sc]);
  return (
    <Widget title="الورق اللوغاريتمي" hint="على المقياس اللوغاريتمي كل وحدة صعوداً **تضرب** $y$ في عدد ثابت بدل أن تضيف إليه: المسافة من 1 إلى 2 تساوي المسافة من 10 إلى 20. والصفر غير موجود. بدّل المقياس وراقب أي المنحنيات يصير خطاً مستقيماً.">
      <Choice value={k} onChange={setK} options={Object.entries(sets).map(([v, d]) => ({ v, label: d.label }))} />
      <Choice value={sc} onChange={setSc} options={[{ v: 'lin', label: 'عادي' }, { v: 'semi', label: 'نصف لوغاريتمي' }, { v: 'loglog', label: 'لوغاريتمي مزدوج' }]} />
      <Canvas refEl={ref} ratio={0.58} label="البيانات على ورق لوغاريتمي" />
      <MathText as="div" className="verdict">{D.note[sc]}</MathText>
      <div className="cv-cap">{sc === 'semi' && k !== 'pow' ? <>الميل المقيس: {fmt(k === 'exp' ? 1 : -0.5, 2)}</> : null}</div>
    </Widget>
  );
}
