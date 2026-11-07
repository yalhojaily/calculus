import { useEffect, useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

type K = 'sq' | 'saw' | 'tri' | 'delta';
const PI = Math.PI;
/** المعاملات: قائمة [k, نوع, معامل] حيث النوع sin أو cos */
const coef: Record<K, (k: number) => { a: number; b: number }> = {
  sq: (k) => ({ a: 0, b: k % 2 ? 4 / (PI * k) : 0 }),
  saw: (k) => ({ a: 0, b: (2 * (k % 2 ? 1 : -1)) / k }),
  tri: (k) => ({ a: k % 2 ? -4 / (PI * k * k) : 0, b: 0 }),
  delta: () => ({ a: 1 / PI, b: 0 }),
};
const a0: Record<K, number> = { sq: 0, saw: 0, tri: PI / 2, delta: 1 / (2 * PI) };
const target: Record<K, ((x: number) => number) | null> = {
  sq: (x) => { const t = ((x % (2 * PI)) + 2 * PI) % (2 * PI); return t < PI ? 1 : -1; },
  saw: (x) => { const t = ((((x + PI) % (2 * PI)) + 2 * PI) % (2 * PI)) - PI; return t; },
  tri: (x) => { const t = ((((x + PI) % (2 * PI)) + 2 * PI) % (2 * PI)) - PI; return Math.abs(t); },
  delta: null,
};
const labels: Record<K, string> = { sq: 'دالة درجية (مربعة)', saw: 'سن المنشار $x$', tri: 'مثلثية $|x|$', delta: 'دالة دلتا $\\delta(x)$' };
const sum = (k: K, N: number, x: number) => { let s = a0[k]; for (let n = 1; n <= N; n++) { const { a, b } = coef[k](n); if (a) s += a * Math.cos(n * x); if (b) s += b * Math.sin(n * x); } return s; };

/** الفصل 16 — متسلسلة فورييه: الإشارة مجموع موجات نقية sin kx و cos kx. الدالة الدرجية تحتاج ترددات كثيرة، ودلتا تحتاجها كلها بالقدر نفسه. */
export default function FourierSeries() {
  const [k, setK] = useState<K>('sq');
  const [N, setN] = useState(5);
  const clock = useClock(10);
  useEffect(() => { if (clock.playing) setN(Math.max(1, Math.round(1 + clock.t * 39))); }, [clock.t, clock.playing]);
  const yr = k === 'delta' ? [-2, Math.max(3, (2 * N + 1) / (2 * PI) + 0.5)] : k === 'tri' ? [-0.6, 3.8] : k === 'saw' ? [-4, 4] : [-1.6, 1.6];
  const ref = usePlot({ xMin: -2 * PI, xMax: 2 * PI, yMin: yr[0], yMax: yr[1] }, (p) => {
    p.axes({ xLabel: 'x', yLabel: 'y', xStep: PI / 2, yStep: k === 'delta' ? 1 : 0.5 });
    const f = target[k];
    if (f) p.fn(f, p.c['ink-3'], { width: 2.4, dash: [6, 4] });
    else { p.line(0, 0, 0, yr[1], p.c['ink-3'], { width: 2.4, dash: [6, 4] }); p.text('δ', 0, yr[1] * 0.92, p.c['ink-3'], { dx: 8 }); }
    p.fn((x) => sum(k, N, x), p.c.f1, { width: 2.6 });
  }, [k, N]);
  const spec = usePlot({ xMin: 0, xMax: 21, yMin: 0, yMax: 1.4 }, (p) => {
    p.axes({ xLabel: 'k', yLabel: '', xStep: 2, yStep: 0.5 });
    const top = Math.max(...Array.from({ length: 20 }, (_, i) => { const c = coef[k](i + 1); return Math.hypot(c.a, c.b); }));
    for (let n = 1; n <= 20; n++) { const c = coef[k](n); const h = Math.hypot(c.a, c.b) / top; if (h > 1e-9) p.rect(n - 0.35, 0, n + 0.35, h, n <= N ? p.c.f1 : p.c['ink-3'], { alpha: n <= N ? 0.8 : 0.25, stroke: false }); }
  }, [k, N]);
  // تجاوز جيبس: أكبر قيمة للمجموع قرب القفزة
  let peak = 0; if (k === 'sq') for (let i = 1; i < 400; i++) peak = Math.max(peak, sum(k, N, (i / 400) * PI));
  return (
    <Widget title="متسلسلة فورييه: إشارة من موجات نقية" hint="**كل إشارة دورية مجموع موجات نقية** $a_k\cos kx$ و $b_k\sin kx$، كما كانت متسلسلة تايلور مجموع قوى $x^n$. **المعاملات تصف الدالة بدل قيمها**: كم فيها من كل تردد. الأزرق مجموع أول $N$ حدود، والمتقطع الدالة نفسها. والرسم السفلي **الطيف**: حجم كل معامل.">
      <Choice value={k} onChange={(v) => { setK(v); clock.reset(); }} options={(Object.keys(labels) as K[]).map((v) => ({ v, label: labels[v] }))} />
      <Canvas refEl={ref} ratio={0.55} label="مجموع جزئي لمتسلسلة فورييه فوق الدالة" />
      <Canvas refEl={spec} ratio={0.22} label="طيف المعاملات" />
      <AnimControls clock={clock} label="أضف الحدود" />
      <div className="controls">
        <Slider label="عدد الحدود $N$" value={N} min={1} max={40} step={1} onChange={(v) => { clock.setPlaying(false); setN(v); }} show={(v) => String(v)} />
      </div>
      <Readout items={k === 'sq' ? [
        { label: 'المعاملات $b_k$ ($k$ فردي)', value: '4/(πk)' },
        { label: 'أعلى قيمة قرب القفزة', value: fmt(peak, 3), color: 'var(--red)' },
      ] : k === 'delta' ? [
        { label: 'كل المعاملات', value: '1/π' },
        { label: 'ارتفاع القمة $(2N + 1)/2\\pi$', value: fmt((2 * N + 1) / (2 * PI), 2), color: 'var(--red)' },
      ] : [
        { label: 'المعاملات تصغر مثل', value: k === 'tri' ? '1/k²' : '1/k' },
        { label: 'المجموع عند $x = 1$', value: fmt(sum(k, N, 1), 4) },
      ]} />
      <MathText as="div" className="verdict">{k === 'sq'
        ? '**الدالة الدرجية لها ترددات كثيرة:** $\\tfrac4\\pi\\left(\\sin x + \\tfrac13\\sin 3x + \\tfrac15\\sin 5x + \\cdots\\right)$. المعاملات تصغر ببطء ($1/k$)، فالتقارب بطيء. **وقرب القفزة يبقى تجاوز قرابة 9%** مهما زادت الحدود (ظاهرة جيبس): القمة تقترب من 1.18 لا من 1. لهذا «لا تستطيع القناة 4 بث دالة درجية تامة».'
        : k === 'delta' ? '**دالة دلتا فيها كل الترددات بالقدر نفسه:** $\\delta(x) = \\tfrac{1}{2\\pi}\\left(1 + 2\\cos x + 2\\cos 2x + \\cdots\\right)$. المجموع يصير قمة أعلى وأضيق، ومساحتها تبقى 1. **«لن ترغب في سماع دالة دلتا.»**'
          : k === 'tri' ? '**الدالة المثلثية متصلة**، فمعاملاتها تصغر أسرع ($1/k^2$): بضعة حدود تكفي. **كلما كانت الدالة أنعم صغرت معاملاتها أسرع.** وعند $x = 0$: $0 = \\tfrac\\pi2 - \\tfrac4\\pi\\left(1 + \\tfrac19 + \\tfrac1{25} + \\cdots\\right)$، فـ $1 + \\tfrac19 + \\tfrac1{25} + \\cdots = \\tfrac{\\pi^2}8$.'
            : '**سن المنشار** $x = 2\\left(\\sin x - \\tfrac12\\sin 2x + \\tfrac13\\sin 3x - \\cdots\\right)$ على $(-\\pi, \\pi)$، ويقفز عند $\\pm\\pi$. عند $x = \\pi/2$ تعطي المتسلسلة $\\tfrac\\pi2 = 2\\left(1 - \\tfrac13 + \\tfrac15 - \\cdots\\right)$: **متسلسلة لايبنتز** للعدد $\\pi/4$!'}</MathText>
    </Widget>
  );
}
