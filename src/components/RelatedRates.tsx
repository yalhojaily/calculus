import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Widget, useClock, usePlot } from './ui';

type Scene = 'ladder' | 'shadow' | 'balloon';

const notes: Record<Scene, string> = {
  ladder: 'العلاقة $x^2 + y^2 = 100$. اشتقّها بالنسبة للزمن: $2x\\,\\dfrac{dx}{dt} + 2y\\,\\dfrac{dy}{dt} = 0$، فـ $\\dfrac{dy}{dt} = -\\dfrac{x}{y}\\cdot 2$. القاعدة تبتعد بسرعة ثابتة، **لكن القمة تتسارع** في نزولها، وحين $y \\to 0$ تنفجر السرعة (التمرين 22: أسرع من الضوء؟).',
  shadow: 'المثال 7: بالمثلثين المتشابهين $\\dfrac{x + s}{8} = \\dfrac{s}{2}$، أي $x = 3s$. فـ $\\dfrac{dx}{dt} = 3\\,\\dfrac{ds}{dt} = 3 \\cdot \\tfrac49 = \\tfrac43$. **لم نحتج قط** إلى $x$ أو $s$ نفسيهما. (21% فقط من الطلاب حلّوه.)',
  balloon: 'المثال 8: $z^2 = y^2 + 100^2$ يعطي $2z\\,\\dfrac{dz}{dt} = 2y\\,\\dfrac{dy}{dt}$. و $\\tan\\theta = y/100$ يعطي $\\sec^2\\theta\\,\\dfrac{d\\theta}{dt} = \\tfrac{1}{100}\\dfrac{dy}{dt}$. عوّض $y = 50$ **بعد الاشتقاق لا قبله**: مشتقة $50/100$ لا تفيد شيئاً.',
};

