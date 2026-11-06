import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type Mode = 'up' | 'right' | 'scale' | 'speed';

const modes: Record<Mode, { label: string; tex: (c: number) => string; g: (f: (t: number) => number, c: number) => (t: number) => number; slope: (c: number) => number; def: number; range: [number, number]; note: string }> = {
  up: { label: '$f(t) + c$', tex: (c) => `f(t) ${c >= 0 ? '+' : '-'} ${fmt(Math.abs(c))}`, g: (f, c) => (t) => f(t) + c, slope: () => 2, def: -2, range: [-4, 4], note: 'نضيف $c$ إلى **كل المسافات**: الرسم يتحرك للأعلى أو للأسفل، والمدى يتغيّر، والميل لا يتغيّر.' },
  right: { label: '$f(t - c)$', tex: (c) => `f(t ${c >= 0 ? '-' : '+'} ${fmt(Math.abs(c))})`, g: (f, c) => (t) => f(t - c), slope: () => 2, def: 2, range: [-3, 3], note: 'نطرح $c$ من **الزمن**: الرسم يتحرك إلى **اليمين** (تأخير). هذا ما يخدع الناس: الطرح يُزيح لليمين. المجال يتغيّر، والميل لا يتغيّر.' },
  scale: { label: '$k \\cdot f(t)$', tex: (k) => `${fmt(k)}\\,f(t)`, g: (f, k) => (t) => k * f(t), slope: (k) => 2 * k, def: 2, range: [0.5, 3], note: 'نضرب **المسافة** في $k$: كل الارتفاعات تتضاعف، والميل يتضاعف أيضاً.' },
  speed: { label: '$f(k t)$', tex: (k) => `f(${fmt(k)}\\,t)`, g: (f, k) => (t) => f(k * t), slope: (k) => 2 * k, def: 2, range: [0.5, 3], note: 'نسرّع **الزمن**: كل شيء يحدث أسرع $k$ مرات ويأخذ وقتاً أقل. الميل يتضاعف كذلك. على الحاسبة هذا «تكبير» على محور $t$.' },
};

const f = (t: number) => 2 * t + 1;

/** 1.1 — أربع طرق لصنع دالة جديدة من f(t) = 2t + 1. */
export default function FunctionShift() {
  const [mode, setMode] = useState<Mode>('right');
  const [c, setC] = useState(modes.right.def);
  const M = modes[mode];
  const g = M.g(f, c);
  const view = { xMin: -1, xMax: 5, yMin: -4, yMax: 12 };
  const ref = usePlot(view, (p) => {
    p.axes({ xLabel: 't', yLabel: 'f' });
    p.fn(f, p.c['ink-3'], { width: 2, dash: [5, 5] });
    p.fn(g, p.c.f1, { width: 3 });
    p.text('f(t) = 2t + 1', 4, f(4), p.c['ink-3'], { align: 'right', dx: -6, dy: -6 });
  }, [mode, c]);

  return (
    <Widget title="أربع طرق لتغيير دالة" hint={M.note}>
      <Choice value={mode} onChange={(m) => { setMode(m); setC(modes[m].def); }} options={(Object.keys(modes) as Mode[]).map((v) => ({ v, label: modes[v].label }))} />
      <Canvas refEl={ref} label="الدالة الأصلية والدالة الجديدة" />
      <div className="controls">
        <Slider label={mode === 'up' || mode === 'right' ? '$c$' : '$k$'} value={c} min={M.range[0]} max={M.range[1]} step={0.5} onChange={setC} show={(v) => fmt(v)} />
      </div>
      <MathText as="div" className="verdict">{`المنقّط: $f(t) = 2t + 1$. الأزرق: $${M.tex(c)}$`}</MathText>
      <Readout items={[{ label: 'ميل الأصلية', value: '2', color: 'var(--ink-3)' }, { label: 'ميل الجديدة', value: fmt(M.slope(c)), color: 'var(--f1)' }, { label: 'الجديدة عند $t = 2$', value: fmt(g(2)) }]} />
    </Widget>
  );
}
