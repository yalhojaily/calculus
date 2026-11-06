import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

/** 1.6 — النقاط (n, sin n) للأعداد الصحيحة n: تبدو كأنها 44 منحنى جيب، أو سداسيات، حسب المقياس. */
export default function SinN() {
  const [N, setN] = useState(10000);
  const [hl, setHl] = useState<'none' | 'mid'>('none');
  const [squash, setSquash] = useState(1);
  const view = { xMin: -N * 0.01, xMax: N * 1.01, yMin: -1.15, yMax: 1.15 };
  const ref = usePlot(view, (p) => {
    p.axes({ xLabel: 'n', yLabel: '', yStep: 0.5 });
    const { ctx } = p;
    const r = N > 3000 ? 0.9 : N > 600 ? 1.3 : 2.2;
    ctx.fillStyle = p.c.f1;
    for (let n = 0; n <= N; n++) {
      ctx.fillRect(p.X(n) - r / 2, p.Y(Math.sin(n)) - r / 2, r, r);
    }
    if (hl === 'mid') {
      ctx.fillStyle = p.c.f2;
      for (let n = 0; n <= N; n += 44) {
        ctx.beginPath();
        ctx.arc(p.X(n), p.Y(Math.sin(n)), 3, 0, 7);
        ctx.fill();
      }
      p.fn((x) => Math.sin((Math.PI * x) / 7810), p.c.f2, { width: 1, dash: [3, 4], from: 0, to: N });
    }
  }, [N, hl, squash]);

  return (
    <Widget title="ألف نقطة من الضوء: y = sin n" hint="كل نقطة هي $(n, \sin n)$ لعدد صحيح $n$. بـ $10{,}000$ نقطة تبدو كأنها $44$ منحنى جيب، وبـ $1{,}000$ يرى أغلب الناس سداسيات، مع أنها النقاط نفسها. «ضغط» الرسم أفقياً يشبه النظر إلى الرسم الثاني من زاوية ضيقة.">
      <Choice value={hl} onChange={setHl} options={[{ v: 'none', label: 'كل النقاط' }, { v: 'mid', label: 'أبرز المنحنى الأوسط $n = 44k$' }]} />
      <div className="cv" style={{ aspectRatio: `${1 / (0.62 * squash)}` }}>
        <canvas ref={ref} role="img" aria-label="رسم النقاط n, sin n" />
      </div>
      <div className="controls">
        <Slider label="عدد النقاط $N$" value={N} min={100} max={10000} step={100} onChange={setN} show={(v) => v.toLocaleString('en')} color="var(--f1)" />
        <Slider label="الارتفاع" value={squash} min={0.35} max={1.4} step={0.05} onChange={setSquash} show={(v) => `×${fmt(v)}`} />
      </div>
      <Readout items={[
        { label: '$\\sin 22$ (لأن $22/7 \\approx \\pi$)', value: fmt(Math.sin(22), 4), color: 'var(--f2)' },
        { label: '$\\sin 44$', value: fmt(Math.sin(44), 4), color: 'var(--f2)' },
        { label: '$44 - 14\\pi$', value: fmt(44 - 14 * Math.PI, 4) },
        { label: '$\\sin 11$', value: fmt(Math.sin(11), 5) },
      ]} />
    </Widget>
  );
}
