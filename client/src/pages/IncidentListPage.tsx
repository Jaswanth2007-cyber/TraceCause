import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flame,
  ArrowRight,
  Database,
  BrainCircuit,
  Activity,
} from 'lucide-react';
import { Incident, IncidentStatus, SeverityLevel } from '../types';
import { SeverityBadge, StatusBadge, ResultBadge, ServiceTag } from '../components/IncidentBadge';

interface IncidentListPageProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onNewIncident: () => void;
  isLoading: boolean;
}

export const IncidentListPage: React.FC<IncidentListPageProps> = ({
  incidents,
  onSelectIncident,
  onNewIncident,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  // Compute stats
  const totalCount = incidents.length;
  const openCount = incidents.filter((i) => i.status === 'OPEN' || i.status === 'INVESTIGATING').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'MITIGATED').length;
  const uniqueServices = Array.from(new Set(incidents.map((i) => i.service))).sort();

  // Filter incidents
  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.incident_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService = selectedService === 'ALL' || inc.service === selectedService;
    const matchesStatus = selectedStatus === 'ALL' || inc.status === selectedStatus;
    const matchesSeverity = selectedSeverity === 'ALL' || inc.severity === selectedSeverity;

    return matchesSearch && matchesService && matchesStatus && matchesSeverity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Quick KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">{totalCount}</div>
            <div className="text-xs text-slate-400">Total Incidents</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-600/10 text-rose-400 border border-rose-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-rose-300">{openCount}</div>
            <div className="text-xs text-slate-400">Active / Open</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-300">{resolvedCount}</div>
            <div className="text-xs text-slate-400">Resolved & Learned</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-600/10 text-purple-400 border border-purple-500/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-purple-300">{resolvedCount}</div>
            <div className="text-xs text-slate-400">Hindsight Memories</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search incidents, services, root causes..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-medium"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Service Filter */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 font-mono text-xs"
          >
            <option value="ALL">All Services</option>
            {uniqueServices.map((svc) => (
              <option key={svc} value={svc}>
                {svc}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 font-mono text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="MITIGATED">MITIGATED</option>
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 font-mono text-xs"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">P1 - CRITICAL</option>
            <option value="HIGH">P2 - HIGH</option>
            <option value="MEDIUM">P3 - MEDIUM</option>
            <option value="LOW">P4 - LOW</option>
          </select>
        </div>
      </div>

      {/* Incidents Table / List */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Incidents & Institutional Postmortems
            </h2>
            <span className="text-xs text-slate-400">({filtered.length} found)</span>
          </div>
          <button
            onClick={onNewIncident}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            + Trigger Incident
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <span>Loading incidents from SQLite...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No incidents matching your filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filtered.map((inc) => {
              const isResolved = inc.status === 'RESOLVED' || inc.status === 'MITIGATED';

              return (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  {/* Left Column: Number, Title, Symptoms, Badges */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-indigo-400 group-hover:text-indigo-300">
                        {inc.incident_number}
                      </span>
                      <SeverityBadge severity={inc.severity} />
                      <StatusBadge status={inc.status} />
                      <ServiceTag service={inc.service} />
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(inc.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white truncate">
                      {inc.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-1">{inc.description}</p>

                    {/* Symptoms preview */}
                    {inc.symptoms && inc.symptoms.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {inc.symptoms.slice(0, 2).map((sym, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                          >
                            {sym}
                          </span>
                        ))}
                        {inc.symptoms.length > 2 && (
                          <span className="text-[10px] font-mono text-slate-500">
                            +{inc.symptoms.length - 2} more symptoms
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Resolution / Action Link */}
                  <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
                    {inc.resolution && (
                      <div className="hidden sm:block text-right text-xs max-w-xs">
                        <div className="flex items-center justify-end gap-1.5 mb-0.5">
                          <ResultBadge result={inc.resolution.result} />
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                          {inc.resolution.root_cause}
                        </p>
                      </div>
                    )}

                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/50 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
