import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type K = 'sin' | 'cos' | 'tan';
const H = Math.PI / 2;
interface T { f: (x: number) => number; inv: (y: number) => number; slope: (y: number) => number; dom: [number, number]; yr: [number, number]; formula: string; note: string; label: string }
const defs: Record<K, T> = {
  sin: { label: '$\\sin^{-1}$', f: Math.sin, inv: Math.asin, slope: (y) => 1 / Math.sqrt(1 - y * y), dom: [-H, H], yr: [-0.995, 0.995], formula: '\\dfrac{dx}{dy} = \\dfrac{1}{\\cos x} = \\dfrac{1}{\\sqrt{1 - y^2}}', note: 'نحصر $x$ بين $-\\pi/2$ و $\\pi/2$ حيث الجيب متزايد، فلكل $y$ زاوية واحدة. عند $y = \\pm 1$ مماس الجيب أفقي، **فمماس المعكوس رأسي**: الميل $1/0$.' },
  cos: { label: '$\\cos^{-1}$', f: Math.cos, inv: Math.acos, slope: (y) => -1 / Math.sqrt(1 - y * y), dom: [0, Math.PI], yr: [-0.995, 0.995], formula: '\\dfrac{dx}{dy} = \\dfrac{-1}{\\sqrt{1 - y^2}}', note: 'هنا $0 \\le x \\le \\pi$ حيث جيب التمام متناقص. و $\\cos^{-1} y + \\sin^{-1} y = \\pi/2$ دائماً (زاويتان متتامّتان)، **فمشتقتاهما متعاكستان في الإشارة**.' },
  tan: { label: '$\\tan^{-1}$', f: Math.tan, inv: Math.atan, slope: (y) => 1 / (1 + y * y), dom: [-H + 0.02, H - 0.02], yr: [-6, 6], formula: '\\dfrac{dx}{dy} = \\dfrac{1}{\\sec^2 x} = \\dfrac{1}{1 + y^2}', note: '4E: ميل $\\tan^{-1} y$ هو $\\dfrac{1}{1 + y^2}$. **سؤال مهم قادم**: أي دالة مشتقتها $\\dfrac{1}{1 + x^2}$؟ هي هذه. والمعكوس محصور بين خطَّي التقارب $\\pm\\pi/2$.' },
};

