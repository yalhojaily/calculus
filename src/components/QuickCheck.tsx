import { useState } from 'react';
import { MathText } from './MathText';
import { recordCheck } from '../lib/progress';

interface Props {
  /** معرّف فريد داخل الدرس لحفظ النتيجة، مثل "0.1-a" */
  id: string;
  question: string;
  options: string[];
  answer: number;
  explain: string;
  /** شرح لخيارات خاطئة محددة */
  wrong?: Record<number, string>;
}

/** «توقّف وتحقّق»: سؤال بنقرة واحدة مع تصحيح فوري وشرح. */
export default function QuickCheck({ id, question, options, answer, explain, wrong = {} }: Props) {
  const [tried, setTried] = useState<number[]>([]);
  const last = tried[tried.length - 1];
  const solved = tried.includes(answer);
  const pick = (i: number) => {
    if (solved || tried.includes(i)) return;
    const next = [...tried, i];
    setTried(next);
    if (i === answer) recordCheck(id, next.length === 1);
  };
  return (
    <div className="qc card" role="group" aria-label="توقّف وتحقّق">
      <div className="qc-head">
        <span className="qc-icon" aria-hidden="true">✋</span>
        <span className="qc-kicker">توقّف وتحقّق</span>
        <span className="qc-tip">{solved ? '' : 'اختر إجابة'}</span>
      </div>
      <MathText as="div" className="qc-q">{question}</MathText>
      <div className="qc-options">
        {options.map((o, i) => {
          const state = tried.includes(i) ? (i === answer ? 'ok' : 'bad') : solved ? 'dim' : '';
          return (
            <button key={i} className={`qc-opt ${state}`} onClick={() => pick(i)} disabled={solved || tried.includes(i)}>
              <span className="qc-letter">{'أبجد'[i] ?? i + 1}</span>
              <MathText>{o}</MathText>
            </button>
          );
        })}
      </div>
      {solved ? (
        <>
          <div className="qc-feedback ok" aria-live="polite"><span className="qc-mark">✓</span><div><strong>{tried.length === 1 ? 'صحيح!' : 'نعم، وصلت.'}</strong> <MathText>{explain}</MathText></div></div>
          <button className="btn btn-ghost qc-reset" onClick={() => setTried([])}>↺ حاول مجدداً</button>
        </>
      ) : last !== undefined ? (
        <div className="qc-feedback bad" aria-live="polite"><span className="qc-mark">✗</span><div><strong>ليس تماماً.</strong> <MathText>{wrong[last] ?? 'فكّر مرة أخرى وجرّب خياراً آخر.'}</MathText></div></div>
      ) : null}
    </div>
  );
}
