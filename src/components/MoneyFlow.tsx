import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Preset { label: string; y0: number; s: number; c: number; T: number; note: string }
const presets: Record<string, Preset> = {
  q3: { label: 'س3: إيداعات', y0: 0, s: 1000, c: 0.05, T: 20, note: 'السؤال 3: إيداع مستمر $s = 1000$ في السنة لعشرين سنة يعطي $\\dfrac{s}{c}(e^{ct} - 1) = 20000(e - 1) \\approx 34400$. **ودفعة واحدة من 20000 في البداية** تعطي $20000e \\approx 54400$.' },
  q4: { label: 'س4: هدف 20000', y0: 0, s: 582, c: 0.05, T: 20, note: 'السؤال 4: لتصل إلى 20000 بعد 20 سنة تحتاج $s = \\dfrac{1000}{e - 1} \\approx 582$ في السنة. المجموع $11640$ فقط، والباقي فائدة.' },
  q5: { label: 'س5: معاش', y0: 12640, s: -1000, c: 0.05, T: 20, note: 'السؤال 5: إيداع $y_0 \\approx 12640$ يكفي لسحب 1000 في السنة عشرين سنة حتى يصل الرصيد إلى صفر. **فاليانصيب الذي يَعِد بـ 20000 مقسّطة لا يضع إلا 12640.**' },
  q6: { label: 'س6: قرض', y0: -20000, s: 1582, c: 0.05, T: 20, note: 'السؤال 6: قرض 20000 يُسدَّد بـ $s \\approx 1582$ في السنة. **اللغز:** لماذا $1582 - 582 = 1000$ بالضبط؟ ادفع 1000 لتغطي فائدة الـ 20000، وضع 582 في حساب منفصل يبلغ 20000 بعد 20 سنة فيسدّ القرض.' },
  decay: { label: 'اضمحلال مع مصدر', y0: 1000, s: 400, c: -0.2, T: 25, note: '$c \\lt 0$: الحد $y_0 e^{ct}$ **عابر** يموت، والحل يقترب من **الحالة المستقرة** $y_\\infty = -s/c$، حيث يوازن المصدر $s$ الاضمحلال $cy$ تماماً و $dy/dt = 0$.' },
};

/** 6.3 — y′ = cy + s: الإيداع الأول ينمو بـ e^{ct}، وكل إيداع لاحق ينمو من لحظة دخوله (مبدأ دوهاميل). */
export default function MoneyFlow() {
  const [k, setK] = useState('q3');
  const P0 = presets[k];
  const [y0, setY0] = useState(P0.y0);
  const [s, setS] = useState(P0.s);
  const [c, setC] = useState(P0.c);
  const T = P0.T;
  const y = (t: number) => (Math.abs(c) < 1e-9 ? y0 + s * t : (y0 + s / c) * Math.exp(c * t) - s / c);
  const part0 = (t: number) => y0 * Math.exp(c * t);
  const partS = (t: number) => (Math.abs(c) < 1e-9 ? s * t : (s / c) * (Math.exp(c * t) - 1));
  const vals = Array.from({ length: 81 }, (_, i) => [y(T * i / 80), part0(T * i / 80), partS(T * i / 80)]).flat();
  const lo = Math.min(0, ...vals), hi = Math.max(1, ...vals);
  const pad = (hi - lo) * 0.08;
  const ref = usePlot({ xMin: -T * 0.04, xMax: T * 1.04, yMin: lo - pad, yMax: hi + pad }, (p) => {
    p.axes({ xLabel: 't (years)', yLabel: '$' });
    p.fn(part0, p.c.f1, { width: 1.6, dash: [5, 4], from: 0, to: T });
    p.fn(partS, p.c.area, { width: 1.6, dash: [5, 4], from: 0, to: T });
    if (c < 0) p.line(0, -s / c, T, -s / c, p.c.red, { width: 1.2, dash: [2, 4] });
    p.fn(y, p.c.f2, { width: 3, from: 0, to: T });
    p.point(T, y(T), p.c.f2, 6);
  }, [k, y0, s, c]);
  return (
    <Widget title="المال بفائدة مستمرة: y′ = cy + s" hint="البرتقالي الرصيد $y(t) = y_0 e^{ct} + \dfrac{s}{c}(e^{ct} - 1)$. المتقطع الأزرق: ما يصنعه الإيداع الأول $y_0$ وحده. المتقطع الأخضر: ما تصنعه الإيداعات المستمرة $s$ وحدها. **الحل مجموعهما.** اختر سؤالاً من أسئلة المالية الستة، أو غيّر القيم بنفسك.">
      <Choice value={k} onChange={(v) => { setK(v); const q = presets[v]; setY0(q.y0); setS(q.s); setC(q.c); }} options={Object.entries(presets).map(([v, q]) => ({ v, label: q.label }))} />
      <Canvas refEl={ref} ratio={0.5} label="الرصيد عبر الزمن" />
      <div className="controls">
        <Slider label="$y_0$" value={y0} min={-25000} max={25000} step={10} onChange={setY0} show={(v) => fmt(v, 0)} color="var(--f1)" />
        <Slider label="$s$ (في السنة)" value={s} min={-2000} max={2000} step={1} onChange={setS} show={(v) => fmt(v, 0)} color="var(--area)" />
        <Slider label="$c$" value={c} min={-0.3} max={0.15} step={0.005} onChange={setC} show={(v) => `${fmt(c * 100, 1)}%`} />
      </div>
      <Readout items={[
        { label: `$y(${T})$`, value: fmt(y(T), 0), color: 'var(--f2)' },
        { label: 'من $y_0$', value: fmt(part0(T), 0), color: 'var(--f1)' },
        { label: 'من $s$', value: fmt(partS(T), 0), color: 'var(--area)' },
        { label: 'زمن المضاعفة $\\ln 2 / c$', value: c > 0 ? fmt(Math.LN2 / c, 1) : '—' },
      ]} />
      <MathText as="div" className="verdict">{P0.note}</MathText>
    </Widget>
  );
}