/** 4.4 — الدوال المثلثية العكسية: فرع واحد، مرآة، ومثلث يعطي الميل. */
export default function InverseTrig() {
  const [k, setK] = useState<K>('sin');
  const D = defs[k];
  const [y, setY] = useState(0.5);
  const x = D.inv(y), s = D.slope(y);
  const lim = k === 'tan' ? 6.5 : 3.6;
  const view = k === 'sin' ? { xMin: -3.6, xMax: 3.6, yMin: -2.2, yMax: 2.2 } : k === 'cos' ? { xMin: -3.6, xMax: 3.6, yMin: -1.3, yMax: 3.5 } : { xMin: -6.5, xMax: 6.5, yMin: -4, yMax: 4 };
  const ref = usePlot(view, (p) => {
    p.axes({ xLabel: 'y', yLabel: 'x' });
    p.line(-lim, -lim, lim, lim, p.c['ink-3'], { width: 1, dash: [5, 5] });
    // الرسم الأصلي y = f(x) مرسوماً كنقاط (x, f(x)): كامله باهتاً، وفرعه المحصور
    if (k === 'tan') {
      for (const c of [-Math.PI, 0, Math.PI]) p.curve((u) => u, D.f, c - H + 0.05, c + H - 0.05, p.c.f1, { width: 1, dash: [3, 4] });
    } else p.curve((u) => u, D.f, -lim, lim, p.c.f1, { width: 1, dash: [3, 4] });
    p.curve((u) => u, D.f, D.dom[0], D.dom[1], p.c.f1, { width: 2.6 });
    // المعكوس: النقاط (y, x)
    p.curve(D.f, (u) => u, D.dom[0], D.dom[1], p.c.f2, { width: 3.2, n: 400 });
    if (k === 'tan') { p.line(-lim, H, lim, H, p.c['ink-3'], { width: 1, dash: [2, 4] }); p.line(-lim, -H, lim, -H, p.c['ink-3'], { width: 1, dash: [2, 4] }); }
    p.lineThrough(y, x, s, p.c.red, { width: 1.8 });
    p.point(y, x, p.c.red, 6);
    p.point(x, y, p.c.f1, 5);
  }, [k, y]);
  const tri = usePlot({ xMin: -0.25, xMax: k === 'tan' ? 1.6 : 1.3, yMin: -0.25, yMax: k === 'tan' ? 1.6 : 1.15 }, (p) => {
    const C = p.c;
    const yy = Math.min(Math.abs(y), k === 'tan' ? 1.5 : 1);
    let ax: number, op: number;
    if (k === 'sin') { op = Math.abs(y); ax = Math.sqrt(1 - y * y); } else if (k === 'cos') { ax = Math.abs(y); op = Math.sqrt(1 - y * y); } else { ax = 1; op = yy; }
    const sc = k === 'tan' ? 1 / Math.max(1, Math.hypot(1, op) / 1.5) : 1;
    ax *= sc; op *= sc;
    p.line(0, 0, ax, 0, k === 'cos' ? C.f2 : C.ink, { width: 3 });
    p.line(ax, 0, ax, op, k === 'cos' ? C.ink : C.f2, { width: 3 });
    p.line(0, 0, ax, op, C.f1, { width: 3 });
    p.text(k === 'sin' ? '1' : k === 'cos' ? '1' : '√(1+y²)', ax / 2, op / 2, C.f1, { dx: -10, dy: -10, align: 'right' });
    p.text(k === 'sin' ? 'y' : k === 'cos' ? '√(1−y²)' : 'y', ax, op / 2, k === 'cos' ? C.ink : C.f2, { dx: 8 });
    p.text(k === 'sin' ? '√(1−y²)' : k === 'cos' ? 'y' : '1', ax / 2, 0, k === 'cos' ? C.f2 : C.ink, { align: 'center', base: 'top', dy: 6 });
    p.text('x', 0.12, 0.02, C.red, { base: 'bottom', dy: -2 });
  }, [k, y]);
  return (
    <Widget title="الدوال المثلثية العكسية" hint="المحور الأفقي هنا $y$ والرأسي $x$ (الزاوية). الأزرق المتقطع: الدالة الأصلية كاملة، وهي تصعد وتنزل فلا معكوس لها. الأزرق العريض: **الفرع المحصور** حيث هي رتيبة. البرتقالي: انعكاسه، وهو الدالة العكسية. المثلث يعطي الضلع الناقص، ومنه الميل.">
      <Choice value={k} onChange={(v) => { setK(v); setY(v === 'tan' ? 1 : 0.5); }} options={[{ v: 'sin', label: defs.sin.label }, { v: 'cos', label: defs.cos.label }, { v: 'tan', label: defs.tan.label }]} />
      <div className="cv-row">
        <div><Canvas refEl={ref} ratio={0.75} label="الدالة ومعكوسها" /><div className="cv-cap f2">المعكوس <i>x = {k}⁻¹ y</i></div></div>
        <div><Canvas refEl={tri} ratio={0.75} label="المثلث القائم" /><div className="cv-cap">المثلث: الزاوية <i>x</i></div></div>
      </div>
      <div className="controls">
        <Slider label="$y$" value={y} min={D.yr[0]} max={D.yr[1]} step={0.005} onChange={setY} show={(v) => fmt(v, 3)} color="var(--red)" />
      </div>
      <Readout items={[
        { label: `$x = \\${k}^{-1} y$`, value: `${fmt(x, 4)} (${fmt((x * 180) / Math.PI, 1)}°)`, color: 'var(--f2)' },
        { label: '$dx/dy$', value: fmt(s, 4), color: 'var(--red)' },
      ]} />
      <MathText as="div" className="verdict">{`$${D.formula}$ · ${D.note}`}</MathText>
    </Widget>
  );
}
