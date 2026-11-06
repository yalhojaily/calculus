import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface C { label: string; x: (t: number) => number; y: (t: number) => number; t: [number, number]; L: number; view: View; note: string }
const cs: Record<string, C> = {
  x32: { label: '$y = x^{3/2}$', x: (t) => t, y: (t) => t ** 1.5, t: [0, 4], L: (8 / 27) * (10 ** 1.5 - 1), view: { xMin: -0.3, xMax: 4.4, yMin: -0.5, yMax: 8.5 }, note: 'المثال 1: $\\int_0^4 \\sqrt{1 + \\tfrac94 x}\\,dx = \\tfrac{8}{27}(10^{3/2} - 1) \\approx 9.07$. والخط المستقيم إلى $(4, 8)$ طوله $\\sqrt{80} \\approx 8.94$: **المنحنى مستقيم على نحو مدهش**. وهذا المثال اختير بعناية ليكون التكامل ممكناً أصلاً.' },
  circ: { label: 'ربع دائرة', x: Math.cos, y: Math.sin, t: [0, Math.PI / 2], L: Math.PI / 2, view: { xMin: -0.15, xMax: 1.2, yMin: -0.15, yMax: 1.15 }, note: 'المثالان 3 و 5: بالمتغير $x$ يكون $\\int_0^1 \\dfrac{dx}{\\sqrt{1 - x^2}} = \\dfrac\\pi2$. وبالوسيط $x = \\cos t$ و $y = \\sin t$ يكون $ds = dt$ ببساطة، **فالطول $\\pi/2$ دون جذر**.' },
  ell: { label: 'ربع قطع ناقص', x: Math.cos, y: (t) => Math.SQRT2 * Math.sin(t), t: [0, Math.PI / 2], L: 1.910098894513856, view: { xMin: -0.15, xMax: 1.25, yMin: -0.15, yMax: 1.55 }, note: 'المثالان 4 و 6: $\\int_0^{\\pi/2}\\sqrt{\\sin^2 t + 2\\cos^2 t}\\,dt$ **لا يُحسب بصيغة مغلقة**. طول القطع الناقص يُحسب عددياً فقط: $1.9101$.' },
  astro: { label: 'نجمية $\\cos^3 t,\\ \\sin^3 t$', x: (t) => Math.cos(t) ** 3, y: (t) => Math.sin(t) ** 3, t: [0, Math.PI / 2], L: 1.5, view: { xMin: -0.15, xMax: 1.15, yMin: -0.15, yMax: 1.15 }, note: 'التمرين 9: النجمية (hypocycloid)، وصورتها غير الوسيطية $x^{2/3} + y^{2/3} = 1$. احسب طولها من $t = 0$ إلى $\\pi/2$ بنفسك، ثم قارن.' },
  stair: { label: 'مفارقة الدرج', x: (t) => t, y: (t) => t, t: [0, 1], L: Math.SQRT2, view: { xMin: -0.1, xMax: 1.15, yMin: -0.1, yMax: 1.15 }, note: '**الدرج يقترب من الخط في الشكل، لا في الطول!** طول الدرج 2 دائماً مهما صغرت الدرجات، وطول الخط $\\sqrt2$. الأطوال تحتاج الميول أيضاً: الدرج ميله 0 أو ∞، لا 1.' },
};

/** 8.2 — طول منحنى: مجموع قطع مستقيمة √((Δx)² + (Δy)²) يقترب من ∫ ds. */
export default function ArcLength() {
  const [k, setK] = useState('x32');
  const C = cs[k];
  const [n, setN] = useState(4);
  const pts = Array.from({ length: n + 1 }, (_, i) => { const t = C.t[0] + ((C.t[1] - C.t[0]) * i) / n; return [C.x(t), C.y(t)] as [number, number]; });
  let poly = 0;
  for (let i = 1; i <= n; i++) poly += k === 'stair' ? Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]) : Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const ref = usePlot(C.view, (p) => {
    p.axes();
    p.curve(C.x, C.y, C.t[0], C.t[1], p.c.f1, { width: 3 });
    for (let i = 1; i <= n; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      if (k === 'stair') { p.line(x0, y0, x1, y0, p.c.f2, { width: 2.2 }); p.line(x1, y0, x1, y1, p.c.f2, { width: 2.2 }); }
      else { p.line(x0, y0, x1, y1, p.c.f2, { width: 2.2 }); if (n <= 8) { p.line(x0, y0, x1, y0, p.c['ink-3'], { width: 1, dash: [3, 3] }); p.line(x1, y0, x1, y1, p.c['ink-3'], { width: 1, dash: [3, 3] }); } }
    }
    if (n <= 60) for (const [x, y] of pts) p.point(x, y, p.c.f2, 3.5);
  }, [k, n]);
  return (
    <Widget title="طول منحنى" hint="نقرّب المنحنى بقطع مستقيمة. كل قطعة وتر مثلث قائم: $(\Delta s)^2 = (\Delta x)^2 + (\Delta y)^2$. وحين تصغر القطع: $ds = \sqrt{1 + (dy/dx)^2}\,dx$، أو بالوسيط $ds = \sqrt{(dx/dt)^2 + (dy/dt)^2}\,dt$. زِد عدد القطع وراقب المجموع يقترب من الطول.">
      <Choice value={k} onChange={setK} options={Object.entries(cs).map(([v, c]) => ({ v, label: c.label }))} />
      <Canvas refEl={ref} ratio={0.65} label="تقريب طول المنحنى بقطع مستقيمة" />
      <div className="controls">
        <Slider label="عدد القطع" value={n} min={1} max={200} step={1} onChange={setN} />
      </div>
      <Readout items={[
        { label: k === 'stair' ? 'طول الدرج' : 'طول المضلّع', value: fmt(poly, 6), color: 'var(--f2)' },
        { label: 'طول المنحنى $\\int ds$', value: fmt(C.L, 6), color: 'var(--f1)' },
        { label: 'الفرق', value: fmt(C.L - poly, 6) },
      ]} />
      <MathText as="div" className="verdict">{C.note}</MathText>
    </Widget>
  );
}
