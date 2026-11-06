import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type K = 'seesaw' | 'tri' | 'semi';

/** 8.5 — مركز الكتلة: العزم الكلي على الكتلة الكلية. على أرجوحة، ثم لصفيحة مثلثة ونصف دائرية. */
export default function Centroid() {
  const [k, setK] = useState<K>('seesaw');
  const [m, setM] = useState([1, 3, 2]);
  const [xs, setXs] = useState([1, 3, 7]);
  const M = m.reduce((s, v) => s + v, 0), My = m.reduce((s, v, i) => s + v * xs[i], 0), xbar = My / M;
  const see = usePlot({ xMin: -0.5, xMax: 9, yMin: -1.6, yMax: 2.4 }, (p) => {
    p.line(0, 0, 8.5, 0, p.c.ink, { width: 4 });
    for (let i = 0; i < 3; i++) { const r = 0.18 + 0.12 * m[i]; p.ctx.beginPath(); p.ctx.arc(p.X(xs[i]), p.Y(r + 0.02), (p.X(r) - p.X(0)), 0, 2 * Math.PI); p.ctx.fillStyle = [p.c.f1, p.c.f2, p.c.violet][i]; p.ctx.globalAlpha = 0.75; p.ctx.fill(); p.ctx.globalAlpha = 1; p.text(String(m[i]), xs[i], r + 0.02, '#fff', { align: 'center', base: 'middle', size: 13 }); }
    const ctx = p.ctx; ctx.beginPath(); ctx.moveTo(p.X(xbar), p.Y(-0.05)); ctx.lineTo(p.X(xbar - 0.35), p.Y(-1.1)); ctx.lineTo(p.X(xbar + 0.35), p.Y(-1.1)); ctx.closePath(); ctx.fillStyle = p.c.red; ctx.fill();
    p.text(`x̄ = ${fmt(xbar, 2)}`, xbar, -1.15, p.c.red, { align: 'center', base: 'top' });
    for (let x = 0; x <= 8; x++) p.text(String(x), x, 0, p.c['ink-3'], { align: 'center', base: 'top', dy: 6, size: 11 });
  }, [m, xs]);
  const plate = usePlot(k === 'tri' ? { xMin: -0.4, xMax: 2.6, yMin: -0.4, yMax: 4.4 } : { xMin: -1.4, xMax: 1.4, yMin: -0.3, yMax: 1.4 }, (p) => {
    p.axes();
    const ctx = p.ctx; ctx.beginPath();
    if (k === 'tri') { ctx.moveTo(p.X(0), p.Y(0)); ctx.lineTo(p.X(2), p.Y(0)); ctx.lineTo(p.X(0), p.Y(4)); }
    else { ctx.moveTo(p.X(-1), p.Y(0)); for (let i = 0; i <= 80; i++) { const a = Math.PI - (Math.PI * i) / 80; ctx.lineTo(p.X(Math.cos(a)), p.Y(Math.sin(a))); } }
    ctx.closePath(); ctx.fillStyle = p.c.f1; ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = p.c.f1; ctx.lineWidth = 2; ctx.stroke();
    const [cx, cy] = k === 'tri' ? [2 / 3, 4 / 3] : [0, 4 / (3 * Math.PI)];
    if (k === 'semi') p.line(-1, 0.5, 1, 0.5, p.c['ink-3'], { width: 1, dash: [3, 3] });
    p.point(cx, cy, p.c.red, 7);
  }, [k]);
  return (
    <Widget title="مركز الكتلة" hint="العزم كتلة ضرب مسافة: $m x$. ومركز الكتلة $\bar x = \dfrac{\sum m_n x_n}{\sum m_n}$ = العزم الكلي على الكتلة الكلية. **هناك تتوازن الأرجوحة.** ولصفيحة مستوية كثافتها 1، الكتلة هي المساحة، والعزمان من الشرائح: $M_y = \int x\,(\text{طول الشريحة الرأسية})\,dx$.">
      <Choice value={k} onChange={setK} options={[{ v: 'seesaw', label: 'أرجوحة' }, { v: 'tri', label: 'صفيحة مثلثة' }, { v: 'semi', label: 'نصف دائرة' }]} />
      {k === 'seesaw' ? <>
        <Canvas refEl={see} ratio={0.42} label="أرجوحة بثلاث كتل" />
        <div className="controls">
          {[0, 1, 2].map((i) => <Slider key={i} label={`الكتلة ${i + 1}`} value={m[i]} min={0.5} max={6} step={0.5} onChange={(v) => setM(m.map((q, j) => (j === i ? v : q)))} show={(v) => fmt(v, 1)} />)}
          {[0, 1, 2].map((i) => <Slider key={`x${i}`} label={`موضع ${i + 1}`} value={xs[i]} min={0} max={8} step={0.1} onChange={(v) => setXs(xs.map((q, j) => (j === i ? v : q)))} show={(v) => fmt(v, 1)} />)}
        </div>
        <Readout items={[
          { label: 'الكتلة $M$', value: fmt(M, 2) },
          { label: 'العزم $\\sum m x$', value: fmt(My, 2), color: 'var(--f2)' },
          { label: '$\\bar x$', value: fmt(xbar, 3), color: 'var(--red)' },
        ]} />
        <MathText as="div" className="verdict">{'الكتل $1, 3, 2$ عند $x = 1, 3, 7$: العزوم $1 + 9 + 14 = 24$ والكتلة 6، **فـ $\\bar x = 4$**. لو نقلنا كل الكتل إلى $\\bar x$ لبقي العزم 24: الكتل تتصرف ككتلة واحدة هناك.'}</MathText>
      </> : <>
        <Canvas refEl={plate} ratio={0.75} label="صفيحة ومركزها" />
        <Readout items={k === 'tri' ? [
          { label: '$M$ (المساحة)', value: '4' }, { label: '$M_y$', value: '8/3' }, { label: '$M_x$', value: '16/3' }, { label: '$(\\bar x, \\bar y)$', value: '(2/3, 4/3)', color: 'var(--red)' },
        ] : [
          { label: '$M$ (المساحة)', value: 'π/2' }, { label: '$M_x$', value: '2/3' }, { label: '$\\bar y = 4/3\\pi$', value: fmt(4 / (3 * Math.PI), 4), color: 'var(--red)' },
        ]} />
        <MathText as="div" className="verdict">{k === 'tri' ? 'المثال 3: الصفيحة تحت $y = 4 - 2x$. الشرائح الرأسية تعطي $M_y = \\int_0^2 x(4 - 2x)\\,dx = \\tfrac83$، والأفقية تعطي $M_x = \\int_0^4 y\\cdot\\tfrac12(4 - y)\\,dy = \\tfrac{16}{3}$. **هذا مركز المثلث**: لن تنقلب الصفيحة إن استندت عليه.' : 'المثال 4: $M_y = 0$ بالتماثل. و $M_x = \\int_0^1 y\\cdot 2\\sqrt{1 - y^2}\\,dy = \\tfrac23$. فـ $\\bar y = \\dfrac{2/3}{\\pi/2} = \\dfrac{4}{3\\pi} \\approx 0.42$، **أقل من النصف** (الخط المتقطع) لأن أسفل نصف الدائرة أعرض من أعلاه.'}</MathText>
      </>}
    </Widget>
  );
}
