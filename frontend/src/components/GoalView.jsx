import { Target, Dumbbell, Flag, Lightbulb, Clock } from 'lucide-react';
import GoalSticker from './GoalSticker.jsx';
import { Disclaimer } from './ui.jsx';
import { goalProgress } from '../utils/storage.js';

// Shows a goal's roadmap with tickable topics. `compact` hides the big header (used inside Progress).
export default function GoalView({ goal, onToggle, compact = false, actions = null }) {
  const rm = goal.roadmap;
  const { done, total, pct } = goalProgress(goal);
  let weekCursor = 1;
  return (
    <div className="space-y-4">
      {compact ? (
        rm.overview ? <p className="text-sm text-slate-700">{rm.overview}</p> : null
      ) : (
        <div className="card relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400" />
          <div className="flex flex-wrap items-center gap-5 pt-2">
            <GoalSticker id={goal.sticker} size={84} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-indigo-500"><Flag className="h-3.5 w-3.5" />My Goal</p>
              <h2 className="mt-1 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                <span className="px-1" style={{ background: 'linear-gradient(transparent 62%, #c7d2fe 62%)', WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' }}>{goal.goal}</span>
              </h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-slate-100 px-2.5 py-1">{goal.level}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">{goal.weeks} weeks</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">{goal.hoursPerWeek} hrs/week</span>
              </div>
            </div>
            {actions && <div className="self-start">{actions}</div>}
          </div>
          {rm.overview && <p className="mt-4 text-sm text-slate-700">{rm.overview}</p>}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-slate-500"><span>{done} of {total} topics completed</span><span>{pct}%</span></div>
            <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-indigo-600 transition-all" style={{ width: `${pct}%` }} /></div>
          </div>
        </div>
      )}

      {rm.phases.map((p, i) => {
        const start = weekCursor;
        weekCursor += p.weeks;
        const end = weekCursor - 1;
        return (
          <div key={i} className="card space-y-3 border-l-4 border-l-indigo-500 bg-white">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">{i + 1}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                {p.goal && <p className="text-sm text-slate-600">{p.goal}</p>}
              </div>
              <span className="flex items-center gap-1 whitespace-nowrap rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
                <Clock className="h-3 w-3" />{start === end ? `Week ${start}` : `Weeks ${start}-${end}`}
              </span>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1 text-sm font-medium text-slate-700"><Target className="h-4 w-4 text-indigo-600" />Topics</p>
              <ul className="space-y-1">
                {p.topics.map((t, j) => {
                  const key = `${i}-${j}`;
                  const checked = !!goal.done?.[key];
                  return (
                    <li key={key}>
                      <label className="flex cursor-pointer items-start gap-2 text-sm">
                        <input type="checkbox" className="mt-0.5 h-4 w-4 accent-indigo-600" checked={checked} onChange={() => onToggle(key)} />
                        <span className={checked ? 'text-slate-400 line-through' : 'text-slate-700'}>{t}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
            {p.practice && <p className="text-sm text-slate-700"><b className="inline-flex items-center gap-1"><Dumbbell className="h-4 w-4 text-indigo-600" />Practice:</b> {p.practice}</p>}
            {p.outcome && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"><b className="inline-flex items-center gap-1"><Flag className="h-4 w-4" />Outcome:</b> {p.outcome}</p>}
          </div>
        );
      })}

      {rm.tips.length > 0 && (
        <div className="card bg-white">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900"><Lightbulb className="h-4 w-4 text-indigo-600" />Tips</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{rm.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      )}
      {!compact && <Disclaimer />}
    </div>
  );
}