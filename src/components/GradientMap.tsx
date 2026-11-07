import { useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { contourMap } from '../lib/three';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface F { label: string; f: (x: number, y: number) => number; g: (x: number, y: number) => [number, number]; levels: number[] }
const fs: Record<string, F> = {
  xy: { label: '$xy$', f: (x, y) => x * y, g: (x, y) => [y, x], levels: [-3, -2, -1, -0.5, 0.5, 1, 2, 3] },
  bowl: { label: '$x^2 + 2y^2$', f: (x, y) => x * x + 2 * y * y, g: (x, y) => [2 * x, 4 * y], levels: [0.5, 1, 2, 3, 4, 6, 8] },
  hill: { label: 'تلّان', f: (x, y) => 3 * Math.exp(-((x - 1) ** 2 + (y - 0.5) ** 2)) + 2 * Math.exp(-((x + 1.2) ** 2 + (y + 0.8) ** 2) / 0.6), g: (x, y) => { const e1 = 3 * Math.exp(-((x - 1) ** 2 + (y - 0.5) ** 2)), e2 = 2 * Math.exp(-((x + 1.2) ** 2 + (y + 0.8) ** 2) / 0.6); return [-2 * (x - 1) * e1 - (2 * (x + 1.2) / 0.6) * e2, -2 * (y - 0.5) * e1 - (2 * (y + 0.8) / 0.6) * e2]; }, levels: [0.25, 0.5, 1, 1.5, 2, 2.5] },
};

/** 13.4 — التدرّج grad f = (fₓ, f_y) عمودي على خطوط التساوي ويشير إلى أشد صعود. والمشتقة الاتجاهية D_u f = grad f · u. */
export default function GradientMap() {
  const [k, setK] = useState('xy');
  const F = fs[k];
  const [x, setX] = useState(1);
  const [y, setY] = useState(1.5);
  const [th, setTh] = useState(0.4);
  const [gx, gy] = F.g(x, y);
  const gl = Math.hypot(gx, gy);
  const u: [number, number] = [Math.cos(th), Math.sin(th)];
  const Du = gx * u[0] + gy * u[1];
  const R = 2.4;
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -R, R, -R, R);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    contourMap(p, F.f, F.levels, [-R, R], [-R, R], { n: 90, width: 1.2, highlight: undefined });
    // حقل التدرّج
    for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
      const X = (i * R) / 4.5, Y = (j * R) / 4.5; const [a, b] = F.g(X, Y); const m = Math.hypot(a, b); if (m < 1e-6) continue;
      const s = 0.22 * Math.min(1, m) / m; p.arrow(X, Y, X + s * a, Y + s * b, p.c['ink-3'], { width: 1, head: 4 });
    }
    const sc = 0.6 / Math.max(1, gl);
    p.arrow(x, y, x + sc * gx, y + sc * gy, p.c.red, { width: 3.2 });
    p.arrow(x, y, x + 0.8 * u[0], y + 0.8 * u[1], p.c.violet, { width: 2.4 });
    // الاتجاه المستوي (على خط التساوي)
    if (gl > 1e-9) p.line(x - (0.7 * gy) / gl, y + (0.7 * gx) / gl, x + (0.7 * gy) / gl, y - (0.7 * gx) / gl, p.c.ink, { width: 1.4, dash: [4, 3] });
    p.point(x, y, p.c.ink, 5);
  }, [k, x, y, th]);
  const deg = (t: number) => `${fmt((t * 180) / Math.PI, 0)}°`;
  const ang = Math.atan2(gy, gx);
  return (
    <Widget title="التدرّج والمشتقة الاتجاهية" hint="**المتجه الأحمر $\nabla f = (f_x, f_y)$ هو التدرّج.** إنه **عمودي على خط التساوي** (المتقطع الأسود) ويشير إلى **أشد صعود**، وطوله أكبر ميل. البنفسجي اتجاه وحدة $\mathbf u$ تختاره: **13F** الميل في اتجاهه $D_{\mathbf u}f = \nabla f\cdot\mathbf u = |\nabla f|\cos\theta$. الأسهم الرمادية حقل التدرّج كله.">
      <Choice value={k} onChange={setK} options={Object.keys(fs).map((v) => ({ v, label: fs[v].label }))} />
      <Canvas refEl={ref} ratio={0.82} label="خريطة كنتورية وتدرّج ومشتقة اتجاهية" />
      <div className="controls">
        <Slider label="$x$" value={x} min={-2} max={2} step={0.05} onChange={setX} show={(v) => fmt(v, 2)} />
        <Slider label="$y$" value={y} min={-2} max={2} step={0.05} onChange={setY} show={(v) => fmt(v, 2)} />
        <Slider label="اتجاه $\mathbf u$" value={th} min={-Math.PI} max={Math.PI} step={0.01} onChange={setTh} show={deg} color="var(--violet)" />
      </div>
      <Readout items={[
        { label: '$\\nabla f$', value: `(${fmt(gx, 3)}, ${fmt(gy, 3)})`, color: 'var(--red)' },
        { label: '$|\\nabla f|$ (أشد ميل)', value: fmt(gl, 3), color: 'var(--red)' },
        { label: 'اتجاه التدرّج', value: deg(ang) },
        { label: '$D_{\\mathbf u}f = \\nabla f\\cdot\\mathbf u$', value: fmt(Du, 3), color: 'var(--violet)' },
      ]} />
      <MathText as="div" className="verdict">{'أدِر $\\mathbf u$: **أكبر ميل حين $\\mathbf u$ في اتجاه $\\nabla f$** ($\\cos\\theta = 1$)، وأشد نزول في الاتجاه المعاكس، **والميل صفر على خط التساوي** ($\\theta = 90°$). لهذا يجري الماء عمودياً على خطوط التساوي. المثال 1: $f = xy$ عند $(1, 2)$: $\\nabla f = (2, 1)$، والميل في اتجاه $45°$ هو $(2 + 1)/\\sqrt2$.'}</MathText>
    </Widget>
  );
}
