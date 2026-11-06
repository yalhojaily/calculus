// محرك رسم صغير على canvas تستخدمه كل المحاكاات.
// الإحداثيات الرياضية دائماً من اليسار إلى اليمين، حتى داخل صفحة عربية.

export interface View {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export type ColorName = 'f1' | 'f2' | 'area' | 'red' | 'violet' | 'teal' | 'ink' | 'ink-2' | 'ink-3' | 'line' | 'grid' | 'card' | 'paper';

export interface Palette extends Record<ColorName, string> {}

const NAMES: ColorName[] = ['f1', 'f2', 'area', 'red', 'violet', 'teal', 'ink', 'ink-2', 'ink-3', 'line', 'grid', 'card', 'paper'];

export function readPalette(el: Element): Palette {
  const cs = getComputedStyle(el);
  const p = {} as Palette;
  for (const n of NAMES) p[n] = cs.getPropertyValue(`--${n}`).trim() || '#888';
  return p;
}

/** "نظيف" لخطوات الشبكة: 1، 2، 5 × قوى العشرة */
export function niceStep(span: number, target = 8) {
  const raw = span / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const r = raw / mag;
  return (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * mag;
}

export const fmt = (v: number, d = 2) => {
  if (!Number.isFinite(v)) return '∞';
  const r = Number(v.toFixed(Math.abs(v) >= 1000 ? 0 : d));
  return Object.is(r, -0) ? '0' : String(r);
};

export class Plot {
  ctx: CanvasRenderingContext2D;
  w = 0;
  h = 0;
  pad = { l: 34, r: 12, t: 12, b: 26 };
  c: Palette;

  constructor(public canvas: HTMLCanvasElement, public view: View) {
    this.ctx = canvas.getContext('2d')!;
    this.c = readPalette(canvas);
    this.resize();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // تغيير حجم canvas يعيد ضبط السياق، فنعيد الاتجاه: الأرقام والمعادلات من اليسار لليمين
    this.ctx.direction = 'ltr';
    this.c = readPalette(this.canvas);
  }

  X = (x: number) => this.pad.l + ((x - this.view.xMin) / (this.view.xMax - this.view.xMin)) * (this.w - this.pad.l - this.pad.r);
  Y = (y: number) => this.pad.t + ((this.view.yMax - y) / (this.view.yMax - this.view.yMin)) * (this.h - this.pad.t - this.pad.b);
  invX = (px: number) => this.view.xMin + ((px - this.pad.l) / (this.w - this.pad.l - this.pad.r)) * (this.view.xMax - this.view.xMin);
  invY = (py: number) => this.view.yMax - ((py - this.pad.t) / (this.h - this.pad.t - this.pad.b)) * (this.view.yMax - this.view.yMin);

  clear() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  /** الشبكة والمحاور مع أرقام */
  axes({ xLabel = 'x', yLabel = 'y', xStep, yStep }: { xLabel?: string; yLabel?: string; xStep?: number; yStep?: number } = {}) {
    const { ctx, view: v, c } = this;
    const sx = xStep ?? niceStep(v.xMax - v.xMin);
    const sy = yStep ?? niceStep(v.yMax - v.yMin, 6);
    ctx.lineWidth = 1;
    ctx.strokeStyle = c.line;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    for (let x = Math.ceil(v.xMin / sx) * sx; x <= v.xMax + 1e-9; x += sx) {
      ctx.moveTo(this.X(x), this.pad.t);
      ctx.lineTo(this.X(x), this.h - this.pad.b);
    }
    for (let y = Math.ceil(v.yMin / sy) * sy; y <= v.yMax + 1e-9; y += sy) {
      ctx.moveTo(this.pad.l, this.Y(y));
      ctx.lineTo(this.w - this.pad.r, this.Y(y));
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    const x0 = Math.min(Math.max(0, v.xMin), v.xMax);
    const y0 = Math.min(Math.max(0, v.yMin), v.yMax);
    ctx.strokeStyle = c['ink-3'];
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(this.pad.l, this.Y(y0));
    ctx.lineTo(this.w - this.pad.r, this.Y(y0));
    ctx.moveTo(this.X(x0), this.pad.t);
    ctx.lineTo(this.X(x0), this.h - this.pad.b);
    ctx.stroke();

    ctx.fillStyle = c['ink-3'];
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = Math.ceil(v.xMin / sx) * sx; x <= v.xMax + 1e-9; x += sx) {
      if (Math.abs(x) < 1e-9) continue;
      ctx.fillText(fmt(x), this.X(x), Math.min(this.Y(y0) + 4, this.h - this.pad.b + 4));
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = Math.ceil(v.yMin / sy) * sy; y <= v.yMax + 1e-9; y += sy) {
      if (Math.abs(y) < 1e-9) continue;
      ctx.fillText(fmt(y), Math.max(this.X(x0) - 5, this.pad.l - 5), this.Y(y));
    }
    ctx.font = 'italic 13px Georgia, serif';
    ctx.fillStyle = c['ink-2'];
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(xLabel, this.w - this.pad.r - 2, this.Y(y0) - 3);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(yLabel, this.X(x0) + 5, this.pad.t + 1);
  }

  private clip(fn: () => void) {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.pad.l, this.pad.t, this.w - this.pad.l - this.pad.r, this.h - this.pad.t - this.pad.b);
    ctx.clip();
    fn();
    ctx.restore();
  }

  fn(f: (x: number) => number, color: string, { width = 2.6, dash = [] as number[], from = this.view.xMin, to = this.view.xMax } = {}) {
    this.clip(() => {
      const { ctx } = this;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const n = Math.max(2, Math.ceil(this.X(to) - this.X(from)));
      let pen = false;
      const span = this.view.yMax - this.view.yMin;
      for (let i = 0; i <= n; i++) {
        const x = from + ((to - from) * i) / n;
        const y = f(x);
        if (!Number.isFinite(y) || y > this.view.yMax + 10 * span || y < this.view.yMin - 10 * span) {
          pen = false;
          continue;
        }
        if (pen) ctx.lineTo(this.X(x), this.Y(y));
        else ctx.moveTo(this.X(x), this.Y(y));
        pen = true;
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  /** مساحة بين المنحنى والمحور الأفقي (موجبة فوق، سالبة تحت) */
  fillUnder(f: (x: number) => number, a: number, b: number, color: string, alpha = 0.28) {
    if (b <= a) return;
    this.clip(() => {
      const { ctx } = this;
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(this.X(a), this.Y(0));
      const n = Math.max(2, Math.ceil(this.X(b) - this.X(a)));
      for (let i = 0; i <= n; i++) {
        const x = a + ((b - a) * i) / n;
        ctx.lineTo(this.X(x), this.Y(f(x)));
      }
      ctx.lineTo(this.X(b), this.Y(0));
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  rect(x0: number, y0: number, x1: number, y1: number, fill: string, { alpha = 0.3, stroke = true } = {}) {
    this.clip(() => {
      const { ctx } = this;
      const px = Math.min(this.X(x0), this.X(x1));
      const py = Math.min(this.Y(y0), this.Y(y1));
      const pw = Math.abs(this.X(x1) - this.X(x0));
      const ph = Math.abs(this.Y(y1) - this.Y(y0));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = fill;
      ctx.fillRect(px, py, pw, ph);
      ctx.globalAlpha = 1;
      if (stroke) {
        ctx.strokeStyle = fill;
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, pw, ph);
      }
    });
  }

  line(x1: number, y1: number, x2: number, y2: number, color: string, { width = 2, dash = [] as number[] } = {}) {
    this.clip(() => {
      const { ctx } = this;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(this.X(x1), this.Y(y1));
      ctx.lineTo(this.X(x2), this.Y(y2));
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  /** خط مستقيم يمر بنقطة بميل معين، ممتد عبر الرسم */
  lineThrough(x0: number, y0: number, m: number, color: string, opts: { width?: number; dash?: number[] } = {}) {
    const { xMin, xMax } = this.view;
    this.line(xMin, y0 + m * (xMin - x0), xMax, y0 + m * (xMax - x0), color, opts);
  }

  point(x: number, y: number, color: string, r = 5) {
    const { ctx } = this;
    if (!Number.isFinite(y)) return;
    ctx.fillStyle = color;
    ctx.strokeStyle = this.c.card;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.X(x), this.Y(y), r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  text(s: string, x: number, y: number, color: string, { align = 'left' as CanvasTextAlign, base = 'bottom' as CanvasTextBaseline, size = 13, dx = 0, dy = 0, italic = true } = {}) {
    const { ctx } = this;
    ctx.fillStyle = color;
    ctx.font = `${italic ? 'italic ' : ''}${size}px Georgia, serif`;
    ctx.textAlign = align;
    ctx.textBaseline = base;
    ctx.fillText(s, this.X(x) + dx, this.Y(y) + dy);
  }
}
