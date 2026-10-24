import { useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Trophy, CalendarCheck } from 'lucide-react';
import { dateKey, streakInfo } from '../utils/storage.js';

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const level = (n) => (n >= 3 ? 'bg-indigo-700 text-white' : n === 2 ? 'bg-indigo-500 text-white' : n === 1 ? 'bg-indigo-300 text-indigo-900' : '');

export default function StreakCalendar({ activity }) {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const info = streakInfo(activity);
  const todayKey = dateKey();
  const first = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const atCurrent = view.y === now.getFullYear() && view.m === now.getMonth();
  const shift = (d) => setView(({ y, m }) => { const n = new Date(y, m + d, 1); return { y: n.getFullYear(), m: n.getMonth() }; });
  const msg = info.current === 0 ? 'Complete a topic, quiz or study task today to start your streak.'
    : info.doneToday ? "You've studied today. Streak is safe!" : 'Study something today to keep your streak alive!';

  return (
    <div className="card">
      <div className="mb-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-amber-50 p-3"><Flame className="mx-auto h-5 w-5 text-amber-500" /><p className="text-2xl font-bold text-slate-900">{info.current}</p><p className="text-xs text-slate-500">Current streak</p></div>
        <div className="rounded-lg bg-indigo-50 p-3"><Trophy className="mx-auto h-5 w-5 text-indigo-500" /><p className="text-2xl font-bold text-slate-900">{info.longest}</p><p className="text-xs text-slate-500">Longest streak</p></div>
        <div className="rounded-lg bg-emerald-50 p-3"><CalendarCheck className="mx-auto h-5 w-5 text-emerald-600" /><p className="text-2xl font-bold text-slate-900">{info.totalDays}</p><p className="text-xs text-slate-500">Active days</p></div>
      </div>
      <p className="mb-3 text-sm text-slate-600">{msg}</p>
      <div className="mx-auto max-w-sm">
        <div className="mb-2 flex items-center justify-between">
          <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="btn-ghost px-2 py-1"><ChevronLeft className="h-4 w-4" /></button>
          <p className="text-sm font-semibold text-slate-900">{new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
          <button type="button" onClick={() => shift(1)} disabled={atCurrent} aria-label="Next month" className="btn-ghost px-2 py-1"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {WEEK.map((d, i) => <div key={i} className="py-1 font-medium text-slate-400">{d}</div>)}
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} />;
            const key = dateKey(new Date(view.y, view.m, d));
            const n = activity[key] || 0;
            const isToday = key === todayKey;
            const future = key > todayKey;
            return (
              <div key={key} title={n ? `${n} study action${n > 1 ? 's' : ''}` : ''}
                className={`flex aspect-square items-center justify-center rounded-lg text-xs font-medium ${level(n) || (future ? 'text-slate-300' : 'bg-slate-50 text-slate-600')} ${isToday ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}>
                {d}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-end gap-1 text-xs text-slate-400">Less
          {['bg-slate-100', 'bg-indigo-300', 'bg-indigo-500', 'bg-indigo-700'].map((c) => <span key={c} className={`h-3 w-3 rounded ${c}`} />)}More
        </div>
      </div>
    </div>
  );
}