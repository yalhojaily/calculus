import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Sub {
  label: string; xf: (x: number) => number; u: (x: number) => number; uf: (u: number) => number; F: (u: number) => number;
  br: [number, number]; xv: View; uv: (b: number) => View; ux: string; note: string;
}
const subs: Record<string, Sub> = {
  sinx2: { label: '$\\int 2x \\sin x^2\\,dx$', xf: (x) => 2 * x * Math.sin(x * x), u: (x) => x * x, uf: Math.sin, F: (u) => -Math.cos(u), br: [0.2, 3], xv: { xMin: -0.1, xMax: 3.1, yMin: -6.2, yMax: 6.2 }, uv: () => ({ xMin: -0.3, xMax: 9.3, yMin: -1.3, yMax: 1.3 }), ux: 'u = x^2', note: 'المثال 2: $u = x^2$ و $du = 2x\\,dx$. الحدود $0$ و $b$ تصبح $0$ و $b^2$. **المساحتان متساويتان دائماً**: $-\\cos u$ بين $0$ و $b^2$.' },
  cub: { label: '$\\int (x^2 + 5)^3 x\\,dx$', xf: (x) => (x * x + 5) ** 3 * x, u: (x) => x * x + 5, uf: (u) => (u ** 3) / 2, F: (u) => u ** 4 / 8, br: [0.2, 1.4], xv: { xMin: -0.05, xMax: 1.45, yMin: -20, yMax: 500 }, uv: () => ({ xMin: 4.8, xMax: 7.1, yMin: -10, yMax: 180 }), ux: 'u = x^2 + 5', note: 'المثال 3: $du = 2x\\,dx$، فالعامل $2$ الناقص يصبح $\\tfrac12$ أمام $u^3$. الحدود من $x = 0$ إلى $1$ تصبح من $u = 5$ إلى $6$.' },
  cos2x: { label: '$\\int \\cos 2x\\,dx$', xf: (x) => Math.cos(2 * x), u: (x) => 2 * x, uf: (u) => Math.cos(u) / 2, F: (u) => Math.sin(u) / 2, br: [0.1, 3], xv: { xMin: -0.1, xMax: 3.1, yMin: -1.2, yMax: 1.2 }, uv: () => ({ xMin: -0.2, xMax: 6.2, yMin: -1.2, yMax: 1.2 }), ux: 'u = 2x', note: 'المثال 10: ضغط الرسم بعامل 2 يقسم المساحة على 2. في متغير $u$ المنحنى **أعرض مرتين وأقصر مرتين**.' },
};

/** 5.4 / 5.5 — التعويض: المساحة تحت v(u(x)) u′(x) من a إلى b تساوي المساحة تحت v(u) من u(a) إلى u(b). */
export default function Substitution() {
  const [k, setK] = useState('sinx2');
  const S = subs[k];
  const [b, setB] = useState(S.br[1] * 0.75);
  const a = 0;
  const ua = S.u(a), ub = S.u(b);
  const area = S.F(ub) - S.F(ua);
  const left = usePlot(S.xv, (p) => {
    p.axes({ xLabel: 'x' });
    p.fillUnder(S.xf, a, b, p.c.area, 0.4);
    p.fn(S.xf, p.c.f1, { width: 2.6, from: S.xv.xMin, to: S.xv.xMax });
    p.line(b, S.xv.yMin, b, S.xv.yMax, p.c['ink-3'], { width: 1, dash: [3, 4] });
  }, [k, b]);
  const right = usePlot(S.uv(b), (p) => {
    p.axes({ xLabel: 'u' });
    p.fillUnder(S.uf, ua, ub, p.c.area, 0.4);
    const V = S.uv(b);
    p.fn(S.uf, p.c.f2, { width: 2.6, from: V.xMin, to: V.xMax });
    p.line(ua, V.yMin, ua, V.yMax, p.c['ink-3'], { width: 1, dash: [3, 4] });
    p.line(ub, V.yMin, ub, V.yMax, p.c['ink-3'], { width: 1, dash: [3, 4] });
  }, [k, b]);
  return (
    <Widget title="التعويض: المساحة نفسها بمتغير آخر" hint="يسار: الدالة بمتغير $x$. يمين: بعد التعويض، **ومحورها الأفقي $u$**. نبدّل $x$ بـ $u$، و $dx$ بـ $du$، **والحدود أيضاً**. شكل المنطقة يتغيّر (تمتد أو تنضغط)، لكن المساحة الخضراء لا تتغيّر.">
      <Choice value={k} onChange={(v) => { setK(v); setB(subs[v].br[1] * 0.75); }} options={Object.entries(subs).map(([v, s]) => ({ v, label: s.label }))} />
      <div className="cv-row">
        <div><Canvas refEl={left} ratio={0.8} label="التكامل بمتغير x" /><div className="cv-cap f1">بمتغير <i>x</i>: من 0 إلى <i>b</i></div></div>
        <div><Canvas refEl={right} ratio={0.8} label="التكامل بمتغير u" /><div className="cv-cap f2">بمتغير <i>u</i>: من <i>u(0)</i> إلى <i>u(b)</i></div></div>
      </div>
      <div className="controls">
        <Slider label="$b$" value={b} min={S.br[0]} max={S.br[1]} step={0.005} onChange={setB} show={(v) => fmt(v, 3)} />
      </div>
      <Readout items={[
        { label: '$u(0)$', value: fmt(ua, 3), color: 'var(--f2)' },
        { label: '$u(b)$', value: fmt(ub, 3), color: 'var(--f2)' },
        { label: 'المساحة (كلا الرسمين)', value: fmt(area, 4), color: 'var(--area)' },
      ]} />
      <MathText as="div" className="verdict">{`$${S.ux}$ · ${S.note}`}</MathText>
    </Widget>
  );
}
