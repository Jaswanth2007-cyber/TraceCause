export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'MITIGATED';
export type ResolutionResult = 'SUCCESS' | 'FAILED' | 'MITIGATED' | 'PARTIAL';

export interface Resolution {
  id?: number;
  incident_id?: string;
  root_cause: string;
  resolution: string;
  result: ResolutionResult;
  created_at: string;
}

export interface Incident {
  id: string;
  incident_number: string;
  title: string;
  service: string;
  severity: SeverityLevel;
  environment: string;
  description: string;
  symptoms: string[];
  status: IncidentStatus;
  created_at: string;
  resolution?: Resolution | null;
  resolutions?: Resolution[];
}

export interface RecalledMemoryItem {
  id: string;
  content: string;
  relevance?: number;
  relevanceLabel?: 'High Match' | 'Relevant' | 'Related Pattern' | 'Weak Match' | string;
  metadata?: Record<string, any>;
  tags?: string[];
  entities?: string[];
  source?: string;
  whyRecalled?: string;
  incidentNumber?: string;
  isNewlyLearned?: boolean;
}

export interface RecalledIncidentReference {
  incidentNumber: string;
  service: string;
  relevanceScore: number;
  relevanceTier?: string;
  similaritySummary: string;
  failedAttemptsWarning?: string;
  provenResolution?: string;
  whyLinked: string;
  isNewlyLearned?: boolean;
}

export interface CurrentFacts {
  incidentNumber: string;
  service: string;
  severity: string;
  environment: string;
  observedSymptoms: string[];
  telemetryFindings: string;
  affectedEndpoints: string[];
  impactAssessment: string;
}

export interface HistoricalMemoryFindings {
  recalledIncidents: RecalledIncidentReference[];
  institutionalPatternsIdentified: string[];
  pastAntiPatternsToAvoid: string[];
}

export interface AIInferenceFindings {
  mostProbableRootCause: string;
  confidenceScore: number;
  immediateActionPlan: string[];
  longTermRemediation: string[];
  institutionalRiskSummary: string;
}

export interface StructuredInvestigationResult {
  currentFacts: CurrentFacts;
  historicalMemory: HistoricalMemoryFindings;
  aiInference: AIInferenceFindings;
}

export interface InvestigationResponse {
  incidentId: string;
  incidentNumber: string;
  investigatedAt: string;
  hindsightMode: string;
  hindsightBankId: string;
  groqConfigured: boolean;
  recalledMemoriesCount: number;
  recalledMemories: RecalledMemoryItem[];
  findings: StructuredInvestigationResult;
}

export interface SystemHealth {
  status: string;
  app: string;
  timestamp: string;
  hindsight: {
    cloudConnected: boolean;
    bankId: string;
    baseUrl?: string;
  };
  groq: {
    configured: boolean;
  };
}
