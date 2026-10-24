import { useState, useRef } from 'react';
import { Upload, X, Copy, Save, Sparkles, FileText } from 'lucide-react';
import { generateNotes } from '../services/api.js';
import { prepend } from '../utils/storage.js';
import { Spinner, ProgressBar, ErrorBox, Notice, PageHeader, Disclaimer } from '../components/ui.jsx';

export default function Notes() {
  const [mode, setMode] = useState('pdf');
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef();

  const pick = (f) => {
    setError('');
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) return setError('Only PDF files are allowed.');
    if (f.size > 5 * 1024 * 1024) return setError('PDF must be 5 MB or smaller.');
    setFile(f);
  };

  const generate = async () => {
    setError(''); setInfo('');
    if (mode === 'pdf' && !file) return setError('Please select a PDF file.');
    if (mode === 'text' && text.trim().length < 50) return setError('Paste at least 50 characters of study material.');
    setBusy(true);
    try {
      const data = await generateNotes(mode === 'pdf' ? { file } : { text });
      setResult(data);
      if (data.truncated) setInfo('Your material was very long, so only the first ~30,000 characters were used.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const noteText = (n) => `${n.title}\n\nOverview\n${n.overview}\n\nKey Concepts\n${n.keyConcepts.map((c) => `- ${c.name}: ${c.explanation}`).join('\n')}\n\nDefinitions\n${n.definitions.map((d) => `- ${d.term}: ${d.meaning}`).join('\n')}\n\nRevision Summary\n${n.revisionSummary}`;
  const copy = async () => { try { await navigator.clipboard.writeText(noteText(result.notes)); setInfo('Notes copied to clipboard.'); } catch { setError('Copy failed. Select the text manually.'); } };
  const saveNotes = () => { prepend('notes', { id: Date.now(), title: result.notes.title, notes: result.notes, sourceText: result.sourceText, date: new Date().toISOString() }); setInfo('Notes saved.'); };

  const n = result?.notes;
  return (
    <div className="space-y-5">
      <PageHeader title="AI Notes Generator" sub="Upload a PDF or paste text to get simplified revision notes." />
      <div className="card space-y-4">
        <div className="flex gap-2">{[['pdf', 'Upload PDF'], ['text', 'Paste text']].map(([k, l]) => <button key={k} onClick={() => setMode(k)} className={mode === k ? 'btn-primary' : 'btn-ghost'}>{l}</button>)}</div>
        {mode === 'pdf' ? (file ? (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-600" />{file.name} <span className="text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span></span>
            <button onClick={() => { setFile(null); inputRef.current.value = ''; }} className="text-slate-500 hover:text-red-600" aria-label="Remove file"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <button onClick={() => inputRef.current.click()} className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-8 text-sm text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600"><Upload className="h-6 w-6" />Click to choose a PDF (max 5 MB)</button>
        )) : <textarea className="input h-48" placeholder="Paste your study material here..." value={text} onChange={(e) => setText(e.target.value)} />}
        <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => pick(e.target.files[0])} />
        <ErrorBox msg={error} />
        <button className="btn-primary" onClick={generate} disabled={busy}>{busy ? <Spinner text="Generating notes..." /> : <><Sparkles className="h-4 w-4" />Generate notes</>}</button>
        <ProgressBar active={busy} label="Reading your material and writing notes..." />
      </div>
      <Notice msg={info} />
      {n && (
        <div className="card space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-xl font-semibold text-slate-900">{n.title}</h2>
            <div className="flex gap-2"><button className="btn-ghost" onClick={copy}><Copy className="h-4 w-4" />Copy</button><button className="btn-primary" onClick={saveNotes}><Save className="h-4 w-4" />Save</button></div>
          </div>
          <section><h3 className="mb-1 font-semibold text-indigo-700">Overview</h3><p className="text-sm text-slate-700">{n.overview}</p></section>
          <section><h3 className="mb-2 font-semibold text-indigo-700">Important concepts</h3><ul className="space-y-2 text-sm">{n.keyConcepts.map((c, i) => <li key={i}><b>{c.name}:</b> {c.explanation}</li>)}</ul></section>
          <section><h3 className="mb-2 font-semibold text-indigo-700">Key definitions</h3><dl className="space-y-2 text-sm">{n.definitions.map((d, i) => <div key={i}><dt className="inline font-medium">{d.term}: </dt><dd className="inline text-slate-700">{d.meaning}</dd></div>)}</dl></section>
          <section className="rounded-lg bg-indigo-50 p-4"><h3 className="mb-1 font-semibold text-indigo-700">Revision summary</h3><p className="text-sm text-slate-700">{n.revisionSummary}</p></section>
          <Disclaimer />
        </div>
      )}
    </div>
  );
}