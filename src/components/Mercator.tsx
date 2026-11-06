import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

const D = Math.PI / 180;
const merc = (lat: number) => Math.log(1 / Math.cos(lat) + Math.tan(lat));

/** 7.2 — خريطة ميركاتور: الشريط عند خط العرض x يُمطّ بعامل sec x، فالمسافة شمالاً ∫ sec x dx = ln(sec x + tan x). */
export default function Mercator() {
  const [lat, setLat] = useState(60);
  const L = lat * D;
  const lines = [0, 10, 20, 30, 40, 50, 60, 70, 80];
  const globe = usePlot({ xMin: -1.15, xMax: 1.15, yMin: -0.1, yMax: 1.15 }, (p) => {
    p.curve(Math.cos, Math.sin, 0, Math.PI, p.c.ink, { width: 2 });
    for (const d of lines) { const y = Math.sin(d * D), w = Math.cos(d * D); p.line(-w, y, w, y, d === lat ? p.c.red : p.c['ink-3'], { width: d === lat ? 2.4 : 1 }); }
    p.line(-Math.cos(L), Math.sin(L), Math.cos(L), Math.sin(L), p.c.red, { width: 2.6 });
    p.line(0, 0, Math.cos(L), Math.sin(L), p.c.f2, { width: 1.4, dash: [4, 3] });
    p.text(`${lat}°`, Math.cos(L), Math.sin(L), p.c.red, { dx: 6 });
  }, [lat]);
  const yMax = merc(85 * D) * 1.04;
  const map = usePlot({ xMin: -1.15, xMax: 1.15, yMin: -0.1, yMax }, (p) => {
    p.rect(-1, 0, 1, yMax, p.c.f1, { alpha: 0.06, stroke: false });
    for (const d of lines) { const y = merc(d * D); p.line(-1, y, 1, y, d === lat ? p.c.red : p.c['ink-3'], { width: d === lat ? 2.4 : 1 }); p.text(`${d}°`, -1, y, p.c['ink-3'], { align: 'right', dx: -4 }); }
    const y = merc(L); p.line(-1, y, 1, y, p.c.red, { width: 2.6 });
  }, [lat]);
  return (
    <Widget title="خريطة ميركاتور وتكامل القاطع" hint="يسار: خطوط العرض على الكرة، كل 10°. طول خط العرض $x$ يتناسب مع $\cos x$. ميركاتور **يمطّ كل شريط أفقياً بعامل $1/\cos x$** ليصير كل خطوط العرض بطول واحد، ولكي تبقى الزوايا محفوظة يمطّه **رأسياً أيضاً** بالعامل نفسه. فالمسافة شمالاً على الخريطة تجمع $dx/\cos x$: إنها $\int \sec x\,dx$.">
      <div className="cv-row">
        <div><Canvas refEl={globe} ratio={0.62} label="خطوط العرض على الكرة" /><div className="cv-cap">على الكرة: تباعد متساوٍ</div></div>
        <div><Canvas refEl={map} ratio={1.15} label="خطوط العرض على خريطة ميركاتور" /><div className="cv-cap f1">على الخريطة: تتباعد نحو القطب</div></div>
      </div>
      <div className="controls">
        <Slider label="خط العرض" value={lat} min={0} max={85} step={1} onChange={setLat} show={(v) => `${v}°`} color="var(--red)" />
      </div>
      <Readout items={[
        { label: 'عامل المطّ $\\sec x$', value: fmt(1 / Math.cos(L), 3), color: 'var(--f2)' },
        { label: 'البعد على الخريطة $\\ln(\\sec x + \\tan x)$', value: fmt(merc(L), 4), color: 'var(--red)' },
        { label: 'البعد على الكرة $x$ (راديان)', value: fmt(L, 4) },
      ]} />
      <MathText as="div" className="verdict">{'**المسافة إلى القطب الشمالي لانهائية!** قرب القطب تتشوّه الخريطة تماماً، ولهذا تبدو غرينلاند ضخمة. ومن المدهش أن أحداً طابق المسافات على الخريطة بجدول لوغاريتمات، فاكتشف $\\int \\sec x\\,dx$ قبل التفاضل والتكامل.'}</MathText>
    </Widget>
  );
}
