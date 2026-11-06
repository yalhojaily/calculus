import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

/** 6.1 / 6.2 — ميل bˣ عند الصفر هو c = ln b، والأساس الذي يجعل c = 1 هو e. */
export default function ExpSlope() {
  const [b, setB] = useState(2);
  const [h, setH] = useState(0.1);
  const c = Math.log(b);
  const ratio = (b ** h - 1) / h;
  const ref = usePlot({ xMin: -2.2, xMax: 2.2, yMin: -1.6, yMax: 4.4 }, (p) => {
    p.axes({ xLabel: 'x', yLabel: 'y' });
    p.line(-2.2, -2.2, 4.4, 4.4, p.c['ink-3'], { width: 1, dash: [4, 5] });
    p.fn((x) => Math.E ** x, p.c['ink-3'], { width: 1.2, dash: [2, 4] });
    p.fn((x) => b ** x, p.c.f1, { width: 3 });
    // اللوغاريتم: صورة المرآة
    p.curve((y) => Math.log(y) / c, (y) => y, 0.02, 4.4, p.c.violet, { width: 2 });
    p.lineThrough(0, 1, c, p.c.f2, { width: 2 });
    p.line(0, 1, h, b ** h, p.c.red, { width: 2 });
    p.point(0, 1, p.c.f2, 5);
    p.point(h, b ** h, p.c.red, 4);
  }, [b, h]);
  const near = Math.abs(c - 1) < 0.004;
  return (
    <Widget title="ما الأساس الذي يبدأ بميل 1؟" hint="الأزرق $y = b^x$، والبرتقالي مماسه عند $x = 0$، وميله $c$. الأحمر قاطع من $0$ إلى $h$، ميله $\dfrac{b^h - 1}{h}$: **هذه النهاية هي $c$**. والبنفسجي صورة المرآة، $x = \log_b y$، وميله عند $y = 1$ هو $1/c$. حرّك $b$ حتى يصير $c = 1$: هناك $b = e$ (المنحنى المنقّط).">
      <Canvas refEl={ref} ratio={0.7} label="الدالة الأسية وميلها عند الصفر" />
      <div className="controls">
        <Slider label="الأساس $b$" value={b} min={1.2} max={4} step={0.001} onChange={setB} show={(v) => fmt(v, 3)} color="var(--f1)" />
        <Slider label="$h$" value={h} min={0.001} max={1} step={0.001} onChange={setH} show={(v) => fmt(v, 3)} color="var(--red)" />
      </div>
      <Readout items={[
        { label: '$\\dfrac{b^h - 1}{h}$', value: fmt(ratio, 5), color: 'var(--red)' },
        { label: '$c = \\ln b$', value: fmt(c, 5), color: 'var(--f2)' },
        { label: '$1/c$ (ميل اللوغاريتم)', value: fmt(1 / c, 4), color: 'var(--violet)' },
      ]} />
      <MathText as="div" className="verdict">{near ? '**وجدتها!** $b \\approx 2.718$: هذا هو $e$. ميل $e^x$ عند الصفر 1، فمشتقة $e^x$ هي $e^x$ نفسها.' : b < Math.E ? `مع $b = ${fmt(b, 2)}$ يبدأ الميل أقل من 1. **زِد الأساس.** (لـ $2^x$ الميل $0.693\\ldots$)` : `مع $b = ${fmt(b, 2)}$ يبدأ الميل أكبر من 1. **أنقص الأساس.**`}</MathText>
    </Widget>
  );
}
