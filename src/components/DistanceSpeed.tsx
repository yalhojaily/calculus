import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { AnimControls, Canvas, Choice, Readout, Widget, useClock, usePlot } from './ui';

interface Trip {
  label: string;
  s: (t: number) => number; // الدالة (2): السرعة
  f: (t: number) => number; // الدالة (1): المسافة
  T: number;
  sView: [number, number];
  fView: [number, number];
  note: string;
}

const trips: Record<string, Trip> = {
  const: { label: 'سرعة ثابتة', s: () => 2, f: (t) => 2 * t, T: 4, sView: [-0.5, 3], fView: [-0.5, 9], note: 'سرعة ثابتة $s = 2$: المسافة خط مستقيم $f = 2t$، والمساحة تحت $s$ مستطيل $2 \\times t$.' },
  accel: { label: 'سرعة متزايدة', s: (t) => 2 * t, f: (t) => t * t, T: 4, sView: [-0.5, 9], fView: [-1, 17], note: 'السرعة $s = 2t$ تزيد: المساحة تحت $s$ مثلث $\\tfrac12 \\cdot t \\cdot 2t = t^2$، وهي بالضبط المسافة $f = t^2$. (الكتاب يستخدم $s = 20t$ و $f = 10t^2$: نفس الفكرة.)' },
  back: { label: 'السيارة للخلف', s: () => -1, f: (t) => 4 - t, T: 4, sView: [-2, 1.5], fView: [-0.5, 5], note: 'السرعة سالبة $s = -1$: المسافة تنزل من $4$ إلى $0$، والمساحة «تحت» $s$ تقع تحت المحور فهي سالبة.' },
  updown: { label: 'تذهب وتعود', s: (t) => (t - 1) * (t - 3), f: (t) => t ** 3 / 3 - 2 * t * t + 3 * t, T: 4, sView: [-1.5, 3.5], fView: [-0.5, 2], note: 'عندما يكون الميل صفراً ($t = 1$ و $t = 3$) تكون $f$ في قمة أو قاع. حيث $s < 0$ تنقص المسافة.' },
};

/** 0.1 — الدالة (1) والدالة (2) معاً: الميل في الأعلى = الارتفاع في الأسفل، والمساحة = المسافة. */
export default function DistanceSpeed() {
  const [key, setKey] = useState<keyof typeof trips>('accel');
  const trip = trips[key];
  const clock = useClock(8);
  const t = clock.t * trip.T;
  const sV: View = { xMin: -0.2, xMax: trip.T + 0.2, yMin: trip.sView[0], yMax: trip.sView[1] };
  const fV: View = { xMin: -0.2, xMax: trip.T + 0.2, yMin: trip.fView[0], yMax: trip.fView[1] };

  const fRef = usePlot(fV, (p) => {
    p.axes({ xLabel: 't', yLabel: 'f' });
    p.fn(trip.f, p.c.f1, { width: 1.4, dash: [3, 4] });
    p.fn(trip.f, p.c.f1, { from: 0, to: Math.max(t, 0.0001), width: 3 });
    p.lineThrough(t, trip.f(t), trip.s(t), p.c.f2, { width: 2, dash: [6, 4] });
    p.point(t, trip.f(t), p.c.f1, 6);
    p.text(`الميل = ${fmt(trip.s(t))}`, t, trip.f(t), p.c.f2, { dx: 8, dy: -6, italic: false });
  }, [key, t]);

  const sRef = usePlot(sV, (p) => {
    p.axes({ xLabel: 't', yLabel: 's' });
    p.fillUnder(trip.s, 0, t, p.c.area, 0.35);
    p.fn(trip.s, p.c.f2, { width: 3 });
    p.point(t, trip.s(t), p.c.f2, 6);
  }, [key, t]);

  const area = trip.f(t) - trip.f(0);
  return (
    <Widget title="الدالة (1) والدالة (2): عدّاد المسافة وعدّاد السرعة" hint={trip.note}>
      <Choice value={key} onChange={(k) => { setKey(k); clock.reset(); }} options={Object.entries(trips).map(([v, tr]) => ({ v: v as keyof typeof trips, label: tr.label }))} />
      <div className="cv-row">
        <div>
          <Canvas refEl={fRef} ratio={0.75} label="المسافة f(t)" />
          <div className="cv-cap f1">الدالة (1): المسافة <span className="ltr">f(t)</span></div>
        </div>
        <div>
          <Canvas refEl={sRef} ratio={0.75} label="السرعة s(t)" />
          <div className="cv-cap f2">الدالة (2): السرعة <span className="ltr">s(t)</span> — والمساحة تحتها</div>
        </div>
      </div>
      <AnimControls clock={clock} label="سِر" />
      <Readout
        items={[
          { label: 'الزمن $t$', value: fmt(t) },
          { label: 'السرعة $s(t)$ = ميل $f$', value: fmt(trip.s(t)), color: 'var(--f2)' },
          { label: 'المساحة تحت $s$ من $0$ إلى $t$', value: fmt(area), color: 'var(--area)' },
          { label: 'تغيّر المسافة $f(t) - f(0)$', value: fmt(trip.f(t) - trip.f(0)), color: 'var(--f1)' },
        ]}
      />
    </Widget>
  );
}
