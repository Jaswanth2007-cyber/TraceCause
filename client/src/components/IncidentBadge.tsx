import React from 'react';
import { SeverityLevel, IncidentStatus, ResolutionResult } from '../types';

export const SeverityBadge: React.FC<{ severity: SeverityLevel; className?: string }> = ({ severity, className = '' }) => {
  const styles: Record<SeverityLevel, { label: string; bg: string; text: string; border: string; dot: string }> = {
    CRITICAL: {
      label: 'P1 CRITICAL',
      bg: 'bg-rose-950/60',
      text: 'text-rose-300',
      border: 'border-rose-700/60',
      dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
    },
    HIGH: {
      label: 'P2 HIGH',
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      border: 'border-amber-700/60',
      dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    },
    MEDIUM: {
      label: 'P3 MEDIUM',
      bg: 'bg-yellow-950/40',
      text: 'text-yellow-300',
      border: 'border-yellow-700/40',
      dot: 'bg-yellow-400',
    },
    LOW: {
      label: 'P4 LOW',
      bg: 'bg-blue-950/40',
      text: 'text-blue-300',
      border: 'border-blue-700/40',
      dot: 'bg-blue-400',
    },
  };

  const s = styles[severity] || styles.HIGH;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border ${s.bg} ${s.text} ${s.border} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus; className?: string }> = ({ status, className = '' }) => {
  const styles: Record<IncidentStatus, { label: string; bg: string; text: string; border: string }> = {
    OPEN: {
      label: 'OPEN',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
    },
    INVESTIGATING: {
      label: 'INVESTIGATING',
      bg: 'bg-indigo-500/15',
      text: 'text-indigo-300',
      border: 'border-indigo-500/40',
    },
    RESOLVED: {
      label: 'RESOLVED',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
    },
    MITIGATED: {
      label: 'MITIGATED',
      bg: 'bg-teal-500/10',
      text: 'text-teal-400',
      border: 'border-teal-500/30',
    },
  };

  const s = styles[status] || styles.OPEN;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${s.bg} ${s.text} ${s.border} ${className}`}>
      {status === 'INVESTIGATING' && (
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1.5 animate-ping" />
      )}
      {s.label}
    </span>
  );
};

export const ResultBadge: React.FC<{ result: ResolutionResult; className?: string }> = ({ result, className = '' }) => {
  const styles: Record<ResolutionResult, { bg: string; text: string; border: string }> = {
    SUCCESS: {
      bg: 'bg-emerald-950/50',
      text: 'text-emerald-300',
      border: 'border-emerald-700/50',
    },
    FAILED: {
      bg: 'bg-rose-950/60',
      text: 'text-rose-300',
      border: 'border-rose-700/60',
    },
    MITIGATED: {
      bg: 'bg-teal-950/50',
      text: 'text-teal-300',
      border: 'border-teal-700/50',
    },
    PARTIAL: {
      bg: 'bg-yellow-950/50',
      text: 'text-yellow-300',
      border: 'border-yellow-700/50',
    },
  };

  const s = styles[result] || styles.SUCCESS;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${s.bg} ${s.text} ${s.border} ${className}`}>
      {result}
    </span>
  );
};

export const ServiceTag: React.FC<{ service: string; className?: string }> = ({ service, className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60 ${className}`}>
      <span className="text-slate-500 font-bold">svc:</span>
      {service}
    </span>
  );
};
