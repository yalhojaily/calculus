import { useEffect, useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

type K = 'alt' | 're';
const N = 120;

/** 10.3 — المتسلسلة المتناوبة 1 − ½ + ⅓ − … : المجاميع الفردية تنزل والزوجية تصعد نحو ln 2. وبإعادة الترتيب تتقارب إلى أي عدد (ريمان). */
export default function Rearrange() {
  const [k, setK] = useState<K>('alt');
  const [target, setTarget] = useState(1.5);
  const clock = useClock(8, { loop: false });
  useEffect(() => { clock.setT(1); }, [k, target]); // eslint-disable-line react-hooks/exhaustive-deps
  const n = Math.max(1, Math.round(clock.t * N));
  // المتسلسلة بالترتيب الأصلي، أو بالترتيب الجشع نحو الهدف
  const terms: number[] = [];
  if (k === 'alt') for (let i = 1; i <= N; i++) terms.push((i % 2 ? 1 : -1) / i);
  else { let odd = 1, even = 2, s = 0; for (let i = 0; i < N; i++) { if (s <= target) { terms.push(1 / odd); odd += 2; } else { terms.push(-1 / even); even += 2; } s += terms[i]; } }
  const ps: number[] = []; let s = 0; for (const t of terms) { s += t; ps.push(s); }
  const goal = k === 'alt' ? Math.LN2 : target;
  const ref = usePlot({ xMin: 0, xMax: N + 2, yMin: k === 'alt' ? 0.4 : Math.min(0, target - 0.8), yMax: k === 'alt' ? 1.05 : Math.max(1.6, target + 0.8) }, (p) => {
    p.axes({ xLabel: 'n', yLabel: 'sₙ', xStep: 20 });
    p.line(0, goal, N + 2, goal, p.c.ink, { width: 1.4, dash: [6, 4] });
    const ctx = p.ctx; ctx.beginPath();
    for (let i = 0; i < n; i++) { const X = p.X(i + 1), Y = p.Y(ps[i]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
    ctx.strokeStyle = p.c['ink-3']; ctx.lineWidth = 1; ctx.stroke();
    for (let i = 0; i < n; i++) p.point(i + 1, ps[i], terms[i] > 0 ? p.c.f1 : p.c.f2, i === n - 1 ? 5.5 : 2.6);
  }, [k, target, n]);
  const pos = terms.slice(0, n).filter((t) => t > 0).length;
  return (
    <Widget title="المتناوبة وإعادة الترتيب" hint="**10H:** إذا تناوبت الإشارات وتناقصت القيم المطلقة إلى الصفر، تتقارب المتسلسلة. النقاط الزرقاء بعد حد موجب، والبرتقالية بعد حد سالب: **$s_1, s_3, s_5, \ldots$ تنزل، و $s_2, s_4, \ldots$ تصعد**، والفرق بينهما $a_n \to 0$. فالمجموع $s$ دائماً بين $s_{n-1}$ و $s_n$.">
      <Choice value={k} onChange={setK} options={[{ v: 'alt', label: 'بالترتيب: ln 2' }, { v: 're', label: 'أعد الترتيب' }]} />
      <Canvas refEl={ref} ratio={0.5} label="المجاميع الجزئية لمتسلسلة متناوبة" />
      <AnimControls clock={clock} label="أضف الحدود" />
      {k === 're' && <div className="controls"><Slider label="المجموع المطلوب" value={target} min={-1} max={3} step={0.05} onChange={setTarget} show={(v) => fmt(v, 2)} color="var(--violet)" /></div>}
      <Readout items={[
        { label: 'عدد الحدود', value: String(n) },
        { label: '$s_n$', value: fmt(ps[n - 1], 5), color: 'var(--f2)' },
        { label: k === 'alt' ? '$\\ln 2$' : 'الهدف', value: fmt(goal, 5) },
        ...(k === 'alt' ? [{ label: 'الخطأ أقل من $a_{n+1}$', value: `${fmt(Math.abs(ps[n - 1] - goal), 5)} < ${fmt(1 / (n + 1), 5)}` }] : [{ label: 'موجبة / سالبة مستعملة', value: `${pos} / ${n - pos}` }]),
      ]} />
      <MathText as="div" className="verdict">{k === 'alt' ? 'المتسلسلة تتقارب إلى $\\ln 2$ **تقارباً مشروطاً**: لو جعلنا كل الإشارات موجبة لتباعدت (التوافقية). والخطأ بعد $n$ حد أقل من الحد التالي.' : '**التقارب المشروط هش.** خذ حدوداً موجبة $1 + \\tfrac13 + \\cdots$ حتى تتجاوز الهدف، ثم سالبة $-\\tfrac12 - \\tfrac14 - \\cdots$ حتى تنزل تحته، وهكذا. كل الحدود تُستعمل في النهاية، والمجاميع تتقارب إلى **أي عدد تختاره**. أما التقارب المطلق فلا يتأثر بالترتيب (10I).'}</MathText>
    </Widget>
  );
}
