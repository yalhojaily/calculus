import { useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { AnimControls, Canvas, Readout, Slider, Widget, useClock, usePlot } from './ui';

const g = 9.8;

/** 12.2 — المقذوف: x = (v₀ cos α)t و y = h + (v₀ sin α)t − ½gt². المدى v₀² sin 2α / g، وزاويتان متتامتان تعطيان المدى نفسه. */
export default function Projectile() {
  const [v0, setV0] = useState(10);
  const [al, setAl] = useState(Math.PI / 4);
  const [h, setH] = useState(0);
  const [twin, setTwin] = useState(true);
  const clock = useClock(3, { loop: false });
  const flight = (a: number) => { const vy = v0 * Math.sin(a); return (vy + Math.sqrt(vy * vy + 2 * g * h)) / g; };
  const T = flight(al), R = v0 * Math.cos(al) * T;
  const ymax = h + (v0 * Math.sin(al)) ** 2 / (2 * g);
  const t = clock.t * T;
  const alt = Math.PI / 2 - al;
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -0.8, 15.5, -0.8, 9);
    p.axes({ xLabel: 'x (m)', yLabel: 'y (m)', xStep: 2, yStep: 2 });
    // السيارة على بعد 12 م
    p.rect(11.2, 0, 12.8, 0.9, p.c.violet, { alpha: 0.45 }); p.text('12 m', 12, 0.9, p.c.violet, { align: 'center', base: 'bottom', dy: -3 });
    if (h > 0) p.rect(-0.3, 0, 0, h, p.c['ink-3'], { alpha: 0.5 });
    const path = (a: number, col: string, w: number, upTo?: number) => { const Ta = flight(a), te = upTo ?? Ta; p.curve((s) => v0 * Math.cos(a) * s, (s) => h + v0 * Math.sin(a) * s - 0.5 * g * s * s, 0, te, col, { width: w }); };
    if (twin && Math.abs(alt - al) > 0.01) path(alt, p.c['ink-3'], 1.4);
    path(al, p.c.f1, 1);
    path(al, p.c.f1, 3, t);
    // نقاط كل ربع ثانية
    for (let s = 0.25; s < T; s += 0.25) p.point(v0 * Math.cos(al) * s, h + v0 * Math.sin(al) * s - 0.5 * g * s * s, p.c.f1, 2.5);
    const x = v0 * Math.cos(al) * t, y = h + v0 * Math.sin(al) * t - 0.5 * g * t * t;
    p.arrow(x, y, x + 0.25 * v0 * Math.cos(al), y + 0.25 * (v0 * Math.sin(al) - g * t), p.c.f2, { width: 2.2 });
    p.point(x, y, p.c.red, 6);
  }, [v0, al, h, twin, t]);
  const deg = (x: number) => `${fmt((x * 180) / Math.PI, 0)}°`;
  return (
    <Widget title="مسار المقذوف" hint="القوة الوحيدة الجاذبية، رأسية تماماً: $d^2y/dt^2 = -g$. **فالسرعة الأفقية لا تتغير** $v_0\cos\alpha$، والرأسية تنقص $gt$. بالتكامل: $x = (v_0\cos\alpha)t$ و $y = (v_0\sin\alpha)t - \tfrac12gt^2$، قطع مكافئ. **هل يصل الماء من الخرطوم بسرعة 10 م/ث إلى السيارة على بعد 12 متراً؟** (البنفسجي)">
      <Canvas refEl={ref} ratio={0.58} label="مسار مقذوف وقطع مكافئ" />
      <AnimControls clock={clock} label="أطلق" />
      <div className="controls">
        <Slider label="$v_0$ (م/ث)" value={v0} min={4} max={14} step={0.1} onChange={(x) => { setV0(x); clock.setT(1); }} show={(x) => fmt(x, 1)} color="var(--f2)" />
        <Slider label="$\alpha$" value={al} min={0.05} max={1.5} step={0.005} onChange={(x) => { setAl(x); clock.setT(1); }} show={deg} color="var(--f1)" />
        <Slider label="ارتفاع البداية $h$ (سلّم)" value={h} min={0} max={6} step={0.1} onChange={(x) => { setH(x); clock.setT(1); }} show={(x) => fmt(x, 1)} />
      </div>
      <label className="row-choices" style={{ fontSize: '0.9rem' }}><input type="checkbox" checked={twin} onChange={(e) => setTwin(e.target.checked)} /> <MathText>{'أظهر الزاوية المتممة $90° - \\alpha$'}</MathText></label>
      <Readout items={[
        { label: 'زمن الطيران $T$', value: `${fmt(T, 3)} ث` },
        { label: 'المدى $R$', value: `${fmt(R, 3)} م`, color: 'var(--f1)' },
        { label: 'أقصى ارتفاع', value: `${fmt(ymax, 3)} م` },
        { label: '$v_0^2/g$ (أقصى مدى من الأرض)', value: `${fmt(v0 * v0 / g, 3)} م`, color: 'var(--violet)' },
      ]} />
      <MathText as="div" className="verdict">{h === 0 ? '**12B:** $T = 2v_0\\sin\\alpha/g$ و $R = v_0^2\\sin 2\\alpha/g$. أكبر مدى حين $\\sin 2\\alpha = 1$، أي $\\alpha = 45°$: $100/9.8 \\approx 10.2$ م، **أقل من 12، فلا نصل إلى السيارة.** والزاويتان $30°$ و $60°$ لهما الجيب نفسه لـ $2\\alpha$، فالمدى نفسه، لكن زمني طيران مختلفين. (مع مقاومة الهواء أفضل زاوية للبيسبول قرب $35°$.)' : '**قف على سلّم:** مع ارتفاع ابتدائي يطول زمن الطيران، فـ $T$ يحل $h + (v_0\\sin\\alpha)T - \\tfrac12gT^2 = 0$. **وأفضل زاوية تصير أقل من $45°$.** هل تصل إلى 12 متراً الآن؟'}</MathText>
    </Widget>
  );
}
