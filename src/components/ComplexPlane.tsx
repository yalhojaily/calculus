import { useState } from 'react';
import { fmt } from '../lib/plot';
import { angleArc, fitEqual, polarGrid } from '../lib/polar';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

type K = 'mul' | 'roots';
const deg = (t: number) => `${fmt((t * 180) / Math.PI, 0)}°`;
const cx = (x: number, y: number) => `${fmt(x, 2)} ${y < 0 ? '−' : '+'} ${fmt(Math.abs(y), 2)}i`;

/** 9.4 — المستوى المركب: الجمع بـ x و y (متوازي أضلاع)، والضرب بـ r و θ (الأطوال تُضرب والزوايا تُجمع). وجذور الواحد. */
export default function ComplexPlane() {
  const [k, setK] = useState<K>('mul');
  const [r1, setR1] = useState(Math.SQRT2);
  const [t1, setT1] = useState(Math.PI / 4);
  const [r2, setR2] = useState(1.5);
  const [t2, setT2] = useState(Math.PI / 3);
  const [n, setN] = useState(8);
  const clock = useClock(8, { loop: false });
  const z1 = [r1 * Math.cos(t1), r1 * Math.sin(t1)], z2 = [r2 * Math.cos(t2), r2 * Math.sin(t2)];
  const pr = [r1 * r2 * Math.cos(t1 + t2), r1 * r2 * Math.sin(t1 + t2)], sm = [z1[0] + z2[0], z1[1] + z2[1]];
  const shown = Math.min(n, Math.floor(clock.t * (n + 0.999)) + 1); // كم قوة ظهرت
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    if (k === 'mul') {
      fitEqual(p, -4.3, 4.3, -4.3, 4.3);
      polarGrid(p, 6, 1);
      p.text('Re', 4.2, 0, p.c['ink-3'], { align: 'right', base: 'bottom', dy: -2 }); p.text('Im', 0, 4.2, p.c['ink-3'], { align: 'left', base: 'top', dx: 4 });
      // الجمع: متوازي أضلاع
      p.line(z1[0], z1[1], sm[0], sm[1], p.c['ink-3'], { width: 1, dash: [4, 3] }); p.line(z2[0], z2[1], sm[0], sm[1], p.c['ink-3'], { width: 1, dash: [4, 3] });
      p.arrow(0, 0, sm[0], sm[1], p.c.area, { width: 2 });
      p.arrow(0, 0, z1[0], z1[1], p.c.f1); p.arrow(0, 0, z2[0], z2[1], p.c.f2);
      p.arrow(0, 0, pr[0], pr[1], p.c.red, { width: 3 });
      angleArc(p, t1 + t2, 22, p.c.red);
      p.line(z1[0], z1[1], z1[0], -z1[1], p.c.f1, { width: 1, dash: [2, 4] }); p.point(z1[0], -z1[1], p.c.f1, 4);
      p.text('z', z1[0], z1[1], p.c.f1, { dx: 6, dy: -4 }); p.text('w', z2[0], z2[1], p.c.f2, { dx: 6, dy: -4 });
      p.text('zw', pr[0], pr[1], p.c.red, { dx: 6, dy: -4 }); p.text('z+w', sm[0], sm[1], p.c.area, { dx: 6, dy: -4 }); p.text('z̄', z1[0], -z1[1], p.c.f1, { dx: 6, dy: 12 });
    } else {
      fitEqual(p, -1.4, 1.4, -1.4, 1.4);
      polarGrid(p, 1.4, 1);
      const ctx = p.ctx; ctx.beginPath();
      for (let j = 0; j <= n; j++) { const a = (2 * Math.PI * j) / n; if (j) ctx.lineTo(p.X(Math.cos(a)), p.Y(Math.sin(a))); else ctx.moveTo(p.X(1), p.Y(0)); }
      ctx.strokeStyle = p.c.violet; ctx.globalAlpha = 0.4; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
      for (let j = 1; j <= shown; j++) {
        const a = (2 * Math.PI * j) / n, x = Math.cos(a), y = Math.sin(a);
        p.line(0, 0, x, y, j === shown ? p.c.red : p.c['ink-3'], { width: j === shown ? 2.4 : 1 });
        p.point(x, y, j === n ? p.c.area : j === 1 ? p.c.f2 : p.c.f1, j === n ? 7 : 5.5);
        p.text(j === 1 ? 'w' : j === n ? `w${sup(j)} = 1` : `w${sup(j)}`, x, y, p.c.ink, { align: x < -0.2 ? 'right' : 'left', base: y < 0 ? 'top' : 'bottom', dx: x < -0.2 ? -6 : 6, dy: y < 0 ? 4 : -4, size: 12 });
      }
    }
  }, [k, r1, t1, r2, t2, n, shown]);
  const w = (2 * Math.PI) / n;
  return (
    <Widget title="المستوى المركب" hint="العدد $x + iy$ هو النقطة $(x, y)$: $x$ على **المحور الحقيقي** و $y$ على **المحور التخيلي**. والقيمة المطلقة $|x + iy| = \sqrt{x^2 + y^2}$ هي $r$ القطبية. **اجمع بـ $x$ و $y$، واضرب بـ $r$ و $\theta$.**">
      <Choice value={k} onChange={setK} options={[{ v: 'mul', label: 'جمع وضرب' }, { v: 'roots', label: 'قوى وجذور الواحد' }]} />
      <Canvas refEl={ref} ratio={0.75} label="أعداد مركبة في المستوى" />
      {k === 'mul' ? <>
        <div className="controls">
          <Slider label="$|z|$" value={r1} min={0.2} max={2.5} step={0.01} onChange={setR1} show={(v) => fmt(v, 2)} color="var(--f1)" />
          <Slider label="زاوية $z$" value={t1} min={-Math.PI} max={Math.PI} step={Math.PI / 72} onChange={setT1} show={deg} color="var(--f1)" />
          <Slider label="$|w|$" value={r2} min={0.2} max={2.5} step={0.01} onChange={setR2} show={(v) => fmt(v, 2)} color="var(--f2)" />
          <Slider label="زاوية $w$" value={t2} min={-Math.PI} max={Math.PI} step={Math.PI / 72} onChange={setT2} show={deg} color="var(--f2)" />
        </div>
        <Readout items={[
          { label: '$z$', value: cx(z1[0], z1[1]), color: 'var(--f1)' },
          { label: '$w$', value: cx(z2[0], z2[1]), color: 'var(--f2)' },
          { label: '$z + w$', value: cx(sm[0], sm[1]), color: 'var(--area)' },
          { label: '$zw$', value: cx(pr[0], pr[1]), color: 'var(--red)' },
          { label: '$|zw| = |z||w|$', value: fmt(r1 * r2, 3), color: 'var(--red)' },
          { label: 'زاوية $zw$', value: `${deg(t1)} + ${deg(t2)}`, color: 'var(--red)' },
        ]} />
        <MathText as="div" className="verdict">{'**9D: الضرب يجمع الزوايا ويضرب الأطوال.** جرّب $z = w = 1 + i$ (الطول $\\sqrt2 \\approx 1.41$ والزاوية $45°$): مربعه $(1 + i)^2 = 1 + 2i - 1 = 2i$: الطول $2$ والزاوية $90°$. والمرافق $\\bar z$ (المنقط) صورة $z$ في مرآة المحور الحقيقي، و $z\\bar z = r^2$ حقيقي دائماً.'}</MathText>
      </> : <>
        <AnimControls clock={clock} label="اضرب في w مرة بعد مرة" />
        <div className="controls"><Slider label="$n$" value={n} min={2} max={16} step={1} onChange={(v) => { setN(v); clock.setT(1); }} /></div>
        <Readout items={[
          { label: '$w = e^{2\\pi i/n}$', value: cx(Math.cos(w), Math.sin(w)), color: 'var(--f2)' },
          { label: 'زاوية $w$', value: deg(w) },
          { label: 'القوة المعروضة', value: `w^${shown} → ${deg(shown * w)}`, color: 'var(--red)' },
        ]} />
        <MathText as="div" className="verdict">{'**كل ضرب في $w$ يدير بزاوية $2\\pi/n$** ولا يغيّر الطول 1. بعد $n$ ضربة نعود إلى $w^n = e^{2\\pi i} = 1$. فالقوى $w, w^2, \\ldots, w^n$ هي **جذور الواحد النونية**، متساوية الأبعاد على دائرة الوحدة. المثال 2: مع $n = 8$ يكون $w^2 = i$ و $w^4 = -1$ و $w^8 = 1$ و $w^{25} = w$. ومع $n = 3$ تظهر الجذور التكعيبية للواحد (المثال 4).'}</MathText>
      </>}
    </Widget>
  );
}

function sup(j: number) { return String(j).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join(''); }
