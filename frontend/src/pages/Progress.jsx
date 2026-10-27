import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Trash2, CheckCircle2 } from 'lucide-react';
import { load, save, goalProgress, markTopicDone, unmarkTopic } from '../utils/storage.js';
import { PageHeader, Empty } from '../components/ui.jsx';
import GoalSticker from '../components/GoalSticker.jsx';
import GoalView from '../components/GoalView.jsx';

export default function Progress() {
  const [goals, setGoals] = useState(() => load('goals'));
  const [openId, setOpenId] = useState(null);

  const toggleTopic = (id, key) => {
    const gs = goals.map((g) => {
      if (g.id !== id) return g;
      const checked = !g.done?.[key];
      if (checked) markTopicDone(id, key); else unmarkTopic(id, key);
      return { ...g, done: { ...g.done, [key]: checked } };
    });
    setGoals(gs); save('goals', gs);
  };
  const removeGoal = (id) => {
    if (!window.confirm('Remove this saved goal and its progress?')) return;
    const gs = goals.filter((g) => g.id !== id);
    setGoals(gs); save('goals', gs);
    if (openId === id) setOpenId(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Goal Progress" sub="Open a goal to see how much is complete and tick off topics." />
      {goals.length ? (
        <div className="space-y-3">
          {goals.map((g) => {
            const p = goalProgress(g);
            const open = openId === g.id;
            return (
              <div key={g.id} className="card overflow-hidden p-0">
                <div className="flex items-center gap-3 p-4">
                  <button type="button" onClick={() => setOpenId(open ? null : g.id)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                    <GoalSticker id={g.sticker} size={56} tilt={-5} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-semibold text-slate-900">{g.goal}</span>
                        {p.pct === 100 && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />Completed</span>}
                      </span>
                      <span className="block text-xs text-slate-500">{p.done} of {p.total} topics done · {p.pct}% complete</span>
                      <span className="mt-1.5 block h-2 rounded bg-slate-100"><span className="block h-2 rounded bg-indigo-600 transition-all" style={{ width: `${p.pct}%` }} /></span>
                    </span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
                  </button>
                  <button type="button" onClick={() => 
                    removeGoal(g.id)} aria-label="Remove goal" className="text-slate-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" /></button>
                </div>
                {open && <div className="border-t border-slate-100 bg-slate-50 p-4"><GoalView goal={g} compact onToggle={(key) => toggleTopic(g.id, key)} /></div>}
              </div>
            );
          })}
        </div>
      ) : <div className="card"><Empty text="No saved goals yet. Create a roadmap and save it as a goal."><Link to="/roadmap" className="btn-primary">Go to Roadmap</Link></Empty></div>}
    </div>
  );
}