// التقدّم محفوظ في المتصفح (localStorage) — الموقع لمستخدم واحد.

export interface LessonProgress {
  visited?: boolean;
  understood?: boolean;
  understoodAt?: string;
}

interface Store {
  lessons: Record<string, LessonProgress>;
  /** نتائج أسئلة «توقّف وتحقّق»: true = صحيح من أول محاولة */
  checks: Record<string, boolean>;
}

const KEY = 'calculus:progress:v1';
const EVENT = 'calculus:progress';

function read(): Store {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Store>;
    return { lessons: s.lessons ?? {}, checks: s.checks ?? {} };
  } catch {
    return { lessons: {}, checks: {} };
  }
}

function write(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* التخزين غير متاح */ }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export const getLesson = (id: string): LessonProgress => read().lessons[id] ?? {};
export const getAllLessons = () => read().lessons;

export function markVisited(id: string) {
  const s = read();
  s.lessons[id] = { ...s.lessons[id], visited: true };
  write(s);
}

export function setUnderstood(id: string, v: boolean) {
  const s = read();
  s.lessons[id] = { ...s.lessons[id], visited: true, understood: v, understoodAt: v ? new Date().toISOString() : undefined };
  write(s);
}

export function recordCheck(id: string, firstTry: boolean) {
  const s = read();
  if (!(id in s.checks)) s.checks[id] = firstTry;
  write(s);
}

export function checksFor(lessonId: string) {
  const c = read().checks;
  const keys = Object.keys(c).filter((k) => k.startsWith(`${lessonId}-`));
  return { done: keys.length, firstTry: keys.filter((k) => c[k]).length };
}

export function onProgress(cb: () => void) {
  const h = () => cb();
  window.addEventListener(EVENT, h);
  window.addEventListener('storage', h);
  return () => { window.removeEventListener(EVENT, h); window.removeEventListener('storage', h); };
}
