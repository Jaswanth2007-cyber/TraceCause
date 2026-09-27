import React, { useState } from 'react';
import { Brain, Tag, ChevronDown, ChevronUp, Database, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { RecalledMemoryItem } from '../types';

interface MemoryVisualizationPanelProps {
  memories: RecalledMemoryItem[];
  bankId: string;
  isCloudMode: boolean;
}

export const MemoryVisualizationPanel: React.FC<MemoryVisualizationPanelProps> = ({
  memories,
  bankId,
  isCloudMode,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const getTierBadge = (score: number, explicitLabel?: string) => {
    const label = explicitLabel || (score >= 0.85 ? 'High Match' : score >= 0.70 ? 'Relevant' : score >= 0.50 ? 'Related Pattern' : 'Weak Match');
    switch (label) {
      case 'High Match':
        return {
          label: 'High Match',
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        };
      case 'Relevant':
        return {
          label: 'Relevant',
          bg: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
        };
      case 'Related Pattern':
        return {
          label: 'Related Pattern',
          bg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
        };
      default:
        return {
          label: 'Weak Match',
          bg: 'bg-slate-900 text-slate-400 border-slate-700',
        };
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Hindsight Memory Recall Graph
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                {memories.length} Memories Activated
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-strategy search across temporal records, failure signatures, and verified resolutions in Hindsight Cloud.
            </p>
          </div>
        </div>

        {/* Bank Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Hindsight Bank:</span>
          <span className="text-slate-200 font-semibold">{bankId}</span>
        </div>
      </div>

      {/* Memory Cards / Graph Representation */}
      {memories.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No historical memories recalled for this query.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {memories.map((mem, idx) => {
            const isExpanded = expandedIndex === idx;
            const score = mem.relevance || 0.75;
            const scorePercent = Math.round(score * 100);
            const tier = getTierBadge(score, mem.relevanceLabel);

            return (
              <div
                key={mem.id || idx}
                className={`rounded-lg border transition-all ${
                  isExpanded
                    ? 'bg-slate-950 border-indigo-700/50 shadow-md shadow-indigo-950/20'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Accordion Row */}
                <div
                  className="p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col items-center justify-center w-12 h-11 rounded-md bg-slate-900 border border-slate-800 font-mono shrink-0">
                      <span className="text-xs font-bold text-slate-200">{scorePercent}%</span>
                      <span className="text-[8px] text-slate-500 uppercase">relevance</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono font-semibold text-slate-200 truncate">
                          {mem.incidentNumber || mem.id}
                        </span>
                        {(mem.isNewlyLearned || mem.incidentNumber === 'INC-2024-091') && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-400/80 flex items-center gap-1 font-bold">
                            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                            NEWLY LEARNED
                          </span>
                        )}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tier.bg}`}>
                          {tier.label}
                        </span>
                        {mem.source && (
                          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {mem.source}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-xl">
                        {mem.whyRecalled || mem.content.slice(0, 90)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 space-y-3 text-xs">
                    {/* Why Hindsight Linked This */}
                    <div className="p-2.5 rounded bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-indigo-300 block text-[11px] uppercase tracking-wider">
                          Why Hindsight Linked This Memory:
                        </span>
                        <p className="text-slate-200 text-xs mt-0.5">
                          {mem.whyRecalled || 'Semantic and entity correlation with active incident.'}
                        </p>
                      </div>
                    </div>

                    {/* Stored Memory Content */}
                    <div>
                      <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block mb-1">
                        Stored Postmortem Knowledge Unit (Hindsight Cloud)
                      </span>
                      <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed overflow-x-auto">
                        {mem.content}
                      </pre>
                    </div>

                    {/* Entities & Tags */}
                    {((mem.entities && mem.entities.length > 0) || (mem.tags && mem.tags.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-slate-500 text-[10px] font-mono mr-1 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Entities:
                        </span>
                        {(mem.entities || []).map((ent, eIdx) => (
                          <span
                            key={eIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/60"
                          >
                            @{ent}
                          </span>
                        ))}
                        {(mem.tags || []).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
