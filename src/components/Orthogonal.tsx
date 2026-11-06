import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type K = 'sc' | 'ss' | 'cc';
const F: Record<K, { label: string; f: (p: number, q: number, x: number) => number; name: string }> = {
  sc: { label: '$\\sin px\\cos qx$', f: (p, q, x) => Math.sin(p * x) * Math.cos(q * x), name: '\\sin px\\cos qx' },
  ss: { label: '$\\sin px\\sin qx$', f: (p, q, x) => Math.sin(p * x) * Math.sin(q * x), name: '\\sin px\\sin qx' },
  cc: { label: '$\\cos px\\cos qx$', f: (p, q, x) => Math.cos(p * x) * Math.cos(q * x), name: '\\cos px\\cos qx' },
};

/** 7.2 — تكاملات الجيوب على دورة كاملة أصفار (التعامد)، إلا المربع الكامل فتكامله π. */
export default function Orthogonal() {
  const [k, setK] = useState<K>('sc');
  const [p, setP] = useState(8);
  const [q, setQ] = useState(6);
  const f = (x: number) => F[k].f(p, q, x);
  let I = 0; const N = 4000, T = 2 * Math.PI;
  for (let i = 0; i < N; i++) I += f(((i + 0.5) * T) / N) * (T / N);
  const ref = usePlot({ xMin: -0.15, xMax: T + 0.15, yMin: -1.15, yMax: 1.15 }, (pl) => {
    pl.axes({ xLabel: 'x' });
    pl.fillUnder((x) => Math.max(f(x), 0), 0, T, pl.c.area, 0.45);
    pl.fillUnder((x) => Math.min(f(x), 0), 0, T, pl.c.red, 0.35);
    pl.fn(f, pl.c.f1, { width: 1.8, from: 0, to: T });
    pl.line(T, -1.1, T, 1.1, pl.c['ink-3'], { width: 1, dash: [3, 4] });
  }, [k, p, q]);
  const exact = k === 'sc' ? 0 : p === q && p > 0 ? Math.PI : k === 'cc' && p === 0 && q === 0 ? 2 * Math.PI : 0;
  const I0 = Math.abs(I) < 1e-9 ? 0 : I;
  return (
    <Widget title="الجيوب متعامدة" hint="الأخضر مساحة موجبة والأحمر سالبة، من $0$ إلى $2\pi$. باستعمال $\sin px\cos qx = \tfrac12\sin(p + q)x + \tfrac12\sin(p - q)x$ يصير الضرب مجموع جيبين، **وكل جيب كامل الدورات تكامله صفر**. الاستثناء الوحيد: $p = q$ مع جيبين أو جيبَي تمام، فهو مربع كامل لا سالب فيه، وتكامله $\pi$.">
      <Choice value={k} onChange={setK} options={(Object.keys(F) as K[]).map((v) => ({ v, label: F[v].label }))} />
      <Canvas refEl={ref} ratio={0.45} label="حاصل ضرب جيبين على دورة كاملة" />
      <div className="controls">
        <Slider label="$p$" value={p} min={0} max={12} step={1} onChange={setP} />
        <Slider label="$q$" value={q} min={0} max={12} step={1} onChange={setQ} />
      </div>
      <Readout items={[
        { label: `$\\int_0^{2\\pi} ${F[k].name}\\,dx$`, value: fmt(I0, 5), color: 'var(--f1)' },
        { label: 'الجواب الدقيق', value: exact === Math.PI ? 'π' : exact === 2 * Math.PI ? '2π' : '0' },
      ]} />
      <MathText as="div" className="verdict">{'يقول Strang: «أعتقد أن هذه أهم التكاملات المحددة في هذا الفصل، وربما في الرياضيات كلها». **على كونها أصفاراً يقوم نجاح متسلسلات فورييه**، وصناعة معالجة الإشارات كلها.'}</MathText>
    </Widget>
  );
}
