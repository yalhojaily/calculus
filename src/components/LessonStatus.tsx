import { useEffect, useState } from 'react';
import { checksFor, getLesson, markVisited, onProgress, setUnderstood, type LessonProgress } from '../lib/progress';

/** حالة الدرس: يُعلَّم كـ«زرته» تلقائياً، وتضغط أنت «فهمت الدرس» عندما تنتهي. */
export default function LessonStatus({ lesson, variant = 'pill' }: { lesson: string; variant?: 'pill' | 'big' }) {
  const [p, setP] = useState<LessonProgress | null>(null);
  const [c, setC] = useState({ done: 0, firstTry: 0 });
  useEffect(() => {
    markVisited(lesson);
    const sync = () => { setP(getLesson(lesson)); setC(checksFor(lesson)); };
    sync();
    return onProgress(sync);
  }, [lesson]);
  if (!p) return <span className="ls" />;
  if (variant === 'big')
    return (
      <div className={`ls-big ${p.understood ? 'done' : ''}`}>
        <div>
          <strong>{p.understood ? '★ فهمت هذا الدرس' : 'هل فهمت الدرس؟'}</strong>
          <span>{c.done > 0 ? `أجبت عن ${c.done} من أسئلة التحقق (${c.firstTry} من أول محاولة)` : 'أجب عن أسئلة التحقق أولاً، ثم علّم الدرس.'}</span>
        </div>
        <button className={`btn ${p.understood ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setUnderstood(lesson, !p.understood)}>
          {p.understood ? 'ألغِ العلامة' : '✓ فهمت الدرس'}
        </button>
      </div>
    );
  return <span className={`ls ${p.understood ? 'done' : ''}`}>{p.understood ? '★ مفهوم' : 'قيد الدراسة'}</span>;
}
