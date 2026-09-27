import React from 'react';
import { Play, CheckCircle2, ArrowRight, Brain, Sparkles, BookOpen, Layers } from 'lucide-react';

export interface DemoStage {
  id: number;
  title: string;
  shortDesc: string;
  actionLabel: string;
  instruction: string;
}

export const DEMO_STAGES: DemoStage[] = [
  {
    id: 1,
    title: '1. Seed Memory Bank',
    shortDesc: 'Initialize 15 historical postmortems',
    actionLabel: 'Seed Memory Bank',
    instruction: 'Seeds the SQLite database and populates Hindsight memory bank with past incident clusters & failed fixes.',
  },
  {
    id: 2,
    title: '2. Spawn Incident #1',
    shortDesc: 'payment-api checkout timeout surge',
    actionLabel: 'Create Incident #1 (payment-api)',
    instruction: 'Simulates a live P1 incident: payment-api experiencing connection pool exhaustion & 504 timeouts.',
  },
  {
    id: 3,
    title: '3. Agent Investigation',
    shortDesc: 'Hindsight recall + Groq reasoning',
    actionLabel: 'Investigate with AI',
    instruction: 'TraceCause queries Hindsight for past postmortems and presents structured root cause findings.',
  },
  {
    id: 4,
    title: '4. Evidence Separation',
    shortDesc: 'Review Facts vs Memory vs AI',
    actionLabel: 'Review Tri-Fold Evidence',
    instruction: 'Observe strict separation: Live Telemetry vs Recalled Institutional Memory vs AI Synthesized Plan.',
  },
  {
    id: 5,
    title: '5. Resolve Incident',
    shortDesc: 'Apply verified connection reaping fix',
    actionLabel: 'Resolve & Learn',
    instruction: 'Document the root cause and applied fix (reaping timeouts + unclosed webhook transaction fix).',
  },
  {
    id: 6,
    title: '6. Institutional Learning',
    shortDesc: 'Hindsight retains new postmortem',
    actionLabel: 'Verify Memory Retention',
    instruction: 'The postmortem lesson is retained into Hindsight memory bank as persistent institutional knowledge.',
  },
  {
    id: 7,
    title: '7. Spawn Incident #2 (Accumulated)',
    shortDesc: 'order-service connection leak recalls newly learned fix',
    actionLabel: 'Spawn Related Incident #2 (order-service)',
    instruction: 'Spawn a 2nd related incident in order-service. AI immediately recalls the newly learned lesson from Stage 6!',
  },
];

interface DemoGuideBarProps {
  currentStage: number;
  onSelectStage: (stage: number) => void;
  onExecuteStageAction: (stage: number) => void;
  isExecuting: boolean;
  stage7IncidentCreated?: boolean;
  isStage7Completed?: boolean;
}

export const DemoGuideBar: React.FC<DemoGuideBarProps> = ({
  currentStage,
  onSelectStage,
  onExecuteStageAction,
  isExecuting,
  stage7IncidentCreated = false,
  isStage7Completed = false,
}) => {
  const current = DEMO_STAGES.find((s) => s.id === currentStage) || DEMO_STAGES[0];

  // Dynamic Stage 7 label & instruction
  let actionLabel = current.actionLabel;
  let instruction = current.instruction;

  if (currentStage === 7) {
    if (isStage7Completed) {
      actionLabel = 'Re-Run Investigation (Accumulated)';
      instruction = 'Stage 7 Complete: order-service successfully queried Hindsight and applied the newly learned lesson from INC-2024-091.';
    } else if (stage7IncidentCreated) {
      actionLabel = 'Investigate Incident #2 with AI Agent';
      instruction = 'Incident #2 (order-service) created in SQLite. Run AI investigation to recall Hindsight Cloud memory and observe transferred institutional knowledge.';
    } else {
      actionLabel = 'Spawn Related Incident #2 (order-service)';
      instruction = 'Spawn a 2nd related incident in order-service. AI will recall the newly retained postmortem lesson from Stage 6!';
    }
  }

  return (
    <div className="w-full bg-slate-900/90 border-b border-indigo-900/40 p-3 sm:p-4 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        {/* Header & Stage Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase text-indigo-400 tracking-wider">
                  Interactive Demo Script
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-300 font-medium">Stage {current.id} of 7</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                {current.title}
                <span className="text-xs font-normal text-slate-400 hidden sm:inline">— {current.shortDesc}</span>
              </h3>
            </div>
          </div>

          {/* Action Trigger for Current Stage */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => onExecuteStageAction(current.id)}
              disabled={isExecuting}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
                isStage7Completed && currentStage === 7
                  ? 'bg-emerald-700 hover:bg-emerald-600 shadow-emerald-700/30'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-600/30'
              }`}
            >
              <Play className={`w-4 h-4 fill-white ${isExecuting ? 'animate-pulse' : ''}`} />
              <span>{isExecuting ? 'Processing Stage...' : actionLabel}</span>
            </button>

            {currentStage < 7 && (
              <button
                onClick={() => onSelectStage(currentStage + 1)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Next stage"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Stage 7 Completion Checklist Banner */}
        {currentStage === 7 && isStage7Completed && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/50 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-emerald-200 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Stage 7 Learning Loop Verified:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-300">✓ Incident #2 Created</span>
              <span className="text-emerald-600">•</span>
              <span className="flex items-center gap-1 text-emerald-300">✓ Hindsight Recalled</span>
              <span className="text-emerald-600">•</span>
              <span className="flex items-center gap-1 text-emerald-300">✓ Newly Learned Memory Applied</span>
              <span className="text-emerald-600">•</span>
              <span className="flex items-center gap-1 text-emerald-300">✓ Accumulated Learning Demonstrated</span>
            </div>
          </div>
        )}

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2 mt-3 pt-3 border-t border-slate-800/80">
          {DEMO_STAGES.map((stage) => {
            const isCompleted = currentStage > stage.id || (stage.id === 7 && isStage7Completed);
            const isCurrent = currentStage === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => onSelectStage(stage.id)}
                className={`text-left p-2 rounded-md transition-all border ${
                  isCurrent
                    ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                    : isCompleted
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span>Stage 0{stage.id}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  ) : null}
                </div>
                <div className="text-xs font-medium truncate">{stage.title.replace(/^\d+\.\s*/, '')}</div>
              </button>
            );
          })}
        </div>

        {/* Instruction sub-note */}
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
          <span className="font-semibold text-indigo-300">Stage Objective:</span>
          <span>{instruction}</span>
        </div>
      </div>
    </div>
  );
};
