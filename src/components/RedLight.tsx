import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

// المثال 4 في القسم 2.3: إشارة حمراء على بعد 72 متراً، تصبح خضراء بعد 4 ثوانٍ،
// والسيارة المنتظرة عندها تتسارع بـ 3 م/ث². أي سرعة ثابتة V تلحق بها دون أن تتجاوزها؟
const D = 72, WAIT = 4, A = 3;
const other = (t: number) => (t < WAIT ? D : D + 0.5 * A * (t - WAIT) ** 2);

export default function RedLight() {
  const [V, setV] = useState(15);
  const you = (t: number) => V * t;
  // أقرب نقطة: الفرق other - you
  let gap = Infinity, tGap = 0;
  for (let t = 0; t <= 20; t += 0.005) { const g = other(t) - you(t); if (g < gap) { gap = g; tGap = t; } }
  const crash = gap < -0.05;
  const T = WAIT + V / A; // تساوي السرعتين
  const ref = usePlot({ xMin: -0.4, xMax: 16, yMin: -10, yMax: 260 }, (p) => {
    p.axes({ xLabel: 't (s)', yLabel: 'distance (m)', xStep: 2, yStep: 50 });
    p.fn(other, p.c.f1, { width: 3, from: 0 });
    p.fn(you, crash ? p.c.red : p.c.f2, { width: 2.6, from: 0 });
    p.line(WAIT, 0, WAIT, D, p.c['ink-3'], { width: 1, dash: [3, 4] });
    p.point(tGap, you(tGap), crash ? p.c.red : p.c.f2, 6);
    p.text('the waiting car', 15.5, other(15.5), p.c.f1, { align: 'right', dy: -8 });
    p.text('you: f = Vt', 9, you(9), crash ? p.c.red : p.c.f2, { dx: 8, dy: 14 });
  }, [V]);

  return (
    <Widget title="الإشارة الحمراء: أبطئ مبكراً بالقدر الصحيح" hint="الإشارة على بعد $72$ متراً وتصبح خضراء بعد $4$ ثوانٍ، والسيارة المنتظرة عندها تنطلق بتسارع $3$ م/ث². أنت تُبطئ فوراً إلى سرعة ثابتة $V$. الخطة الأمثل: أكبر $V$ تجعل خطّك **يمسّ** منحناها دون أن يقطعه. عند نقطة اللحاق للسيارتين **المسافة نفسها والسرعة نفسها**، أي أن الرسمين **متماسّان**.">
      <Canvas refEl={ref} label="مسافتك ومسافة السيارة المنتظرة" />
      <div className="controls">
        <Slider label="سرعتك $V$ (م/ث)" value={V} min={6} max={18} step={0.25} onChange={setV} show={(v) => `${fmt(v)} ≈ ${Math.round(v * 3.6)} km/h`} color="var(--f2)" />
      </div>
      <Readout items={[
        { label: 'أقرب مسافة بينكما (م)', value: crash ? 'اصطدام!' : fmt(gap, 2), color: crash ? 'var(--red)' : 'var(--area)' },
        { label: 'تتساوى السرعتان عند $t$', value: `${fmt(T, 2)} s` },
      ]} />
      <div className="verdict">{crash ? 'سريع جداً: خطك يقطع منحناها، أي أنك تصطدم بها أو تتجاوزها.' : Math.abs(V - 12) < 0.13 ? '✓ هذا هو الحل: V = 12 م/ث (43 كم/س). الخط يمسّ المنحنى تماماً.' : 'آمن، لكن يمكنك أن تكون أسرع: الخط لا يلمس المنحنى.'}</div>
    </Widget>
  );
}
