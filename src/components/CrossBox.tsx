import { useCallback, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { type Cam, type V3, add, cross, dot, draw3, len, useOrbit } from '../lib/three';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type K = 'cross' | 'box';
const sph = (r: number, az: number, el: number): V3 => [r * Math.cos(el) * Math.cos(az), r * Math.cos(el) * Math.sin(az), r * Math.sin(el)];
const v3 = (v: V3) => `(${v.map((x) => fmt(x, 2)).join(', ')})`;

/** 11.3 — الضرب الاتجاهي A × B: عمودي على الاثنين (قاعدة اليد اليمنى) وطوله مساحة متوازي الأضلاع. والضرب الثلاثي A·(B × C) حجم الصندوق = المحدد. */
export default function CrossBox() {
  const [k, setK] = useState<K>('cross');
  const [tb, setTb] = useState(1.3);
  const [zb, setZb] = useState(0);
  const [hc, setHc] = useState(1.6);
  const [cam, setCam0] = useState<Cam>({ az: 0.75, el: 0.4 });
  const setCam = useCallback((f: (c: Cam) => Cam) => setCam0(f), []);
  const A: V3 = [1.6, 0, 0];
  const B: V3 = sph(1.4, tb, zb);
  const C: V3 = [0.5, 0.6, hc];
  const X = cross(A, B);
  const vol = dot(A, cross(B, C));
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -3, 3.2, -2.4, 3.6);
    const g = draw3(p, cam);
    g.floor(2, 1); g.axes(2.6);
    const O: V3 = [0, 0, 0];
    if (k === 'cross') {
      g.poly([O, A, add(A, B), B], p.c.area, 0.3);
      g.arrow(O, A, p.c.f1, { width: 3 }); g.arrow(O, B, p.c.f2, { width: 3 });
      g.arrow(O, X, p.c.red, { width: 3.4 });
      g.text('A', A, p.c.f1, { dx: 6 }); g.text('B', B, p.c.f2, { dx: 6 }); g.text('A × B', X, p.c.red, { dx: 6 });
    } else {
      const AB = add(A, B), AC = add(A, C), BC = add(B, C), ABC = add(AB, C);
      const faces: V3[][] = [[O, A, AB, B], [C, AC, ABC, BC], [O, A, AC, C], [B, AB, ABC, BC], [O, B, BC, C], [A, AB, ABC, AC]];
      faces.forEach((f) => g.poly(f, p.c.violet, 0.1));
      g.arrow(O, A, p.c.f1, { width: 3 }); g.arrow(O, B, p.c.f2, { width: 3 }); g.arrow(O, C, p.c.area, { width: 3 });
      g.arrow(O, X, p.c.red, { width: 1.6 });
      g.text('A', A, p.c.f1, { dx: 6 }); g.text('B', B, p.c.f2, { dx: 6 }); g.text('C', C, p.c.area, { dx: 6 });
    }
  }, [k, tb, zb, hc, cam]);
  useOrbit(ref, setCam);
  const th = Math.acos(Math.max(-1, Math.min(1, dot(A, B) / (len(A) * len(B)))));
  return (
    <Widget title={k === 'cross' ? 'الضرب الاتجاهي' : 'حجم الصندوق والمحدد'} hint={k === 'cross' ? 'الضرب النقطي عدد، **أما $\\mathbf A\\times\\mathbf B$ فمتجه**: طوله $|\\mathbf A||\\mathbf B||\\sin\\theta|$ (مساحة متوازي الأضلاع الأخضر)، واتجاهه عمودي على $\\mathbf A$ و $\\mathbf B$ حسب قاعدة اليد اليمنى: لُفّ أصابعك من $\\mathbf A$ إلى $\\mathbf B$ فيشير إبهامك إلى $\\mathbf A\\times\\mathbf B$. أدِر $\\mathbf B$ إلى ما بعد $\\mathbf A$ ($\\theta$ سالبة): ينقلب الأحمر إلى أسفل. اسحب الرسم لتديره.' : 'ثلاثة متجهات من الأصل تصنع صندوقاً (متوازي سطوح). مساحة القاعدة $|\\mathbf A\\times\\mathbf B|$، والارتفاع مركّبة $\\mathbf C$ على العمودي $\\mathbf A\\times\\mathbf B$. **الحجم $|\\mathbf C\\cdot(\\mathbf A\\times\\mathbf B)|$ = القيمة المطلقة للمحدد** $3\\times 3$. خفّض $\\mathbf C$ إلى المستوى: الحجم صفر.'}>
      <Choice value={k} onChange={setK} options={[{ v: 'cross', label: 'A × B' }, { v: 'box', label: 'الصندوق' }]} />
      <Canvas refEl={ref} ratio={0.75} label="الضرب الاتجاهي في ثلاثة أبعاد" />
      <div className="controls">
        <Slider label="زاوية $\mathbf B$ في المستوى $xy$" value={tb} min={-Math.PI} max={Math.PI} step={0.01} onChange={setTb} show={(x) => `${fmt((x * 180) / Math.PI, 0)}°`} color="var(--f2)" />
        <Slider label="ميل $\mathbf B$ عن المستوى" value={zb} min={-1.2} max={1.2} step={0.01} onChange={setZb} show={(x) => `${fmt((x * 180) / Math.PI, 0)}°`} color="var(--f2)" />
        {k === 'box' && <Slider label="ارتفاع $\mathbf C$" value={hc} min={-2} max={2.2} step={0.05} onChange={setHc} show={(x) => fmt(x, 2)} color="var(--area)" />}
      </div>
      <Readout items={k === 'cross' ? [
        { label: '$\\mathbf A$', value: v3(A), color: 'var(--f1)' },
        { label: '$\\mathbf B$', value: v3(B), color: 'var(--f2)' },
        { label: '$\\mathbf A\\times\\mathbf B$', value: v3(X), color: 'var(--red)' },
        { label: '$|\\mathbf A\\times\\mathbf B|$', value: fmt(len(X), 3), color: 'var(--area)' },
        { label: '$|\\mathbf A||\\mathbf B|\\sin\\theta$', value: fmt(len(A) * len(B) * Math.sin(th), 3) },
        { label: '$\\mathbf A\\cdot(\\mathbf A\\times\\mathbf B)$', value: fmt(dot(A, X), 6) },
      ] : [
        { label: '$\\mathbf C$', value: v3(C), color: 'var(--area)' },
        { label: '$\\mathbf A\\cdot(\\mathbf B\\times\\mathbf C)$ = المحدد', value: fmt(vol, 4), color: 'var(--violet)' },
        { label: 'الحجم', value: fmt(Math.abs(vol), 4) },
      ]} />
      <MathText as="div" className="verdict">{k === 'cross' ? '**الصيغة (6):** $\\mathbf A\\times\\mathbf B = (a_2b_3 - a_3b_2)\\mathbf i + (a_3b_1 - a_1b_3)\\mathbf j + (a_1b_2 - a_2b_1)\\mathbf k$، بنمط دوري: $\\mathbf i$ من الدليلين 2، 3 و $\\mathbf j$ من 3، 1 و $\\mathbf k$ من 1، 2. **والضرب غير تبديلي**: $\\mathbf B\\times\\mathbf A = -\\mathbf A\\times\\mathbf B$، واكتشاف هاملتون لهذا أحدث ثورة في جبر القرن التاسع عشر. والمتوازيان ضربهما صفر.' : 'ترتيب المتجهات الدوري لا يغيّر الحجم: $\\mathbf A\\cdot(\\mathbf B\\times\\mathbf C) = \\mathbf B\\cdot(\\mathbf C\\times\\mathbf A) = \\mathbf C\\cdot(\\mathbf A\\times\\mathbf B)$. **المحدد صفر تماماً حين تقع المتجهات الثلاثة في مستوى واحد**: صندوق مسطّح. وإشارة المحدد تخبر إن كان الثلاثي يمينياً.'}</MathText>
    </Widget>
  );
}
