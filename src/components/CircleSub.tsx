import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

/** 7.3 — ∫₀ˣ √(1 − t²) dt بالتعويض x = sin θ: المساحة تحت ربع الدائرة = مثلث ½x√(1 − x²) + قطاع ½θ. */
export default function CircleSub() {
  const [x, setX] = useState(0.6);
  const th = Math.asin(x), c = Math.sqrt(1 - x * x);
  const left = usePlot({ xMin: -0.1, xMax: 1.12, yMin: -0.1, yMax: 1.12 }, (p) => {
    p.axes({ xLabel: 'x', yLabel: 'y' });
    // القطاع: من المحور الرأسي إلى نصف القطر نحو (x, √(1−x²))
    const ctx = p.ctx; ctx.beginPath(); ctx.moveTo(p.X(0), p.Y(0));
    for (let i = 0; i <= 60; i++) { const a = Math.PI / 2 - (th * i) / 60; ctx.lineTo(p.X(Math.cos(a)), p.Y(Math.sin(a))); }
    ctx.closePath(); ctx.fillStyle = p.c.f2; ctx.globalAlpha = 0.4; ctx.fill(); ctx.globalAlpha = 1;
    // المثلث
    ctx.beginPath(); ctx.moveTo(p.X(0), p.Y(0)); ctx.lineTo(p.X(x), p.Y(0)); ctx.lineTo(p.X(x), p.Y(c)); ctx.closePath();
    ctx.fillStyle = p.c.area; ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1;
    p.curve(Math.cos, Math.sin, 0, Math.PI / 2, p.c.f1, { width: 3 });
    p.line(0, 0, x, c, p.c.ink, { width: 1.4 });
    p.line(x, 0, x, c, p.c.ink, { width: 1.4 });
    p.point(x, c, p.c.red, 5);
    p.text('θ', 0.05, 0.25, p.c.f2, { size: 14 });
  }, [x]);
  const right = usePlot({ xMin: -0.1, xMax: Math.PI / 2 + 0.1, yMin: -0.1, yMax: 1.12 }, (p) => {
    p.axes({ xLabel: 'θ', yLabel: 'cos²θ' });
    p.fillUnder((t) => Math.cos(t) ** 2, 0, th, p.c.violet, 0.4);
    p.fn((t) => Math.cos(t) ** 2, p.c.violet, { width: 3, from: 0, to: Math.PI / 2 });
    p.line(th, 0, th, Math.cos(th) ** 2, p.c.ink, { width: 1.2, dash: [3, 3] });
  }, [x]);
  const area = 0.5 * x * c + 0.5 * th;
  return (
    <Widget title="التعويض x = sin θ" hint="يسار: المساحة تحت ربع الدائرة $y = \sqrt{1 - x^2}$ من 0 إلى $x$، **وهي مثلث** (الأخضر، مساحته $\tfrac12 x\sqrt{1 - x^2}$) **وقطاع** (البرتقالي، زاويته $\theta$ ومساحته $\tfrac12\theta$). يمين: بعد التعويض $x = \sin\theta$ و $dx = \cos\theta\,d\theta$ يصير التكامل $\int \cos^2\theta\,d\theta$: **رسم جديد وقاعدة جديدة، والمساحة نفسها**.">
      <div className="cv-row">
        <div><Canvas refEl={left} ratio={0.95} label="المساحة تحت ربع الدائرة" /><div className="cv-cap f1">بمتغير <i>x</i></div></div>
        <div><Canvas refEl={right} ratio={0.75} label="المساحة بعد التعويض" /><div className="cv-cap">بمتغير <i>θ</i>: الحد الأعلى <i>θ = sin⁻¹x</i></div></div>
      </div>
      <div className="controls">
        <Slider label="$x$" value={x} min={0.01} max={1} step={0.005} onChange={setX} show={(v) => fmt(v, 3)} color="var(--red)" />
      </div>
      <Readout items={[
        { label: '$\\theta = \\sin^{-1} x$', value: `${fmt(th, 4)} (${fmt(th / D, 1)}°)`, color: 'var(--f2)' },
        { label: 'المثلث $\\tfrac12 x\\sqrt{1 - x^2}$', value: fmt(0.5 * x * c, 4), color: 'var(--area)' },
        { label: 'القطاع $\\tfrac12\\theta$', value: fmt(0.5 * th, 4), color: 'var(--f2)' },
        { label: 'المساحة الكلية', value: fmt(area, 4), color: 'var(--violet)' },
      ]} />
      <MathText as="div" className="verdict">{'**تحذير:** لو انتقلنا من $\\sqrt{1 - x^2}$ إلى $\\cos\\theta$ ونسينا الفرق بين $dx$ و $d\\theta$، فحسبنا $\\int\\cos\\theta\\,d\\theta$، **لكان الجواب خطأ تماماً**. العامل $dx = \\cos\\theta\\,d\\theta$ هو الذي يجعلها $\\cos^2\\theta$.'}</MathText>
    </Widget>
  );
}
const D = Math.PI / 180;
