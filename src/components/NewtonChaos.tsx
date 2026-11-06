import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Choice, Slider, Widget } from './ui';

/** 3.7 — نيوتن لـ x² + 1 = 0 (لا جذر حقيقي): x(n+1) = ½(x(n) − 1/x(n))، والحل xₙ = cot(2ⁿθ). */
export default function NewtonChaos() {
  const [mode, setMode] = useState<'pi16' | 'pi9' | 'pi3' | 'one'>('pi9');
  const [n, setN] = useState(12);
  const theta = { pi16: Math.PI / 16, pi9: Math.PI / 9, pi3: Math.PI / 3, one: 1 }[mode];
  const rows: { k: number; newton: number; cot: number }[] = [];
  let x = 1 / Math.tan(theta);
  for (let k = 0; k <= n; k++) {
    rows.push({ k, newton: x, cot: 1 / Math.tan(2 ** k * theta) });
    x = 0.5 * (x - 1 / x);
  }
  const show = (v: number) => (!Number.isFinite(v) || Math.abs(v) > 1e9 ? '∞' : fmt(v, 6));
  return (
    <Widget title="نيوتن يحاول حلّ x² + 1 = 0" hint="المنحنى $y = x^2 + 1$ لا يقطع المحور أبداً، ومع ذلك يعطي نيوتن تكراراً: $x_{n+1} = \tfrac12\left(x_n - \tfrac{1}{x_n}\right)$. وإذا بدأنا من $x_0 = \cot\theta$ فإن $x_n = \cot 2^n\theta$: كل خطوة **تضاعف الزاوية**. مع $\pi/16$ تنفجر المتتالية بعد 4 خطوات، ومع $\pi/3$ تدور بين قيمتين، ومع $\theta = 1$ **لا تعود أبداً**. وبعد 50 خطوة لا يستطيع الحاسوب نفسه أن يتبعها: خطأ التقريب يتضاعف مع الزاوية.">
      <Choice value={mode} onChange={setMode} options={[{ v: 'pi16', label: '$\\theta = \\pi/16$' }, { v: 'pi9', label: '$\\theta = \\pi/9$' }, { v: 'pi3', label: '$\\theta = \\pi/3$' }, { v: 'one', label: '$\\theta = 1$' }]} />
      <div className="controls">
        <Slider label="عدد الخطوات" value={n} min={4} max={60} step={1} onChange={setN} />
      </div>
      <div className="table-scroll" style={{ maxHeight: 340, overflowY: 'auto' }}>
        <table>
          <thead><tr><th>n</th><th>Newton xₙ</th><th>cot(2ⁿθ)</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.k} className={Math.abs(r.newton - r.cot) > 1e-3 * (1 + Math.abs(r.cot)) ? 'hl' : ''}><td>{r.k}</td><td>{show(r.newton)}</td><td>{show(r.cot)}</td></tr>)}</tbody>
        </table>
      </div>
    </Widget>
  );
}
