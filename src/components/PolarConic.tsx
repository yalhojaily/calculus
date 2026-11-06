import { useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual, polarCurve } from '../lib/polar';
import { MathText } from './MathText';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

/** 9.2 — القطوع المخروطية r = A/(1 + e cos θ): البؤرة في الأصل، والدليل x = A/e، و PF = e·Pd. */
export default function PolarConic() {
  const [e, setE] = useState(0.5);
  const [th, setTh] = useState(2);
  const A = 1;
  const F = (t: number) => A / (1 + e * Math.cos(t));
  const r = F(th);
  const ok = 1 + e * Math.cos(th) > 0.02;
  const x = r * Math.cos(th), y = r * Math.sin(th);
  const dx = e > 0 ? A / e : Infinity;
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -3.2, 2.4, -2.5, 2.5);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    // الفرع الموجب (r > 0) بالأزرق، والفرع الثاني للقطع الزائد (r < 0) بالأحمر
    polarCurve(p, (t) => { const d = 1 + e * Math.cos(t); return Math.abs(d) < 0.01 ? NaN : A / d; }, -Math.PI, Math.PI, p.c.f1, p.c.red, { width: 2.8, n: 1600 });
    if (e > 0 && dx < 6) p.line(dx, p.view.yMin, dx, p.view.yMax, p.c.violet, { width: 2, dash: [6, 4] });
    p.point(0, 0, p.c.ink, 5);
    p.text('F', 0, 0, p.c.ink, { align: 'right', base: 'top', dx: -4, dy: 3 });
    if (ok) {
      p.line(0, 0, x, y, p.c.f2, { width: 2.4 });
      if (e > 0 && dx < 6) p.line(x, y, dx, y, p.c.area, { width: 2.4 });
      p.point(x, y, p.c.f2, 6);
      p.text('P', x, y, p.c.f2, { align: 'left', base: 'bottom', dx: 5, dy: -4 });
    }
  }, [e, th]);
  const kind = e === 0 ? 'دائرة' : e < 1 ? 'قطع ناقص' : Math.abs(e - 1) < 1e-9 ? 'قطع مكافئ' : 'قطع زائد';
  const PF = Math.abs(r), Pd = Math.abs(dx - x);
  return (
    <Widget title="القطوع المخروطية بالإحداثيات القطبية" hint="**9A:** $r = \dfrac{A}{1 + e\cos\theta}$ قطع مخروطي «اختلافه المركزي» $e$، وإحدى بؤرتيه في الأصل $F$. حرّك $e$ من 0 إلى 2: دائرة، ثم قطع ناقص، ثم قطع مكافئ عند $e = 1$ بالضبط، ثم قطع زائد. الخط المتقطع البنفسجي **الدليل** $x = A/e$.">
      <Canvas refEl={ref} ratio={0.75} label="قطع مخروطي بؤرته في الأصل ودليله" />
      <div className="controls">
        <Slider label="$e$" value={e} min={0} max={2} step={0.05} onChange={setE} show={(v) => fmt(v, 2)} color="var(--f1)" />
        <Slider label="$\theta$ للنقطة $P$" value={th} min={-Math.PI} max={Math.PI} step={0.01} onChange={setTh} show={(v) => `${fmt((v * 180) / Math.PI, 0)}°`} color="var(--f2)" />
      </div>
      <Readout items={[
        { label: 'النوع', value: kind },
        { label: '$PF = r$', value: ok ? fmt(PF, 3) : '∞', color: 'var(--f2)' },
        { label: 'البعد إلى الدليل $Pd$', value: ok && e > 0 ? fmt(Pd, 3) : '—', color: 'var(--area)' },
        { label: '$PF / Pd$', value: ok && e > 0 ? fmt(PF / Pd, 3) : '—' },
      ]} />
      <MathText as="div" className="verdict">{'**كل نقطة $P$ على المنحنى تحقق $PF = e\\cdot Pd$**: البعد إلى البؤرة $e$ مرة البعد إلى الدليل. البرهان سطر واحد: $r(1 + e\\cos\\theta) = A$ يعني $r = A - ex = e\\left(\\tfrac Ae - x\\right)$. «الشمس في الأصل ليست مركز النظام بل بؤرته»: هذه المعادلات تطابق الكواكب تماماً.'}</MathText>
    </Widget>
  );
}
