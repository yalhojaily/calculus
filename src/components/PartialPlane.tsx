import { useCallback, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { type Cam, type V3, draw3, surface, useOrbit } from '../lib/three';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type M = 'slices' | 'plane';
interface F { label: string; f: (x: number, y: number) => number; fx: (x: number, y: number) => number; fy: (x: number, y: number) => number; z: [number, number]; p0: [number, number] }
const fs: Record<string, F> = {
  dome: { label: '$14 - x^2 - y^2$', f: (x, y) => 14 - x * x - y * y, fx: (x) => -2 * x, fy: (_, y) => -2 * y, z: [0, 14], p0: [1, 2] },
  wave: { label: '$\\sin 2x\\cos y$', f: (x, y) => Math.sin(2 * x) * Math.cos(y), fx: (x, y) => 2 * Math.cos(2 * x) * Math.cos(y), fy: (x, y) => -Math.sin(2 * x) * Math.sin(y), z: [-1, 1], p0: [0, 0] },
  saddle: { label: '$y^2 - x^2$', f: (x, y) => y * y - x * x, fx: (x) => -2 * x, fy: (_, y) => 2 * y, z: [-6, 6], p0: [1, 1.5] },
  xy: { label: '$xy$', f: (x, y) => x * y, fx: (_, y) => y, fy: (x) => x, z: [-6, 6], p0: [1, 2] },
};

/** 13.2 / 13.3 — المشتقتان الجزئيتان ميلا الدالتين الجزئيتين (مقطعين رأسيين)، والمستوى المماس z − z₀ = fₓ(x − x₀) + f_y(y − y₀). */
export default function PartialPlane({ mode = 'slices' }: { mode?: M }) {
  const [k, setK] = useState('dome');
  const F = fs[k];
  const [x0, setX0] = useState(F.p0[0]);
  const [y0, setY0] = useState(F.p0[1]);
  const [d, setD] = useState(0.5);
  const [cam, setCam0] = useState<Cam>({ az: 0.6, el: 0.42 });
  const setCam = useCallback((f: (c: Cam) => Cam) => setCam0(f), []);
  const R = 2.5;
  const zs = 2.2 / Math.max(Math.abs(F.z[0]), Math.abs(F.z[1]));
  const z0 = F.f(x0, y0), a = F.fx(x0, y0), b = F.fy(x0, y0);
  const lin = (x: number, y: number) => z0 + a * (x - x0) + b * (y - y0);
  const s3 = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -3.4, 3.4, -2.8, 3.2);
    const g = draw3(p, cam);
    g.floor(2, 1);
    surface(p, cam, (x, y) => zs * F.f(x, y), [-R, R], [-R, R], { n: 22, alpha: mode === 'plane' ? 0.6 : 0.78 });
    const P: V3 = [x0, y0, zs * z0];
    // الدالتان الجزئيتان: y = y₀ (أزرق) و x = x₀ (أخضر)
    const N = 60;
    for (let i = 0; i < N; i++) {
      const s0 = -R + (2 * R * i) / N, s1 = -R + (2 * R * (i + 1)) / N;
      g.line([s0, y0, zs * F.f(s0, y0)], [s1, y0, zs * F.f(s1, y0)], p.c.f1, { width: 3 });
      g.line([x0, s0, zs * F.f(x0, s0)], [x0, s1, zs * F.f(x0, s1)], p.c.area, { width: 3 });
    }
    const L = 1.1;
    g.line([x0 - L, y0, zs * (z0 - a * L)], [x0 + L, y0, zs * (z0 + a * L)], p.c.f1, { width: 2, dash: [5, 3] });
    g.line([x0, y0 - L, zs * (z0 - b * L)], [x0, y0 + L, zs * (z0 + b * L)], p.c.area, { width: 2, dash: [5, 3] });
    if (mode === 'plane') {
      const S = 1.2, c = (u: number, v: number): V3 => [x0 + u, y0 + v, zs * lin(x0 + u, y0 + v)];
      g.poly([c(-S, -S), c(S, -S), c(S, S), c(-S, S)], p.c.violet, 0.3);
      const Q: V3 = [x0 + d, y0 + d, zs * F.f(x0 + d, y0 + d)], Ql: V3 = [x0 + d, y0 + d, zs * lin(x0 + d, y0 + d)];
      g.line(Q, Ql, p.c.red, { width: 2.4 }); g.point(Q, p.c.red, 4); g.point(Ql, p.c.violet, 4);
    }
    g.line([x0, y0, 0], P, p.c['ink-3'], { width: 1, dash: [3, 3] });
    g.point(P, p.c.ink, 6);
    g.axes(2.8);
  }, [k, x0, y0, d, cam, mode]);
  useOrbit(s3, setCam);
  const sl = usePlot({ xMin: -R, xMax: R, yMin: F.z[0] - 0.05 * (F.z[1] - F.z[0]), yMax: F.z[1] }, (p) => {
    p.axes({ xLabel: 'x أو y' });
    p.fn((s) => F.f(s, y0), p.c.f1, { width: 2.6 });
    p.fn((s) => F.f(x0, s), p.c.area, { width: 2.6 });
    p.lineThrough(x0, z0, a, p.c.f1, { width: 1.4, dash: [5, 3] });
    p.lineThrough(y0, z0, b, p.c.area, { width: 1.4, dash: [5, 3] });
    p.point(x0, z0, p.c.f1, 5); p.point(y0, z0, p.c.area, 5);
  }, [k, x0, y0]);
  const Qx = x0 + d, Qy = y0 + d;
  return (
    <Widget title={mode === 'slices' ? 'المشتقتان الجزئيتان' : 'المستوى المماس'} hint={mode === 'slices' ? '**غيّر متغيراً واحداً في كل مرة.** ثبّت $y = y_0$ فتحصل على **دالة جزئية** $f(x, y_0)$ في $x$ وحده (الأزرق): مقطع رأسي في السطح، وميلها $\\partial f/\\partial x$. وثبّت $x = x_0$ فتحصل على $f(x_0, y)$ (الأخضر) وميلها $\\partial f/\\partial y$. يمين: الدالتان الجزئيتان ومماساهما. **السطح قد يصعد في اتجاه وينزل في آخر.**' : '**13A:** للمستوى المماس ميلا السطح نفسهما: $z - z_0 = f_x(x - x_0) + f_y(y - y_0)$. المماسان الجزئيان (المتقطعان) **يقعان فيه**. والعمودي $\\mathbf N = (f_x, f_y, -1)$. الخط الأحمر **خطأ التقريب الخطي** عند نقطة قريبة: يصغر مثل مربع المسافة.'}>
      <Choice value={k} onChange={(v) => { setK(v); setX0(fs[v].p0[0]); setY0(fs[v].p0[1]); }} options={Object.keys(fs).map((v) => ({ v, label: fs[v].label }))} />
      <div className="cv-row">
        <div><Canvas refEl={s3} ratio={0.9} label="سطح ومقطعاه الجزئيان" /><div className="cv-cap">{mode === 'slices' ? 'السطح ومقطعاه' : 'السطح والمستوى المماس'}</div></div>
        <div><Canvas refEl={sl} ratio={0.9} label="الدالتان الجزئيتان" /><div className="cv-cap">الدالتان الجزئيتان (أزرق: y ثابت، أخضر: x ثابت)</div></div>
      </div>
      <div className="controls">
        <Slider label="$x_0$" value={x0} min={-2} max={2} step={0.05} onChange={setX0} show={(v) => fmt(v, 2)} color="var(--f1)" />
        <Slider label="$y_0$" value={y0} min={-2} max={2} step={0.05} onChange={setY0} show={(v) => fmt(v, 2)} color="var(--area)" />
        {mode === 'plane' && <Slider label="الإزاحة $\Delta x = \Delta y$" value={d} min={0} max={1.2} step={0.01} onChange={setD} show={(v) => fmt(v, 2)} color="var(--red)" />}
      </div>
      <Readout items={[
        { label: '$f(x_0, y_0)$', value: fmt(z0, 4) },
        { label: '$\\partial f/\\partial x$', value: fmt(a, 4), color: 'var(--f1)' },
        { label: '$\\partial f/\\partial y$', value: fmt(b, 4), color: 'var(--area)' },
        ...(mode === 'plane' ? [
          { label: 'المستوى المماس', value: `z = ${fmt(z0, 2)} ${a < 0 ? '−' : '+'} ${fmt(Math.abs(a), 2)}(x − ${fmt(x0, 2)}) ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b), 2)}(y − ${fmt(y0, 2)})` },
          { label: 'الحقيقي / الخطي عند النقطة القريبة', value: `${fmt(F.f(Qx, Qy), 4)} / ${fmt(lin(Qx, Qy), 4)}`, color: 'var(--red)' },
        ] : []),
      ]} />
      <MathText as="div" className="verdict">{mode === 'slices' ? '**لا تعامل $y$ صفراً! عامله ثابتاً، مثل 6:** مشتقته بالنسبة إلى $x$ صفر. مثلاً $\\partial(x^2y^2 + xy + y)/\\partial x = 2xy^2 + y$. وعند **نقطة السرج** (اختر $y^2 - x^2$ واذهب إلى الأصل) المشتقتان صفر: قاع القطع في اتجاه $y$ هو قمته في اتجاه $x$.' : 'المثال 1: $z = 14 - x^2 - y^2$ عند $(1, 2, 9)$: المشتقتان $-2$ و $-4$، والمستوى $z - 9 = -2(x - 1) - 4(y - 2)$، أي $z + 2x + 4y = 19$. **من قصر النظر يبدو السطح مستوياً.** والتقريب الخطي $\\Delta f \\approx f_x\\Delta x + f_y\\Delta y$.'}</MathText>
    </Widget>
  );
}
