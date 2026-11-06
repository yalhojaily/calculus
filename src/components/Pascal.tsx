import { useState } from 'react';
import { MathText } from './MathText';
import { Slider, Widget } from './ui';

const choose = (n: number, k: number) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };

/** 2.2 — مثلث باسكال: الحد الذي فيه h واحدة هو n xⁿ⁻¹ h، وهو وحده الذي يبقى في المشتقة. */
export default function Pascal() {
  const [n, setN] = useState(4);
  const rows = Array.from({ length: 9 }, (_, r) => Array.from({ length: r + 1 }, (_, k) => choose(r, k)));
  const term = (k: number) => {
    const c = choose(n, k);
    const xp = n - k, hp = k;
    const x = xp === 0 ? '' : xp === 1 ? 'x' : `x^{${xp}}`;
    const h = hp === 0 ? '' : hp === 1 ? 'h' : `h^{${hp}}`;
    const body = `${c === 1 && (x || h) ? '' : c}${x}${h}`;
    return k === 1 ? `\\htmlClass{f2}{${body}}` : body;
  };
  const expansion = Array.from({ length: n + 1 }, (_, k) => term(k)).join(' + ');
  return (
    <Widget title="مثلث باسكال وحدّ الرتبة الأولى" hint="من $n$ أقواس $(x + h)$ نختار $h$ من **قوس واحد فقط** و $x$ من البقية: هناك $n$ طريقة، فالحد $n x^{n-1} h$. بعد طرح $x^n$ والقسمة على $h$ يبقى هذا الحد وحده، وكل الحدود الأخرى فيها $h$ وتختفي. أما مجموع كل صف فهو $2^n$.">
      <div className="pascal" dir="ltr">
        {rows.map((row, r) => (
          <div key={r} className={`pascal-row ${r === n ? 'on' : ''}`}>
            {row.map((c, k) => <span key={k} className={r === n && k === 1 ? 'key' : ''}>{c}</span>)}
          </div>
        ))}
      </div>
      <div className="controls">
        <Slider label="القوة $n$" value={n} min={1} max={8} step={1} onChange={setN} color="var(--f2)" />
      </div>
      <MathText as="div" className="verdict">{`$(x + h)^{${n}} = ${expansion}$`}</MathText>
      <MathText as="div" className="verdict">{`$\\dfrac{(x + h)^{${n}} - x^{${n}}}{h} = \\htmlClass{f2}{${n === 1 ? '1' : `${n}x${n - 1 === 1 ? '' : `^{${n - 1}}`}`}} + (\\text{terms with } h) \\;\\longrightarrow\\; ${n === 1 ? '1' : `${n}x${n - 1 === 1 ? '' : `^{${n - 1}}`}`}$`}</MathText>
    </Widget>
  );
}
