import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle2, Inbox } from 'lucide-react';
// Estimated progress: eases toward ~92% while `active`, disappears when `active` is false (done or error).
export function ProgressBar({ active, label = 'Working...' }) {
    const [pct, setPct] = useState(0);
    useEffect(() => {
        if (!active) { setPct(0); return; }
        setPct(5);
        const id = setInterval(() => setPct((p) => p + (92 - p) * 0.06), 400);
        return () => clearInterval(id);
    }, [active]);
    if (!active) return null;
    return (
        <div>
            <div className="mb-1 flex justify-between text-xs text-slate-500"><span>{label}</span><span>{Math.round(pct)}%</span></div>
            <div className="h-2 overflow-hidden rounded bg-slate-100"><div className="h-2 rounded bg-indigo-600 transition-all duration-500" style={{ width: `${pct}%` }} /></div>
        </div>
    );
}
export const Spinner = ({ text = 'Working...' }) => <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{text}</span>;
export const ErrorBox = ({ msg }) => msg ? <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{msg}</div> : null;
export const Notice = ({ msg, tone = 'ok' }) => msg ? <div className={`flex gap-2 rounded-lg border p-3 text-sm ${tone === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}><CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />{msg}</div> : null;
export const Empty = ({ text, children }) => <div className="flex flex-col items-center gap-3 py-8 text-center text-sm text-slate-500"><Inbox className="h-8 w-8 text-slate-300" />{text}{children}</div>;
export const PageHeader = ({ title, sub }) => <div className="mb-6"><h1 className="text-2xl font-semibold text-slate-900">{title}</h1><p className="text-sm text-slate-500">{sub}</p></div>;
export const Stat = ({ icon: Icon, label, value }) => <div className="card flex items-center gap-4"><div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Icon className="h-5 w-5" /></div><div><p className="text-2xl font-semibold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div></div>;
export const Disclaimer = () => <p className="text-xs text-slate-400">AI-generated content can contain errors. Verify important facts against your course material.</p>;