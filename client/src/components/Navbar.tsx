import React from 'react';
import { BrainCircuit, Sparkles, Plus, Database } from 'lucide-react';
import { SystemHealth } from '../types';

interface NavbarProps {
  health: SystemHealth | null;
  onSeed: () => void;
  onNewIncident: () => void;
  isSeeding: boolean;
  activeView: 'list' | 'detail';
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  onSeed,
  onNewIncident,
  isSeeding,
  activeView,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0b0f19]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand with Image Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onNavigateHome}>
          <div className="relative flex items-center justify-center h-11 w-auto rounded-lg overflow-hidden transition-transform group-hover:scale-105">
            <img
              src="/logo.png"
              alt="TraceCause Logo"
              className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(99,102,241,0.35)]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-mono">
                Trace<span className="text-indigo-400">Cause</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                Institutional Memory Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              Powered by <span className="text-slate-200 font-medium">Hindsight Cloud</span> & <span className="text-slate-200 font-medium">Groq GPT-OSS-120B</span>
            </p>
          </div>
        </div>

        {/* Status Indicators & Actions */}
        <div className="flex items-center gap-3">
          {/* Memory Bank Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">Memory Bank:</span>
            <span className="font-mono text-slate-200 font-medium">
              {health?.hindsight.bankId || 'tracecause-bank'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                health?.hindsight.cloudConnected
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-emerald-500/80'
              }`}
              title={health?.hindsight.cloudConnected ? 'Hindsight Cloud Connected' : 'Institutional Memory Engine Active'}
            />
          </div>

          {/* Groq LLM Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">LLM:</span>
            <span className="font-mono text-slate-200">
              {health?.groq.configured ? 'Groq GPT-OSS-120B' : 'Groq GPT-OSS-120B'}
            </span>
          </div>

          {/* Seed Button */}
          <button
            onClick={onSeed}
            disabled={isSeeding}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            title="Seed 15 historical incidents into database and Hindsight memory bank"
          >
            <Database className={`w-3.5 h-3.5 text-indigo-400 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>{isSeeding ? 'Seeding...' : 'Seed Memory'}</span>
          </button>

          {/* New Incident Button */}
          <button
            onClick={onNewIncident}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Incident</span>
          </button>
        </div>
      </div>
    </header>
  );
};
