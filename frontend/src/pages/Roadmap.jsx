import { useState, useRef } from 'react';
import { Sparkles, Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';
import { generateRoadmap } from '../services/api.js';
import { load, save, markTopicDone, unmarkTopic, goalProgress } from '../utils/storage.js';
import { Spinner, ProgressBar, ErrorBox, Notice, PageHeader } from '../components/ui.jsx';
import GoalSticker, { STICKERS } from '../components/GoalSticker.jsx';
import GoalView from '../components/GoalView.jsx';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const DURATIONS = [4, 8, 12, 24];

export default function Roadmap() {
  const [goals, setGoals] = useState(() => load('goals'));
  // The roadmap on screen: either a fresh (unsaved) draft or a saved goal.
  const [current, setCurrent] = useState(() => {
    const draft = load('roadmap_draft', null);
    return draft ? load('goals').find((g) => g.id === draft.id) || draft : null;
  });
  const [f, setF] = useState({ goal: '', level: 'Beginner', weeks: 12, hoursPerWeek: 8, notes: '', sticker: 'target' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const viewRef = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const isSaved = !!current && goals.some((g) => g.id === current.id);
  const scrollToView = () => setTimeout(() => viewRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 50);

  const persist = (next) => {
    setCurrent(next);
    save('roadmap_draft', next);
    if (goals.some((g) => g.id === next.id)) {
      const gs = goals.map((g) => (g.id === next.id ? next : g));
      setGoals(gs);
      save('goals', gs);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (f.goal.trim().length < 2) return setError('Enter a course, subject or tech field.');
    if (!(f.hoursPerWeek >= 1 && f.hoursPerWeek <= 60)) return setError('Hours per week must be between 1 and 60.');
    setBusy(true);
    try {
      const r = await generateRoadmap({ goal: f.goal, level: f.level, weeks: Number(f.weeks), hoursPerWeek: Number(f.hoursPerWeek), notes: f.notes });
      const next = { id: Date.now(), goal: f.goal.trim(), sticker: f.sticker, level: f.level, weeks: Number(f.weeks), hoursPerWeek: Number(f.hoursPerWeek), roadmap: r.roadmap, done: {} };
      setCurrent(next);
      save('roadmap_draft', next);
      scrollToView();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = (key) => {
    const checked = !current.done[key];
    if (checked) markTopicDone(current.id, key); else unmarkTopic(current.id, key); // only roadmap topics feed the streak
    persist({ ...current, done: { ...current.done, [key]: checked } });
  };

  const saveGoal = () => {
    if (!current || isSaved) return;
    const next = { ...current, savedAt: new Date().toISOString() };
    const gs = [next, ...goals];
    setGoals(gs); save('goals', gs);
    setCurrent(next); save('roadmap_draft', next);
    setInfo('Goal saved! Track it anytime from the Progress page.');
  };

  const removeGoal = (id) => {
    if (!window.confirm('Remove this saved goal and its progress?')) return;
    const gs = goals.filter((g) => g.id !== id);
    setGoals(gs); save('goals', gs);
  };

  const openGoal = (g) => { setCurrent(g); save('roadmap_draft', g); setInfo(''); scrollToView(); };

  return (
    <div className="space-y-5">
      <PageHeader title="Learning Roadmap" sub="Set a goal, get a step-by-step roadmap, and save it to track your progress." />

      <form onSubmit={submit} className="card grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="goal">Course, subject or tech field</label>
          <input id="goal" className="input" value={f.goal} onChange={set('goal')} placeholder="e.g. Full Stack Web Development, Data Structures, Machine Learning" maxLength={100} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Pick your goal sticker</label>
          <div className="flex flex-wrap gap-3 pt-1">
            {Object.keys(STICKERS).map((k) => (
              <button type="button" key={k} onClick={() => setF({ ...f, sticker: k })} aria-label={`${k} sticker`} aria-pressed={f.sticker === k}
                className={`rounded-2xl p-1.5 transition ${f.sticker === k ? 'bg-indigo-50 ring-2 ring-indigo-500' : 'hover:bg-slate-100'}`}>
                <GoalSticker id={k} size={44} tilt={-4} />
              </button>
            ))}
          </div>
        </div>
        <div><label className="label">Your current level</label><select className="input" value={f.level} onChange={set('level')}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></div>
        <div><label className="label">Duration</label><select className="input" value={f.weeks} onChange={set('weeks')}>{DURATIONS.map((w) => <option key={w} value={w}>{w} weeks</option>)}</select></div>
        <div><label className="label">Hours per week</label><input type="number" min="1" max="60" className="input" value={f.hoursPerWeek} onChange={set('hoursPerWeek')} /></div>
        <div><label className="label">Anything specific? (optional)</label><input className="input" value={f.notes} onChange={set('notes')} placeholder="e.g. focus on placements, I know basic Python" maxLength={500} /></div>
        <div className="space-y-3 sm:col-span-2">
          <ErrorBox msg={error} />
          <button className="btn-primary" disabled={busy}>{busy ? <Spinner text="Building your roadmap..." /> : <><Sparkles className="h-4 w-4" />Generate roadmap</>}</button>
          <ProgressBar active={busy} label="Designing your roadmap..." />
        </div>
      </form>

      {goals.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Saved goals</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {goals.map((g) => {
              const p = goalProgress(g);
              return (
                <div key={g.id} className={`card flex items-center gap-3 p-3 transition ${current?.id === g.id ? 'ring-2 ring-indigo-500' : 'hover:shadow-md'}`}>
                  <button type="button" onClick={() => openGoal(g)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <GoalSticker id={g.sticker} size={48} tilt={-5} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-900">{g.goal}</span>
                      <span className="text-xs text-slate-500">{p.done}/{p.total} topics · {p.pct}%</span>
                      <span className="mt-1 block h-1.5 rounded bg-slate-100"><span className="block h-1.5 rounded bg-indigo-600" style={{ width: `${p.pct}%` }} /></span>
                    </span>
                  </button>
                  <button type="button" onClick={() => removeGoal(g.id)} aria-label="Remove goal" className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div ref={viewRef} className="scroll-mt-4 space-y-4">
        <Notice msg={info} />
        {current && (
          <GoalView goal={current} onToggle={toggle}
            actions={isSaved
              ? <button type="button" className="btn-ghost" disabled><BookmarkCheck className="h-4 w-4 text-emerald-600" />Saved</button>
              : <button type="button" className="btn-primary" onClick={saveGoal}><Bookmark className="h-4 w-4" />Save goal</button>} />
        )}
      </div>
    </div>
  );
}