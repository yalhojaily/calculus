import { useCallback, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { type Cam, type V3, depth, draw3, surface, useOrbit } from '../lib/three';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type K = 'sticks' | 'slice';
const f = (x: number, y: number) => 1 + x * x + y * y;
const EXACT = 16 / 3;

/** 14.1 — التكامل الثنائي حجم: أعواد رفيعة f(xᵢ, yⱼ)ΔA تُجمع. أو شرائح: A(x) = ∫ f dy ثم ∫ A(x) dx (فوبيني). */
export default function StickSum() {
  const [k, setK] = useState<K>('sticks');
  const [n, setN] = useState(4);
  const [xs, setXs] = useState(0.5);
  const [cam, setCam0] = useState<Cam>({ az: 0.55, el: 0.45 });
  const setCam = useCallback((g: (c: Cam) => Cam) => setCam0(g), []);
  const nx = n, ny = 2 * n, dx = 1 / nx, dy = 2 / ny;
  let sum = 0;
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) sum += f((i + 0.5) * dx, (j + 0.5) * dy) * dx * dy;
  const zs = 0.45;
  const A = (x: number) => 2 + 2 * x * x + 8 / 3;
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -1.6, 2.8, -1.2, 3);
    const g = draw3(p, cam);
    g.axes(2.6);
    if (k === 'sticks') {
      const boxes: { d: number; i: number; j: number }[] = [];
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) boxes.push({ d: depth(cam, [(i + 0.5) * dx, (j + 0.5) * dy, 0]), i, j });
      boxes.sort((a, b) => a.d - b.d);
      for (const { i, j } of boxes) {
        const x0 = i * dx, x1 = x0 + dx, y0 = j * dy, y1 = y0 + dy, h = zs * f(x0 + dx / 2, y0 + dy / 2);
        const s = (h / zs - 1) / 5;
        const col = `hsl(${220 - 190 * s}, 60%, 55%)`;
        const P = (x: number, y: number, z: number): V3 => [x, y, z];
        g.poly([P(x0, y0, h), P(x1, y0, h), P(x1, y1, h), P(x0, y1, h)], col, 0.95);
        g.poly([P(x0, y0, 0), P(x1, y0, 0), P(x1, y0, h), P(x0, y0, h)], col, 0.75);
        g.poly([P(x1, y0, 0), P(x1, y1, 0), P(x1, y1, h), P(x1, y0, h)], col, 0.6);
        g.poly([P(x0, y0, 0), P(x0, y1, 0), P(x0, y1, h), P(x0, y0, h)], col, 0.6);
        g.poly([P(x0, y1, 0), P(x1, y1, 0), P(x1, y1, h), P(x0, y1, h)], col, 0.75);
      }
    } else {
      surface(p, cam, (x, y) => zs * f(x, y), [0, 1], [0, 2], { n: 14, alpha: 0.35 });
      const pts: V3[] = [[xs, 0, 0]];
      for (let i = 0; i <= 40; i++) { const y = (2 * i) / 40; pts.push([xs, y, zs * f(xs, y)]); }
      pts.push([xs, 2, 0]);
      g.poly(pts, p.c.red, 0.55);
    }
    g.poly([[0, 0, 0], [1, 0, 0], [1, 2, 0], [0, 2, 0]], p.c.ink, 0.05);
  }, [k, n, xs, cam]);
  useOrbit(ref, setCam);
  return (
    <Widget title="التكامل الثنائي: أعواد وشرائح" hint={k === 'sticks' ? 'المثال 1: الحجم تحت $z = 1 + x^2 + y^2$ فوق المستطيل $0 \\le x \\le 1$، $0 \\le y \\le 2$. **قطّع القاعدة مستطيلات صغيرة $\\Delta A = \\Delta x\\,\\Delta y$**، وفوق كل منها **عود رفيع** حجمه $f(x_i, y_j)\\,\\Delta A$. اجمع الأعواد ودع $\\Delta x, \\Delta y \\to 0$: $\\iint_R f\\,dA$. اسحب الرسم لتديره.' : '**فوبيني: التكامل الثنائي تكاملان مفردان.** ثبّت $x$ واقطع الجسم: مساحة الشريحة (الحمراء) $A(x) = \\int_0^2 f(x, y)\\,dy$، تكامل «جزئي» عكس المشتقة الجزئية. ثم اجمع الشرائح: $\\int_0^1 A(x)\\,dx$.'}>
      <Choice value={k} onChange={setK} options={[{ v: 'sticks', label: 'أعواد رفيعة' }, { v: 'slice', label: 'شرائح (فوبيني)' }]} />
      <Canvas refEl={ref} ratio={0.75} label="أعواد أو شريحة تحت سطح" />
      <div className="controls">
        {k === 'sticks' ? <Slider label="التقسيم $n$" value={n} min={1} max={12} step={1} onChange={setN} show={(v) => `${v} × ${2 * v}`} /> : <Slider label="موضع الشريحة $x$" value={xs} min={0} max={1} step={0.01} onChange={setXs} show={(v) => fmt(v, 2)} color="var(--red)" />}
      </div>
      <Readout items={k === 'sticks' ? [
        { label: 'عدد الأعواد', value: String(nx * ny) },
        { label: '$\\sum f\\,\\Delta A$ (نقاط وسطى)', value: fmt(sum, 5), color: 'var(--f2)' },
        { label: 'الحجم الحقيقي', value: `16/3 = ${fmt(EXACT, 5)}`, color: 'var(--f1)' },
      ] : [
        { label: '$A(x) = 2 + 2x^2 + \\tfrac83$', value: fmt(A(xs), 4), color: 'var(--red)' },
        { label: '$\\int_0^1 A(x)\\,dx$', value: '16/3', color: 'var(--f1)' },
      ]} />
      <MathText as="div" className="verdict">{k === 'sticks' ? '**الخطأ «طبقة سكر»** حول الجسم: حيث لا تتطابق القطع مع الجوانب ولا الارتفاعات مع السطح المنحني. تزداد رقة كلما صغرت المستطيلات. **ومع النقاط الوسطى** يتناقص الخطأ مثل $(\\Delta x)^2$.' : 'الداخلي: $\\int_0^2(1 + x^2 + y^2)\\,dy = \\Big[y + x^2y + \\tfrac13y^3\\Big]_0^2 = 2 + 2x^2 + \\tfrac83$. الخارجي: $\\int_0^1\\left(2 + 2x^2 + \\tfrac83\\right)dx = 2 + \\tfrac23 + \\tfrac83 = \\tfrac{16}{3}$. **وبالترتيب الآخر الجواب نفسه.** أنصح بشدة أن تحسب الداخلي على سطر والخارجي على سطر آخر.'}</MathText>
    </Widget>
  );
}
