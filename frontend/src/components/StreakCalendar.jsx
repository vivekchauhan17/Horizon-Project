import { useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Trophy, CalendarCheck } from 'lucide-react';
import { dateKey, streakInfo } from '../utils/storage.js';

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const level = (n) => (n >= 3 ? 'bg-indigo-600 text-white' : n === 2 ? 'bg-indigo-400 text-white' : n === 1 ? 'bg-indigo-200 text-indigo-900' : '');

// Streak card: gradient header with the streak numbers + month calendar. Width is set by the parent (w-72).
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

  // The days that make up the current streak (shown in orange)
  const streakKeys = new Set();
  const startOffset = info.doneToday ? 0 : -1;
  for (let i = 0; i < info.current; i++) {
    const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + startOffset - i);
    streakKeys.add(dateKey(d));
  }
  const msg = info.current === 0 ? 'Tick a roadmap topic to start your streak.'
    : info.doneToday ? 'Great job! Your streak is safe for today.' : 'Tick a topic today to keep your streak going!';

  return (
    <div className="overflow-hidden rounded-2xl border border-white/30 bg-white shadow-xl shadow-indigo-950/40">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20"><Flame className="h-7 w-7 text-amber-300" /></span>
          <div>
            <p className="text-3xl font-extrabold leading-none">{info.current}</p>
            <p className="text-xs text-indigo-100">day streak</p>
          </div>
          <div className="ml-auto space-y-1 text-right text-xs text-indigo-50">
            <p className="flex items-center justify-end gap-1"><Trophy className="h-3.5 w-3.5" />Best {info.longest}</p>
            <p className="flex items-center justify-end gap-1"><CalendarCheck className="h-3.5 w-3.5" />{info.totalDays} active</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-indigo-100">{msg}</p>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><ChevronLeft className="h-4 w-4" /></button>
          <p className="text-sm font-semibold text-slate-900">{new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
          <button type="button" onClick={() => shift(1)} disabled={atCurrent} aria-label="Next month" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {WEEK.map((d, i) => <div key={i} className="pb-1 font-medium text-slate-400">{d}</div>)}
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} />;
            const key = dateKey(new Date(view.y, view.m, d));
            const n = activity[key] || 0;
            const isToday = key === todayKey;
            const future = key > todayKey;
            const look = streakKeys.has(key) ? 'bg-gradient-to-br from-amber-400 to-orange-500 font-semibold text-white shadow-sm'
              : level(n) || (future ? 'text-slate-300' : 'bg-slate-50 text-slate-600');
            return (
              <div key={key} title={n ? `${n} topic${n > 1 ? 's' : ''} completed` : ''}
                className={`flex aspect-square items-center justify-center rounded-lg text-xs font-medium ${look} ${isToday ? 'ring-2 ring-indigo-500' : ''}`}>
                {d}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-gradient-to-br from-amber-400 to-orange-500" />Streak</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-indigo-400" />Studied</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded ring-2 ring-indigo-500" />Today</span>
        </div>
      </div>
    </div>
  );
}