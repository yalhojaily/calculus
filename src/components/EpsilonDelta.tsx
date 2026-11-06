import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Fn { label: string; f: (x: number) => number; a: number; L: number | null; view: View; oneSided?: boolean; note: string }

const fns: Record<string, Fn> = {
  lin: { label: '$5x$ عند $2$', f: (x) => 5 * x, a: 2, L: 10, view: { xMin: 1, xMax: 3, yMin: 6, yMax: 14 }, note: 'هنا $|5x - 10| = 5|x - 2|$، فيكفي أن يختار أفلاطون $\\delta = \\varepsilon/5$ (والأصغر جائز دائماً). عند $\\delta = \\varepsilon/5$ بالضبط يخرج الرسم من **الزاويتين**.' },
  sq: { label: '$x^2$ عند $1$', f: (x) => x * x, a: 1, L: 1, view: { xMin: 0.2, xMax: 1.8, yMin: 0, yMax: 2.4 }, note: 'اختيار معقول: $\\delta = \\varepsilon / (2|f\'(a)|) = \\varepsilon/4$، أي القسمة على ضعف الميل للأمان.' },
  sqrt: { label: '$\\sqrt{x}$ عند $0^+$', f: (x) => (x < 0 ? NaN : Math.sqrt(x)), a: 0, L: 0, view: { xMin: -0.3, xMax: 1, yMin: -0.5, yMax: 1.1 }, oneSided: true, note: 'نهاية من **جهة واحدة** (الجذر لا يقبل السالب). الميل لانهائي عند البداية، فيجب أن تكون العلبة **ضيقة جداً**: مع $\\varepsilon = 0.1$ نحتاج $\\delta = 0.01$.' },
  step: { label: 'دالة درجية عند $0$', f: (x) => (x < 0 ? 0 : 1), a: 0, L: null, view: { xMin: -1, xMax: 1, yMin: -0.5, yMax: 1.5 }, note: 'جرّب أي $L$ بين $0$ و $1$: مهما ضيّقت العلبة، يخرج الرسم من **الأعلى أو الأسفل** عند القفزة. **لا توجد نهاية.**' },
};

/** 2.6 — لعبة سقراط وأفلاطون: سقراط يختار ε (ارتفاع العلبة)، وأفلاطون يختار δ (عرضها). */
export default function EpsilonDelta() {
  const [k, setK] = useState('lin');
  const F = fns[k];
  const [eps, setEps] = useState(1);
  const [del, setDel] = useState(0.4);
  const [Lg, setLg] = useState(0.5); // تخمين L للدالة الدرجية
  const L = F.L ?? Lg;
  const scale = (F.view.yMax - F.view.yMin) / 8;
  const e = eps * scale, d = del * (F.view.xMax - F.view.xMin) / 4;
  // هل يبقى الرسم داخل العلبة لكل x في 0 < |x - a| < δ ؟
  let ok = true;
  for (let i = 1; i <= 400; i++) {
    const s = (d * i) / 400;
    for (const x of F.oneSided ? [F.a + s] : [F.a - s, F.a + s]) {
      const y = F.f(x);
      if (Number.isFinite(y) && Math.abs(y - L) >= e) ok = false;
    }
  }
  const ref = usePlot(F.view, (p) => {
    p.axes();
    p.rect(F.view.xMin, L - e, F.view.xMax, L + e, p.c.f2, { alpha: 0.12, stroke: false });
    p.rect(F.oneSided ? F.a : F.a - d, L - e, F.a + d, L + e, ok ? p.c.area : p.c.red, { alpha: 0.25 });
    p.line(F.view.xMin, L, F.view.xMax, L, p.c.f2, { width: 1, dash: [4, 4] });
    p.fn(F.f, p.c.f1, { width: 3 });
    p.point(F.a, L, p.c.card, 5);
  }, [k, eps, del, Lg]);

  return (
    <Widget title="سقراط يختار ε، وأفلاطون يختار δ" hint={F.note}>
      <Choice value={k} onChange={setK} options={Object.entries(fns).map(([v, f]) => ({ v, label: f.label }))} />
      <Canvas refEl={ref} label="علبة ε و δ حول النهاية" />
      <div className="controls">
        <Slider label="سقراط: $\varepsilon$ (نصف الارتفاع)" value={eps} min={0.05} max={2} step={0.05} onChange={setEps} show={() => fmt(e, 3)} color="var(--f2)" />
        <Slider label="أفلاطون: $\delta$ (نصف العرض)" value={del} min={0.01} max={1.5} step={0.01} onChange={setDel} show={() => fmt(d, 4)} color="var(--area)" />
        {F.L === null && <Slider label="تخمين $L$" value={Lg} min={0} max={1} step={0.05} onChange={setLg} show={(v) => fmt(v)} />}
      </div>
      <Readout items={[
        { label: 'النهاية المقترحة $L$', value: fmt(L, 3) },
        { label: 'النتيجة', value: ok ? 'الرسم يخرج من الجانبين ✓' : 'يخرج من الأعلى أو الأسفل ✗', color: ok ? 'var(--area)' : 'var(--red)' },
      ]} />
    </Widget>
  );
}
