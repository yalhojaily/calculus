import { useCallback, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { type Cam, contourMap, contourSegs, draw3, surface, useOrbit } from '../lib/three';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface F { label: string; f: (x: number, y: number) => number; levels: number[]; z: [number, number]; c0: number; note: string }
const fs: Record<string, F> = {
  cone: { label: '$\\sqrt{x^2 + y^2}$', f: (x, y) => Math.hypot(x, y), levels: [0.5, 1, 1.5, 2, 2.5], z: [0, 2.8], c0: 1.5, note: 'المثال 1: **مخروط** يصعد بميل 1: المسافة إلى الخارج تساوي المسافة إلى أعلى. **خطوط التساوي دوائر** متساوية الأبعاد، نصف قطرها $c$.' },
  bowl: { label: '$x^2 + y^2$', f: (x, y) => x * x + y * y, levels: [0.5, 1, 2, 3, 4, 5], z: [0, 6], c0: 2, note: 'خطوط التساوي **دوائر أيضاً**، لكن السطح ليس مخروطاً: ينحني إلى أعلى كالقطع المكافئ. لاحظ أن الدوائر **تتقارب** كلما ابتعدت: السطح أشد انحداراً هناك.' },
  plane: { label: '$2x + y$', f: (x, y) => 2 * x + y, levels: [-4, -3, -2, -1, 0, 1, 2, 3, 4], z: [-6, 6], c0: 1, note: 'المثال 2: الدالة الخطية سطحها **مستوى**، وخطوط تساويها **خطوط مستقيمة متوازية** $2x + y = c$، متساوية الأبعاد لأن الانحدار ثابت.' },
  saddle: { label: '$y^2 - x^2$', f: (x, y) => y * y - x * x, levels: [-3, -2, -1, -0.3, 0, 0.3, 1, 2, 3], z: [-4, 4], c0: 1, note: '**سرج**: يصعد في اتجاه $y$ وينزل في اتجاه $x$. خطوط التساوي **قطوع زائدة** $y^2 - x^2 = c$، والمستوى $c = 0$ يقطعه في خطين متقاطعين $y = \\pm x$.' },
  util: { label: '$x^2y$ (منفعة)', f: (x, y) => x * x * y, levels: [0.25, 0.5, 1, 2, 3], z: [0, 4], c0: 1, note: 'المثال 5 (الاقتصاد): $x^2y$ قيمة $x$ ساعة يقظة و $y$ ساعة نوم. ساعتا يقظة وربع ساعة نوم $= 4\\cdot\\tfrac14 = 1$، **مثل** ساعة من كل منهما. على **منحنى السواء** نحن غير مبالين، ونقبل تبادل أي نقطتين عليه.' },
};

/** 13.1 — السطح z = f(x, y) ومنحنيات المستوى f(x, y) = c: المستوى الأفقي z = c يقطع السطح، وظل التقاطع على القاعدة خط تساوٍ. */
export default function SurfaceContour({ initial = 'cone', only }: { initial?: keyof typeof fs; only?: (keyof typeof fs)[] }) {
  const [k, setK] = useState<string>(initial);
  const F = fs[k];
  const [c, setC] = useState(F.c0);
  const [cam, setCam0] = useState<Cam>({ az: 0.75, el: 0.5 });
  const setCam = useCallback((f: (c: Cam) => Cam) => setCam0(f), []);
  const R = 2, isUtil = k === 'util';
  const xr: [number, number] = isUtil ? [0.05, 2] : [-R, R], yr: [number, number] = isUtil ? [0.05, 2] : [-R, R];
  const zs = 2.2 / Math.max(Math.abs(F.z[0]), Math.abs(F.z[1])); // تحجيم رأسي للعرض
  const s3 = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -2.9, 2.9, -2.6, 2.9);
    const g = draw3(p, cam);
    g.floor(2, 1);
    const fz = (x: number, y: number) => zs * F.f(x, y);
    // الخط المقطوع على القاعدة
    for (const [a, b, c2, d] of contourSegs(F.f, c, xr, yr, 60)) g.line([a, b, 0], [c2, d, 0], p.c.red, { width: 2.2 });
    surface(p, cam, fz, xr, yr, { n: 24, zMin: zs * F.z[0], zMax: zs * F.z[1], alpha: 0.82 });
    // المستوى الأفقي z = c
    const h = zs * c;
    g.poly([[xr[0], yr[0], h], [xr[1], yr[0], h], [xr[1], yr[1], h], [xr[0], yr[1], h]], p.c.violet, 0.16);
    for (const [a, b, c2, d] of contourSegs(F.f, c, xr, yr, 60)) g.line([a, b, h], [c2, d, h], p.c.red, { width: 2.6 });
    g.axes(2.6);
  }, [k, c, cam]);
  useOrbit(s3, setCam);
  const map = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, xr[0] - 0.1, xr[1] + 0.1, yr[0] - 0.1, yr[1] + 0.1);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    contourMap(p, F.f, F.levels, xr, yr, { n: 80 });
    for (const [a, b, c2, d] of contourSegs(F.f, c, xr, yr, 80)) p.line(a, b, c2, d, p.c.red, { width: 3 });
  }, [k, c]);
  return (
    <Widget title="السطح وخطوط التساوي" hint="رسم $z = f(x, y)$ **سطح** في الفضاء. **خط التساوي** $f(x, y) = c$ يحوي كل النقاط $(x, y)$ التي تشترك في القيمة نفسها: المستوى الأفقي $z = c$ (البنفسجي) يقطع السطح، وظل التقاطع على القاعدة هو الخط الأحمر. يمين: **الخريطة الكنتورية**، كل خطوط التساوي معاً، كخريطة جبل أو طقس. اسحب السطح لتديره.">
      {(only ?? Object.keys(fs)).length > 1 && <Choice value={k} onChange={(v) => { setK(v); setC(fs[v].c0); }} options={((only ?? Object.keys(fs)) as string[]).map((v) => ({ v, label: fs[v].label }))} />}
      <div className="cv-row">
        <div><Canvas refEl={s3} ratio={0.9} label="سطح ثلاثي الأبعاد يقطعه مستوى أفقي" /><div className="cv-cap">السطح والمستوى z = c</div></div>
        <div><Canvas refEl={map} ratio={0.9} label="خريطة خطوط التساوي" /><div className="cv-cap">الخريطة الكنتورية</div></div>
      </div>
      <div className="controls"><Slider label="المستوى $c$" value={c} min={F.z[0]} max={F.z[1]} step={(F.z[1] - F.z[0]) / 100} onChange={setC} show={(v) => fmt(v, 2)} color="var(--red)" /></div>
      <Readout items={[{ label: 'قيمة $c$ على الخط الأحمر', value: fmt(c, 2), color: 'var(--red)' }]} />
      <MathText as="div" className="verdict">{F.note}</MathText>
    </Widget>
  );
}
