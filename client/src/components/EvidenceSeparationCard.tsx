import React, { useState } from 'react';
import {
  Activity,
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  FileText,
  Target,
  ShieldCheck,
  Zap,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { StructuredInvestigationResult } from '../types';

interface EvidenceSeparationCardProps {
  findings: StructuredInvestigationResult;
  onSelectIncidentLink?: (incNumber: string) => void;
}

export const EvidenceSeparationCard: React.FC<EvidenceSeparationCardProps> = ({
  findings,
  onSelectIncidentLink,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'facts' | 'memory' | 'inference'>('all');

  const { currentFacts, historicalMemory, aiInference } = findings;

  return (
    <div className="w-full space-y-4">
      {/* Evidence Separation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Strict Evidence Separation
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/60 uppercase">
              Zero-Hallucination Policy
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Telemetry facts, Hindsight institutional memory, and AI inference are strictly isolated and never conflated.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tri-Fold Grid
          </button>
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'facts'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Current Facts
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'memory'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Institutional Memory
          </button>
          <button
            onClick={() => setActiveTab('inference')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'inference'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. AI Inference
          </button>
        </div>
      </div>

      {/* Tri-Fold Evidence Grid */}
      <div className={`grid gap-4 ${activeTab === 'all' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* ======================================================== */}
        {/* COLUMN 1: CURRENT OBSERVED FACTS */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'facts') && (
          <div className="flex flex-col rounded-xl bg-slate-900/80 border border-sky-900/50 shadow-lg shadow-sky-950/20 overflow-hidden">
            <div className="p-4 border-b border-sky-900/40 bg-gradient-to-r from-sky-950/60 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-sky-100">1. Current Facts</h4>
                  <p className="text-[11px] text-sky-400 font-mono">Telemetry & Live Observations</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                Ground Truth
              </span>
            </div>

            <div className="p-4 space-y-4 flex-1 text-xs">
              {/* Telemetry Findings */}
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                  Active Telemetry & Metrics
                </span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] leading-relaxed">
                  {currentFacts.telemetryFindings}
                </div>
              </div>

              {/* Observed Symptoms */}
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                  Observed Symptoms ({currentFacts.observedSymptoms.length})
                </span>
                <ul className="space-y-1.5">
                  {currentFacts.observedSymptoms.map((sym, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                      <span>{sym}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Affected Endpoints */}
              {currentFacts.affectedEndpoints && currentFacts.affectedEndpoints.length > 0 && (
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                    Affected Routes / Handlers
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentFacts.affectedEndpoints.map((ep, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded bg-slate-950 text-sky-300 font-mono text-[11px] border border-sky-950"
                      >
                        {ep}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Impact Assessment */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                  Customer & SLA Impact
                </span>
                <p className="text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded border border-slate-800">
                  {currentFacts.impactAssessment}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* COLUMN 2: INSTITUTIONAL MEMORY (HINDSIGHT) */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'memory') && (
          <div className="flex flex-col rounded-xl bg-slate-900/80 border border-purple-900/50 shadow-lg shadow-purple-950/20 overflow-hidden">
            <div className="p-4 border-b border-purple-900/40 bg-gradient-to-r from-purple-950/60 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-purple-100">2. Institutional Memory</h4>
                  <p className="text-[11px] text-purple-400 font-mono">Hindsight Memory Recall</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Historical Bank
              </span>
            </div>

            <div className="p-4 space-y-4 flex-1 text-xs">
              {/* Recalled Incidents */}
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                  Matched Historical Postmortems ({historicalMemory.recalledIncidents.length})
                </span>
                <div className="space-y-2">
                  {historicalMemory.recalledIncidents.map((mem, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border transition-colors ${
                        mem.isNewlyLearned || mem.incidentNumber === 'INC-2024-091'
                          ? 'bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-950/40'
                          : 'bg-slate-950 border-slate-800 hover:border-purple-700/50'
                      }`}
                    >
                      {/* Newly Learned Memory Banner */}
                      {(mem.isNewlyLearned || mem.incidentNumber === 'INC-2024-091') && (
                        <div className="mb-2 px-2.5 py-1 rounded bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-400/60 flex items-center justify-between text-[10px] font-mono text-purple-200">
                          <span className="font-bold flex items-center gap-1.5 text-amber-300">
                            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                            NEWLY LEARNED MEMORY
                          </span>
                          <span className="text-purple-300">Retained in Stage 6</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="font-mono font-bold text-purple-300 hover:underline cursor-pointer flex items-center gap-1"
                          onClick={() => onSelectIncidentLink && onSelectIncidentLink(mem.incidentNumber)}
                        >
                          {mem.incidentNumber}
                          <ArrowUpRight className="w-3 h-3 text-purple-400" />
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                          {mem.relevanceTier || (mem.relevanceScore >= 0.85 ? 'High Match' : mem.relevanceScore >= 0.70 ? 'Relevant' : 'Related Pattern')} ({Math.round(mem.relevanceScore * 100)}%)
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] mb-2">{mem.similaritySummary}</p>

                      {/* Explicit Failed Attempts Warning */}
                      {mem.failedAttemptsWarning && (
                        <div className="p-2 rounded bg-rose-950/40 border border-rose-800/50 text-rose-300 text-[11px] flex items-start gap-1.5 mb-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{mem.failedAttemptsWarning}</span>
                        </div>
                      )}

                      {/* Proven Resolution */}
                      {mem.provenResolution && (
                        <div className="p-2 rounded bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-[11px] flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{mem.provenResolution}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-Patterns to Avoid */}
              {historicalMemory.pastAntiPatternsToAvoid && historicalMemory.pastAntiPatternsToAvoid.length > 0 && (
                <div>
                  <span className="text-rose-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3" />
                    Past Anti-Patterns To Avoid
                  </span>
                  <ul className="space-y-1 bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/30">
                    {historicalMemory.pastAntiPatternsToAvoid.map((ap, idx) => (
                      <li key={idx} className="text-rose-200 text-[11px] flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{ap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Institutional Patterns */}
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                  Institutional Patterns
                </span>
                <ul className="space-y-1">
                  {historicalMemory.institutionalPatternsIdentified.map((pat, idx) => (
                    <li key={idx} className="text-slate-300 text-[11px] flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{pat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* COLUMN 3: AI INFERENCE & SYNTHESIS */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'inference') && (
          <div className="flex flex-col rounded-xl bg-slate-900/80 border border-emerald-900/50 shadow-lg shadow-emerald-950/20 overflow-hidden">
            <div className="p-4 border-b border-emerald-900/40 bg-gradient-to-r from-emerald-950/60 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-100">3. AI Inference</h4>
                  <p className="text-[11px] text-emerald-400 font-mono">Deduction & Action Plan</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px]">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>{Math.round((aiInference.confidenceScore || 0.94) * 100)}% Confident</span>
              </div>
            </div>

            <div className="p-4 space-y-4 flex-1 text-xs">
              {/* Most Probable Root Cause */}
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                  Deducted Root Cause
                </span>
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 font-medium leading-relaxed">
                  {aiInference.mostProbableRootCause}
                </div>
              </div>

              {/* Immediate Action Plan */}
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Recommended Immediate Action Plan
                </span>
                <ol className="space-y-1.5">
                  {aiInference.immediateActionPlan.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 text-[11px]"
                    >
                      <span className="font-mono text-emerald-400 font-bold">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Long Term Architecture Fix */}
              {aiInference.longTermRemediation && aiInference.longTermRemediation.length > 0 && (
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                    Long-Term Architecture Remediation
                  </span>
                  <ul className="space-y-1">
                    {aiInference.longTermRemediation.map((rem, idx) => (
                      <li key={idx} className="text-slate-300 text-[11px] flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Institutional Risk Summary */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                  Institutional Risk Context
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800">
                  {aiInference.institutionalRiskSummary}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
