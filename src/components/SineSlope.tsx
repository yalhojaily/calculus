import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Choice, Slider, Widget, usePlot } from './ui';

/** 2.4 — الشكل 2.9: sin(x + h) بجانب sin x، والفرق مقسوماً على h يقترب من cos x. */
export default function SineSlope() {
  const [h, setH] = useState(Math.PI / 18);
  const [fn, setFn] = useState<'sin' | 'cos'>('sin');
  const f = fn === 'sin' ? Math.sin : Math.cos;
  const d = fn === 'sin' ? Math.cos : (x: number) => -Math.sin(x);
  const T = 2 * Math.PI;
  const top = usePlot({ xMin: -0.2, xMax: T + 0.2, yMin: -1.3, yMax: 1.3 }, (p) => {
    p.axes({ xStep: Math.PI / 2 });
    p.fn(f, p.c['ink-2'], { width: 2.4 });
    p.fn((x) => f(x + h), p.c.f2, { width: 2.4 });
  }, [h, fn]);
  const bot = usePlot({ xMin: -0.2, xMax: T + 0.2, yMin: -1.3, yMax: 1.3 }, (p) => {
    p.axes({ xStep: Math.PI / 2 });
    p.fn(d, p.c.f1, { width: 2, dash: [5, 4] });
    p.fn((x) => (f(x + h) - f(x)) / h, p.c.f2, { width: 3 });
  }, [h, fn]);
  return (
    <Widget title={`الفرق بين ${fn}(x + h) و ${fn} x، مقسوماً على h`} hint={`أعلى: $\\${fn} x$ (الرمادي) و $\\${fn}(x + h)$ (البرتقالي) مُزاحاً **لليسار** بمقدار $h$. أسفل: الفرق بينهما مقسوماً على $h$ (البرتقالي)، و ${fn === 'sin' ? '$\\cos x$' : '$-\\sin x$'} (الأزرق المتقطع). صغّر $h$ فيلتصق الاثنان. لاحظ أنه يبدأ مُزاحاً قليلاً: ليس ${fn === 'sin' ? '$\\cos x$' : '$-\\sin x$'} تماماً قبل النهاية.`}>
      <Choice value={fn} onChange={setFn} options={[{ v: 'sin', label: '$\\sin x$' }, { v: 'cos', label: '$\\cos x$' }]} />
      <div className="cv-row">
        <div><Canvas refEl={top} ratio={0.7} label="الدالة ومُزاحتها" /><div className="cv-cap">الدالة ونسختها المُزاحة</div></div>
        <div><Canvas refEl={bot} ratio={0.7} label="الفرق مقسوماً على h" /><div className="cv-cap f2">Δf / h</div></div>
      </div>
      <div className="controls">
        <Slider label="$h$ (راديان)" value={h} min={0.005} max={1.2} step={0.005} onChange={setH} show={(v) => `${fmt(v, 3)} ≈ ${fmt((v * 180) / Math.PI, 1)}°`} color="var(--f2)" />
      </div>
    </Widget>
  );
}
