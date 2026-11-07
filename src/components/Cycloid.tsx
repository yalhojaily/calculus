import { useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Widget, useClock, usePlot } from './ui';

type K = 'roll' | 'race';
const g = 9.8;

/** 12.2 — الدويري: نقطة على عجلة تتدحرج، x = a(θ − sin θ)، y = a(1 − cos θ). ومقلوباً هو أسرع منزلق (البراكستوكرون). */
export default function Cycloid() {
  const [k, setK] = useState<K>('roll');
  const a = 1;
  const clock = useClock(k === 'roll' ? 6 : 3, { loop: false });
  const th = clock.t * 2 * Math.PI;
  const X = (s: number) => a * (s - Math.sin(s)), Y = (s: number) => a * (1 - Math.cos(s));
  // السباق: من O إلى Q = (πa, −2a). الدويري زمنه π√(a/g) أينما بدأ. الخط المستقيم √(π²+4)·√(a/g).
  const Tc = Math.PI * Math.sqrt(a / g), Tl = Math.sqrt(Math.PI ** 2 + 4) * Math.sqrt(a / g);
  const Tmax = Math.max(Tc, Tl) * 1.05;
  const tt = clock.t * Tmax;
  // على الدويري: θ(t) = t·√(g/a) (من حل حفظ الطاقة) حتى θ = π
  const thc = Math.min(Math.PI, tt * Math.sqrt(g / a));
  // على الخط: تسارع ثابت g sin β على طول L
  const L = Math.hypot(Math.PI * a, 2 * a), sinb = (2 * a) / L;
  const sl = Math.min(L, 0.5 * g * sinb * tt * tt);
  // من منتصف الدويري: نقطة تبدأ عند θ₀ تصل في الزمن نفسه
  const th0 = Math.PI / 2;
  const thm = (() => { const u = Math.min(1, tt / Tc); const c0 = Math.cos(th0 / 2); const c = c0 * Math.cos((Math.PI / 2) * u); return 2 * Math.acos(c); })();
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    if (k === 'roll') {
      fitEqual(p, -0.6, 2 * Math.PI * a + 0.6, -0.4, 2.6);
      p.axes({ xLabel: 'x', yLabel: 'y' });
      p.curve(X, Y, 0, 2 * Math.PI, p.c['ink-3'], { width: 1, dash: [4, 3] });
      p.curve(X, Y, 0, th, p.c.f1, { width: 3 });
      const cx = a * th, cy = a;
      const ctx = p.ctx; ctx.beginPath(); ctx.arc(p.X(cx), p.Y(cy), p.X(a) - p.X(0), 0, 2 * Math.PI); ctx.strokeStyle = p.c.f2; ctx.lineWidth = 2; ctx.stroke();
      p.line(cx, cy, X(th), Y(th), p.c.f2, { width: 1.6 });
      p.point(cx, cy, p.c.f2, 3);
      p.point(X(th), Y(th), p.c.red, 6);
      p.text('P', X(th), Y(th), p.c.red, { dx: 6, dy: -4 });
    } else {
      fitEqual(p, -0.4, Math.PI * a + 0.6, -2.4, 0.6);
      p.axes({});
      // الدويري المقلوب
      p.curve(X, (s) => -Y(s), 0, Math.PI, p.c.f1, { width: 2.6 });
      p.line(0, 0, Math.PI * a, -2 * a, p.c.f2, { width: 2.6 });
      p.point(X(thc), -Y(thc), p.c.f1, 7);
      p.point((sl / L) * Math.PI * a, (-sl / L) * 2 * a, p.c.f2, 7);
      p.point(X(thm), -Y(thm), p.c.area, 6);
      p.text('O', 0, 0, p.c.ink, { dx: -12, dy: -4 }); p.text('Q', Math.PI * a, -2 * a, p.c.ink, { dx: 6 });
    }
  }, [k, th, tt]);
  return (
    <Widget title="الدويري" hint={k === 'roll' ? 'دحرج دائرة نصف قطرها $a$ على المحور $x$ وراقب النقطة التي تبدأ في أسفلها. الوسيط $\\theta$ زاوية دوران العجلة: المركز عند $(a\\theta, a)$، ونطرح القطعة $CP$: **$x = a(\\theta - \\sin\\theta)$، $y = a(1 - \\cos\\theta)$**. بحث العلماء قرناً عن معادلة $xy$، ثم وجدوا الطريق الصحيح: الوسيط.' : '**أي منحدر يوصل أسرع من $O$ إلى $Q$؟** الأزرق دويري مقلوب، والبرتقالي خط مستقيم (أقصر). والأخضر يبدأ من منتصف الدويري. شغّل السباق.'}>
      <Choice value={k} onChange={(v) => { setK(v); clock.reset(); }} options={[{ v: 'roll', label: 'العجلة المتدحرجة' }, { v: 'race', label: 'أسرع منزلق' }]} />
      <Canvas refEl={ref} ratio={k === 'roll' ? 0.42 : 0.6} label={k === 'roll' ? 'عجلة تتدحرج ونقطة عليها ترسم دويرياً' : 'سباق انزلاق على دويري وخط مستقيم'} />
      <AnimControls clock={clock} label={k === 'roll' ? 'دحرج' : 'انطلق'} />
      <Readout items={k === 'roll' ? [
        { label: '$\\theta$', value: `${fmt((th * 180) / Math.PI, 0)}°` },
        { label: 'الميل $\\dfrac{dy}{dx} = \\dfrac{\\sin\\theta}{1 - \\cos\\theta}$', value: th < 1e-6 || th > 2 * Math.PI - 1e-6 ? '∞' : fmt(Math.sin(th) / (1 - Math.cos(th)), 3) },
        { label: 'المساحة تحت قوس', value: '3πa²', color: 'var(--area)' },
        { label: 'طول القوس', value: '8a', color: 'var(--f1)' },
      ] : [
        { label: 'الدويري $\\pi\\sqrt{a/g}$', value: `${fmt(Tc, 3)} ث`, color: 'var(--f1)' },
        { label: 'الخط $\\sqrt{\\pi^2 + 4}\\sqrt{a/g}$', value: `${fmt(Tl, 3)} ث`, color: 'var(--f2)' },
        { label: 'الزمن', value: `${fmt(Math.min(tt, Tmax), 3)} ث` },
      ]} />
      <MathText as="div" className="verdict">{k === 'roll' ? 'الميل لانهائي عند $\\theta = 0$: النقطة تنطلق إلى أعلى رأسياً، **وللدويري رأس حاد**. المساحة تحت القوس $\\int y\\,dx = \\int_0^{2\\pi} a^2(1 - \\cos\\theta)^2 d\\theta = 3\\pi a^2$، **ثلاثة أضعاف مساحة العجلة**. والطول مع $1 - \\cos\\theta = 2\\sin^2\\tfrac\\theta2$ يصير $\\int 2a\\sin\\tfrac\\theta2\\,d\\theta = 8a$.' : '**الدويري يفوز** مع أنه أطول: من الأفضل أن تبدأ رأسياً وتكسب السرعة مبكراً. تحدّى يوحنا برنولي العالم بهذه المسألة، فحلها نيوتن وأرسل الحل بلا اسم، فقال برنولي: **«أعرف الأسد من مخالبه»**. والأعجب (الأخضر): **الزمن إلى $Q$ هو نفسه أينما بدأت على الدويري**.'}</MathText>
    </Widget>
  );
}
