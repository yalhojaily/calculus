import { useState } from 'react';
import { type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Widget, usePlot } from './ui';

interface Fn { label: string; f: (x: number) => number; d1: (x: number) => number; d2: (x: number) => number; view: View; asym: { v?: number[]; h?: number; s?: [number, number] }; note: string }

const fns: Record<string, Fn> = {
  ex1: { label: '$\\dfrac{x^2}{1 - x^2}$', f: (x) => x * x / (1 - x * x), d1: (x) => 2 * x / (1 - x * x) ** 2, d2: (x) => (2 + 6 * x * x) / (1 - x * x) ** 3, view: { xMin: -4, xMax: 4, yMin: -5, yMax: 5 }, asym: { v: [-1, 1], h: -1 }, note: 'زوجية (متماثلة حول المحور $y$). خطّا تقارب رأسيان $x = \\pm1$ حيث المقام صفر، وأفقي $y = -1$ لأن $x^2/(-x^2) \\to -1$. قاع محلّي عند $0$، ولا نقاط انقلاب لأن $f\'\'$ لا تنعدم.' },
  ex2: { label: '$\\dfrac{x^2}{x - 1}$', f: (x) => x * x / (x - 1), d1: (x) => (x * x - 2 * x) / (x - 1) ** 2, d2: (x) => 2 / (x - 1) ** 3, view: { xMin: -4, xMax: 6, yMin: -10, yMax: 12 }, asym: { v: [1], s: [1, 1] }, note: 'خط تقارب رأسي $x = 1$. وبالقسمة: $\\dfrac{x^2}{x - 1} = x + 1 + \\dfrac{1}{x - 1}$، فخط التقارب **المائل** $y = x + 1$. قاع محلّي عند $x = 2$ وقمة عند $x = 0$.' },
  ex3: { label: '$\\sin x + \\tfrac13 \\sin 3x$', f: (x) => Math.sin(x) + Math.sin(3 * x) / 3, d1: (x) => Math.cos(x) + Math.cos(3 * x), d2: (x) => -Math.sin(x) - 3 * Math.sin(3 * x), view: { xMin: -Math.PI, xMax: Math.PI, yMin: -1.5, yMax: 1.5 }, asym: {}, note: 'دورية (دورتها $2\\pi$) وفردية (متماثلة حول نقطة الأصل). نقاط السكون $\\pi/4, \\pi/2, 3\\pi/4$ متساوية التباعد، وقيمها $\\tfrac{\\sqrt8}{3}$ (قمة) و $\\tfrac23$ (قاع محلّي) و $\\tfrac{\\sqrt8}{3}$ (قمة).' },
};

/** 3.4 — تشريح رسم: إشارات f و f' و f'' كأشرطة ملونة تحت الرسم، مع خطوط التقارب. */
export default function GraphAnatomy() {
  const [k, setK] = useState('ex1');
  const F = fns[k];
  const ref = usePlot(F.view, (p) => {
    p.axes();
    const { ctx } = p;
    // أشرطة الإشارات في أسفل الرسم
    const bands: [string, (x: number) => number, string, string][] = [
      ['f', F.f, p.c.f1, p.c.red], ["f'", F.d1, p.c.area, p.c.red], ["f''", F.d2, p.c.violet, p.c.f2],
    ];
    const H = 9, y0 = p.h - p.pad.b - 3 * (H + 3) - 2;
    bands.forEach(([name, g, pos, neg], i) => {
      for (let px = p.pad.l; px < p.w - p.pad.r; px++) {
        const v = g(p.invX(px));
        if (!Number.isFinite(v) || Math.abs(v) > 1e6) continue;
        ctx.fillStyle = v > 0 ? pos : neg;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(px, y0 + i * (H + 3), 1, H);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = p.c['ink-2'];
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, p.pad.l + 2, y0 + i * (H + 3) + H / 2);
    });
    for (const v of F.asym.v ?? []) p.line(v, F.view.yMin, v, F.view.yMax, p.c['ink-3'], { width: 1.2, dash: [6, 5] });
    if (F.asym.h !== undefined) p.line(F.view.xMin, F.asym.h, F.view.xMax, F.asym.h, p.c['ink-3'], { width: 1.2, dash: [6, 5] });
    if (F.asym.s) p.lineThrough(0, F.asym.s[1], F.asym.s[0], p.c['ink-3'], { width: 1.2, dash: [6, 5] });
    p.fn(F.f, p.c.f1, { width: 3 });
  }, [k]);
  return (
    <Widget title="تشريح رسم: الإشارات وخطوط التقارب" hint="الأشرطة الثلاثة أسفل الرسم: إشارة $f$ (فوق المحور أم تحته)، وإشارة $f'$ (أخضر: صاعدة)، وإشارة $f''$ (بنفسجي: مقعّرة للأعلى). حيث يتغيّر لون شريط يقع حدث خاص: تقاطع مع المحور، أو قمة أو قاع، أو نقطة انقلاب. والخطوط المتقطعة **خطوط تقارب**.">
      <Choice value={k} onChange={setK} options={Object.entries(fns).map(([v, f]) => ({ v, label: f.label }))} />
      <Canvas refEl={ref} ratio={0.7} label="رسم الدالة مع أشرطة الإشارات" />
      <MathText as="div" className="verdict">{F.note}</MathText>
    </Widget>
  );
}
