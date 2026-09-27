import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  BrainCircuit,
  CheckCircle,
  AlertTriangle,
  Send,
  Activity,
  Layers,
  Clock,
  Globe,
  Database,
  RefreshCw,
} from 'lucide-react';
import {
  Incident,
  InvestigationResponse,
  RecalledMemoryItem,
  ResolutionResult,
} from '../types';
import { SeverityBadge, StatusBadge, ResultBadge, ServiceTag } from '../components/IncidentBadge';
import { EvidenceSeparationCard } from '../components/EvidenceSeparationCard';
import { MemoryVisualizationPanel } from '../components/MemoryVisualizationPanel';
import { ResolveLearnModal } from '../components/ResolveLearnModal';

interface IncidentDetailPageProps {
  incident: Incident;
  onBack: () => void;
  onInvestigate: (id: string) => Promise<InvestigationResponse>;
  onResolveAndLearn: (
    id: string,
    payload: { root_cause: string; resolution: string; result: ResolutionResult }
  ) => Promise<any>;
  onRefresh: () => void;
  externalInvestigationData?: InvestigationResponse | null;
}

export const IncidentDetailPage: React.FC<IncidentDetailPageProps> = ({
  incident,
  onBack,
  onInvestigate,
  onResolveAndLearn,
  onRefresh,
  externalInvestigationData = null,
}) => {
  const [investigationData, setInvestigationData] = useState<InvestigationResponse | null>(externalInvestigationData);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationError, setInvestigationError] = useState<string | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [retainedFeedback, setRetainedFeedback] = useState<any | null>(null);

  // Synchronize when external investigation data is provided from Stage bar
  useEffect(() => {
    if (externalInvestigationData && externalInvestigationData.incidentId === incident.id) {
      setInvestigationData(externalInvestigationData);
    }
  }, [externalInvestigationData, incident.id]);

  // Run investigation manually
  const handleRunInvestigation = async () => {
    setIsInvestigating(true);
    setInvestigationError(null);
    try {
      const response = await onInvestigate(incident.id);
      setInvestigationData(response);
    } catch (err: any) {
      setInvestigationError(err.message || 'Hindsight recall failed');
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleResolved = (resp: any) => {
    setRetainedFeedback(resp.memoryRetained);
    onRefresh();
  };

  const isResolved = incident.status === 'RESOLVED' || incident.status === 'MITIGATED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Incidents</span>
        </button>

        <div className="flex items-center gap-2.5">
          {/* Investigate Action Button */}
          <button
            onClick={handleRunInvestigation}
            disabled={isInvestigating}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isInvestigating ? 'animate-spin' : ''}`} />
            <span>{isInvestigating ? 'Querying Hindsight & Groq...' : 'Investigate with AI Agent'}</span>
          </button>

          {/* Resolve & Learn Action Button */}
          <button
            onClick={() => setIsResolveModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
              isResolved
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50 hover:bg-emerald-950/60'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{isResolved ? 'Update Resolution' : 'Resolve & Learn'}</span>
          </button>
        </div>
      </div>

      {/* Incident Metadata & Overview Card */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4">
        {/* Title & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-bold text-indigo-400">
              {incident.incident_number}
            </span>
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
            <ServiceTag service={incident.service} />
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
              env: {incident.environment}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(incident.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {incident.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 font-sans">
            {incident.description}
          </p>
        </div>

        {/* Symptoms List */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Observed Symptoms & Telemetry Triggers ({incident.symptoms.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {incident.symptoms.map((symptom, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono text-slate-300 flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <span>{symptom}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Banner if already resolved */}
        {(incident.resolution || (incident.resolutions && incident.resolutions.length > 0)) && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-xs sm:text-sm text-emerald-200">
                  Documented Institutional Resolution
                </span>
              </div>
              <ResultBadge
                result={
                  incident.resolution?.result ||
                  incident.resolutions?.[0]?.result ||
                  'SUCCESS'
                }
              />
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div>
                <strong className="text-emerald-300">Root Cause: </strong>
                {incident.resolution?.root_cause || incident.resolutions?.[0]?.root_cause}
              </div>
              <div>
                <strong className="text-emerald-300">Resolution & Lessons Learned: </strong>
                {incident.resolution?.resolution || incident.resolutions?.[0]?.resolution}
              </div>
            </div>
          </div>
        )}

        {/* Retained Memory Notice */}
        {retainedFeedback && (
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/50 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              <span>Successfully Retained into Hindsight Bank: {retainedFeedback.bankId}</span>
            </div>
            <pre className="p-2.5 rounded bg-slate-950 text-[11px] font-mono text-slate-300 whitespace-pre-wrap border border-slate-800">
              {retainedFeedback.content}
            </pre>
          </div>
        )}
      </div>

      {/* Investigation Loading Spinner */}
      {isInvestigating && (
        <div className="p-8 rounded-xl bg-slate-900/90 border border-indigo-700/50 shadow-xl shadow-indigo-950/30 text-center space-y-3 animate-pulse">
          <div className="w-8 h-8 mx-auto rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <div className="text-sm font-semibold text-indigo-300">
            TraceCause Agent is Investigating...
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            1. Querying Hindsight Cloud memory bank for historical postmortems and failure clusters...<br />
            2. Synthesizing telemetry and past lessons via Groq GPT-OSS-120B with strict evidence separation...
          </p>
        </div>
      )}

      {/* Investigation Error */}
      {investigationError && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>Investigation Error: {investigationError}</span>
        </div>
      )}

      {/* Tri-Fold Evidence Separation Card */}
      {investigationData && (
        <section className="space-y-4">
          <EvidenceSeparationCard findings={investigationData.findings} />

          {/* Memory Visualization Panel */}
          <MemoryVisualizationPanel
            memories={investigationData.recalledMemories}
            bankId={investigationData.hindsightBankId}
            isCloudMode={investigationData.hindsightMode.includes('Cloud')}
          />
        </section>
      )}

      {/* Resolve & Learn Modal */}
      <ResolveLearnModal
        incident={incident}
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onResolved={handleResolved}
        onSubmitResolve={(payload) => onResolveAndLearn(incident.id, payload)}
      />
    </div>
  );
};
