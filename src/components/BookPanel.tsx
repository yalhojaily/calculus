import { useEffect, useState } from 'react';

interface Props {
  /** مسار ملف الكتاب، مثل /calculus/book.pdf */
  src: string;
  /** مجلد صور الصفحات، مثل /calculus/pages (تُولَّد بـ scripts/render_pages.py) */
  pagesDir: string;
  /** صفحات القسم في الكتاب المطبوع */
  pages: [number, number];
  offset: number;
  sectionId: string;
}

const KEY = 'calculus:book-open';
const DIM = 'calculus:book-dim';
const FIRST = 1;
const LAST = 682;

/**
 * لوحة الكتاب: تعرض صفحات القسم الأصلية بجانب الشرح، كصور مرسومة مسبقاً من ملف PDF
 * (تعمل في كل متصفح وجوال). تُعرض الصفحات نفسها وليس نصاً مستخرجاً، لأن الرموز الرياضية تتشوّه عند الاستخراج.
 */
export default function BookPanel({ src, pagesDir, pages, offset, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(pages[0]);
  const [dim, setDim] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === '1' && matchMedia('(min-width: 1100px)').matches) setOpen(true);
      setDim(localStorage.getItem(DIM) === '1');
    } catch {}
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-book-page]');
      if (!el) return;
      setPage(Number(el.dataset.bookPage));
      setOpen(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('book-open', open);
    try { localStorage.setItem(KEY, open ? '1' : '0'); } catch {}
  }, [open]);

  useEffect(() => { try { localStorage.setItem(DIM, dim ? '1' : '0'); } catch {} }, [dim]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea')) return;
      if (e.key === 'Escape') setOpen(false);
      // الكتاب إنجليزي: السهم الأيمن = الصفحة التالية
      if (e.key === 'ArrowRight') setPage((p) => Math.min(LAST, p + 1));
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(FIRST, p - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const raw = `${src}#page=${page + offset}`;
  const img = (p: number) => `${pagesDir}/p${String(p + offset).padStart(4, '0')}.png`;
  const [loaded, setLoaded] = useState<string | null>(null);

  // حمّل الصفحة التالية مسبقاً
  useEffect(() => {
    if (!open || page >= LAST) return;
    const i = new Image();
    i.src = img(page + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page]);
  const list = Array.from({ length: pages[1] - pages[0] + 1 }, (_, i) => pages[0] + i);
  const outside = page < pages[0] || page > pages[1];

  return (
    <>
      {!open && (
        <button className="book-fab" onClick={() => setOpen(true)} aria-label="افتح الكتاب">
          <span aria-hidden="true">📖</span> الكتاب <span className="ltr">p. {pages[0]}–{pages[1]}</span>
        </button>
      )}
      {open && (
        <aside className={`book-panel ${dim ? 'dim' : ''}`} aria-label="صفحات الكتاب">
          <div className="book-bar">
            <strong>📖 <span className="ltr">{sectionId}</span></strong>
            <div className="book-pages" role="group" aria-label="صفحات القسم">
              {list.map((p) => (
                <button key={p} className={p === page ? 'on' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              {outside && <button className="on">{page}</button>}
            </div>
            <div className="book-actions">
              <button className="btn btn-ghost" onClick={() => setDim((d) => !d)} title="صفحات داكنة للقراءة ليلاً" aria-pressed={dim}>◐</button>
              <a className="btn btn-ghost" href={raw} target="_blank" rel="noopener" title="افتح في نافذة جديدة">↗</a>
              <button className="btn btn-ghost" onClick={() => setOpen(false)} aria-label="أغلق">✕</button>
            </div>
          </div>
          <div className="book-scroll">
            <div className="pdf-page">
              {loaded !== img(page) && <div className="pdf-msg">جارٍ تحميل الصفحة…</div>}
              <img
                key={page}
                src={img(page)}
                alt={`صفحة ${page} من الكتاب`}
                onLoad={() => setLoaded(img(page))}
                onError={() => setLoaded(img(page))}
              />
            </div>
          </div>
          <div className="book-nav">
            <button className="btn" onClick={() => setPage((p) => Math.max(FIRST, p - 1))} disabled={page <= FIRST}>← <span className="ltr">{page - 1}</span></button>
            <span className="ltr">page {page}</span>
            <button className="btn" onClick={() => setPage((p) => Math.min(LAST, p + 1))} disabled={page >= LAST}><span className="ltr">{page + 1}</span> →</button>
          </div>
        </aside>
      )}
    </>
  );
}
