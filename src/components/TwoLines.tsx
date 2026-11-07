import { useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

/** 11.4 — معادلتان في مجهولين: صورة الصفوف (خطان يتقاطعان) وصورة الأعمدة (تركيبة xa + yb تصل إلى d)، وقاعدة كرامر. */
export default function TwoLines() {
  const [a1, setA1] = useState(1); const [b1, setB1] = useState(2);
  const [a2, setA2] = useState(1); const [b2, setB2] = useState(-1);
  const [d1, setD1] = useState(3); const [d2, setD2] = useState(0);
  const D = a1 * b2 - a2 * b1;
  const sing = Math.abs(D) < 1e-9;
  const x = sing ? NaN : (d1 * b2 - b1 * d2) / D, y = sing ? NaN : (a1 * d2 - a2 * d1) / D;
  const rows = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -4, 4, -4, 4);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    const lineOf = (a: number, b: number, d: number, col: string) => {
      if (Math.abs(b) > 1e-9) p.fn((t) => (d - a * t) / b, col, { width: 2.6 });
      else if (Math.abs(a) > 1e-9) p.line(d / a, p.view.yMin, d / a, p.view.yMax, col, { width: 2.6 });
    };
    lineOf(a1, b1, d1, p.c.f1); lineOf(a2, b2, d2, p.c.f2);
    if (!sing) p.point(x, y, p.c.red, 6);
  }, [a1, b1, a2, b2, d1, d2]);
  const cols = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -5, 5, -5, 5);
    p.axes({});
    p.arrow(0, 0, a1, a2, p.c.f1, { width: 1.6 }); p.arrow(0, 0, b1, b2, p.c.f2, { width: 1.6 });
    if (!sing) {
      p.arrow(0, 0, x * a1, x * a2, p.c.f1, { width: 3 });
      p.arrow(x * a1, x * a2, x * a1 + y * b1, x * a2 + y * b2, p.c.f2, { width: 3 });
    }
    p.point(d1, d2, p.c.red, 6);
    p.text('a', a1, a2, p.c.f1, { dx: 5, dy: -4 }); p.text('b', b1, b2, p.c.f2, { dx: 5, dy: -4 }); p.text('d', d1, d2, p.c.red, { dx: 6, dy: -6 });
  }, [a1, b1, a2, b2, d1, d2, x, y]);
  const S = (label: string, v: number, set: (n: number) => void, color: string) => <Slider label={label} value={v} min={-3} max={3} step={0.5} onChange={set} show={(n) => fmt(n, 1)} color={color} />;
  return (
    <Widget title="صورة الصفوف وصورة الأعمدة" hint="$a_1x + b_1y = d_1$ و $a_2x + b_2y = d_2$. **الصفوف:** كل معادلة خط، والحل نقطة التقاطع (يسار). **الأعمدة:** المعادلة نفسها $x\mathbf a + y\mathbf b = \mathbf d$ مع العمودين $\mathbf a = (a_1, a_2)$ و $\mathbf b = (b_1, b_2)$: أي تركيبة منهما تصل إلى $\mathbf d$؟ (يمين). **المصفوفة** $A\mathbf u = \mathbf d$ تحوي الصورتين معاً.">
      <div className="cv-row">
        <div><Canvas refEl={rows} ratio={0.9} label="صورة الصفوف: خطان" /><div className="cv-cap">الصفوف: خطان يتقاطعان</div></div>
        <div><Canvas refEl={cols} ratio={0.9} label="صورة الأعمدة: تركيبة متجهين" /><div className="cv-cap">الأعمدة: x a + y b = d</div></div>
      </div>
      <div className="controls">
        {S('$a_1$', a1, setA1, 'var(--f1)')}{S('$b_1$', b1, setB1, 'var(--f2)')}{S('$d_1$', d1, setD1, 'var(--red)')}
        {S('$a_2$', a2, setA2, 'var(--f1)')}{S('$b_2$', b2, setB2, 'var(--f2)')}{S('$d_2$', d2, setD2, 'var(--red)')}
      </div>
      <Readout items={[
        { label: '$\\det A = a_1b_2 - a_2b_1$', value: fmt(D, 3), color: sing ? 'var(--red)' : undefined },
        { label: 'كرامر: $x = \\dfrac{d_1b_2 - b_1d_2}{\\det A}$', value: sing ? '—' : fmt(x, 4), color: 'var(--f1)' },
        { label: '$y = \\dfrac{a_1d_2 - a_2d_1}{\\det A}$', value: sing ? '—' : fmt(y, 4), color: 'var(--f2)' },
      ]} />
      <MathText as="div" className="verdict">{sing ? '**الحالة الشاذة: $\\det A = 0$.** الخطان متوازيان (لا حل) أو متطابقان (حلول لانهائية). وفي صورة الأعمدة: $\\mathbf a$ و $\\mathbf b$ على خط واحد، فلا تصل تركيبتهما إلى $\\mathbf d$ إلا إن كان على ذلك الخط. **قاعدة كرامر تنهار لأننا نقسم على صفر.**' : 'البداية المثال 2: $x + 2y = 3$ و $x - y = 0$، والحل $(1, 1)$: **مرة واحدة $\\mathbf a$ ومرة واحدة $\\mathbf b$ تعطي $\\mathbf d$.** اجعل الصفين متناسبين (مثلاً $a_2 = 1$، $b_2 = 2$) لتصل إلى الحالة الشاذة.'}</MathText>
    </Widget>
  );
}
