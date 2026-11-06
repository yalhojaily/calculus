import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type K = 'spring' | 'gravity' | 'dam';

/** 8.6 — الشغل ∫F dx: نابض (المساحة تحت kx)، جاذبية (حتى اللانهاية)، وقوة الماء على سدّ (شرائح أفقية). */
export default function ForceWork() {
  const [k, setK] = useState<K>('spring');
  const [x, setX] = useState(1);
  const [kk, setKk] = useState(20);
  const [x0, setX0] = useState(1.5);
  const [depth, setDepth] = useState(20);
  const spring = usePlot({ xMin: -0.15, xMax: 3.2, yMin: -4, yMax: Math.max(kk * 3, 10) * 1.05 }, (p) => {
    p.axes({ xLabel: 'x (ft)', yLabel: 'F (lb)' });
    p.fillUnder((t) => kk * t, 0, x, p.c.area, 0.45);
    p.fn((t) => kk * t, p.c.f1, { width: 3, from: 0, to: 3 });
    p.line(x, 0, x, kk * x, p.c.f2, { width: 2 });
  }, [kk, x]);
  const grav = usePlot({ xMin: 0, xMax: 10, yMin: -0.03, yMax: 1.1 }, (p) => {
    p.axes({ xLabel: 'x / R', yLabel: 'F' });
    p.fillUnder((t) => 1 / (t * t), x0, 10, p.c.area, 0.45);
    p.fn((t) => 1 / (t * t), p.c.f1, { width: 3, from: 1, to: 10 });
    p.line(x0, 0, x0, 1 / (x0 * x0), p.c.f2, { width: 2 });
    p.line(1, 0, 1, 1, p.c['ink-3'], { width: 1, dash: [3, 3] });
  }, [x0]);
  const dam = usePlot({ xMin: -36, xMax: 36, yMin: -2, yMax: 24 }, (p) => {
    const H = 20; // ارتفاع السد
    const len = (h: number) => 60 - h / 2; // h العمق من السطح
    const surf = H, ctx = p.ctx;
    ctx.beginPath(); ctx.moveTo(p.X(-30), p.Y(H)); ctx.lineTo(p.X(30), p.Y(H)); ctx.lineTo(p.X(25), p.Y(0)); ctx.lineTo(p.X(-25), p.Y(0)); ctx.closePath();
    ctx.strokeStyle = p.c.ink; ctx.lineWidth = 2; ctx.stroke();
    const nS = 12;
    for (let i = 0; i < nS; i++) {
      const h0 = (depth * i) / nS, h1 = (depth * (i + 1)) / nS, hm = (h0 + h1) / 2, l = len(hm);
      const y0 = surf - h1, y1 = surf - h0;
      if (y0 < 0) continue;
      p.rect(-l / 2, y0, l / 2, y1, p.c.f1, { alpha: 0.12 + (0.6 * hm) / 20, stroke: true });
    }
    p.text('surface', 0, surf, p.c.f1, { align: 'center', base: 'bottom', dy: -4 });
  }, [depth]);
  const w = 62;
  const F = w * (30 * depth * depth - depth ** 3 / 6); // ∫₀^D w h (60 − h/2) dh
  return (
    <Widget title="القوة والشغل" hint="الشغل قوة ضرب مسافة. **حين تتغير القوة نكامل**: $W = \int F(x)\,dx$، المساحة تحت منحنى القوة. والضغط في الماء $wh$ يزيد مع العمق، فالقوة على جدار سدّ تُجمع من شرائح أفقية: $F = \int w\,h\,l(h)\,dh$.">
      <Choice value={k} onChange={setK} options={[{ v: 'spring', label: 'نابض' }, { v: 'gravity', label: 'جاذبية' }, { v: 'dam', label: 'سدّ' }]} />
      {k === 'spring' && <>
        <Canvas refEl={spring} ratio={0.5} label="قوة النابض والشغل" />
        <div className="controls">
          <Slider label="$k$ (رطل/قدم)" value={kk} min={5} max={40} step={1} onChange={setKk} />
          <Slider label="المطّ $x$ (قدم)" value={x} min={0} max={3} step={0.01} onChange={setX} show={(v) => fmt(v, 2)} color="var(--f2)" />
        </div>
        <Readout items={[
          { label: '$F = kx$', value: `${fmt(kk * x, 2)} lb`, color: 'var(--f2)' },
          { label: '$W = \\tfrac12 kx^2$', value: `${fmt(0.5 * kk * x * x, 2)} ft·lb`, color: 'var(--area)' },
          { label: '$kx \\cdot x$ (خطأ)', value: fmt(kk * x * x, 2) },
        ]} />
        <MathText as="div" className="verdict">{'المثال 1: قوة 20 رطلاً تمطّ النابض قدماً واحدة، فـ $k = 20$ و $W = \\tfrac12(20)(1)^2 = 10$ قدم-رطل. **الشغل ليس $kx$ ضرب $x$**: القوة تتغير، فالشغل مساحة مثلث. والطاقة الكامنة $V = \\tfrac12 kx^2$ هي التكامل غير المحدد.'}</MathText>
      </>}
      {k === 'gravity' && <>
        <Canvas refEl={grav} ratio={0.5} label="قوة الجاذبية والشغل إلى اللانهاية" />
        <div className="controls">
          <Slider label="البداية $x_0$ (بأنصاف أقطار الأرض)" value={x0} min={1} max={6} step={0.01} onChange={setX0} show={(v) => fmt(v, 2)} color="var(--f2)" />
        </div>
        <Readout items={[
          { label: 'الشغل إلى $\\infty$ (بوحدة $GMm/R$)', value: fmt(1 / x0, 4), color: 'var(--area)' },
        ]} />
        <MathText as="div" className="verdict">{'المثال 2: قوة الجاذبية $GMm/x^2$ وجهدها $V = -GMm/x$. حمل جسم إلى اللانهاية **بقوة ثابتة يتطلب شغلاً لانهائياً**. مع القوة الصحيحة (المتناقصة) الشغل $GMm/x_0$: **مساحة منتهية لمنطقة لانهائية** (القسم 7.5).'}</MathText>
      </>}
      {k === 'dam' && <>
        <Canvas refEl={dam} ratio={0.45} label="ضغط الماء على سدّ بشرائح أفقية" />
        <div className="controls">
          <Slider label="عمق الماء (قدم)" value={depth} min={1} max={20} step={0.5} onChange={setDepth} show={(v) => fmt(v, 1)} color="var(--f1)" />
        </div>
        <Readout items={[
          { label: 'طول السد عند العمق $h$', value: '$l = 60 - \\tfrac12 h$' },
          { label: 'القوة الكلية (رطل)', value: fmt(F, 0), color: 'var(--f1)' },
        ]} />
        <MathText as="div" className="verdict">{'المثال 4: سدّ شبه منحرف، عرضه 60 عند السطح و 50 عند عمق 20. **الشرائح الأعمق أغمق لأن الضغط $wh$ أكبر هناك.** القوة $\\int_0^{20} wh\\left(60 - \\tfrac12 h\\right)dh = 12000w - \\tfrac16(8000)w$، مع $w = 62$ رطلاً للقدم المكعب.'}</MathText>
      </>}
    </Widget>
  );
}
