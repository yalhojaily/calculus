import { useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

const fs: Record<string, { label: string; sing: [number, number][]; note: string }> = {
  bell: { label: '$1/(1 + x^2)$', sing: [[0, 1], [0, -1]], note: 'الدالة لا تفشل على المحور الحقيقي، لكنها تنفجر عند $\\pm i$ لأن $1 + i^2 = 0$. **الدائرة حول $a$ تمتد حتى $\\pm i$**، فنصف القطر $\\sqrt{1 + a^2}$: 1 حول الصفر، و $\\sqrt{10}$ حول $a = 3$.' },
  geo: { label: '$1/(1 - x)$', sing: [[1, 0]], note: 'التفرد الوحيد عند $x = 1$. حول $a = 0$ نصف القطر 1، وحول $a$ هو $|1 - a|$. **والدالة سليمة بعد 1، لكن المتسلسلة لا تستطيع تجاوز نقطة الفشل.**' },
  ln: { label: '$\\ln(1 + x)$', sing: [[-1, 0]], note: '$\\ln(1 + x)$ تنفجر عند $x = -1$، فـ $x - \\tfrac12x^2 + \\tfrac13x^3 - \\cdots$ لها $r = 1$ حول الصفر. مشتقتها $1/(1 + x)$ وتكاملها لهما **نصف القطر نفسه**.' },
  two: { label: '$4/(2 - x)$', sing: [[2, 0]], note: 'تمرين القراءة: $f = 4/(2 - x)$ تفشل عند $x = 2$، فـ $r = 2$ حول الصفر، و $r = 3$ حول $a = 5$.' },
};

/** 10.5 — دائرة التقارب: تمتد من الأساس a إلى أقرب نقطة تفشل فيها الدالة، حقيقية أو مركبة. */
export default function ConvergenceRadius() {
  const [k, setK] = useState('bell');
  const [a, setA] = useState(0);
  const F = fs[k];
  const r = Math.min(...F.sing.map(([x, y]) => Math.hypot(x - a, y)));
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -4.2, 5.2, -3.4, 3.4);
    p.axes({ xLabel: 'Re', yLabel: 'Im' });
    const ctx = p.ctx; ctx.beginPath(); ctx.arc(p.X(a), p.Y(0), p.X(r) - p.X(0), 0, 2 * Math.PI);
    ctx.fillStyle = p.c.area; ctx.globalAlpha = 0.15; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = p.c.area; ctx.lineWidth = 2; ctx.stroke();
    p.line(a - r, 0, a + r, 0, p.c.f2, { width: 5 });
    F.sing.forEach(([x, y]) => { p.line(a, 0, x, y, p.c['ink-3'], { width: 1, dash: [4, 3] }); p.point(x, y, p.c.red, 7); p.text('×', x, y, '#fff', { align: 'center', base: 'middle', size: 12, italic: false }); });
    p.point(a, 0, p.c.ink, 5);
    p.text('a', a, 0, p.c.ink, { align: 'center', base: 'top', dy: 6 });
  }, [k, a]);
  return (
    <Widget title="دائرة التقارب" hint="**الأعداد المركبة تحرّك الخيوط من وراء الستار.** متسلسلة القوى حول الأساس $a$ تتقارب داخل دائرة تمتد إلى **أقرب نقطة تفشل فيها الدالة** (الحمراء)، حقيقية أو تخيلية أو مركبة. ولهذا نسمّي $r$ «نصف قطر». الخط البرتقالي فترة التقارب الحقيقية $a - r \lt x \lt a + r$.">
      <Choice value={k} onChange={(v) => { setK(v); setA(0); }} options={Object.keys(fs).map((v) => ({ v, label: fs[v].label }))} />
      <Canvas refEl={ref} ratio={0.7} label="دائرة التقارب في المستوى المركب" />
      <div className="controls"><Slider label="الأساس $a$" value={a} min={-3.5} max={5} step={0.05} onChange={setA} show={(v) => fmt(v, 2)} /></div>
      <Readout items={[
        { label: 'نصف قطر التقارب $r$', value: fmt(r, 4), color: 'var(--area)' },
        { label: 'فترة التقارب', value: `${fmt(a - r, 3)} < x < ${fmt(a + r, 3)}`, color: 'var(--f2)' },
      ]} />
      <MathText as="div" className="verdict">{F.note}</MathText>
    </Widget>
  );
}
