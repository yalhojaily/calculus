import { useMemo, useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Fn { label: string; v: (x: number) => number; a: number; b: number; exact: number; view: View; note: string }
const fns: Record<string, Fn> = {
  bump: { label: '$1 + \\sin 2x$', v: (x) => 1 + Math.sin(2 * x), a: 0, b: 3, exact: 3 + (1 - Math.cos(6)) / 2, view: { xMin: -0.1, xMax: 3.15, yMin: -0.1, yMax: 2.2 }, note: 'دالة متصلة ترتفع وتنخفض: في كل فترة صغيرة نأخذ أدنى قيمة $m_k$ وأعلى قيمة $M_k$. **الفجوة $S - s$ تنغلق** على عدد واحد هو التكامل.' },
  sq: { label: '$(x^2 + 1)^4$', v: (x) => (x * x + 1) ** 4, a: 0, b: 1, exact: 1 + 4 / 3 + 6 / 5 + 4 / 7 + 1 / 9, view: { xMin: -0.03, xMax: 1.05, yMin: -0.5, yMax: 17 }, note: 'التمرين 19: الدالة متزايدة، **فالحد الأدنى في الطرف الأيسر والأعلى في الأيمن**. والفرق $S - s$ هو مستطيل واحد عند أقصى اليمين، ارتفاعه $v(1) - v(0) = 15$.' },
  step: { label: 'دالة درجية $U(x)$', v: (x) => (x < 0.5 ? 0 : 1), a: 0, b: 1, exact: 0.5, view: { xMin: -0.03, xMax: 1.05, yMin: -0.1, yMax: 1.2 }, note: 'الملاحظة 2: الدالة الدرجية **غير متصلة لكنها قابلة للتكامل**. في كل فترة $m_k = M_k$ إلا الفترة التي فيها القفزة، وعرضها يذهب إلى الصفر.' },
};

const rnd = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

/** 5.5 — المجموع الأدنى s والأعلى S والمجموع الوسيط S*: s ≤ S* ≤ S، والفجوة تنغلق حين Δx_max → 0. */
export default function UpperLower() {
  const [k, setK] = useState('bump');
  const F = fns[k];
  const [n, setN] = useState(6);
  const [mesh, setMesh] = useState<'eq' | 'rand'>('eq');
  const [show, setShow] = useState<'both' | 'star'>('both');
  const pts = useMemo(() => {
    if (mesh === 'eq') return Array.from({ length: n + 1 }, (_, i) => F.a + ((F.b - F.a) * i) / n);
    const r = rnd(7 + n); const w = Array.from({ length: n }, () => 0.3 + r()); const tot = w.reduce((s, x) => s + x, 0);
    let acc = F.a; return [F.a, ...w.map((x) => (acc += ((F.b - F.a) * x) / tot))];
  }, [k, n, mesh]); // eslint-disable-line react-hooks/exhaustive-deps
  const stars = useMemo(() => { const r = rnd(99 + n); return pts.slice(1).map((x1, i) => pts[i] + (x1 - pts[i]) * r()); }, [pts, n]);
  const ext = (x0: number, x1: number) => { let lo = Infinity, hi = -Infinity; for (let t = 0; t <= 60; t++) { const y = F.v(x0 + ((x1 - x0) * t) / 60); lo = Math.min(lo, y); hi = Math.max(hi, y); } return [lo, hi]; };
  let s = 0, S = 0, St = 0, wmax = 0;
  const boxes = pts.slice(1).map((x1, i) => { const x0 = pts[i]; const [m, M] = ext(x0, x1); s += m * (x1 - x0); S += M * (x1 - x0); St += F.v(stars[i]) * (x1 - x0); wmax = Math.max(wmax, x1 - x0); return { x0, x1, m, M }; });
  const ref = usePlot(F.view, (p) => {
    p.axes();
    const stroke = n <= 50;
    if (show === 'both') for (const b of boxes) { p.rect(b.x0, 0, b.x1, b.M, p.c.f2, { alpha: 0.22, stroke }); p.rect(b.x0, 0, b.x1, b.m, p.c.area, { alpha: 0.45, stroke }); }
    else boxes.forEach((b, i) => { p.rect(b.x0, 0, b.x1, F.v(stars[i]), p.c.violet, { alpha: 0.3, stroke }); if (n <= 40) p.point(stars[i], F.v(stars[i]), p.c.violet, 3); });
    p.fn(F.v, p.c.f1, { width: 2.6, from: F.a, to: F.b });
  }, [k, n, mesh, show]);
  return (
    <Widget title="المجموع الأدنى والأعلى" hint="الأخضر: مستطيلات **تحت** المنحنى (ارتفاعها أدنى قيمة $m_k$)، ومجموعها $s$. البرتقالي: مستطيلات **فوقه** (أعلى قيمة $M_k$)، ومجموعها $S$. والبنفسجي: مجموع ريمان $S^*$ بارتفاع $v(x_k^*)$ عند نقطة عشوائية. الفترات لا يلزم أن تكون متساوية: يكفي أن يذهب **أعرضها** إلى الصفر.">
      <Choice value={k} onChange={setK} options={Object.entries(fns).map(([v, f]) => ({ v, label: f.label }))} />
      <div className="row-choices">
        <Choice value={mesh} onChange={setMesh} options={[{ v: 'eq', label: 'فترات متساوية' }, { v: 'rand', label: 'فترات غير متساوية' }]} />
        <Choice value={show} onChange={setShow} options={[{ v: 'both', label: '$s$ و $S$' }, { v: 'star', label: '$S^*$' }]} />
      </div>
      <Canvas refEl={ref} ratio={0.55} label="المجموع الأدنى والأعلى" />
      <div className="controls">
        <Slider label="عدد الفترات $n$" value={n} min={1} max={120} step={1} onChange={setN} />
      </div>
      <Readout items={[
        { label: '$s$', value: fmt(s, 4), color: 'var(--area)' },
        { label: '$S^*$', value: fmt(St, 4), color: 'var(--violet)' },
        { label: '$S$', value: fmt(S, 4), color: 'var(--f2)' },
        { label: '$S - s$', value: fmt(S - s, 4) },
        { label: '$\\Delta x_{\\max}$', value: fmt(wmax, 3) },
        { label: 'التكامل', value: fmt(F.exact, 4), color: 'var(--f1)' },
      ]} />
      <MathText as="div" className="verdict">{F.note}</MathText>
    </Widget>
  );
}
