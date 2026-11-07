import { useCallback, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { type Cam, type V3, draw3, useOrbit } from '../lib/three';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type K = 'sph' | 'cyl';
const S = (r: number, ph: number, th: number): V3 => [r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)];
const C = (r: number, th: number, z: number): V3 => [r * Math.cos(th), r * Math.sin(th), z];

/** 14.4 — عنصر الحجم: أسطواني r dr dθ dz، وكروي ρ² sin φ dρ dφ dθ. «صندوق» صغير بين سطوح الإحداثيات. */
export default function SphericalBox() {
  const [k, setK] = useState<K>('sph');
  const [r, setR] = useState(1.6);
  const [ph, setPh] = useState(0.9);
  const [th, setTh] = useState(0.6);
  const [z, setZ] = useState(0.8);
  const [cam, setCam0] = useState<Cam>({ az: 0.9, el: 0.35 });
  const setCam = useCallback((f: (c: Cam) => Cam) => setCam0(f), []);
  const dr = 0.35, da = 0.32, dz = 0.4;
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -2.4, 2.4, -1.8, 2.6);
    const g = draw3(p, cam);
    g.floor(2, 1); g.axes(2.4);
    const edge = (fn: (t: number) => V3, col: string, w = 1.6) => { const N = 16; for (let i = 0; i < N; i++) g.line(fn(i / N), fn((i + 1) / N), col, { width: w }); };
    if (k === 'sph') {
      // خطوط الإحداثيات المرشدة: الشعاع، ودائرة العرض، ونصف خط الطول
      g.line([0, 0, 0], S(r, ph, th), p.c['ink-3'], { width: 1, dash: [3, 3] });
      edge((t) => S(r, ph, 2 * Math.PI * t), p.c['ink-3'], 0.8);
      edge((t) => S(r, Math.PI * t, th), p.c['ink-3'], 0.8);
      const a = [r, r + dr], b = [ph, ph + da], c = [th, th + da];
      for (const R of a) for (const P of b) edge((t) => S(R, P, c[0] + t * da), p.c.f1); // اتجاه θ: ρ sin φ dθ
      for (const R of a) for (const T of c) edge((t) => S(R, b[0] + t * da, T), p.c.f2); // اتجاه φ: ρ dφ
      for (const P of b) for (const T of c) g.line(S(a[0], P, T), S(a[1], P, T), p.c.red, { width: 2 }); // اتجاه ρ: dρ
      g.point(S(r, ph, th), p.c.ink, 5);
      // زاوية φ عن المحور z
      edge((t) => S(0.5, ph * t, th), p.c.violet, 2);
    } else {
      g.line([0, 0, 0], C(r, th, 0), p.c['ink-3'], { width: 1, dash: [3, 3] });
      g.line(C(r, th, 0), C(r, th, z), p.c['ink-3'], { width: 1, dash: [3, 3] });
      const a = [r, r + dr], c = [th, th + da], e = [z, z + dz];
      for (const R of a) for (const Z of e) edge((t) => C(R, c[0] + t * da, Z), p.c.f1);
      for (const R of a) for (const T of c) g.line(C(R, T, e[0]), C(R, T, e[1]), p.c.area, { width: 2 });
      for (const T of c) for (const Z of e) g.line(C(a[0], T, Z), C(a[1], T, Z), p.c.red, { width: 2 });
      edge((t) => C(r, 2 * Math.PI * t, 0), p.c['ink-3'], 0.8);
      g.point(C(r, th, z), p.c.ink, 5);
    }
  }, [k, r, ph, th, z, cam]);
  useOrbit(ref, setCam);
  const vol = k === 'sph' ? r * r * Math.sin(ph) * dr * da * da : r * dr * da * dz;
  const deg = (x: number) => `${fmt((x * 180) / Math.PI, 0)}°`;
  return (
    <Widget title={k === 'sph' ? 'الإحداثيات الكروية' : 'الإحداثيات الأسطوانية'} hint={k === 'sph' ? '$\\rho$ البعد عن الأصل، و $\\phi$ الزاوية من المحور $z$ نزولاً (البنفسجي)، و $\\theta$ الزاوية القطبية المعتادة. **الصندوق الصغير** أضلاعه: $d\\rho$ (الأحمر)، و $\\rho\\,d\\phi$ على خط الطول (البرتقالي)، و $\\rho\\sin\\phi\\,d\\theta$ على دائرة العرض (الأزرق). **فـ $dV = \\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$.** اسحب الرسم لتديره.' : 'الإحداثيات القطبية في المستوى، و $z$ كما هو. **الصندوق الصغير** أضلاعه $dr$ (الأحمر) و $r\\,d\\theta$ (الأزرق) و $dz$ (الأخضر)، **فـ $dV = r\\,dr\\,d\\theta\\,dz$**. مثالية للأسطوانات والمخاريط والأجسام الدورانية حول المحور $z$.'}>
      <Choice value={k} onChange={setK} options={[{ v: 'sph', label: 'كروية $(\\rho, \\phi, \\theta)$' }, { v: 'cyl', label: 'أسطوانية $(r, \\theta, z)$' }]} />
      <Canvas refEl={ref} ratio={0.75} label="صندوق الحجم الصغير في إحداثيات منحنية" />
      <div className="controls">
        <Slider label={k === 'sph' ? '$\\rho$' : '$r$'} value={r} min={0.3} max={1.9} step={0.01} onChange={setR} show={(v) => fmt(v, 2)} color="var(--red)" />
        {k === 'sph' && <Slider label="$\phi$" value={ph} min={0.05} max={Math.PI - 0.4} step={0.01} onChange={setPh} show={deg} color="var(--violet)" />}
        <Slider label="$\theta$" value={th} min={0} max={2 * Math.PI} step={0.01} onChange={setTh} show={deg} color="var(--f1)" />
        {k === 'cyl' && <Slider label="$z$" value={z} min={-1} max={1.6} step={0.01} onChange={setZ} show={(v) => fmt(v, 2)} color="var(--area)" />}
      </div>
      <Readout items={k === 'sph' ? [
        { label: '$(x, y, z)$', value: `(${S(r, ph, th).map((q) => fmt(q, 2)).join(', ')})` },
        { label: 'عامل الحجم $\\rho^2\\sin\\phi$', value: fmt(r * r * Math.sin(ph), 3), color: 'var(--red)' },
        { label: 'حجم الصندوق (تقريباً)', value: fmt(vol, 4) },
      ] : [
        { label: '$(x, y, z)$', value: `(${C(r, th, z).map((q) => fmt(q, 2)).join(', ')})` },
        { label: 'عامل الحجم $r$', value: fmt(r, 3), color: 'var(--red)' },
        { label: 'حجم الصندوق (تقريباً)', value: fmt(vol, 4) },
      ]} />
      <MathText as="div" className="verdict">{k === 'sph' ? '**حجم الكرة:** $\\int_0^{2\\pi}\\int_0^\\pi\\int_0^R\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta = \\tfrac13R^3\\cdot 2\\cdot 2\\pi = \\tfrac43\\pi R^3$. **قرب القطبين ($\\phi \\to 0$) ينكمش الصندوق** لأن دوائر العرض تصغر: هذا هو $\\sin\\phi$. و $x = \\rho\\sin\\phi\\cos\\theta$، $y = \\rho\\sin\\phi\\sin\\theta$، $z = \\rho\\cos\\phi$.' : 'حجم الأسطوانة: $\\int_0^h\\int_0^{2\\pi}\\int_0^R r\\,dr\\,d\\theta\\,dz = \\pi R^2h$. **ابتعد عن المحور: الصندوق يكبر مع $r$**، تماماً كما في المستطيل القطبي.'}</MathText>
    </Widget>
  );
}
