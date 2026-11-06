import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

const STEPS = [1, 2, 4, 12, 52, 365, 8760, 525600];
const NAMES = ['مرة في السنة', 'كل نصف سنة', 'كل ربع سنة', 'كل شهر', 'كل أسبوع', 'كل يوم', 'كل ساعة', 'كل دقيقة'];

/** 0.3 — الفائدة المركّبة: (1 + 1/N)ᴺ تقترب من e، والدرج يقترب من المنحنى eˣ. */
export default function Compound() {
  const [i, setI] = useState(3);
  const N = STEPS[i];
  const view = { xMin: -0.05, xMax: 1.08, yMin: 0.8, yMax: 2.9 };
  const ref = usePlot(view, (p) => {
    p.axes({ xLabel: 'السنة', yLabel: '$', xStep: 0.25, yStep: 0.5 });
    p.fn(Math.exp, p.c.f1, { from: 0, to: 1, width: 2.4 });
    // طريقة أويلر: كل خطوة تضرب في (1 + 1/N)
    const drawN = Math.min(N, 400);
    let y = 1;
    for (let k = 0; k < drawN; k++) {
      const a = k / drawN;
      const b = (k + 1) / drawN;
      const ny = y * (1 + 1 / N) ** (N / drawN);
      p.line(a, y, b, y, p.c.f2, { width: 2.4 });
      p.line(b, y, b, ny, p.c.f2, { width: 1.4 });
      y = ny;
    }
    p.line(1, view.yMin, 1, view.yMax, p.c['ink-3'], { width: 1, dash: [4, 4] });
    p.point(1, (1 + 1 / N) ** N, p.c.f2);
    p.point(1, Math.E, p.c.f1, 4);
    p.text('e = 2.71828…', 1, Math.E, p.c.f1, { align: 'right', dx: -8, dy: -4 });
  }, [N]);

  const v = (1 + 1 / N) ** N;
  return (
    <Widget title="ريال واحد بفائدة 100% — كم مرة تُضاف الفائدة؟" hint="الدرج البرتقالي: في كل خطوة تُضاف الفائدة فيكبر المبلغ، وتُحسب الفائدة التالية على المبلغ الأكبر. هذا هو حل $\frac{\Delta Y}{\Delta x} = Y$ بخطوات صغيرة، وفي النهاية يصبح $\frac{dy}{dx} = y$.">
      <Canvas refEl={ref} label="الفائدة المركبة مقابل e^x" />
      <div className="controls">
        <Slider label="تُضاف الفائدة" value={i} min={0} max={STEPS.length - 1} step={1} onChange={setI} show={(k) => NAMES[k]} color="var(--f2)" />
      </div>
      <Readout
        items={[
          { label: 'عدد المرات $N$', value: N.toLocaleString('en') },
          { label: 'المبلغ آخر السنة $(1 + \\frac1N)^N$', value: fmt(v, 6), color: 'var(--f2)' },
          { label: 'الحد: العدد $e$', value: fmt(Math.E, 6), color: 'var(--f1)' },
          { label: 'الفرق', value: fmt(Math.E - v, 6) },
        ]}
      />
    </Widget>
  );
}
