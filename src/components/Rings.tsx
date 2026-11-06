import { useState } from 'react';
import { fmt } from '../lib/plot';
import { AnimControls, Canvas, Readout, Slider, Widget, useClock, usePlot } from './ui';

/** 5.7 — مساحة الدائرة تكامل الحلقات: كل حلقة تنفرد إلى شريط طوله 2πr، والأشرطة تصنع مثلثاً مساحته πr². */
export default function Rings() {
  const [n, setN] = useState(8);
  const clock = useClock(5, { loop: false });
  const t = clock.t;
  const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; // تسهيل الحركة
  const cx = Math.PI, cy = 1.15, R = 1, dr = R / n;
  const ref = usePlot({ xMin: -0.3, xMax: 6.6, yMin: -0.2, yMax: 2.45 }, (p) => {
    const ctx = p.ctx;
    const px = p.X(1) - p.X(0);
    for (let i = 0; i < n; i++) {
      const rho = (i + 0.5) * dr;
      ctx.beginPath();
      for (let k = 0; k <= 120; k++) {
        const s = -Math.PI + (2 * Math.PI * k) / 120;
        const x0 = cx + rho * Math.sin(s), y0 = cy - rho * Math.cos(s);
        const x1 = cx + rho * s, y1 = cy - rho;
        const X = p.X(x0 + (x1 - x0) * e), Y = p.Y(y0 + (y1 - y0) * e);
        if (k === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.strokeStyle = i % 2 ? p.c.f1 : p.c.area;
      ctx.globalAlpha = 0.75;
      ctx.lineWidth = Math.max(1, dr * px * 0.92);
      ctx.lineCap = 'butt';
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (e > 0.98) {
      p.line(cx - Math.PI * R, cy - R - 0.08, cx + Math.PI * R, cy - R - 0.08, p.c.f2, { width: 2 });
      p.text('2πr', cx, cy - R - 0.08, p.c.f2, { align: 'center', base: 'top', dy: 4 });
      p.line(cx + Math.PI * R + 0.15, cy - R, cx + 0.15, cy, p.c['ink-3'], { width: 1, dash: [3, 3] });
      p.text('r', cx + 0.2, cy - R / 2, p.c.ink, { dx: 6 });
    }
  }, [n, e]);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += 2 * Math.PI * i * dr * dr; // المحيط الداخلي لكل حلقة
  return (
    <Widget title="الدائرة من حلقات" hint="لا مستطيلات هنا. قسّم الدائرة إلى حلقات رقيقة سُمكها $\Delta r$. اضغط **افرد**: كل حلقة تنقطع من الأعلى وتنفرد إلى شريط طوله تقريباً المحيط $C = 2\pi r$ عند نصف قطرها. الأشرطة تُكدَّس **مثلثاً** قاعدته $2\pi r$ وارتفاعه $r$، فمساحته $\tfrac12 \cdot 2\pi r \cdot r = \pi r^2$.">
      <Canvas refEl={ref} ratio={0.384} label="حلقات الدائرة تنفرد إلى مثلث" />
      <AnimControls clock={clock} label="افرد" />
      <div className="controls">
        <Slider label="عدد الحلقات" value={n} min={2} max={40} step={1} onChange={setN} />
      </div>
      <Readout items={[
        { label: '$\\Delta r$', value: fmt(dr, 3) },
        { label: '$\\sum C\\,\\Delta r$ (المحيط الداخلي)', value: fmt(sum, 5), color: 'var(--area)' },
        { label: '$\\pi r^2$', value: fmt(Math.PI, 5), color: 'var(--f2)' },
      ]} />
    </Widget>
  );
}
