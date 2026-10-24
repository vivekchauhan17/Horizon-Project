import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { generateQuiz, submitQuiz } from '../services/api.js';
import { load, prepend } from '../utils/storage.js';
import { Spinner, ProgressBar, ErrorBox, Notice, PageHeader, Disclaimer } from '../components/ui.jsx';

export default function Quiz() {
  const notes = load('notes');
  const [source, setSource] = useState('');
  const [noteId, setNoteId] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const text = noteId ? notes.find((n) => String(n.id) === noteId)?.sourceText || '' : source;
  const reset = () => { setQuiz(null); setResult(null); setAnswers([]); setIdx(0); setError(''); };

  const start = async () => {
    setError(''); setInfo('');
    if (text.trim().length < 50) return setError('Paste at least 50 characters or pick a saved note.');
    setBusy(true);
    try {
      const q = await generateQuiz({ text, difficulty, count });
      setQuiz(q); setAnswers(Array(q.questions.length).fill(null)); setIdx(0); setResult(null);
      if (q.questions.length < count) setInfo(`Only ${q.questions.length} valid questions were generated.`);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const submit = async () => {
    if (busy || result) return; // prevents double submission
    setBusy(true); setError('');
    try {
      const r = await submitQuiz({ quizId: quiz.quizId, answers });
      setResult(r);
      prepend('quizzes', { id: Date.now(), topic: quiz.topic, difficulty, score: r.score, total: r.total, date: new Date().toISOString(), wrong: r.results.filter((x) => !x.isCorrect).map((x) => x.question) });
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  if (result) return (
    <div className="space-y-4">
      <PageHeader title="Quiz results" sub={quiz.topic} />
      <div className="card flex items-center justify-between"><p className="text-3xl font-semibold text-indigo-600">{result.score}/{result.total} <span className="text-base text-slate-500">({Math.round((result.score / result.total) * 100)}%)</span></p><button className="btn-primary" onClick={reset}><RotateCcw className="h-4 w-4" />Retake / new quiz</button></div>
      {result.results.map((r, i) => (
        <div key={i} className={`card border-l-4 ${r.isCorrect ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
          <p className="mb-2 flex gap-2 font-medium">{r.isCorrect ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <XCircle className="h-5 w-5 shrink-0 text-amber-600" />}{i + 1}. {r.question}</p>
          <ul className="space-y-1 text-sm">{r.options.map((o, j) => <li key={j} className={`rounded px-2 py-1 ${j === r.correct ? 'bg-emerald-50 text-emerald-800' : j === r.selected ? 'bg-amber-50 text-amber-800' : 'text-slate-600'}`}>{o}{j === r.correct && ' ✓ correct'}{j === r.selected && j !== r.correct && ' (your answer)'}</li>)}</ul>
          {r.selected === null && <p className="mt-1 text-xs text-slate-500">You skipped this one.</p>}
          <p className="mt-2 text-sm text-slate-600"><b>Why:</b> {r.explanation}</p>
        </div>
      ))}
      <Disclaimer />
    </div>
  );

  if (quiz) {
    const q = quiz.questions[idx], last = idx === quiz.questions.length - 1, answered = answers.filter((a) => a !== null).length;
    return (
      <div className="space-y-4">
        <PageHeader title={quiz.topic} sub={`${difficulty} quiz`} />
        <Notice msg={info} tone="warn" />
        <div className="card space-y-4">
          <div><div className="mb-1 flex justify-between text-xs text-slate-500"><span>Question {idx + 1} of {quiz.questions.length}</span><span>{answered} answered</span></div><div className="h-1.5 rounded bg-slate-100"><div className="h-1.5 rounded bg-indigo-600 transition-all" style={{ width: `${((idx + 1) / quiz.questions.length) * 100}%` }} /></div></div>
          <p className="font-medium text-slate-900">{q.question}</p>
          <div className="space-y-2">{q.options.map((o, j) => <button key={j} onClick={() => setAnswers(answers.map((a, k) => (k === idx ? j : a)))} className={`w-full rounded-lg border p-3 text-left text-sm transition ${answers[idx] === j ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-200 hover:border-indigo-300'}`}>{o}</button>)}</div>
          <ErrorBox msg={error} />
          <div className="flex justify-between">
            <button className="btn-ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}><ChevronLeft className="h-4 w-4" />Previous</button>
            {last ? <button className="btn-primary" disabled={busy} onClick={submit}>{busy ? <Spinner text="Scoring..." /> : 'Submit quiz'}</button> : <button className="btn-primary" onClick={() => setIdx(idx + 1)}>Next<ChevronRight className="h-4 w-4" /></button>}
          </div>
          <ProgressBar active={busy} label="Scoring your answers..." />
          {last && answered < answers.length && <p className="text-xs text-amber-700">{answers.length - answered} unanswered question(s) will count as incorrect.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="AI Quiz Generator" sub="Create MCQs from pasted text or your saved notes." />
      <div className="card space-y-4">
        {notes.length > 0 && <div><label className="label">Use a saved note</label><select className="input" value={noteId} onChange={(e) => setNoteId(e.target.value)}><option value="">None, I'll paste text</option>{notes.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}</select></div>}
        {!noteId && <div><label className="label">Study material</label><textarea className="input h-40" placeholder="Paste study material..." value={source} onChange={(e) => setSource(e.target.value)} /></div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Difficulty</label><select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>{['Easy', 'Medium', 'Hard'].map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label className="label">Questions</label><select className="input" value={count} onChange={(e) => setCount(Number(e.target.value))}><option value={5}>5</option><option value={10}>10</option></select></div>
        </div>
        <ErrorBox msg={error} />
        <button className="btn-primary" onClick={start} disabled={busy}>{busy ? <Spinner text="Generating quiz..." /> : <><Sparkles className="h-4 w-4" />Generate quiz</>}</button>
        <ProgressBar active={busy} label="Generating your quiz..." />
      </div>
    </div>
  );
}