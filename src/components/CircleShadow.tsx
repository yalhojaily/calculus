import { useState } from 'react';
import { fmt } from '../lib/plot';
import { AnimControls, Canvas, Choice, Readout, Widget, useClock, usePlot } from './ui';

/**
 * 1.4 — كرة تدور على دائرة نصف قطرها 1 بزاوية ωt، و«ظلّها» يصعد وينزل على خط رأسي.
 * ارتفاع الظل sin(ωt)، وسرعته الرأسية هي السرعة الرأسية للكرة: ω cos(ωt).
 */
export default function CircleShadow() {
  const [w, setW] = useState(1);
  const clock = useClock(14, { loop: true });
  const T = 2 * Math.PI;
  const t = clock.t * T;
  const a = w * t;
  const x = Math.cos(a), y = Math.sin(a);
  const vx = -w * Math.sin(a), vy = w * Math.cos(a);
  const S = 1.75;

  const cRef = usePlot({ xMin: -S, xMax: S, yMin: -S, yMax: S }, (p) => {
    p.pad = { l: 8, r: 8, t: 8, b: 8 };
    const { c } = p;
    p.line(-S, 0, S, 0, c['ink-3'], { width: 1 });
    p.line(0, -S, 0, S, c['ink-3'], { width: 1 });
    p.curve(Math.cos, Math.sin, 0, T, c['ink-2'], { width: 1.6 });
    // مثلث الموضع: cos أفقياً و sin رأسياً
    p.line(0, 0, x, y, c['ink-2'], { width: 1.6 });
    p.line(0, 0, x, 0, c.violet, { width: 3 });
    p.line(x, 0, x, y, c.f1, { width: 3 });
    p.text('cos', x / 2, 0, c.violet, { align: 'center', base: y >= 0 ? 'top' : 'bottom', dy: y >= 0 ? 4 : -4 });
    p.text('sin', x, y / 2, c.f1, { align: x >= 0 ? 'left' : 'right', base: 'middle', dx: x >= 0 ? 6 : -6 });
    // سهم السرعة: مماس للدائرة، طوله ω
    const k = 0.55;
    p.arrow(x, y, x + k * vx, y + k * vy, c.f2);
    p.arrow(x, y, x, y + k * vy, c.f2, { width: 1.4, head: 7 });
    // الظل على خط رأسي عند x = 1.5
    p.line(1.5, -1, 1.5, 1, c.line, { width: 4 });
    p.line(x, y, 1.5, y, c['ink-3'], { width: 1, dash: [3, 4] });
    p.point(1.5, y, c.f1, 7);
    p.point(x, y, c.ink, 7);
  }, [a, w]);

  const gRef = usePlot({ xMin: -0.2, xMax: T + 0.2, yMin: -2.3, yMax: 2.3 }, (p) => {
    p.axes({ xLabel: 't', yLabel: '', xStep: Math.PI / 2 });
    p.fn((s) => w * Math.cos(w * s), p.c.f2, { width: 1.6, dash: [5, 4] });
    p.fn((s) => Math.sin(w * s), p.c.f1, { width: 1.4, dash: [2, 4] });
    p.fn((s) => Math.sin(w * s), p.c.f1, { width: 3, from: 0, to: Math.max(t, 1e-4) });
    p.lineThrough(t, y, vy, p.c.f2, { width: 2 });
    p.point(t, y, p.c.f1, 6);
    p.point(t, vy, p.c.f2, 5);
    p.text(w === 1 ? 'sin t' : 'sin 2t', 0.15, 1.05, p.c.f1, { base: 'bottom' });
    p.text(w === 1 ? 'cos t' : '2 cos 2t', T - 0.1, w * Math.cos(w * (T - 0.1)), p.c.f2, { align: 'right', dy: -6 });
  }, [t, w]);

  return (
    <Widget title="الكرة على الدائرة وظلّها" hint="الكرة (الأسود) تدور بسرعة ثابتة $\omega$، وزاويتها $\omega t$. ظلّها (الأزرق) يبقى في مستواها دائماً، فيصعد وينزل بين $-1$ و $1$: ارتفاعه $\sin \omega t$. سرعة الظل هي **السرعة الرأسية للكرة**، أي المركّبة الرأسية لسهم السرعة البرتقالي: $\omega\cos\omega t$. لاحظ أن الظل يتوقف في الأعلى والأسفل، ويكون أسرع في المنتصف.">
      <Choice value={w} onChange={(v) => { setW(v); }} options={[{ v: 1, label: 'زاوية $t$ (سرعة 1)' }, { v: 2, label: 'زاوية $2t$ (سرعة 2)' }]} />
      <div className="cv-row">
        <div><Canvas refEl={cRef} ratio={1} label="الكرة على دائرة الوحدة وظلها" /><div className="cv-cap">الدائرة: الموضع والسرعة</div></div>
        <div><Canvas refEl={gRef} ratio={1} label="منحنى الجيب وميله" /><div className="cv-cap"><span className="f1">الارتفاع</span> و<span className="f2">ميله (المتقطّع)</span></div></div>
      </div>
      <AnimControls clock={clock} label="دوّر" />
      <Readout items={[
        { label: 'الزاوية $\\omega t$ (راديان)', value: fmt(a % (2 * Math.PI) , 2) },
        { label: 'الارتفاع $\\sin \\omega t$', value: fmt(y, 3), color: 'var(--f1)' },
        { label: 'السرعة الرأسية $\\omega\\cos\\omega t$', value: fmt(vy, 3), color: 'var(--f2)' },
        { label: 'السرعة الأفقية $-\\omega\\sin\\omega t$', value: fmt(vx, 3), color: 'var(--violet)' },
      ]} />
    </Widget>
  );
}
