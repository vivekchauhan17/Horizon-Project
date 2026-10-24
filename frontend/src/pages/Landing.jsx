import { Link } from 'react-router-dom';
import { FileText, ListChecks, CalendarDays, Upload, Sparkles, Trophy } from 'lucide-react';
import { Logo } from '../components/AppLayout.jsx';

const features = [[FileText, 'AI Notes', 'Turn PDFs or pasted text into clear revision notes with key concepts and definitions.'],
[ListChecks, 'Smart Quizzes', 'Generate MCQs at your difficulty level and get instant scores with explanations.'],
[CalendarDays, 'Study Planner', 'Get a day-by-day revision timetable built around your exam date and free time.']];
const steps = [[Upload, 'Add your material', 'Upload a PDF or paste your notes.'], [Sparkles, 'Let AI work', 'Get notes, quizzes and a plan.'], [Trophy, 'Revise and track', 'Take quizzes and watch your progress grow.']];

export default function Landing() {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  return (
    <div >
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Logo />
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-indigo-600">Home</button>
            <button onClick={() => go('features')} className="hover:text-indigo-600">Features</button>
            <button onClick={() => go('how')} className="hidden hover:text-indigo-600 sm:block">How It Works</button>
            <Link to="/dashboard" className="btn-primary">Dashboard</Link>
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="mb-3 text-sm font-medium text-indigo-600">Learn Smarter. Prepare Better.</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Your Personal AI Exam Preparation Assistant.</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">ExamPrep AI transforms your study materials into simplified notes, interactive quizzes, and a personalized study plan, all in one place.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/dashboard" className="btn-primary px-6 py-3">Start Preparing</Link>
          <button onClick={() => go('features')} className="btn-ghost px-6 py-3">Explore Features</button>
        </div>
      </section>
      <section id="features" className="bg-slate-50 py-16"><div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-8 text-center text-2xl font-semibold text-slate-900">Everything you need to revise</h2>
        <div className="grid gap-4 md:grid-cols-3">{features.map(([I, t, d]) => <div key={t} className="card transition hover:shadow-md"><I className="mb-3 h-6 w-6 text-indigo-600" /><h3 className="font-semibold text-slate-900">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div>)}</div>
      </div></section>
      <section id="how" className="py-16"><div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-8 text-center text-2xl font-semibold text-slate-900">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">{steps.map(([I, t, d], i) => <div key={t} className="text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"><I className="h-5 w-5" /></div><p className="text-xs text-slate-400">Step {i + 1}</p><h3 className="font-semibold text-slate-900">{t}</h3><p className="text-sm text-slate-600">{d}</p></div>)}</div>
      </div></section>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">ExamPrep AI: an AI-powered learning platform that turns study material into notes, quizzes and study plans.</footer>
    </div>
  );
}
