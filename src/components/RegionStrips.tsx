import { useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface R { label: string; lo: (x: number) => number; hi: (x: number) => number; a: number; b: number; left: (y: number) => number; right: (y: number) => number; c: number; d: number; vert: string; horiz: string; area: string; box: [number, number, number, number] }
const rs: Record<string, R> = {
  tri: { label: 'المثلث $x + y \\le 1$', lo: () => 0, hi: (x) => 1 - x, a: 0, b: 1, left: () => 0, right: (y) => 1 - y, c: 0, d: 1, vert: '\\int_{x=0}^{1}\\int_{y=0}^{1-x}', horiz: '\\int_{y=0}^{1}\\int_{x=0}^{1-y}', area: '1/2', box: [-0.2, 1.3, -0.2, 1.3] },
  par: { label: 'بين $y = x^2$ و $y = 2x$', lo: (x) => x * x, hi: (x) => 2 * x, a: 0, b: 2, left: (y) => y / 2, right: (y) => Math.sqrt(y), c: 0, d: 4, vert: '\\int_{x=0}^{2}\\int_{y=x^2}^{2x}', horiz: '\\int_{y=0}^{4}\\int_{x=y/2}^{\\sqrt y}', area: '4/3', box: [-0.3, 2.5, -0.3, 4.3] },
};

/** 14.1 — حدود التكامل لمنطقة غير مستطيلة: شرائح رأسية (y من المنحنى الأسفل إلى الأعلى) أو أفقية (x من الدخول إلى الخروج). */
export default function RegionStrips() {
  const [k, setK] = useState('par');
  const R = rs[k];
  const [dir, setDir] = useState<'v' | 'h'>('v');
  const [s, setS] = useState(0.5);
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    const [a, b, c, d] = R.box; fitEqual(p, a, b, c, d);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    const ctx = p.ctx; ctx.beginPath();
    const N = 80;
    for (let i = 0; i <= N; i++) { const x = R.a + ((R.b - R.a) * i) / N; const X = p.X(x), Y = p.Y(R.lo(x)); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
    for (let i = N; i >= 0; i--) { const x = R.a + ((R.b - R.a) * i) / N; ctx.lineTo(p.X(x), p.Y(R.hi(x))); }
    ctx.closePath(); ctx.fillStyle = p.c.f1; ctx.globalAlpha = 0.18; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = p.c.f1; ctx.lineWidth = 2; ctx.stroke();
    const M = 10;
    for (let i = 0; i < M; i++) {
      if (dir === 'v') { const x0 = R.a + ((R.b - R.a) * i) / M, x1 = x0 + (R.b - R.a) / M, xm = (x0 + x1) / 2; p.rect(x0, R.lo(xm), x1, R.hi(xm), p.c.f2, { alpha: 0.18 }); }
      else { const y0 = R.c + ((R.d - R.c) * i) / M, y1 = y0 + (R.d - R.c) / M, ym = (y0 + y1) / 2; p.rect(R.left(ym), y0, R.right(ym), y1, p.c.area, { alpha: 0.18 }); }
    }
    if (dir === 'v') { const x = R.a + s * (R.b - R.a); p.line(x, R.lo(x), x, R.hi(x), p.c.red, { width: 4 }); p.point(x, R.lo(x), p.c.red, 5); p.point(x, R.hi(x), p.c.red, 5); }
    else { const y = R.c + s * (R.d - R.c); p.line(R.left(y), y, R.right(y), y, p.c.red, { width: 4 }); p.point(R.left(y), y, p.c.red, 5); p.point(R.right(y), y, p.c.red, 5); }
  }, [k, dir, s]);
  const x = R.a + s * (R.b - R.a), y = R.c + s * (R.d - R.c);
  return (
    <Widget title="حدود التكامل: ارسم المنطقة!" hint="**ارسم المنطقة دائماً (إلا للمستطيلات). بلا رسم يصعب إيجاد الحدود.** بالشرائح الرأسية: $y$ يدخل من المنحنى الأسفل ويخرج من الأعلى (حدود **متغيرة**)، ثم $x$ من أول المنطقة إلى آخرها (حدود **ثابتة**). وبالأفقية العكس. الخط الأحمر شريحة واحدة: نقطتا دخولها وخروجها هما الحدود الداخلية.">
      <Choice value={k} onChange={setK} options={Object.keys(rs).map((v) => ({ v, label: rs[v].label }))} />
      <Choice value={dir} onChange={setDir} options={[{ v: 'v', label: 'شرائح رأسية (dy أولاً)' }, { v: 'h', label: 'شرائح أفقية (dx أولاً)' }]} />
      <Canvas refEl={ref} ratio={0.75} label="منطقة التكامل وشرائحها" />
      <div className="controls"><Slider label="موضع الشريحة" value={s} min={0.02} max={0.98} step={0.01} onChange={setS} show={() => (dir === 'v' ? `x = ${fmt(x, 2)}` : `y = ${fmt(y, 2)}`)} color="var(--red)" /></div>
      <Readout items={[
        { label: 'التكامل المتكرر', value: '' },
        { label: dir === 'v' ? `$${R.vert}\\,dy\\,dx$` : `$${R.horiz}\\,dx\\,dy$`, value: dir === 'v' ? `y من ${fmt(R.lo(x), 2)} إلى ${fmt(R.hi(x), 2)}` : `x من ${fmt(R.left(y), 2)} إلى ${fmt(R.right(y), 2)}`, color: 'var(--red)' },
        { label: 'المساحة $\\iint 1\\,dA$', value: R.area, color: 'var(--f1)' },
      ].filter((it) => it.value !== '')} />
      <MathText as="div" className="verdict">{k === 'par' ? 'المثال 4: اعكس ترتيب $\\int_0^2\\int_{x^2}^{2x}x^3\\,dy\\,dx$. الخط $y = 2x$ والقطع $y = x^2$ يلتقيان عند $x = 0$ و $x = 2$. **أفقياً:** على كل خط $y$ ثابت، $x$ يدخل عند $y/2$ (الخط) ويخرج عند $\\sqrt y$ (القطع)، ثم $y$ من 0 إلى 4. **انتبه للحدود الخارجية: صارت لـ $y$.**' : 'المثال 3: المساحة $\\int_0^1\\int_0^{1-x}dy\\,dx$. الداخلي $1 - x$ (طول الشريحة)، والخارجي $\\int_0^1(1 - x)\\,dx = \\tfrac12$. **كأنه تكامل غير محدد داخل تكامل محدد.** والمثال 2 يكامل $x - 2y$ على هذا المثلث فيحصل على $-\\tfrac16$: معظم الجسم تحت المستوى $xy$.'}</MathText>
    </Widget>
  );
}
