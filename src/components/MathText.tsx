import katex from 'katex';
import { useMemo } from 'react';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Allow \\htmlClass so math can use the site's color classes (f1, f2, area). */
export const katexOptions = { trust: (ctx: { command: string }) => ctx.command === '\\htmlClass', strict: false as const };

export function tex(src: string, display = false) {
  return katex.renderToString(src, { throwOnError: false, displayMode: display, ...katexOptions });
}

/** Renders a string containing inline math ($...$) and **bold** text. */
export function renderMathText(src: string) {
  // ** تبدّل الخط العريض عبر الأجزاء كلها، فيصح أن يحيط الخط العريض بمعادلة.
  let bold = false;
  const out = src
    .split(/(\$[^$]+\$)/g)
    .map((part) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 1) return tex(part.slice(1, -1));
      return esc(part)
        .replace(/\*\*/g, () => ((bold = !bold) ? '<strong>' : '</strong>'))
        .replace(/\n\n/g, '<br/><br/>');
    })
    .join('');
  return bold ? out + '</strong>' : out;
}

export function MathText({ children, as: Tag = 'span', className }: { children: string; as?: 'span' | 'div' | 'p'; className?: string }) {
  const html = useMemo(() => renderMathText(children), [children]);
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Tex({ children, display = false }: { children: string; display?: boolean }) {
  const html = useMemo(() => tex(children, display), [children, display]);
  return display ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <span dangerouslySetInnerHTML={{ __html: html }} />;
}
