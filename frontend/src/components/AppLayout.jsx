// import { NavLink, Link, Outlet } from 'react-router-dom';
// import { GraduationCap, LayoutDashboard, FileText, ListChecks, CalendarDays, TrendingUp } from 'lucide-react';

// const links = [['/dashboard', 'Dashboard', LayoutDashboard], ['/notes', 'Notes', FileText], ['/quiz', 'Quiz', ListChecks], ['/planner', 'Planner', CalendarDays], ['/progress', 'Progress', TrendingUp]];
// export const Logo = () => <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900"><span className="rounded-lg bg-indigo-600 p-1.5 text-white"><GraduationCap className="h-5 w-5" /></span>ExamPrep AI</Link>;

// export default function AppLayout() {
//   const cls = ({ isActive }) => `flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`;
//   return (
//     <div className="min-h-screen md:flex">
//       <aside className="border-b border-slate-200 bg-white md:fixed md:inset-y-0 md:w-64 md:border-b-0 md:border-r">
//         <div className="flex items-center justify-between p-4 md:block"><Logo /></div>
//         <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:gap-2 md:px-4">
//           {links.map(([to, label, Icon]) => <NavLink key={to} to={to} className={cls}><Icon className="h-5 w-5" />{label}</NavLink>)}
//         </nav>
//       </aside>
//       <main className="mx-auto w-full max-w-4xl p-4 md:ml-64 md:max-w-none md:p-8"><div className="mx-auto max-w-4xl"><Outlet /></div></main>
//     </div>
//   );
// }
import { NavLink, Link, Outlet } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, FileText, ListChecks, CalendarDays, TrendingUp, Map as MapIcon } from 'lucide-react';

const links = [['/dashboard', 'Dashboard', LayoutDashboard], ['/roadmap', 'Roadmap', MapIcon], ['/notes', 'Notes', FileText], ['/quiz', 'Quiz', ListChecks], ['/planner', 'Planner', CalendarDays], ['/progress', 'Progress', TrendingUp]];
export const Logo = () => <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900"><span className="rounded-lg bg-indigo-600 p-1.5 text-white"><GraduationCap className="h-5 w-5" /></span>ExamPrep AI</Link>;

export default function AppLayout() {
  const cls = ({ isActive }) => `flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`;
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-200 bg-white md:fixed md:inset-y-0 md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between p-4 md:block"><Logo /></div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:gap-2 md:px-4">
          {links.map(([to, label, Icon]) => <NavLink key={to} to={to} className={cls}><Icon className="h-5 w-5" />{label}</NavLink>)}
        </nav>
      </aside>
      <main className="mx-auto w-full max-w-4xl p-4 md:ml-64 md:max-w-none md:p-8"><div className="mx-auto max-w-4xl"><Outlet /></div></main>
    </div>
  );
}