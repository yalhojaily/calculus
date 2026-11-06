import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

const presets: Record<string, { label: string; f: number[] }> = {
  any: { label: 'أي أعداد', f: [0, 2, 6, 7, 4, 9] },
  squares: { label: 'المربعات', f: [0, 1, 4, 9, 16] },
  powers: { label: 'قوى 2', f: [1, 2, 4, 8, 16] },
  osc: { label: 'تذبذب', f: [0, 1, 1, 0, -1, -1, 0] },
  linear: { label: 'خطية', f: [2, 3, 4, 5, 6, 7] },
};

/** 1.2 — مجموع الفروق = آخر f ناقص أول f. المبرهنة الأساسية بلا نهايات. */
export default function Differences() {
  const [key, setKey] = useState('squares');
  const [fs, setFs] = useState<number[]>(presets.squares.f);
  const [text, setText] = useState(presets.squares.f.join(', '));
  const n = fs.length - 1;
  const [tEnd, setTEnd] = useState(n);
  const end = Math.min(tEnd, n);
  const vs = fs.slice(1).map((x, j) => x - fs[j]);

  // f متعددة القطع الخطية، و v ثابتة على كل قطعة
  const F = (t: number) => {
    if (t <= 0) return fs[0];
    if (t >= n) return fs[n];
    const j = Math.floor(t);
    return fs[j] + (t - j) * vs[j];
  };
  const V = (t: number) => vs[Math.min(n - 1, Math.max(0, Math.floor(t)))];

  const lo = Math.min(...fs, ...vs, 0);
  const hi = Math.max(...fs, ...vs, 1);
  const pad = (hi - lo) * 0.12 + 0.5;
  const view = { xMin: -0.3, xMax: n + 0.3, yMin: lo - pad, yMax: hi + pad };

  const fRef = usePlot(view, (p) => {
    p.axes({ xLabel: 't', yLabel: 'f', xStep: 1 });
    p.fn(F, p.c.f1, { width: 1.4, dash: [3, 4], from: 0, to: n });
    p.fn(F, p.c.f1, { width: 3, from: 0, to: Math.max(end, 1e-4) });
    fs.forEach((y, j) => p.point(j, y, p.c.f1, 4));
    p.point(end, F(end), p.c.f2, 6);
  }, [fs, end]);

  const vRef = usePlot(view, (p) => {
    p.axes({ xLabel: 't', yLabel: 'v', xStep: 1 });
    for (let j = 0; j < n; j++) {
      const b = Math.min(j + 1, end);
      if (b > j) p.rect(j, 0, b, vs[j], vs[j] >= 0 ? p.c.area : p.c.red, { alpha: 0.3 });
      p.line(j, vs[j], j + 1, vs[j], p.c.f2, { width: 3 });
    }
    p.line(end, view.yMin, end, view.yMax, p.c['ink-3'], { width: 1, dash: [4, 4] });
  }, [fs, end]);

  const apply = (s: string) => {
    setText(s);
    const arr = s.split(/[,\s،]+/).filter(Boolean).map(Number);
    if (arr.length >= 2 && arr.length <= 12 && arr.every(Number.isFinite)) { setFs(arr); setTEnd(arr.length - 1); setKey(''); }
  };
  const area = F(end) - fs[0];
  const sumTex = vs.slice(0, Math.ceil(end)).map((v, j) => {
    const w = Math.min(1, end - j);
    const term = w < 1 ? `${fmt(w)}(${fmt(v)})` : `(${fmt(v)})`;
    return term;
  }).join(' + ') || '0';

  return (
    <Widget title="الفروق تُجمع إلى (آخر f) − (أول f)" hint="اكتب أي أعداد تريد. كل فرق $v_j = f_j - f_{j-1}$ هو **ميل** قطعة في رسم $f$، و**ارتفاع** مستطيل في رسم $v$ قاعدته $1$. عند الجمع تلغي الأعداد الوسطى بعضها، فلا يبقى إلا أول $f$ وآخرها.">
      <Choice value={key} onChange={(k) => { setKey(k); setFs(presets[k].f); setText(presets[k].f.join(', ')); setTEnd(presets[k].f.length - 1); }} options={Object.entries(presets).map(([v, p]) => ({ v, label: p.label }))} />
      <label className="diff-input">
        <span>الأعداد <i className="ltr">f</i>:</span>
        <input dir="ltr" value={text} onChange={(e) => apply(e.target.value)} aria-label="أعداد f مفصولة بفواصل" />
      </label>
      <table>
        <tbody>
          <tr><th>f</th>{fs.map((x, j) => <td key={j} colSpan={2}>{fmt(x)}</td>)}</tr>
          <tr><th>v</th><td />{vs.map((v, j) => <td key={j} colSpan={2} style={{ color: v < 0 ? 'var(--red)' : 'var(--f2)' }}>{fmt(v)}</td>)}<td /></tr>
        </tbody>
      </table>
      <div className="cv-row">
        <div><Canvas refEl={fRef} ratio={0.75} label="f متعددة القطع الخطية" /><div className="cv-cap f1">المسافات <i>f</i> — ميل كل قطعة هو <i>v</i></div></div>
        <div><Canvas refEl={vRef} ratio={0.75} label="v ثابتة على كل قطعة" /><div className="cv-cap f2">الفروق <i>v</i> — والمساحة تحتها</div></div>
      </div>
      <div className="controls">
        <Slider label="توقّف عند $t$" value={tEnd} min={0} max={n} step={0.1} onChange={setTEnd} show={(v) => fmt(v, 1)} color="var(--area)" />
      </div>
      <Readout items={[
        { label: 'المساحة تحت $v$ حتى $t$', value: fmt(area, 3), color: 'var(--area)' },
        { label: '$f(t) - f(0)$', value: fmt(F(end) - fs[0], 3), color: 'var(--f1)' },
      ]} />
      <MathText as="div" className="verdict">{`$${sumTex} = ${fmt(area, 3)}$`}</MathText>
    </Widget>
  );
}