/** 4.2 — المعدلات المرتبطة: علاقة من الشكل، ثم اشتقاقها بالنسبة للزمن، ثم التعويض. */
export default function RelatedRates() {
  const [sc, setSc] = useState<Scene>('ladder');
  const dur = sc === 'ladder' ? 9 : sc === 'shadow' ? 9 : 12;
  const clock = useClock(dur, { loop: true });
  const u = clock.t;

  // السلّم: القاعدة تبتعد بسرعة 2 قدم/ث
  const lx = 0.6 + 9.3 * u, ly = Math.sqrt(100 - lx * lx), ldy = (-lx * 2) / ly, lT = (lx - 0.6) / 2;
  // الظل: المصباح 8م، الشخص 2م، الظل يطول 4/9 م/ث
  const sT = 9 * u, ss = 0.5 + (4 / 9) * sT, sx = 3 * ss;
  // المنطاد: يصعد 3م/ث، والمراقب على بعد 100م
  const bT = 50 * u, by = 3 * bT, bz = Math.hypot(by, 100), bth = Math.atan(by / 100), bdz = (by * 3) / bz, bdth = (3 / 100) * Math.cos(bth) ** 2;

  const view = sc === 'ladder' ? { xMin: -1, xMax: 11.5, yMin: -0.8, yMax: 10.8 } : sc === 'shadow' ? { xMin: -1.5, xMax: 16, yMin: -0.8, yMax: 9.5 } : { xMin: -12, xMax: 112, yMin: -10, yMax: 160 };
  const ref = usePlot(view, (p) => {
    const C = p.c;
    if (sc === 'ladder') {
      p.line(0, 0, 0, 10.5, C.ink, { width: 4 });
      p.line(0, 0, 11.3, 0, C.ink, { width: 2 });
      p.line(lx, 0, 0, ly, C.f2, { width: 5 });
      p.line(0, 0, lx, 0, C.f1, { width: 2.4 });
      p.line(0, 0, 0, ly, C.area, { width: 2.4 });
      p.point(lx, 0, C.f1, 6); p.point(0, ly, C.area, 6);
      p.text('x', lx / 2, 0, C.f1, { align: 'center', base: 'top', dy: 6 });
      p.text('y', 0, ly / 2, C.area, { dx: 8 });
      p.text('10', lx / 2, ly / 2, C.f2, { dx: 8, dy: -8 });
      p.arrow(lx, 0.5, lx + 1.2, 0.5, C.f1);
      p.arrow(0.35, ly, 0.35, Math.max(0, ly + ldy * 0.4), C.area);
    } else if (sc === 'shadow') {
      p.line(-1.5, 0, 16, 0, C.ink, { width: 2 });
      p.line(0, 0, 0, 8, C.ink, { width: 3 });
      p.point(0, 8, C.f2, 8);
      p.line(0, 8, sx + ss, 0, C.f2, { width: 1.2, dash: [5, 4] });
      p.line(sx, 0, sx, 2, C.f1, { width: 5 });
      p.point(sx, 2.15, C.f1, 5);
      p.line(sx, 0.03, sx + ss, 0.03, C.violet, { width: 6 });
      p.text('8', 0, 4, C.ink, { dx: -14 });
      p.text('x', sx / 2, 0, C.f1, { align: 'center', base: 'top', dy: 6 });
      p.text('s', sx + ss / 2, 0, C.violet, { align: 'center', base: 'top', dy: 6 });
      p.text('2', sx, 1, C.f1, { dx: 8 });
    } else {
      p.line(-12, 0, 112, 0, C.ink, { width: 2 });
      p.line(100, 0, 100, 158, C['ink-3'], { width: 1, dash: [3, 4] });
      p.line(0, 0, 100, by, C.f2, { width: 2.4 });
      p.line(0, 0, 100, 0, C.f1, { width: 2.4 });
      p.line(100, 0, 100, by, C.area, { width: 3 });
      p.point(100, by, C.red, 9);
      p.point(0, 0, C.ink, 6);
      p.text('A', 0, 0, C.ink, { align: 'center', base: 'top', dy: 6 });
      p.text('C', 100, 0, C.ink, { align: 'center', base: 'top', dy: 6 });
      p.text('B', 100, by, C.red, { dx: 10 });
      p.text('100', 50, 0, C.f1, { align: 'center', base: 'top', dy: 6 });
      p.text('z', 50, by / 2, C.f2, { dx: -6, dy: -12 });
      p.text('y', 100, by / 2, C.area, { dx: 8 });
      p.text('θ', 14, 0, C.ink, { dy: -6, base: 'bottom' });
    }
  }, [sc, u]);

  const items = sc === 'ladder'
    ? [{ label: 'الزمن (ث)', value: fmt(lT, 2) }, { label: '$x$', value: fmt(lx, 2), color: 'var(--f1)' }, { label: '$y$', value: fmt(ly, 2), color: 'var(--area)' }, { label: '$dx/dt$', value: '2', color: 'var(--f1)' }, { label: '$dy/dt$', value: fmt(ldy, 3), color: 'var(--area)' }]
    : sc === 'shadow'
      ? [{ label: 'الزمن (ث)', value: fmt(sT, 2) }, { label: '$x$', value: fmt(sx, 2), color: 'var(--f1)' }, { label: '$s$', value: fmt(ss, 2), color: 'var(--violet)' }, { label: '$ds/dt$', value: '4/9', color: 'var(--violet)' }, { label: '$dx/dt$', value: '4/3 ≈ 1.333', color: 'var(--f1)' }]
      : [{ label: '$y$', value: fmt(by, 1), color: 'var(--area)' }, { label: '$z$', value: fmt(bz, 1), color: 'var(--f2)' }, { label: '$dz/dt$', value: fmt(bdz, 3), color: 'var(--f2)' }, { label: '$dA/dt$', value: '150', color: 'var(--f1)' }, { label: '$d\\theta/dt$', value: fmt(bdth, 4) }];

  return (
    <Widget title="المعدلات المرتبطة" hint="نعرف سرعة شيء ونريد سرعة شيء آخر. **ثلاث خطوات**: اكتب علاقة من الشكل، ثم اشتقّها بالنسبة للزمن (ضمنياً)، ثم عوّض بالقيم المعروفة. شغّل الحركة وراقب أن السرعة المطلوبة قد تكون ثابتة أو متغيرة.">
      <Choice value={sc} onChange={(v) => { setSc(v); clock.reset(); }} options={[{ v: 'ladder', label: 'السلّم' }, { v: 'shadow', label: 'الظل' }, { v: 'balloon', label: 'المنطاد' }]} />
      <Canvas refEl={ref} ratio={0.62} label="مشهد المعدلات المرتبطة" />
      <AnimControls clock={clock} label="شغّل" />
      <Readout items={items} />
      <MathText as="div" className="verdict">{notes[sc]}</MathText>
    </Widget>
  );
}
