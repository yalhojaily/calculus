import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

/** 6.6 — طريقة أويلر لـ y′ = cy: كل خطوة تضرب في a = 1 + cΔt، فبعد n خطوة (1 + cΔt)^n مقابل e^{ct}. */
export default function EulerSteps() {
  const [c, setC] = useState(-1);
  const [n, setN] = useState(10);
  const T = 1;
  const dt = T / n;
  const a = 1 + c * dt;
  const pts = Array.from({ length: n + 1 }, (_, j) => [j * dt, a ** j] as [number, number]);
  const exact = Math.exp(c * T), approx = a ** n;
  const ys = pts.map((q) => q[1]).concat([exact, 1]);
  const lo = Math.min(...ys), hi = Math.max(...ys);
  const pad = (hi - lo) * 0.1 + 0.05;
  const ref = usePlot({ xMin: -0.05, xMax: T * 1.05, yMin: Math.max(lo - pad, -50), yMax: Math.min(hi + pad, 60) }, (p) => {
    p.axes({ xLabel: 't', yLabel: 'y' });
    p.fn((t) => Math.exp(c * t), p.c.f1, { width: 3, from: 0, to: T });
    for (let j = 0; j < n; j++) p.line(pts[j][0], pts[j][1], pts[j + 1][0], pts[j + 1][1], p.c.f2, { width: 2.2 });
    if (n <= 60) for (const [t, y] of pts) p.point(t, y, p.c.f2, 3.5);
  }, [c, n]);
  return (
    <Widget title="طريقة أويلر: خطوات بدل الاشتقاق" hint="أويلر يستبدل $dy/dt$ بـ $\Delta y/\Delta t$، فتصبح المعادلة $y(t + \Delta t) = (1 + c\,\Delta t)\,y(t)$. **كل خطوة تضرب في $a = 1 + c\,\Delta t$**، فبعد $n$ خطوة حتى الزمن 1 يكون $y = (1 + c/n)^n$. الأزرق الحل الحقيقي $e^{ct}$، والبرتقالي خطوات أويلر.">
      <Choice value={c} onChange={setC} options={[{ v: -1, label: "$y' = -y$ (اضمحلال)" }, { v: 1, label: "$y' = y$ (نمو)" }, { v: -3, label: "$y' = -3y$" }]} />
      <Canvas refEl={ref} ratio={0.52} label="خطوات أويلر مقابل الحل الأسي" />
      <div className="controls">
        <Slider label="عدد الخطوات $n$" value={n} min={1} max={200} step={1} onChange={setN} />
      </div>
      <Readout items={[
        { label: '$\\Delta t$', value: fmt(dt, 4) },
        { label: '$a = 1 + c\\,\\Delta t$', value: fmt(a, 4), color: 'var(--f2)' },
        { label: '$a^n$', value: fmt(approx, 5), color: 'var(--f2)' },
        { label: '$e^{c}$', value: fmt(exact, 5), color: 'var(--f1)' },
        { label: 'الخطأ', value: fmt(approx - exact, 5), color: 'var(--red)' },
        { label: 'الخطأ × $n$', value: fmt((approx - exact) * n, 4) },
      ]} />
      <MathText as="div" className="verdict">{a < 0 ? '**عدم استقرار!** $a$ سالب، فالحل العددي يتذبذب في الإشارة بينما الحقيقي يضمحل بهدوء. مع $\\Delta t = 3$ في الكتاب: $a = -2$ و $a^{20} \\approx 10^6$.' : a === 0 ? 'مع $c\\,\\Delta t = -1$ تكون $a = 0$: **كل القيم بعد الأولى أصفار**. عديم الفائدة أيضاً.' : '**الخطأ يتناسب مع $\\Delta t$**: ضاعف $n$ فينقسم الخطأ على 2 تقريباً (راقب «الخطأ × $n$» يثبت). مع $c = -1$ الثابت قريب من $\\tfrac12 e^{-1} \\approx \\tfrac15$. هذه دقة الرتبة الأولى، كالمستطيلات في 5.8.'}</MathText>
    </Widget>
  );
}
