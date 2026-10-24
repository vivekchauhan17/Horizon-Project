import { Target, Rocket, Code2, BookOpen, Brain, Trophy, Flame } from 'lucide-react';

export const STICKERS = {
  target: { icon: Target, from: '#6366f1', to: '#4338ca' },
  rocket: { icon: Rocket, from: '#fb923c', to: '#dc2626' },
  code: { icon: Code2, from: '#38bdf8', to: '#2563eb' },
  book: { icon: BookOpen, from: '#34d399', to: '#0f766e' },
  brain: { icon: Brain, from: '#c084fc', to: '#7e22ce' },
  trophy: { icon: Trophy, from: '#fbbf24', to: '#d97706' },
  flame: { icon: Flame, from: '#fb7185', to: '#be123c' },
};

// A tilted, sticker-style badge: gradient tile, white border, dashed inner outline, "GOAL" tag.
export default function GoalSticker({ id = 'target', size = 72, tilt = -6, tag = true }) {
  const s = STICKERS[id] || STICKERS.target;
  const Icon = s.icon;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size, transform: `rotate(${tilt}deg)` }} aria-hidden="true">
      <div className="flex h-full w-full items-center justify-center rounded-2xl border-[3px] border-white shadow-lg ring-1 ring-slate-200"
        style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}>
        <div className="absolute inset-1 rounded-xl border border-dashed border-white/60" />
        <Icon color="white" size={Math.round(size * 0.46)} strokeWidth={2} />
      </div>
      {tag && size >= 60 && (
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-amber-300 px-2 py-px text-[9px] font-extrabold tracking-widest text-amber-900 shadow">GOAL</span>
      )}
    </div>
  );
}