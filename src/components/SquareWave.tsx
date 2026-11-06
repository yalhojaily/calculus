import { useState } from 'react';
import { Canvas, Slider, Widget, usePlot } from './ui';

/** 3.4 — sin x + (1/3) sin 3x + (1/5) sin 5x + … يقترب من موجة مربعة؛ وميله مجموع جيوب تمام يقترب من دالة دلتا. */
export default function SquareWave() {
  const [N, setN] = useState(2);
  const f = (x: number) => { let s = 0; for (let k = 0; k < N; k++) { const m = 2 * k + 1; s += Math.sin(m * x) / m; } return s; };
  const d = (x: number) => { let s = 0; for (let k = 0; k < N; k++) s += Math.cos((2 * k + 1) * x); return s; };
  const P = Math.PI;
  const top = usePlot({ xMin: -P - 0.2, xMax: P + 0.2, yMin: -1.2, yMax: 1.2 }, (p) => {
    p.axes({ xStep: P / 2 });
    p.line(-P, -P / 4, 0, -P / 4, p.c['ink-3'], { width: 1, dash: [4, 4] });
    p.line(0, P / 4, P, P / 4, p.c['ink-3'], { width: 1, dash: [4, 4] });
    p.fn(f, p.c.f1, { width: 2.4 });
  }, [N]);
  const bot = usePlot({ xMin: -P - 0.2, xMax: P + 0.2, yMin: -N - 1, yMax: N + 1 }, (p) => {
    p.axes({ xStep: P / 2 });
    p.fn(d, p.c.f2, { width: 2 });
  }, [N]);
  return (
    <Widget title="جيوب كثيرة تصنع موجة مربعة" hint="$f = \sin x + \tfrac13\sin 3x + \tfrac15\sin 5x + \cdots$. بعد عشرة حدود يكون الرسم قريباً جداً من **دالة درجية** تقفز من $-\pi/4$ إلى $+\pi/4$ عند الصفر. وميله $\cos x + \cos 3x + \cos 5x + \cdots$: عدد لانهائي من جيوب التمام يجتمع في **دالة دلتا**، شوكاً لانهائياً عند القفزة. هذه **متسلسلات فورييه**.">
      <div className="cv-row">
        <div><Canvas refEl={top} ratio={0.7} label="مجموع الجيوب" /><div className="cv-cap f1">الدالة</div></div>
        <div><Canvas refEl={bot} ratio={0.7} label="مجموع جيوب التمام" /><div className="cv-cap f2">ميلها</div></div>
      </div>
      <div className="controls">
        <Slider label="عدد الحدود" value={N} min={1} max={40} step={1} onChange={setN} color="var(--f1)" />
      </div>
    </Widget>
  );
}
