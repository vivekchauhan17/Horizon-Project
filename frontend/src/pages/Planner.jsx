import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { generatePlan } from '../services/api.js';
import { load, save, fmtDate } from '../utils/storage.js';
import { Spinner, ProgressBar, ErrorBox, Notice, PageHeader, Empty } from '../components/ui.jsx';

const tone = { High: 'bg-red-50 text-red-700', Medium: 'bg-amber-50 text-amber-700', Low: 'bg-emerald-50 text-emerald-700' };

export default function Planner() {
  const [plan, setPlan] = useState(() => load('plan', null));
  const [f, setF] = useState({ subjects: '', examDate: '', hoursPerDay: 3, sessionMinutes: 45, weakTopics: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!f.subjects.trim()) return setError('Enter at least one subject or topic.');
    if (!f.examDate || f.examDate < tomorrow) return setError('Pick an exam date in the future.');
    if (!(f.hoursPerDay > 0 && f.hoursPerDay <= 16)) return setError('Daily hours must be between 0.5 and 16.');
    setBusy(true);
    try {
      const r = await generatePlan({ ...f, hoursPerDay: Number(f.hoursPerDay), sessionMinutes: Number(f.sessionMinutes) });
      const p = { examDate: f.examDate, warning: r.warning, tasks: r.tasks.map((t, i) => ({ ...t, id: i, done: false })) };
      setPlan(p); save('plan', p);
    } catch (e2) { setError(e2.message); } finally { setBusy(false); }
  };
  const toggle = (id) => { const p = { ...plan, tasks: plan.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }; setPlan(p); save('plan', p); };

  const days = plan ? [...new Set(plan.tasks.map((t) => t.date))] : [];
  const done = plan ? plan.tasks.filter((t) => t.done).length : 0;
  return (
    <div className="space-y-5">
      <PageHeader title="AI Study Planner" sub="Get a revision timetable that fits your exam date and free time." />
      <form onSubmit={submit} className="card grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label">Subjects / topics (comma separated)</label><input className="input" value={f.subjects} onChange={set('subjects')} placeholder="DBMS, Operating Systems, Networks" /></div>
        <div><label className="label">Exam date</label><input type="date" min={tomorrow} className="input" value={f.examDate} onChange={set('examDate')} /></div>
        <div><label className="label">Study hours per day</label><input type="number" step="0.5" min="0.5" max="16" className="input" value={f.hoursPerDay} onChange={set('hoursPerDay')} /></div>
        <div><label className="label">Session length</label><select className="input" value={f.sessionMinutes} onChange={set('sessionMinutes')}>{[30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} minutes</option>)}</select></div>
        <div><label className="label">Weak topics (optional)</label><input className="input" value={f.weakTopics} onChange={set('weakTopics')} placeholder="Normalization, Deadlocks" /></div>
        <div className="sm:col-span-2 space-y-3"><ErrorBox msg={error} /><button className="btn-primary" disabled={busy}>{busy ? <Spinner text="Planning..." /> : <><Sparkles className="h-4 w-4" />Generate plan</>}</button><ProgressBar active={busy} label="Building your study plan..." /></div>
      </form>
      {plan ? (
        <div className="space-y-4">
          <Notice msg={plan.warning} tone="warn" />
          <div className="card"><div className="mb-1 flex justify-between text-sm"><span>{done} completed, {plan.tasks.length - done} pending</span><span className="text-slate-500">{Math.round((done / plan.tasks.length) * 100)}%</span></div><div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-indigo-600 transition-all" style={{ width: `${(done / plan.tasks.length) * 100}%` }} /></div></div>
          {days.map((d) => (
            <div key={d} className="card"><h3 className="mb-2 text-sm font-semibold text-slate-900">{fmtDate(d)}</h3>
              <ul className="divide-y divide-slate-100">{plan.tasks.filter((t) => t.date === d).map((t) => (
                <li key={t.id} className="flex items-start gap-3 py-2"><input type="checkbox" className="mt-1 h-4 w-4 accent-indigo-600" checked={t.done} onChange={() => toggle(t.id)} />
                  <div className={`flex-1 text-sm ${t.done ? 'text-slate-400 line-through' : ''}`}><b>{t.topic}</b>: {t.task}</div>
                  <span className="text-xs text-slate-500">{t.minutes} min</span><span className={`rounded px-2 py-0.5 text-xs ${tone[t.priority]}`}>{t.priority}</span></li>))}</ul></div>
          ))}
        </div>
      ) : <div className="card"><Empty text="No plan yet. Fill in the form to generate one." /></div>}
    </div>
  );
}