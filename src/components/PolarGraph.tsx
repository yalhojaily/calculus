import { useEffect, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual, polarCurve, polarGrid } from '../lib/polar';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

interface C { label: string; F: (t: number, b: number) => number; a: number; b: number; box: [number, number, number, number]; rMax: number; note: string; slider?: { label: string; min: number; max: number; v: number } }
const cs: Record<string, C> = {
  cos: { label: '$r = \\cos\\theta$', F: (t) => Math.cos(t), a: 0, b: 2 * Math.PI, box: [-1.1, 1.1, -0.8, 0.8], rMax: 1, note: 'دائرة نصف قطرها $\\tfrac12$ ومركزها $(\\tfrac12, 0)$. بعد $\\pi/2$ يصير $\\cos\\theta$ سالباً **فنرجع للخلف** على كل شعاع (بالأحمر)، ونكمل الدائرة عند $\\theta = \\pi$. ومن $\\pi$ إلى $2\\pi$ **ندور مرة ثانية**. البرهان: اضرب في $r$: $r^2 = r\\cos\\theta$ أي $x^2 + y^2 = x$.' },
  sin: { label: '$r = \\sin\\theta$', F: (t) => Math.sin(t), a: 0, b: 2 * Math.PI, box: [-0.8, 0.8, -0.1, 1.1], rMax: 1, note: 'دائرة ثانية: $x^2 + y^2 = y$، مركزها $(0, \\tfrac12)$. ومرة أخرى: من $0$ إلى $\\pi$ تكفي لدورة كاملة.' },
  rose2: { label: '$r = \\cos 2\\theta$', F: (t) => Math.cos(2 * t), a: 0, b: 2 * Math.PI, box: [-1.1, 1.1, -1.1, 1.1], rMax: 1, note: 'المثال 2: **وردة رباعية**. النقاط عند $\\pm 30°$ و $\\pm 150°$ لها $r = \\tfrac12$. لها كل التماثلات الثلاثة: حول المحور $x$، وحول المحور $y$، وحول الأصل.' },
  rose3: { label: '$r = \\cos 3\\theta$', F: (t) => Math.cos(3 * t), a: 0, b: Math.PI, box: [-1.1, 1.1, -1.1, 1.1], rMax: 1, note: 'ثلاث بتلات فقط، وتكتمل الوردة عند $\\theta = \\pi$ (التمرين 9). مع $\\cos 2\\theta$ أربع بتلات: **العدد الزوجي يضاعف** لأن البتلات السالبة لا تقع فوق الموجبة.' },
  spiral: { label: 'حلزون $r = \\theta$', F: (t) => t, a: -2 * Math.PI, b: 2 * Math.PI, box: [-7, 7, -7, 7], rMax: 6, note: 'المثال 3: **حلزون أرخميدس**. يضيف نقاطاً جديدة بعد $2\\pi$، ويبتعد $2\\pi$ في كل لفة. ومع الزوايا السالبة (و $r = \\theta$ سالب) **يظهر حلزون ثانٍ** بالأحمر، صورة الأول في مرآة المحور $y$.' },
  card: { label: 'قلبية $1 + \\cos\\theta$', F: (t) => 1 + Math.cos(t), a: 0, b: 2 * Math.PI, box: [-0.6, 2.1, -1.35, 1.35], rMax: 2, note: 'المثال 4: **القلبية**. لا معادلة $xy$ بسيطة لها، ولها رأس حاد عند الأصل. $r$ لا يصير سالباً أبداً لأن $\\cos\\theta \\ge -1$. «المتجه الكهربائي في قلبك يرسم قلبية تقريباً. لو كانت قلبية تامة لكنت في ورطة صغيرة.»' },
  lima: { label: 'محار $1 + b\\cos\\theta$', F: (t, b) => 1 + b * Math.cos(t), a: 0, b: 2 * Math.PI, box: [-1.6, 4.1, -2.2, 2.2], rMax: 4, slider: { label: '$b$', min: 0, max: 3, v: 0.5 }, note: 'المثال 5: **المحار** (limaçon بالفرنسية: حلزون). كبّر $b$: تظهر **غمازة**، ثم عند $b = 1$ القلبية «تلد» عروة داخلية (حيث $r$ سالب، بالأحمر). ولـ $b$ كبير يشبه دائرتين.' },
};

