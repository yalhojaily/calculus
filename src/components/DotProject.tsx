import { useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type K = 'dot' | 'proj';

/** 11.1 / 11.2 — الضرب النقطي بصيغتيه |A||B|cos θ = a₁b₁ + a₂b₂، والإسقاط P = (A·B/|A|²) A والجزء العمودي B − P. */
export default function DotProject({ initial = 'dot' }: { initial?: K }) {
  const [k, setK] = useState<K>(initial);
  const [ta, setTa] = useState(0.25);
  const [ra, setRa] = useState(3);
  const [tb, setTb] = useState(1.2);
  const [rb, setRb] = useState(2.5);
  const A: [number, number] = [ra * Math.cos(ta), ra * Math.sin(ta)], B: [number, number] = [rb * Math.cos(tb), rb * Math.sin(tb)];
  const d = A[0] * B[0] + A[1] * B[1];
  let th = tb - ta; while (th > Math.PI) th -= 2 * Math.PI; while (th < -Math.PI) th += 2 * Math.PI;
  const c = d / (ra * ra);
  const P: [number, number] = [c * A[0], c * A[1]];
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -3.6, 3.6, -3.2, 3.6);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    const L = 3.6; p.line(-L * Math.cos(ta), -L * Math.sin(ta), L * Math.cos(ta), L * Math.sin(ta), p.c.grid, { width: 1.4 });
    p.line(B[0], B[1], P[0], P[1], p.c['ink-3'], { width: 1.4, dash: [4, 3] });
    if (k === 'proj') { p.arrow(P[0], P[1], B[0], B[1], p.c.violet, { width: 2.4 }); p.text('B − P', (B[0] + P[0]) / 2, (B[1] + P[1]) / 2, p.c.violet, { dx: 6 }); }
    p.arrow(0, 0, A[0], A[1], p.c.f1, { width: 3 }); p.arrow(0, 0, B[0], B[1], p.c.f2, { width: 3 });
    p.arrow(0, 0, P[0], P[1], p.c.red, { width: 4.2, head: 8 });
    p.text('A', A[0], A[1], p.c.f1, { dx: 6, dy: -4 }); p.text('B', B[0], B[1], p.c.f2, { dx: 6, dy: -4 }); p.text('P', P[0], P[1], p.c.red, { dx: 4, dy: 14 });
    const ctx = p.ctx; ctx.beginPath(); ctx.arc(p.X(0), p.Y(0), 26, -ta, -(ta + th), th > 0); ctx.strokeStyle = p.c.ink; ctx.lineWidth = 1.5; ctx.stroke();
  }, [k, ta, ra, tb, rb]);
  const deg = (x: number) => `${fmt((x * 180) / Math.PI, 0)}°`;
  return (
    <Widget title={k === 'dot' ? 'الضرب النقطي' : 'إسقاط متجه على متجه'} hint={k === 'dot' ? 'تعريفان لعدد واحد: $\\mathbf A\\cdot\\mathbf B = |\\mathbf A||\\mathbf B|\\cos\\theta$ (بلا محاور) و $\\mathbf A\\cdot\\mathbf B = a_1b_1 + a_2b_2$ (بالمركّبات). الأحمر **ظل $\\mathbf B$ على خط $\\mathbf A$**: طوله $|\\mathbf B|\\cos\\theta$. أدِر $\\mathbf B$: الضرب موجب حين $\\theta \\lt 90°$، وصفر عند التعامد، وسالب بعد ذلك.' : 'جزء من $\\mathbf B$ يسير على $\\mathbf A$ (الإسقاط $\\mathbf P$)، والجزء الآخر $\\mathbf B - \\mathbf P$ عمودي عليه. **11D:** $\\mathbf P = \\dfrac{\\mathbf A\\cdot\\mathbf B}{|\\mathbf A|^2}\\mathbf A$. ضاعِف $\\mathbf A$: لا يتغير $\\mathbf P$. ضاعِف $\\mathbf B$: يتضاعف $\\mathbf P$.'}>
      <Choice value={k} onChange={setK} options={[{ v: 'dot', label: 'الضرب النقطي' }, { v: 'proj', label: 'الإسقاط' }]} />
      <Canvas refEl={ref} ratio={0.75} label="متجهان والزاوية بينهما والإسقاط" />
      <div className="controls">
        <Slider label="زاوية $\mathbf A$" value={ta} min={-Math.PI} max={Math.PI} step={0.01} onChange={setTa} show={deg} color="var(--f1)" />
        <Slider label="$|\mathbf A|$" value={ra} min={0.5} max={3.4} step={0.05} onChange={setRa} show={(x) => fmt(x, 2)} color="var(--f1)" />
        <Slider label="زاوية $\mathbf B$" value={tb} min={-Math.PI} max={Math.PI} step={0.01} onChange={setTb} show={deg} color="var(--f2)" />
        <Slider label="$|\mathbf B|$" value={rb} min={0.5} max={3.4} step={0.05} onChange={setRb} show={(x) => fmt(x, 2)} color="var(--f2)" />
      </div>
      <Readout items={k === 'dot' ? [
        { label: '$\\mathbf A$', value: `(${fmt(A[0], 2)}, ${fmt(A[1], 2)})`, color: 'var(--f1)' },
        { label: '$\\mathbf B$', value: `(${fmt(B[0], 2)}, ${fmt(B[1], 2)})`, color: 'var(--f2)' },
        { label: '$a_1b_1 + a_2b_2$', value: fmt(d, 3) },
        { label: '$|\\mathbf A||\\mathbf B|\\cos\\theta$', value: `${fmt(ra, 2)}·${fmt(rb, 2)}·${fmt(Math.cos(th), 3)} = ${fmt(ra * rb * Math.cos(th), 3)}` },
        { label: '$\\theta$', value: deg(Math.abs(th)) },
      ] : [
        { label: '$\\mathbf A\\cdot\\mathbf B / |\\mathbf A|^2$', value: fmt(c, 3) },
        { label: '$\\mathbf P$', value: `(${fmt(P[0], 2)}, ${fmt(P[1], 2)})`, color: 'var(--red)' },
        { label: '$\\mathbf B - \\mathbf P$', value: `(${fmt(B[0] - P[0], 2)}, ${fmt(B[1] - P[1], 2)})`, color: 'var(--violet)' },
        { label: '$\\mathbf P\\cdot(\\mathbf B - \\mathbf P)$', value: fmt(P[0] * (B[0] - P[0]) + P[1] * (B[1] - P[1]), 6) },
        { label: '$|\\mathbf P|^2 + |\\mathbf B - \\mathbf P|^2$ و $|\\mathbf B|^2$', value: `${fmt(c * c * ra * ra + (B[0] - P[0]) ** 2 + (B[1] - P[1]) ** 2, 3)} = ${fmt(rb * rb, 3)}` },
      ]} />
      <MathText as="div" className="verdict">{k === 'dot' ? '**لماذا الصيغتان متساويتان؟** احسب $|\\mathbf A - \\mathbf B|^2$ بالمركّبات، ثم بقانون جيب التمام $|\\mathbf A|^2 + |\\mathbf B|^2 - 2|\\mathbf A||\\mathbf B|\\cos\\theta$. المربعات تتطابق، فتتساوى الحدود المضروبة في $-2$. ومن $|\\cos\\theta| \\le 1$ تأتي **متباينة كوشي–شفارتز** $|\\mathbf A\\cdot\\mathbf B| \\le |\\mathbf A||\\mathbf B|$.' : 'المثال 5: الريح $\\mathbf V = (100, 0)$ والطائرة تتجه شمالاً شرقياً $\\mathbf A = (1, 1)$: الريح الخلفية $\\mathbf P = \\tfrac{100}{2}(1, 1) = (50, 50)$، والباقي ريح جانبية. **فيثاغورس:** $|\\mathbf P|^2 + |\\mathbf B - \\mathbf P|^2 = |\\mathbf B|^2$ لأن الجزأين متعامدان.'}</MathText>
    </Widget>
  );
}
