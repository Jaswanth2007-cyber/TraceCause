import { Incident, InvestigationResponse, RecalledMemoryItem, ResolutionResult, SystemHealth } from '../types';

const getApiBase = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  // In production builds, default directly to the primary deployed backend URL
  if (import.meta.env.PROD) {
    return 'https://trace-cause-server.vercel.app/api';
  }

  // In local development, use relative path which is proxied by Vite dev server
  return '/api';
};

const API_BASE = getApiBase();

export const api = {
  /**
   * GET /api/health
   */
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch health');
    return res.json();
  },

  /**
   * GET /api/incidents
   */
  async getIncidents(params?: { service?: string; status?: string; severity?: string }): Promise<Incident[]> {
    const query = new URLSearchParams();
    if (params?.service) query.set('service', params.service);
    if (params?.status) query.set('status', params.status);
    if (params?.severity) query.set('severity', params.severity);

    const url = `${API_BASE}/incidents${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  /**
   * GET /api/incidents/:id
   */
  async getIncidentById(id: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    if (!res.ok) throw new Error(`Incident '${id}' not found`);
    return res.json();
  },

  /**
   * POST /api/incidents
   */
  async createIncident(payload: {
    title: string;
    service: string;
    severity: string;
    environment?: string;
    description: string;
    symptoms: string[];
    incident_number?: string;
  }): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create incident');
    }
    return res.json();
  },

  /**
   * POST /api/incidents/:id/investigate
   */
  async investigateIncident(id: string): Promise<InvestigationResponse> {
    const res = await fetch(`${API_BASE}/incidents/${id}/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to investigate incident');
    }
    return res.json();
  },

  /**
   * POST /api/incidents/:id/resolve-learn
   */
  async resolveAndLearn(
    id: string,
    payload: {
      root_cause: string;
      resolution: string;
      result: ResolutionResult;
    }
  ): Promise<{
    success: boolean;
    incident: Incident;
    resolution: any;
    memoryRetained: any;
  }> {
    const res = await fetch(`${API_BASE}/incidents/${id}/resolve-learn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to resolve and learn');
    }
    return res.json();
  },

  /**
   * GET /api/incidents/:id/memories
   */
  async getIncidentMemories(id: string): Promise<{ incident: Incident; memories: RecalledMemoryItem[] }> {
    const res = await fetch(`${API_BASE}/incidents/${id}/memories`);
    if (!res.ok) throw new Error('Failed to retrieve memories');
    return res.json();
  },

  /**
   * POST /api/seed
   */
  async runSeed(): Promise<{ message: string; inserted: number; retainedMemories: number }> {
    const res = await fetch(`${API_BASE}/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to run database seed');
    return res.json();
  },
};