/** 9.1/9.2 — رسم r = F(θ) بتتبّع الزاوية: شعاع يدور ونقطة على بعد F(θ)؛ الجزء السالب بالأحمر. */
export default function PolarGraph({ initial = 'cos', only }: { initial?: keyof typeof cs; only?: (keyof typeof cs)[] }) {
  const [k, setK] = useState<string>(initial);
  const C = cs[k];
  const [b, setB] = useState(C.slider?.v ?? 0);
  const clock = useClock(8, { loop: false });
  useEffect(() => { clock.setT(1); setB(cs[k].slider?.v ?? 0); }, [k]); // eslint-disable-line react-hooks/exhaustive-deps
  const th = C.a + (C.b - C.a) * clock.t;
  const r = C.F(th, b);
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    const [x0, x1, y0, y1] = C.box; fitEqual(p, x0, x1, y0, y1);
    polarGrid(p, C.rMax * 1.6, C.rMax > 3 ? 2 : C.rMax > 1 ? 1 : 0.5);
    polarCurve(p, (t) => C.F(t, b), C.a, C.b, p.c.f1, p.c.red, { width: 1, n: 800 });
    p.ctx.globalAlpha = 0.25; polarCurve(p, (t) => C.F(t, b), C.a, C.b, p.c.f1, p.c.red, { width: 5, n: 800 }); p.ctx.globalAlpha = 1;
    polarCurve(p, (t) => C.F(t, b), C.a, th, p.c.f1, p.c.red, { width: 3, n: 800 });
    const L = C.rMax * 1.6;
    p.line(-L * Math.cos(th), -L * Math.sin(th), L * Math.cos(th), L * Math.sin(th), p.c.violet, { width: 1, dash: [5, 4] });
    p.line(0, 0, r * Math.cos(th), r * Math.sin(th), r < 0 ? p.c.red : p.c.f2, { width: 2.4 });
    p.point(r * Math.cos(th), r * Math.sin(th), r < 0 ? p.c.red : p.c.f2, 6);
  }, [k, th, b]);
  const keys = (only ?? Object.keys(cs)) as string[];
  return (
    <Widget title="رسم منحنى قطبي" hint="أساس الفصول 1–8 كان $y = f(x)$، **ومفتاح هذا الفصل $r = F(\theta)$**. الطريقة المباشرة: لكل زاوية $\theta$ اخرج على الشعاع مسافة $r = F(\theta)$. شغّل لترى الشعاع يدور والنقطة ترسم. حين يصير $r$ سالباً نمشي **في الاتجاه المعاكس** للشعاع.">
      {keys.length > 1 && <Choice value={k} onChange={setK} options={keys.map((v) => ({ v, label: cs[v].label }))} />}
      <Canvas refEl={ref} ratio={0.75} label="منحنى قطبي يُرسم بزاوية تدور" />
      <AnimControls clock={clock} label="ارسم" />
      {C.slider && <div className="controls"><Slider label={C.slider.label} value={b} min={C.slider.min} max={C.slider.max} step={0.05} onChange={setB} show={(v) => fmt(v, 2)} color="var(--f1)" /></div>}
      <Readout items={[
        { label: '$\\theta$', value: `${fmt((th * 180) / Math.PI, 0)}°`, color: 'var(--violet)' },
        { label: '$r = F(\\theta)$', value: fmt(r, 3), color: r < 0 ? 'var(--red)' : 'var(--f2)' },
      ]} />
      <MathText as="div" className="verdict">{C.note}</MathText>
    </Widget>
  );
}
