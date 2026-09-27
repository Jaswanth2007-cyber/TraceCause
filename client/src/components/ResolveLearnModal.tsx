import React, { useState } from 'react';
import { X, Brain, CheckCircle, AlertCircle, Sparkles, Send } from 'lucide-react';
import { Incident, ResolutionResult } from '../types';

interface ResolveLearnModalProps {
  incident: Incident;
  isOpen: boolean;
  onClose: () => void;
  onResolved: (resultData: any) => void;
  onSubmitResolve: (payload: {
    root_cause: string;
    resolution: string;
    result: ResolutionResult;
  }) => Promise<any>;
}

export const ResolveLearnModal: React.FC<ResolveLearnModalProps> = ({
  incident,
  isOpen,
  onClose,
  onResolved,
  onSubmitResolve,
}) => {
  const [rootCause, setRootCause] = useState(
    'PostgreSQL connection pool exhausted due to unclosed transaction references in checkout error handler during high-concurrency request bursts, compounded by missing idle connection reap timeout.'
  );
  const [resolution, setResolution] = useState(
    '1) Set idleTimeoutMillis: 10000, connectionTimeoutMillis: 2000 on pg-pool. 2) Wrapped /checkout handlers in try-finally with explicit client.release(). 3) Verified zero connection leaks under load test.'
  );
  const [result, setResult] = useState<ResolutionResult>('SUCCESS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootCause.trim() || !resolution.trim()) {
      setErrorMessage('Please fill in both Root Cause and Resolution.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const resp = await onSubmitResolve({
        root_cause: rootCause.trim(),
        resolution: resolution.trim(),
        result,
      });
      onResolved(resp);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resolve incident and retain memory.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-950/60 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Resolve & Retain in Institutional Memory</h3>
                <span className="font-mono text-xs text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  {incident.incident_number}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Saves verified resolution and indexes postmortem lessons into Hindsight memory bank.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Result Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Resolution Outcome / Result
            </label>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as ResolutionResult)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
            >
              <option value="SUCCESS">SUCCESS (Permanent Architectural Fix)</option>
              <option value="MITIGATED">MITIGATED (Temporary Relief / Workaround)</option>
              <option value="PARTIAL">PARTIAL (Partial Recovery)</option>
              <option value="FAILED">FAILED (Attempt Unsuccessful / Caused Outage)</option>
            </select>
          </div>

          {/* Root Cause */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Identified Root Cause
            </label>
            <textarea
              rows={3}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="Describe the underlying technical root cause..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-mono leading-relaxed"
            />
          </div>

          {/* Resolution & Postmortem Lessons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Resolution Steps & Postmortem Lessons (Retained by Hindsight)
            </label>
            <textarea
              rows={4}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Document the exact remediation steps and what worked vs what failed..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-mono leading-relaxed"
            />
          </div>

          {/* Info note */}
          <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/40 text-slate-300 text-xs flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              This postmortem will be retained with tags <code className="text-indigo-300">#{incident.service}</code> and <code className="text-indigo-300">#{result.toLowerCase()}</code>. Future incidents in any microservice will automatically recall this lesson during agent investigations.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Retaining in Hindsight...' : 'Resolve & Learn'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
