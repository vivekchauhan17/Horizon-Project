const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function call(path, opts) {
  let res;
  try {
    res = await fetch(BASE + path, opts);
  } catch {
    throw new Error(`Cannot reach the backend at ${BASE}. Is it running?`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const post = (b) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(b),
});

export const generateNotes = ({ text, file }) => {
  if (file) {
    const f = new FormData();
    f.append('file', file);
    return call('/api/notes', { method: 'POST', body: f });
  }
  return call('/api/notes', post({ text }));
};

export const generateQuiz = (b) => call('/api/quiz', post(b));
export const submitQuiz = (b) => call('/api/quiz/submit', post(b));
export const generatePlan = (b) => call('/api/plan', post(b));
export const generateRoadmap = (b) => call('/api/roadmap', post(b));