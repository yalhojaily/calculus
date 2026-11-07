import { useMemo, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

type V2 = [number, number];
interface Fd { label: string; F: (x: number, y: number) => V2; curl: (x: number, y: number) => number; note: string }
const q = (x: number, y: number) => x * x + y * y;
const fields: Record<string, Fd> = {
  S: { label: '$-y\\mathbf i + x\\mathbf j$', F: (x, y) => [-y, x], curl: () => 2, note: '**دوران صلب:** $\\operatorname{curl}\\mathbf S = 2\\mathbf k$، فالعجلة تدور بسرعة زاوية $\\tfrac12\\cdot 2 = 1$، **تماماً كسرعة دوران الماء حول الأصل**. تكمل دورة حول نفسها مع كل دورة حول الأصل، كراكب على قرص دوّار.' },
  V: { label: '$\\mathbf S/r^2$ (دوامة)', F: (x, y) => [-y / q(x, y), x / q(x, y)], curl: () => 0, note: '**المفاجأة:** الماء يدور حول الأصل، **لكن العجلة لا تدور حول نفسها!** $\\operatorname{curl} = 0$ بعيداً عن الأصل: السرعة تقل مع البعد ($1/r$)، وهذا الفرق يدير العجلة في الاتجاه المعاكس بالقدر نفسه الذي يديرها به انحناء التيار، فيتوازنان. كل الدوران محصور في نقطة الأصل ($2\\pi$ هناك).' },
  Sh: { label: '$y\\mathbf i$ (قص)', F: (x, y) => [y, 0], curl: () => -1, note: '**المثال 5 (في المستوى $xy$):** الماء يجري في خطوط مستقيمة، **ومع ذلك تدور العجلة!** الجانب العلوي أسرع من السفلي، فتدور مع عقارب الساعة: $\\operatorname{curl} = -\\mathbf k$ والسرعة الزاوية $\\tfrac12$. الدوران ليس انحناء خطوط الانسياب بل **اختلاف السرعة عبرها**.' },
  R: { label: '$x\\mathbf i + y\\mathbf j$', F: (x, y) => [x, y], curl: () => 0, note: 'حقل تدرّج: **$\\operatorname{curl}\\operatorname{grad} f = 0$ دائماً (15N)**، فلا دوران. العجلة تندفع إلى الخارج دون أن تلتف.' },
};
const T = 11, DT = 0.01, L = 2.4;

/** 15.6 — الدوران curl F: عجلة مجاديف صغيرة تطفو مع الماء وتدور حول نفسها بسرعة زاوية ½ (curl F)·n. */
export default function PaddleWheel() {
  const [k, setK] = useState('V');
  const [x0, setX0] = useState(1.3);
  const [y0, setY0] = useState(0);
  const fd = fields[k];
  const clock = useClock(T, { loop: false });
  const path = useMemo(() => {
    const out: { p: V2; a: number }[] = [{ p: [x0, y0], a: 0 }]; let p: V2 = [x0, y0], a = 0;
    for (let n = 0; n < T / DT; n++) {
      if (Math.abs(p[0]) > L + 0.6 || Math.abs(p[1]) > L + 0.6) break;
      const f1 = fd.F(p[0], p[1]), mid: V2 = [p[0] + (DT / 2) * f1[0], p[1] + (DT / 2) * f1[1]], f2 = fd.F(mid[0], mid[1]);
      a += 0.5 * fd.curl(mid[0], mid[1]) * DT; p = [p[0] + DT * f2[0], p[1] + DT * f2[1]]; out.push({ p, a });
    }
    return out;
  }, [fd, x0, y0]);
  const idx = Math.min(path.length - 1, Math.floor((clock.t * T) / DT));
  const { p: C, a: ang } = path[idx];
  const curl = fd.curl(C[0], C[1]);
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -L, L, -L, L);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    for (let x = -L + 0.2; x <= L; x += 0.4) for (let y = -L + 0.2; y <= L; y += 0.4) {
      const [m, n] = fd.F(x, y); const g = Math.hypot(m, n); if (!Number.isFinite(g) || g < 1e-9) continue;
      const s = (0.3 * Math.tanh(g / 1.2)) / g; p.arrow(x, y, x + s * m, y + s * n, p.c['ink-3'], { width: 1, head: 3.5 });
    }
    // أثر المسار
    for (let i = 1; i <= idx; i += 3) p.line(path[i - 1].p[0], path[i - 1].p[1], path[Math.min(i + 2, idx)].p[0], path[Math.min(i + 2, idx)].p[1], p.c.f1, { width: 1.4, dash: [3, 3] });
    // العجلة: أربعة مجاديف، أحدها ملوّن لتتبع الدوران
    const r = 0.38;
    p.curve((t) => C[0] + r * Math.cos(t), (t) => C[1] + r * Math.sin(t), 0, 2 * Math.PI, p.c.ink, { width: 1.2, dash: [2, 3] });
    for (let m = 0; m < 4; m++) {
      const t = ang + (m * Math.PI) / 2;
      p.line(C[0], C[1], C[0] + r * Math.cos(t), C[1] + r * Math.sin(t), m === 0 ? p.c.red : p.c.ink, { width: m === 0 ? 4 : 2.6 });
    }
    p.point(C[0], C[1], p.c.ink, 4);
    if (k === 'V') p.point(0, 0, p.c.red, 4);
  }, [k, idx, path]);
  return (
    <Widget title="عجلة المجاديف: ماذا يقيس الدوران؟" hint="ضع **عجلة مجاديف صغيرة** في الماء. **تطفو مع التيار** (المسار المتقطع) **وتدور حول نفسها** بسرعة زاوية $\tfrac12(\operatorname{curl}\mathbf F)\cdot\mathbf n$. في المستوى $\operatorname{curl}\mathbf F = (N_x - M_y)\mathbf k$. تابع المجداف الأحمر: هل يغير اتجاهه؟">
      <Choice value={k} onChange={(v) => { setK(v); clock.reset(); }} options={Object.keys(fields).map((v) => ({ v, label: fields[v].label }))} />
      <Canvas refEl={ref} ratio={0.9} label="عجلة مجاديف تطفو في حقل سرعة وتدور" />
      <AnimControls clock={clock} label="أطلق العجلة" />
      <div className="controls">
        <Slider label="البداية $x$" value={x0} min={-2} max={2} step={0.05} onChange={(v) => { setX0(v); clock.reset(); }} show={(v) => fmt(v, 2)} />
        <Slider label="البداية $y$" value={y0} min={-2} max={2} step={0.05} onChange={(v) => { setY0(v); clock.reset(); }} show={(v) => fmt(v, 2)} />
      </div>
      <Readout items={[
        { label: '$N_x - M_y$ (الدوران)', value: fmt(curl, 3), color: 'var(--red)' },
        { label: 'السرعة الزاوية $\\tfrac12\\operatorname{curl}$', value: fmt(curl / 2, 3) },
        { label: 'دارت العجلة حول نفسها', value: `${fmt((ang * 180) / Math.PI, 0)}°` },
      ]} />
      <MathText as="div" className="verdict">{fd.note}</MathText>
    </Widget>
  );
}
