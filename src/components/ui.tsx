import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Plot, type View } from '../lib/plot';
import { MathText } from './MathText';

/** ينشئ Plot على canvas ويعيد الرسم عند تغيّر المدخلات أو حجم الشاشة أو الوضع الليلي. */
export function usePlot(view: View, draw: (p: Plot) => void, deps: unknown[]) {
  const ref = useRef<HTMLCanvasElement>(null);
  const plot = useRef<Plot | null>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  const redraw = useCallback(() => {
    const p = plot.current;
    if (!p) return;
    p.view = view;
    p.clear();
    drawRef.current(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.xMin, view.xMax, view.yMin, view.yMax]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    plot.current = new Plot(ref.current, view);
    const onResize = () => { plot.current?.resize(); redrawLatest.current(); };
    const ro = new ResizeObserver(onResize);
    ro.observe(ref.current);
    const mo = new MutationObserver(onResize);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', onResize);
    return () => { ro.disconnect(); mo.disconnect(); mq.removeEventListener('change', onResize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redrawLatest = useRef(redraw);
  redrawLatest.current = redraw;

  useEffect(() => { redraw(); }, [redraw, ...deps]);
  return ref;
}

export const SPEEDS = [0.25, 0.5, 1, 2] as const;

/**
 * ساعة للمحاكاة المتحركة: t من 0 إلى 1 خلال `seconds` ثانية (بالسرعة العادية).
 * فيها إيقاف وتشغيل وإبطاء — حتى تقرأ الشرح على مهل.
 */
export function useClock(seconds: number, { loop = false, autoplay = false } = {}) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [speed, setSpeed] = useState<number>(1);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) { last.current = null; return; }
    let id = 0;
    const tick = (now: number) => {
      if (last.current != null) {
        const dt = ((now - last.current) / 1000) * speed / seconds;
        let stop = false;
        setT((old) => {
          let n = old + dt;
          if (n >= 1) {
            if (loop) n %= 1;
            else { n = 1; stop = true; }
          }
          return n;
        });
        if (stop) { setPlaying(false); return; }
      }
      last.current = now;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, speed, seconds, loop]);

  const toggle = () => {
    if (!playing && t >= 1) setT(0);
    setPlaying((p) => !p);
  };
  const reset = () => { setPlaying(false); setT(0); };
  return { t, setT, playing, setPlaying, toggle, reset, speed, setSpeed };
}

export function AnimControls({ clock, label = 'تشغيل' }: { clock: ReturnType<typeof useClock>; label?: string }) {
  return (
    <div className="anim">
      <button className="btn btn-primary anim-play" onClick={clock.toggle} aria-label={clock.playing ? 'إيقاف مؤقت' : label}>
        {clock.playing ? '⏸ إيقاف' : clock.t >= 1 ? '↺ أعِد' : `▶ ${label}`}
      </button>
      <button className="btn btn-ghost" onClick={clock.reset} title="من البداية">⏮</button>
      <div className="anim-speed" role="group" aria-label="السرعة">
        {SPEEDS.map((s) => (
          <button key={s} className={s === clock.speed ? 'on' : ''} onClick={() => clock.setSpeed(s)}>
            {s === 1 ? '1×' : s < 1 ? `${s}×` : `${s}×`}
          </button>
        ))}
      </div>
      <input
        className="anim-scrub"
        type="range" min={0} max={1} step={0.001} value={clock.t}
        onChange={(e) => { clock.setPlaying(false); clock.setT(Number(e.target.value)); }}
        aria-label="موضع الحركة"
      />
    </div>
  );
}

interface SliderProps {
  label: string; // يقبل $...$
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  show?: (v: number) => string;
  color?: string;
}

export function Slider({ label, value, min, max, step, onChange, show, color }: SliderProps) {
  return (
    <label className="sl" style={color ? ({ '--sl': color } as React.CSSProperties) : undefined}>
      <MathText className="sl-label">{label}</MathText>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="sl-val ltr">{show ? show(value) : value}</span>
    </label>
  );
}

export function Widget({ title, children, hint }: { title: string; children: ReactNode; hint?: string }) {
  return (
    <figure className="wg card">
      <figcaption className="wg-head">
        <span className="wg-kicker">جرّب بنفسك</span>
        <span className="wg-title">{title}</span>
      </figcaption>
      {children}
      {hint && <MathText as="p" className="wg-hint">{hint}</MathText>}
    </figure>
  );
}

/** لوحة أرقام صغيرة تحت الرسم */
export function Readout({ items }: { items: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="ro">
      {items.map((it, i) => (
        <div key={i} className="ro-item" style={it.color ? ({ '--ro': it.color } as React.CSSProperties) : undefined}>
          <MathText className="ro-label">{it.label}</MathText>
          <span className="ro-val ltr">{it.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Canvas({ refEl, ratio = 0.62, label }: { refEl: React.RefObject<HTMLCanvasElement | null>; ratio?: number; label: string }) {
  return (
    <div className="cv" style={{ aspectRatio: `${1 / ratio}` }}>
      <canvas ref={refEl} role="img" aria-label={label} />
    </div>
  );
}

export function Choice<T extends string | number>({ options, value, onChange }: { options: { v: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="choice" role="radiogroup">
      {options.map((o) => (
        <button key={String(o.v)} role="radio" aria-checked={o.v === value} className={o.v === value ? 'on' : ''} onClick={() => onChange(o.v)}>
          <MathText>{o.label}</MathText>
        </button>
      ))}
    </div>
  );
}
