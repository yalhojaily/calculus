import { useState } from 'react';
import { fmt } from '../lib/plot';
import { angleArc, fitEqual, polarGrid } from '../lib/polar';
import { MathText } from './MathText';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

const deg = (t: number) => `${fmt((t * 180) / Math.PI, 0)}°`;

/** 9.1 — الإحداثيات القطبية: (r, θ) ↔ (x, y). نفس النقطة لها زوايا كثيرة، وقد يكون r سالباً. */
export default function PolarCoords() {
  const [r, setR] = useState(2);
  const [th, setTh] = useState(Math.PI / 6);
  const x = r * Math.cos(th), y = r * Math.sin(th);
  const ref = usePlot({ xMin: -3.4, xMax: 3.4, yMin: -3.4, yMax: 3.4 }, (p) => {
    fitEqual(p, -3.4, 3.4, -3.4, 3.4);
    polarGrid(p, 3);
    for (let k = 1; k <= 3; k++) p.text(String(k), k, 0, p.c['ink-3'], { align: 'center', base: 'top', dy: 3, size: 11, italic: false });
    // الشعاع عند θ (يمتد للخلف إن كان r سالباً)
    p.line(0, 0, 3.3 * Math.cos(th), 3.3 * Math.sin(th), p.c.violet, { width: 1.4, dash: [5, 4] });
    angleArc(p, th, 26, p.c.violet);
    p.line(x, 0, x, y, p.c.f2, { width: 2, dash: [4, 3] });
    p.line(0, 0, x, 0, p.c.area, { width: 3 });
    p.line(0, 0, x, y, r < 0 ? p.c.red : p.c.f1, { width: 3 });
    p.point(x, y, r < 0 ? p.c.red : p.c.f1, 7);
    p.text('θ', 34 / (p.X(1) - p.X(0)) * Math.cos(th / 2), 34 / (p.X(1) - p.X(0)) * Math.sin(th / 2), p.c.violet, { align: 'left', base: 'middle', dx: 4 });
  }, [r, th]);
  const R = Math.hypot(x, y);
  let base = Math.atan2(y, x); if (base < 0) base += 2 * Math.PI;
  return (
    <Widget title="الإحداثيات القطبية" hint="مراقب الطيران لا يعطي موقع الطائرة بـ $x$ و $y$، بل **باتجاهها $\theta$ وبعدها $r$**. من المثلث القائم: $x = r\cos\theta$ و $y = r\sin\theta$، والعكس $r = \sqrt{x^2 + y^2}$ و $\tan\theta = y/x$. اجعل $r$ سالباً: تعود النقطة **إلى الخلف** على الشعاع (بالأحمر).">
      <Canvas refEl={ref} ratio={0.75} label="نقطة بإحداثياتها القطبية والديكارتية" />
      <div className="controls">
        <Slider label="$r$" value={r} min={-3} max={3} step={0.05} onChange={setR} show={(v) => fmt(v, 2)} color="var(--f1)" />
        <Slider label="$\theta$" value={th} min={-2 * Math.PI} max={2 * Math.PI} step={Math.PI / 36} onChange={setTh} show={deg} color="var(--violet)" />
      </div>
      <Readout items={[
        { label: '$x = r\\cos\\theta$', value: fmt(x, 3), color: 'var(--area)' },
        { label: '$y = r\\sin\\theta$', value: fmt(y, 3), color: 'var(--f2)' },
        { label: '$\\sqrt{x^2 + y^2}$', value: fmt(R, 3) },
        { label: 'النقطة نفسها بـ $r \\ge 0$', value: R < 1e-9 ? '(0, أي زاوية)' : `(${fmt(R, 2)}, ${deg(base)}) = (${fmt(R, 2)}, ${deg(base - 2 * Math.PI)})` },
      ]} />
      <MathText as="div" className="verdict">{'**تحذير:** لأي زاوية نضيف $2\\pi$ فيبقى الاتجاه: $45°$ و $-315°$ و $405°$ زاوية واحدة. وإضافة $180°$ لا تغيّر $\\tan\\theta$، لذا كتبنا «تقريباً» في $\\theta = \\tan^{-1}(y/x)$: النقطتان $(1, 1)$ و $(-1, -1)$ لهما $\\tan\\theta = 1$ والبعد نفسه $\\sqrt2$.'}</MathText>
    </Widget>
  );
}
