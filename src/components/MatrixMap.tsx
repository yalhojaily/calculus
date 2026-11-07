import { useEffect, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { AnimControls, Canvas, Readout, Slider, Widget, useClock, usePlot } from './ui';

/** 11.4 — المصفوفة دالة تأخذ u إلى Au: المربع الواحد يصير متوازي أضلاع ضلعاه عمودا A، ومساحته |det A|. والمعكوس يعيده. */
export default function MatrixMap() {
  const [a, setA] = useState(2); const [b, setB] = useState(1);
  const [c, setC] = useState(0.5); const [d, setD] = useState(1.5);
  const clock = useClock(3, { loop: false });
  useEffect(() => { clock.setT(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const s = clock.t; // من I إلى A تدريجياً
  const M = [1 + s * (a - 1), s * b, s * c, 1 + s * (d - 1)];
  const T = (x: number, y: number): [number, number] => [M[0] * x + M[1] * y, M[2] * x + M[3] * y];
  const det = a * d - b * c;
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -4.2, 4.2, -3.6, 3.6);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    for (let i = -3; i <= 3; i++) {
      const [x1, y1] = T(i, -3), [x2, y2] = T(i, 3), [x3, y3] = T(-3, i), [x4, y4] = T(3, i);
      p.line(x1, y1, x2, y2, p.c.violet, { width: i === 0 ? 1.6 : 0.6 }); p.line(x3, y3, x4, y4, p.c.violet, { width: i === 0 ? 1.6 : 0.6 });
    }
    const q = [T(0, 0), T(1, 0), T(1, 1), T(0, 1)];
    const ctx = p.ctx; ctx.beginPath(); q.forEach(([x, y], i) => (i ? ctx.lineTo(p.X(x), p.Y(y)) : ctx.moveTo(p.X(x), p.Y(y)))); ctx.closePath();
    ctx.fillStyle = p.c.area; ctx.globalAlpha = 0.35; ctx.fill(); ctx.globalAlpha = 1;
    const e1 = T(1, 0), e2 = T(0, 1);
    p.arrow(0, 0, e1[0], e1[1], p.c.f1, { width: 3 }); p.arrow(0, 0, e2[0], e2[1], p.c.f2, { width: 3 });
    // حرف F يُظهر الانعكاس
    const F: [number, number][][] = [[[0.25, 0.2], [0.25, 0.8], [0.65, 0.8]], [[0.25, 0.5], [0.55, 0.5]]];
    F.forEach((seg) => { ctx.beginPath(); seg.forEach(([x, y], i) => { const [X, Y] = T(x, y); if (i) ctx.lineTo(p.X(X), p.Y(Y)); else ctx.moveTo(p.X(X), p.Y(Y)); }); ctx.strokeStyle = p.c.ink; ctx.lineWidth = 2.4; ctx.stroke(); });
  }, [a, b, c, d, s]);
  const S = (label: string, v: number, set: (n: number) => void, color: string) => <Slider label={label} value={v} min={-2.5} max={2.5} step={0.25} onChange={(n) => { set(n); clock.setT(1); }} show={(n) => fmt(n, 2)} color={color} />;
  const inv = Math.abs(det) > 1e-9 ? [d / det, -b / det, -c / det, a / det] : null;
  return (
    <Widget title="المصفوفة تحوّل المستوى" hint="$A = \begin{bmatrix} a & b \\ c & d\end{bmatrix}$ تأخذ كل متجه $\mathbf u$ إلى $A\mathbf u$. **عمودها الأول صورة $\mathbf i$ (الأزرق) وعمودها الثاني صورة $\mathbf j$ (البرتقالي)**، والشبكة كلها تتبعهما. المربع الواحد يصير متوازي أضلاع **مساحته $|\det A|$**. شغّل لترى الانتقال من المصفوفة المحايدة $I$ إلى $A$.">
      <Canvas refEl={ref} ratio={0.75} label="الشبكة والمربع الواحد بعد ضربهما في المصفوفة" />
      <AnimControls clock={clock} label="من I إلى A" />
      <div className="controls">
        {S('$a$', a, setA, 'var(--f1)')}{S('$b$', b, setB, 'var(--f2)')}
        {S('$c$', c, setC, 'var(--f1)')}{S('$d$', d, setD, 'var(--f2)')}
      </div>
      <Readout items={[
        { label: '$\\det A = ad - bc$', value: fmt(det, 3), color: 'var(--area)' },
        { label: '$A^{-1} = \\tfrac{1}{\\det A}\\begin{bmatrix} d & -b \\\\ -c & a\\end{bmatrix}$', value: inv ? `[${fmt(inv[0], 3)}, ${fmt(inv[1], 3)}; ${fmt(inv[2], 3)}, ${fmt(inv[3], 3)}]` : 'لا يوجد' },
      ]} />
      <MathText as="div" className="verdict">{Math.abs(det) < 1e-9 ? '**$\\det A = 0$: المستوى كله ينسحق على خط.** نقاط كثيرة تذهب إلى المكان نفسه، فلا سبيل للعودة: لا معكوس.' : det < 0 ? '**$\\det A \\lt 0$: الحرف F انقلب** في مرآة. القيمة المطلقة للمحدد ما زالت عامل المساحة.' : '**المعكوس $A^{-1}$ يعيد كل شيء** كما تعيد الدالة العكسية $g^{-1}$ ما فعلته $g$. ولأن $A^{-1}A = I$: إذا $A\\mathbf u = \\mathbf d$ فـ $\\mathbf u = A^{-1}\\mathbf d$. وضرب المصفوفات يعني تركيب التحويلين، **و $AB \\ne BA$ عادة**.'}</MathText>
    </Widget>
  );
}
