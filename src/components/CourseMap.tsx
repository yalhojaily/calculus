import { useEffect, useState } from 'react';
import { parts, type Chapter } from '../data/curriculum';
import { bidiParts } from '../lib/bidi';
import { getAllLessons, onProgress, type LessonProgress } from '../lib/progress';

interface Props {
  chapters: Chapter[];
  /** id → رابط الدرس، للدروس الجاهزة فقط */
  available: Record<string, string>;
  /** id → رابط صفحة القسم (كل الأقسام: غير الجاهزة تعرض صفحات الكتاب) */
  hrefs: Record<string, string>;
}

export default function CourseMap({ chapters, available, hrefs }: Props) {
  const [prog, setProg] = useState<Record<string, LessonProgress>>({});
  useEffect(() => {
    const sync = () => setProg(getAllLessons());
    sync();
    return onProgress(sync);
  }, []);
  const total = chapters.reduce((a, c) => a + c.sections.length, 0);
  const understood = Object.values(prog).filter((p) => p.understood).length;

  return (
    <div className="cm">
      <div className="cm-summary">
        <div className="cm-bar"><span style={{ width: `${(understood / total) * 100}%` }} /></div>
        <span>فهمت <b>{understood}</b> من <b>{total}</b> قسماً · الجاهز الآن: <b>{Object.keys(available).length}</b></span>
      </div>
      <div className="cm-legend">
        {Object.entries(parts).map(([k, p]) => (
          <span key={k}><i style={{ background: p.color }} />{p.ar}</span>
        ))}
      </div>
      <div className="cm-grid">
        {chapters.map((c) => {
          const ready = c.sections.filter((s) => available[s.id]).length;
          const done = c.sections.filter((s) => prog[s.id]?.understood).length;
          return (
            <section key={c.number} className={`cm-ch ${ready ? '' : 'soon'}`} style={{ '--part': parts[c.part].color } as React.CSSProperties}>
              <header>
                <span className="cm-num">{c.number}</span>
                <div>
                  <h3>{c.titleAr}</h3>
                  <span className="cm-en">{c.titleEn}</span>
                </div>
                {done > 0 && <span className="cm-done">{done}/{c.sections.length}</span>}
              </header>
              {c.sections.length > 1 && (
                <ol>
                  {c.sections.map((s) => {
                    const p = prog[s.id];
                    const mark = p?.understood ? '★' : p?.visited ? '●' : '';
                    return (
                      <li key={s.id} className={available[s.id] ? '' : 'soon'}>
                        <a href={hrefs[s.id]} title={available[s.id] ? undefined : 'الشرح قادم — الصفحة تعرض القسم من الكتاب'}><span className="cm-id ltr">{s.id}</span><Bidi s={s.titleAr} /><span className="cm-mark">{mark}</span></a>
                      </li>
                    );
                  })}
                </ol>
              )}
              {c.sections.length === 1 && <a className="cm-one" href={hrefs[c.sections[0].id]}>اقرأ الفصل ←</a>}
              {!ready && <div className="cm-soon">الشرح قريباً · الأقسام تفتح صفحات الكتاب</div>}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Bidi({ s }: { s: string }) {
  return <span>{bidiParts(s).map((p, i) => (p.ltr ? <bdi key={i} dir="ltr">{p.text}</bdi> : <span key={i}>{p.text}</span>))}</span>;
}
