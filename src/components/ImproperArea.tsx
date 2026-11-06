import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

/** 7.5 — التكاملات المعتلة: مساحة 1/x^p نحو اللانهاية تنتهي إذا p > 1، وقرب الصفر تنتهي إذا p < 1. والحد p = 1 يتباعد في الجهتين. */
export default function ImproperArea() {
  const [side, setSide] = useState<'inf' | 'zero'>('inf');
  const [p, setP] = useState(2);
  const [lg, setLg] = useState(1); // log10 of b (أو −log10 of a)
  const end = side === 'inf' ? 10 ** lg : 10 ** -lg;
  const F = (x: number) => (Math.abs(p - 1) < 1e-9 ? Math.log(x) : x ** (1 - p) / (1 - p));
  const area = side === 'inf' ? F(end) - F(1) : F(1) - F(end);
  const limit = side === 'inf' ? (p > 1 ? 1 / (p - 1) : Infinity) : p < 1 ? 1 / (1 - p) : Infinity;
  const ref = usePlot(side === 'inf' ? { xMin: -0.2, xMax: 12, yMin: -0.1, yMax: 1.6 } : { xMin: -0.05, xMax: 1.25, yMin: -0.2, yMax: 10 }, (pl) => {
    pl.axes({ xLabel: 'x' });
    const f = (x: number) => x ** -p;
    if (side === 'inf') pl.fillUnder(f, 1, Math.min(end, 12), pl.c.area, 0.4);
    else pl.fillUnder(f, Math.max(end, 0.002), 1, pl.c.area, 0.4);
    pl.fn(f, pl.c.f1, { width: 3, from: side === 'inf' ? 0.6 : 0.01, to: side === 'inf' ? 12 : 1.25 });
    pl.fn((x) => 1 / x, pl.c['ink-3'], { width: 1.2, dash: [4, 4], from: side === 'inf' ? 0.6 : 0.08, to: side === 'inf' ? 12 : 1.25 });
    pl.line(1, -0.1, 1, side === 'inf' ? 1.6 : 10, pl.c['ink-3'], { width: 1, dash: [2, 3] });
  }, [side, p, lg]);
  return (
    <Widget title="مساحة لانهائية أم منتهية؟" hint="الأزرق $y = 1/x^p$، والمتقطع $1/x$ (الحد الفاصل $p = 1$). **نحو اللانهاية** (من 1 إلى $b$): كلما كبر $p$ هبط الرسم أسرع، والمساحة تنتهي إذا $p \gt 1$. **قرب الصفر** (من $a$ إلى 1): الرسم يصعد على المحور، والمساحة تنتهي إذا $p \lt 1$. دفع الحد بعيداً هو التعريف الدقيق: نهاية تكاملات عادية.">
      <Choice value={side} onChange={(v) => { setSide(v); setP(v === 'inf' ? 2 : 0.5); }} options={[{ v: 'inf', label: 'نحو اللانهاية' }, { v: 'zero', label: 'قرب الصفر' }]} />
      <Canvas refEl={ref} ratio={0.55} label="المساحة تحت 1/x^p" />
      <div className="controls">
        <Slider label="$p$" value={p} min={0.2} max={3} step={0.01} onChange={setP} show={(v) => fmt(v, 2)} color="var(--f1)" />
        <Slider label={side === 'inf' ? '$\\log_{10} b$' : '$-\\log_{10} a$'} value={lg} min={0} max={12} step={0.05} onChange={setLg} show={(v) => fmt(v, 1)} color="var(--area)" />
      </div>
      <Readout items={[
        { label: side === 'inf' ? '$b$' : '$a$', value: end.toExponential(1) },
        { label: 'المساحة حتى الآن', value: fmt(area, 4), color: 'var(--area)' },
        { label: 'النهاية', value: Number.isFinite(limit) ? fmt(limit, 4) : '∞ (تتباعد)', color: Number.isFinite(limit) ? 'var(--f1)' : 'var(--red)' },
      ]} />
      <MathText as="div" className="verdict">{Math.abs(p - 1) < 0.005 ? '**$p = 1$ على جهة التباعد تماماً.** المساحة $\\ln b$ تبلغ اللانهاية، لكن ببطء شديد: مع $b = 10^{12}$ ما زالت نحو 28 فقط.' : side === 'inf' ? (p > 1 ? `المساحة تقترب من $\\dfrac{1}{p - 1} = ${fmt(1 / (p - 1), 3)}$. **المنطقة لانهائية لكن مساحتها منتهية.**` : 'مع $p \\lt 1$ يهبط الرسم ببطء شديد، **والمساحة لانهائية**: $\\dfrac{b^{1-p} - 1}{1 - p} \\to \\infty$.') : p < 1 ? `المساحة تقترب من $\\dfrac{1}{1 - p} = ${fmt(1 / (1 - p), 3)}$. مع $p = \\tfrac12$: $\\int_0^1 dx/\\sqrt x = 2$.` : 'مع $p \\gt 1$ يصعد الرسم بسرعة كبيرة قرب الصفر، **والمساحة لانهائية**.'}</MathText>
    </Widget>
  );
}
