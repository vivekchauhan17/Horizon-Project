const read = (k, d) => { try { return JSON.parse(localStorage.getItem('ep_' + k)) ?? d; } catch { return d; } };
export const load = (k, d = []) => read(k, d);
export const save = (k, v) => localStorage.setItem('ep_' + k, JSON.stringify(v));
export const prepend = (k, item) => { const a = load(k); a.unshift(item); save(k, a); return a; };
export const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
export const avgScore = (q) => (q.length ? Math.round(q.reduce((s, x) => s + (x.score / x.total) * 100, 0) / q.length) : 0);

// ---- Dates (always LOCAL date, never UTC, so the streak rolls over at the user's midnight) ----
const pad = (n) => String(n).padStart(2, '0');
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// ---- Streak: counts ONLY roadmap topics the user has completed ----
// Stored under 'streak' as { 'YYYY-MM-DD': ['goalId|topicKey', ...] }.
// Unticking a topic removes it, so a day only counts while at least one topic from that day is still complete.
export const markTopicDone = (goalId, topicKey) => {
  const s = load('streak', {});
  const id = `${goalId}|${topicKey}`;
  const t = dateKey();
  s[t] = Array.isArray(s[t]) ? s[t] : [];
  if (!s[t].includes(id)) s[t].push(id);
  save('streak', s);
};
export const unmarkTopic = (goalId, topicKey) => {
  const s = load('streak', {});
  const id = `${goalId}|${topicKey}`;
  for (const d of Object.keys(s)) {
    s[d] = (Array.isArray(s[d]) ? s[d] : []).filter((x) => x !== id);
    if (!s[d].length) delete s[d];
  }
  save('streak', s);
};
// { 'YYYY-MM-DD': number of topics completed that day }
export const getStreakDays = () => Object.fromEntries(Object.entries(load('streak', {})).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0]));

export const streakInfo = (activity) => {
  const dayAt = (offset) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + offset); return d; };
  const has = (offset) => (activity[dateKey(dayAt(offset))] || 0) > 0;
  const doneToday = has(0);
  let current = 0;
  const start = doneToday ? 0 : has(-1) ? -1 : null; // streak stays alive until the end of today
  if (start !== null) for (let o = start; has(o); o--) current++;

  const keys = Object.keys(activity).filter((k) => activity[k] > 0).sort();
  let longest = 0, run = 0, prev = null;
  for (const k of keys) {
    const [y, m, d] = k.split('-').map(Number);
    const t = Date.UTC(y, m - 1, d) / 86400000;
    run = prev !== null && t - prev === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = t;
  }
  return { current, longest, totalDays: keys.length, doneToday };
};

// ---- Goals (saved roadmaps) ----
export const goalProgress = (g) => {
  let total = 0, done = 0;
  (g?.roadmap?.phases || []).forEach((p, i) => p.topics.forEach((_, j) => { total++; if (g.done?.[`${i}-${j}`]) done++; }));
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
};