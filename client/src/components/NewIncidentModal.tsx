import React, { useState } from 'react';
import { X, Plus, AlertTriangle, Sparkles, Zap, ChevronRight } from 'lucide-react';
import { SeverityLevel } from '../types';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateIncident: (payload: {
    title: string;
    service: string;
    severity: SeverityLevel;
    environment: string;
    description: string;
    symptoms: string[];
    incident_number?: string;
  }) => Promise<any>;
}

interface IncidentPreset {
  name: string;
  badge: string;
  title: string;
  service: string;
  severity: SeverityLevel;
  environment: string;
  description: string;
  symptoms: string[];
}

const PRESETS: IncidentPreset[] = [
  {
    name: 'Demo Stage 2: Payment API 504 Timeouts (Connection Starvation)',
    badge: 'Stage 2 Primary',
    title: 'payment-api HTTP 504 Gateway Timeouts under checkout surge',
    service: 'payment-api',
    severity: 'CRITICAL',
    environment: 'production',
    description: 'During a flash campaign, payment-api latency spiked to >15,000ms and returned 504s on /v1/charges endpoint. Telemetry showed connection pool acquisition timeouts and database connection queue depth backing up.',
    symptoms: [
      'Connection pool acquisition timeout: pool exhausted (50/50 active)',
      'HTTP 504 Gateway Timeout on POST /v1/charges',
      'Database connection queue depth > 450 requests',
      'p99 latency spiked from 120ms to 18,200ms',
    ],
  },
  {
    name: 'Demo Stage 7: Order Service DB Connection Leak (Accumulated Memory)',
    badge: 'Stage 7 Validation',
    title: 'order-service database connection starvation during inventory commit',
    service: 'order-service',
    severity: 'CRITICAL',
    environment: 'production',
    description: 'Order service backend experiencing severe database connection exhaustion and 504 Gateway Timeouts on /v1/orders/commit during high traffic checkout surge. Database queue depth climbing rapidly.',
    symptoms: [
      'pg-pool acquisition timeout: no available connections in pool',
      'pg_stat_activity showing 35+ connections in state "idle in transaction"',
      'HTTP 504 Gateway Timeout on /v1/orders/commit',
      'Order fulfillment processing latency spiked to 14,000ms',
    ],
  },
  {
    name: 'Auth Service Token Validation Bottleneck',
    badge: 'Secondary Scenario',
    title: 'auth-service JWKS public key verification rate limit failure',
    service: 'auth-service',
    severity: 'HIGH',
    environment: 'production',
    description: 'Incoming microservice requests failing with 401 Unauthorized. Auth service making excessive outbound calls to IdP public signing key endpoint.',
    symptoms: [
      'HTTP 401 Unauthorized rate jumped to 34%',
      'Auth0 JWKS endpoint returning 429 Too Many Requests',
      'JWT verification latency spiked to 2,800ms',
    ],
  },
];

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  isOpen,
  onClose,
  onCreateIncident,
}) => {
  const [title, setTitle] = useState('');
  const [service, setService] = useState('payment-api');
  const [severity, setSeverity] = useState<SeverityLevel>('CRITICAL');
  const [environment, setEnvironment] = useState('production');
  const [description, setDescription] = useState('');
  const [symptomsText, setSymptomsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const applyPreset = (p: IncidentPreset) => {
    setTitle(p.title);
    setService(p.service);
    setSeverity(p.severity);
    setEnvironment(p.environment);
    setDescription(p.description);
    setSymptomsText(p.symptoms.join('\n'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !service.trim() || !description.trim()) {
      setError('Please fill in Title, Service, and Description.');
      return;
    }

    const symptoms = symptomsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreateIncident({
        title: title.trim(),
        service: service.trim(),
        severity,
        environment,
        description: description.trim(),
        symptoms: symptoms.length > 0 ? symptoms : ['Active service failure detected'],
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-950/60 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create New Live Incident</h3>
              <p className="text-xs text-slate-400">
                Trigger a simulated production incident to test AI agent investigation and memory recall.
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

        {/* Presets Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Quick Demo Presets
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-left p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                    {preset.badge}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate">{preset.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">svc: {preset.service}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Incident Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. payment-api 504 Gateway Timeouts under checkout surge"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-medium"
            />
          </div>

          {/* Row: Service, Severity, Environment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Service
              </label>
              <input
                type="text"
                required
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="payment-api"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              >
                <option value="CRITICAL">P1 - CRITICAL</option>
                <option value="HIGH">P2 - HIGH</option>
                <option value="MEDIUM">P3 - MEDIUM</option>
                <option value="LOW">P4 - LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              >
                <option value="production">production</option>
                <option value="staging">staging</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Incident Description & Telemetry Summary
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the initial telemetry, alerts, and user impact..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-mono leading-relaxed"
            />
          </div>

          {/* Symptoms (one per line) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Observed Symptoms (One per line)
            </label>
            <textarea
              rows={3}
              value={symptomsText}
              onChange={(e) => setSymptomsText(e.target.value)}
              placeholder="Connection pool exhausted (50/50 active)&#10;HTTP 504 on POST /v1/charges&#10;p99 latency spiked to 18,200ms"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-mono leading-relaxed"
            />
          </div>

          {/* Actions */}
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
              <Zap className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Spawning Incident...' : 'Trigger Incident'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
