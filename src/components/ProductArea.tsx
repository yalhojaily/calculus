import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

/** 2.5 — الشكل 2.13: مستطيل u × v يكبر. الزيادة = شريطان u Δv و v Δu + زاوية صغيرة Δu Δv. */
export default function ProductArea() {
  const [u, setU] = useState(3);
  const [v, setV] = useState(2);
  const [dx, setDx] = useState(0.5);
  const du = 1.2 * dx, dv = 0.9 * dx;
  const ref = usePlot({ xMin: -0.3, xMax: 6, yMin: -0.3, yMax: 4.4 }, (p) => {
    p.pad = { l: 12, r: 8, t: 8, b: 12 };
    const C = p.c;
    p.rect(0, 0, u, v, C.f1, { alpha: 0.18 });
    p.rect(0, v, u, v + dv, C.f2, { alpha: 0.45 });
    p.rect(u, 0, u + du, v, C.area, { alpha: 0.45 });
    p.rect(u, v, u + du, v + dv, C.red, { alpha: 0.6 });
    p.text('u v', u / 2, v / 2, C.f1, { align: 'center', base: 'middle', size: 16 });
    p.text('u Δv', u / 2, v + dv / 2, C.f2, { align: 'center', base: 'middle' });
    p.text('v Δu', u + du / 2, v / 2, C.area, { align: 'center', base: 'middle' });
    p.text('u', u / 2, 0, C['ink-2'], { align: 'center', base: 'top', dy: 2 });
    p.text('v', 0, v / 2, C['ink-2'], { align: 'right', base: 'middle', dx: -3 });
  }, [u, v, dx]);
  const strips = u * dv + v * du;
  const corner = du * dv;
  return (
    <Widget title="قاعدة الضرب في صورة: مستطيل يكبر" hint="عندما يكبر الضلعان $u$ و $v$ قليلاً، تزيد المساحة بشريطين، $u\,\Delta v$ (البرتقالي) و $v\,\Delta u$ (الأخضر)، وزاوية صغيرة $\Delta u\,\Delta v$ (الأحمر). صغّر الخطوة: الزاوية تختفي أسرع بكثير من الشريطين لأنها من **الرتبة الثانية**. بعد القسمة على $\Delta x$ يبقى $u\frac{dv}{dx} + v\frac{du}{dx}$.">
      <Canvas refEl={ref} ratio={0.72} label="مستطيل مساحته u في v" />
      <div className="controls">
        <Slider label="$u$" value={u} min={1} max={4.5} step={0.1} onChange={setU} show={(x) => fmt(x)} />
        <Slider label="$v$" value={v} min={1} max={3.2} step={0.1} onChange={setV} show={(x) => fmt(x)} />
        <Slider label="الخطوة $\Delta x$" value={dx} min={0.02} max={1} step={0.02} onChange={setDx} show={(x) => fmt(x)} color="var(--red)" />
      </div>
      <Readout items={[
        { label: 'الشريطان $u\\Delta v + v\\Delta u$', value: fmt(strips, 4), color: 'var(--f2)' },
        { label: 'الزاوية $\\Delta u\\,\\Delta v$', value: fmt(corner, 4), color: 'var(--red)' },
        { label: 'الزاوية ÷ الشريطين', value: `${fmt((100 * corner) / strips, 1)}%` },
      ]} />
    </Widget>
  );
}
