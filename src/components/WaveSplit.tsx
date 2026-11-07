import { useEffect, useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

type K = 'bump' | 'stand';
const L = 10, T = 8;
const bump = (x: number) => Math.exp(-x * x);
const stand = (x: number) => Math.sin(x);

/** الفصل 16 — معادلة الموجة u_tt = c² u_xx: الحل ½[f(x − ct) + f(x + ct)] موجتان تسيران في اتجاهين متعاكسين. */
export default function WaveSplit() {
  const [k, setK] = useState<K>('bump');
  const [c, setC] = useState(1);
  const clock = useClock(T);
  useEffect(() => { clock.setT(0.25); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const t = clock.t * T;
  const f = k === 'bump' ? bump : stand;
  const u = (x: number) => 0.5 * (f(x - c * t) + f(x + c * t));
  const ref = usePlot({ xMin: -L, xMax: L, yMin: -1.3, yMax: 1.3 }, (p) => {
    p.axes({ xLabel: 'x', yLabel: 'u', xStep: 2, yStep: 0.5 });
    p.fn(f, p.c['ink-3'], { width: 1.2, dash: [3, 4] });
    p.fn((x) => 0.5 * f(x - c * t), p.c.f2, { width: 1.6, dash: [6, 4] });
    p.fn((x) => 0.5 * f(x + c * t), p.c.violet, { width: 1.6, dash: [6, 4] });
    p.fn(u, p.c.f1, { width: 3 });
    if (k === 'bump') {
      p.arrow(c * t, 0.62, c * t + 1.4, 0.62, p.c.f2, { width: 2, head: 7 });
      p.arrow(-c * t, 0.62, -c * t - 1.4, 0.62, p.c.violet, { width: 2, head: 7 });
    } else for (let n = -3; n <= 3; n++) p.point(n * Math.PI, 0, p.c.red, 4);
  }, [k, c, t]);
  return (
    <Widget title="معادلة الموجة: موجتان متعاكستان" hint="**معادلة الموجة** $u_{tt} = c^2u_{xx}$ لوتر مشدود أو صوت أو ضوء. حلها العام **$u = F(x + ct) + G(x - ct)$**: شكلان ينزلقان دون تغيير، أحدهما يميناً والآخر يساراً بسرعة $c$. **ابدأ بشكل $f(x)$ ساكن**، فينقسم نصفين: $u = \tfrac12\big(f(x - ct) + f(x + ct)\big)$. الأزرق $u$، والمتقطعان النصفان.">
      <Choice value={k} onChange={(v) => { setK(v); clock.reset(); }} options={[{ v: 'bump', label: 'نتوء $e^{-x^2}$' }, { v: 'stand', label: 'موجة واقفة $\\sin x$' }]} />
      <Canvas refEl={ref} ratio={0.5} label="موجة تنقسم نصفين يسيران في اتجاهين متعاكسين" />
      <AnimControls clock={clock} label="أطلق الموجة" />
      <div className="controls">
        <Slider label="سرعة الموجة $c$" value={c} min={0.3} max={2} step={0.05} onChange={setC} show={(v) => fmt(v, 2)} />
      </div>
      <Readout items={[
        { label: 'الزمن $t$', value: fmt(t, 2) },
        { label: '$u(0, t)$', value: fmt(u(0), 3), color: 'var(--f1)' },
      ]} />
      <MathText as="div" className="verdict">{k === 'bump'
        ? '**النتوء ينقسم نصفين** بارتفاع $\\tfrac12$ يبتعدان بسرعة $c$. تحقق: $u_{tt} = c^2f\'\'$ و $u_{xx} = f\'\'$ لكل نصف، فـ $u_{tt} = c^2u_{xx}$. **والموجة الأساسية $e^{ik(x + ct)}$** تحقق المعادلة، ومنها تُبنى كل الحلول بمعاملات فورييه.'
        : '**موجتان جيبيتان متعاكستان تصنعان موجة واقفة:** $\\tfrac12\\big(\\sin(x - ct) + \\sin(x + ct)\\big) = \\sin x\\cos ct$. **النقاط الحمراء (العُقد) لا تتحرك أبداً**، والوتر كله يهتز صعوداً ونزولاً. هكذا يهتز وتر الغيتار المثبت طرفاه.'}</MathText>
    </Widget>
  );
}
