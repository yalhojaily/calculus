import { useCallback, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { type Cam, contourMap, draw3, surface, useOrbit } from '../lib/three';
import { MathText } from './MathText';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

/** 13.6 — الصيغة التربيعية ax² + 2bxy + cy²: صغرى إذا a > 0 و ac > b²، عظمى إذا a < 0 و ac > b²، سرج إذا ac < b². */
export default function QuadForm() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0.5);
  const [c, setC] = useState(1);
  const [cam, setCam0] = useState<Cam>({ az: 0.7, el: 0.45 });
  const setCam = useCallback((f: (c: Cam) => Cam) => setCam0(f), []);
  const f = (x: number, y: number) => a * x * x + 2 * b * x * y + c * y * y;
  const D = a * c - b * b;
  const kind = Math.abs(D) < 1e-9 ? 'حالة حدّية (ac = b²)' : D < 0 ? 'نقطة سرج' : a > 0 ? 'صغرى' : 'عظمى';
  const s3 = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -2.8, 2.8, -2.6, 2.8);
    const g = draw3(p, cam); g.floor(1.5, 0.5);
    surface(p, cam, (x, y) => 0.35 * f(x, y), [-1.5, 1.5], [-1.5, 1.5], { n: 22, zMin: -2.2, zMax: 2.2 });
    g.point([0, 0, 0], p.c.red, 5);
    g.axes(2.2);
  }, [a, b, c, cam]);
  useOrbit(s3, setCam);
  const map = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -1.6, 1.6, -1.6, 1.6);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    const L = [-3, -2, -1, -0.5, -0.15, 0.15, 0.5, 1, 2, 3];
    contourMap(p, f, L, [-1.6, 1.6], [-1.6, 1.6], { n: 90 });
    p.point(0, 0, p.c.red, 5);
  }, [a, b, c]);
  return (
    <Widget title="صغرى أم عظمى أم سرج؟" hint="قرب نقطة حرجة (حيث $f_x = f_y = 0$) تتصرف الدالة كجزئها التربيعي من متسلسلة تايلور: $ax^2 + 2bxy + cy^2$ مع $a = \tfrac12f_{xx}$ و $b = \tfrac12f_{xy}$ و $c = \tfrac12f_{yy}$. **13K: الحكم من الإشارة والمميِّز $ac - b^2$.** حرّك المعاملات وراقب السطح وخطوط تساويه.">
      <div className="cv-row">
        <div><Canvas refEl={s3} ratio={0.9} label="سطح الصيغة التربيعية" /><div className="cv-cap">السطح</div></div>
        <div><Canvas refEl={map} ratio={0.9} label="خطوط تساوي الصيغة التربيعية" /><div className="cv-cap">خطوط التساوي: قطوع ناقصة أم زائدة</div></div>
      </div>
      <div className="controls">
        <Slider label="$a$" value={a} min={-2} max={2} step={0.05} onChange={setA} show={(v) => fmt(v, 2)} />
        <Slider label="$b$" value={b} min={-2} max={2} step={0.05} onChange={setB} show={(v) => fmt(v, 2)} />
        <Slider label="$c$" value={c} min={-2} max={2} step={0.05} onChange={setC} show={(v) => fmt(v, 2)} />
      </div>
      <Readout items={[
        { label: '$ac - b^2$', value: fmt(D, 3), color: D > 0 ? 'var(--area)' : 'var(--red)' },
        { label: 'عند الأصل', value: kind, color: 'var(--red)' },
      ]} />
      <MathText as="div" className="verdict">{'**صغرى** إذا $a \\gt 0$ و $ac \\gt b^2$ (خطوط التساوي قطوع ناقصة). **عظمى** إذا $a \\lt 0$ و $ac \\gt b^2$. **سرج** إذا $ac \\lt b^2$ (قطوع زائدة). اختبار $f_{xx} \\gt 0$ و $f_{yy} \\gt 0$ **لا يكفي**: المثال 6، $x^2 + 10xy + y^2$: المعاملان $a = c = 1$ موجبان، لكن $b = 5$ و $ac - b^2 = -24 \\lt 0$، **فهو سرج**: على الخط $y = -x$ تصير الدالة $-8x^2$. (جرّب في الأداة $a = c = 1$ و $b = 2$.)'}</MathText>
    </Widget>
  );
}
