import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Seq { label: string; f: (j: number) => number; note: string }
const seqs: Record<string, Seq> = {
  tri: { label: '$v = 1, 2, 3, 4, \\ldots$', f: (j) => (j * (j + 1)) / 2, note: 'المجاميع $f = 1, 3, 6, 10, \\ldots$ والفروق تعيد $v$. **أخذ المجاميع عكس أخذ الفروق.**' },
  odd: { label: '$v = 1, 3, 5, \\ldots$', f: (j) => j * j, note: 'الأعداد الفردية فروق بين المربعات $0, 1, 4, 9, \\ldots$ فمجموع أول 50 عدداً فردياً هو $50^2$. **الجزء الصعب أن تكتشف $f$ الصحيحة.**' },
  pow: { label: '$v = 1, 2, 4, 8, \\ldots$', f: (j) => 2 ** j, note: 'الفروق بين $f = 1, 2, 4, 8, 16, \\ldots$ هي $1, 2, 4, 8, \\ldots$ أيضاً (التمرين 2)، فـ $1 + 2 + 4 + 8 + 16 = 32 - 1$.' },
};

/** 5.1 — المبرهنة الأساسية قبل النهايات: فروق f تجتمع إلى f_n − f_0 (المجموع «يتداخل» كالمنظار). */
export default function Telescope() {
  const [k, setK] = useState('tri');
  const S = seqs[k];
  const [n, setN] = useState(4);
  const [j, setJ] = useState(3);
  const N = k === 'pow' ? 6 : 8;
  const nn = Math.min(n, N), jj = Math.min(j, nn);
  const fs = Array.from({ length: N + 1 }, (_, i) => S.f(i));
  const vs = fs.map((f, i) => (i === 0 ? 0 : f - fs[i - 1]));
  const vmax = Math.max(...vs) * 1.15, fmax = fs[N] * 1.1;
  const left = usePlot({ xMin: -0.2, xMax: N + 0.6, yMin: -vmax * 0.06, yMax: vmax }, (p) => {
    p.axes({ xLabel: 'j', yLabel: 'v', xStep: 1 });
    for (let i = 1; i <= nn; i++) p.rect(i - 0.9, 0, i - 0.1, vs[i], i === jj ? p.c.f2 : p.c.area, { alpha: i === jj ? 0.7 : 0.35 });
  }, [k, nn, jj]);
  const right = usePlot({ xMin: -0.2, xMax: N + 0.6, yMin: -fmax * 0.06, yMax: fmax }, (p) => {
    p.axes({ xLabel: 'j', yLabel: 'f', xStep: 1 });
    for (let i = 1; i <= nn; i++) {
      p.rect(i - 0.9, 0, i - 0.1, fs[i - 1], p.c.f1, { alpha: 0.25 });
      p.rect(i - 0.9, fs[i - 1], i - 0.1, fs[i], i === jj ? p.c.f2 : p.c.area, { alpha: i === jj ? 0.7 : 0.35 });
    }
  }, [k, nn, jj]);
  return (
    <Widget title="المجموع يتداخل كالمنظار" hint="يسار: الأعداد $v_j$. يمين: المجاميع $f_j = v_1 + \cdots + v_j$، **وكل عمود فيها أعلى من سابقه بمقدار $v_j$ بالضبط** (الجزء الأخضر). اختر $j$ لترى أن $v_j = f_j - f_{j-1}$. والمجموع كله $f_n - f_0$: كل ما بينهما يُلغى.">
      <Choice value={k} onChange={setK} options={Object.entries(seqs).map(([v, s]) => ({ v, label: s.label }))} />
      <div className="cv-row">
        <div><Canvas refEl={left} ratio={0.8} label="الفروق v" /><div className="cv-cap">الفروق <i>v</i> (مثل السرعة)</div></div>
        <div><Canvas refEl={right} ratio={0.8} label="المجاميع f" /><div className="cv-cap f1">المجاميع <i>f</i> (مثل المسافة)</div></div>
      </div>
      <div className="controls">
        <Slider label="$n$" value={nn} min={1} max={N} step={1} onChange={setN} />
        <Slider label="$j$" value={jj} min={1} max={nn} step={1} onChange={setJ} color="var(--f2)" />
      </div>
      <Readout items={[
        { label: '$v_j$', value: fmt(vs[jj], 0), color: 'var(--f2)' },
        { label: '$f_j - f_{j-1}$', value: `${fmt(fs[jj], 0)} − ${fmt(fs[jj - 1], 0)}`, color: 'var(--f2)' },
        { label: '$v_1 + \\cdots + v_n$', value: vs.slice(1, nn + 1).join(' + '), color: 'var(--area)' },
        { label: '$f_n - f_0$', value: fmt(fs[nn] - fs[0], 0), color: 'var(--f1)' },
      ]} />
      <MathText as="div" className="verdict">{S.note}</MathText>
    </Widget>
  );
}
