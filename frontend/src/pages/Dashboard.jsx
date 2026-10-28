import { Link } from 'react-router-dom';
import { ListChecks, BarChart3, Trophy, FileText, Target, CheckSquare, Upload, Sparkles, Map as MapIcon } from 'lucide-react';
import { load, avgScore, fmtDate, goalProgress, getStreakDays } from '../utils/storage.js';
import { Stat, PageHeader, Empty } from '../components/ui.jsx';
import StreakCalendar from '../components/StreakCalendar.jsx';
import GoalSticker from '../components/GoalSticker.jsx';

export default function Dashboard() {
  const quizzes = load('quizzes'), notes = load('notes'), goals = load('goals'), plan = load('plan', null);
  const tasks = plan?.tasks || [];
  const upcoming = tasks.filter((t) => !t.done).slice(0, 5);

  const best = quizzes.length ? Math.max(...quizzes.map((q) => Math.round((q.score / q.total) * 100))) : 0;
  const totals = goals.reduce((a, g) => {
     const p = goalProgress(g); return { done: a.done + p.done, total: a.total + p.total }; }, { done: 0, total: 0 });
  const goalPct = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;

  const weak = {};
  quizzes.forEach((q) => { if (q.wrong?.length) weak[q.topic] = (weak[q.topic] || 0) + q.wrong.length; });
  const weakList = Object.entries(weak).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const activity = [
    ...notes.map((n) => ({ t: `Saved notes: ${n.title}`, d: n.date })),
    ...quizzes.map((q) => ({ t: `Quiz "${q.topic}": ${q.score}/${q.total}`, d: q.date })),
    ...goals.filter((g) => g.savedAt).map((g) => ({ t: `Saved goal: ${g.goal}`, d: g.savedAt })),
  ].sort((a, b) => b.d.localeCompare(a.d)).slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader title="Welcome back 👋" sub="Your streak, goals and activity in one place." />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Study streak</h2>
        <StreakCalendar activity={getStreakDays()} />
        <p className="mt-2 text-xs text-slate-400">Your streak grows when you complete a topic in a roadmap goal.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={ListChecks} label="Quizzes attempted" value={quizzes.length} />
        <Stat icon={BarChart3} label="Average score" value={quizzes.length ? `${avgScore(quizzes)}%` : '–'} />
        <Stat icon={Trophy} label="Best score" value={quizzes.length ? `${best}%` : '–'} />
        <Stat icon={FileText} label="Notes saved" value={notes.length} />
        <Stat icon={Target} label="Goal completion" value={goals.length ? `${goalPct}%` : '–'} />
        <Stat icon={CheckSquare} label="Tasks completed" value={`${tasks.filter((t) => t.done).length}/${tasks.length}`} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/roadmap" className="btn-primary"><MapIcon className="h-4 w-4" />Create a roadmap</Link>
        <Link to="/notes" className="btn-ghost"><Upload className="h-4 w-4" />Upload study material</Link>
        <Link to="/quiz" className="btn-ghost"><Sparkles className="h-4 w-4" />Generate a quiz</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-semibold">My goals</h2>
          {goals.length ? (
            <ul className="space-y-3">
              {goals.map((g) => { const p = goalProgress(g); return (
                <li key={g.id} className="flex items-center gap-3">
                  <GoalSticker id={g.sticker} size={40} tilt={-5} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2 text-sm"><span className="truncate font-medium text-slate-800">{g.goal}</span><span className="text-slate-500">{p.pct}%</span></div>
                    <div className="mt-1 h-1.5 rounded bg-slate-100"><div className="h-1.5 rounded bg-indigo-600 transition-all" style={{ width: `${p.pct}%` }} /></div>
                  </div>
                </li>); })}
            </ul>
          ) : <Empty text="No goals saved yet."><Link to="/roadmap" className="btn-ghost">Create a roadmap</Link></Empty>}
        </div>
        <div className="card">
          <h2 className="mb-3 font-semibold">Recent activity</h2>
          {activity.length ? <ul className="space-y-2 text-sm">{activity.map((a, i) => <li key={i} className="flex justify-between gap-2"><span>{a.t}</span><span className="shrink-0 text-slate-400">{fmtDate(a.d)}</span></li>)}</ul> : <Empty text="No activity yet." />}
        </div>
        <div className="card">
          <h2 className="mb-3 font-semibold">Upcoming study tasks</h2>
          {upcoming.length ? <ul className="space-y-2 text-sm">{upcoming.map((t) => <li key={t.id} className="flex justify-between gap-2"><span><b>{t.topic}</b>: {t.task}</span><span className="shrink-0 text-slate-400">{fmtDate(t.date)}</span></li>)}</ul> : <Empty text="No pending tasks."><Link to="/planner" className="btn-ghost">Create a plan</Link></Empty>}
        </div>
        <div className="card">
          <h2 className="mb-3 font-semibold">Topics to revise</h2>
          {weakList.length ? <ul className="space-y-2 text-sm">{weakList.map(([t, n]) => <li key={t} className="flex justify-between"><span>{t}</span><span className="text-amber-700">{n} missed</span></li>)}</ul> : <Empty text="Nothing flagged. Missed quiz questions show up here." />}
        </div>
      </div>
    </div>
  );
}