import { hindsightService, RecalledMemoryItem } from './hindsight.service.js';
import { groqService, StructuredInvestigationResult } from './groq.service.js';
import { db } from '../db/index.js';
import { findIncidentOrHydrate } from '../routes/incidents.routes.js';

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

export class AgentService {
  async investigateIncident(incidentId: string): Promise<InvestigationResponse> {
    // 1. Fetch incident with automatic stateless serverless hydration
    const incidentRow: any = findIncidentOrHydrate(incidentId);

    if (!incidentRow) {
      throw new Error(`Incident with ID or Number '${incidentId}' not found.`);
    }

    let symptomsList: string[] = [];
    try {
      symptomsList = JSON.parse(incidentRow.symptoms);
    } catch {
      symptomsList = [incidentRow.symptoms];
    }

    const incidentData = {
      id: incidentRow.id,
      incident_number: incidentRow.incident_number,
      title: incidentRow.title,
      service: incidentRow.service,
      severity: incidentRow.severity,
      environment: incidentRow.environment,
      description: incidentRow.description,
      symptoms: symptomsList,
    };

    // Update status to INVESTIGATING if currently OPEN
    if (incidentRow.status === 'OPEN') {
      db.prepare('UPDATE incidents SET status = ? WHERE id = ?').run(['INVESTIGATING', incidentRow.id]);
    }

    // 2. Call Hindsight Recall
    if (incidentData.service === 'order-service' || incidentData.incident_number === 'INC-2024-092') {
      console.log('[TRACECAUSE][STAGE7] Calling Hindsight recall');
    }

    const recallQuery = `${incidentData.service} ${incidentData.title} ${symptomsList.join(' ')} ${incidentData.description}`;
    const recalledMemories = await hindsightService.recall(recallQuery, {
      limit: 5,
      service: incidentData.service,
    });

    if (incidentData.service === 'order-service' || incidentData.incident_number === 'INC-2024-092') {
      console.log(`[TRACECAUSE][STAGE7] Memories returned: ${recalledMemories.length}`);
      const newlyLearned = recalledMemories.find(
        (m) => m.isNewlyLearned || m.incidentNumber === 'INC-2024-091' || m.content.includes('INC-2024-091')
      );
      if (newlyLearned) {
        console.log(`[TRACECAUSE][STAGE7] Newly learned memory found: ${newlyLearned.incidentNumber || newlyLearned.id}`);
      }
      console.log('[TRACECAUSE][STAGE7] Stage 7 completed');
    }

    // 3. Pass to Groq LLM with strictly separated evidence schema
    const findings = await groqService.runInvestigation(incidentData, recalledMemories);

    return {
      incidentId: incidentRow.id,
      incidentNumber: incidentRow.incident_number,
      investigatedAt: new Date().toISOString(),
      hindsightMode: hindsightService.isCloudConnected() ? 'Hindsight Cloud API' : 'Institutional Memory Engine',
      hindsightBankId: hindsightService.getBankId(),
      groqConfigured: groqService.isConfigured(),
      recalledMemoriesCount: recalledMemories.length,
      recalledMemories,
      findings,
    };
  }

  async resolveAndLearn(
    incidentId: string,
    payload: {
      root_cause: string;
      resolution: string;
      result: 'SUCCESS' | 'FAILED' | 'MITIGATED' | 'PARTIAL';
    }
  ): Promise<{ success: boolean; incident: any; resolution: any; memoryRetained: any }> {
    const incidentRow: any = findIncidentOrHydrate(incidentId);

    if (!incidentRow) {
      throw new Error(`Incident '${incidentId}' not found.`);
    }

    const now = new Date().toISOString();

    // 1. Update SQLite incident status to RESOLVED
    db.prepare('UPDATE incidents SET status = ? WHERE id = ?').run(['RESOLVED', incidentRow.id]);

    // 2. Insert resolution record into SQLite
    db.prepare(
      `INSERT INTO resolutions (incident_id, root_cause, resolution, result, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run([incidentRow.id, payload.root_cause, payload.resolution, payload.result, now]);

    const updatedIncident = db.prepare('SELECT * FROM incidents WHERE id = ?').get([incidentRow.id]);
    const insertedResolution = db.prepare('SELECT * FROM resolutions WHERE incident_id = ? ORDER BY id DESC').get([incidentRow.id]);

    // 3. Retain postmortem lesson into Hindsight Memory Bank
    let symptomsArray: string[] = [];
    try {
      symptomsArray = JSON.parse(incidentRow.symptoms);
    } catch {
      symptomsArray = [incidentRow.symptoms];
    }

    const memoryContent = `[${incidentRow.incident_number}] Service: ${incidentRow.service} | Severity: ${incidentRow.severity} | Result: ${payload.result}
Title: ${incidentRow.title}
Symptoms: ${symptomsArray.join('; ')}
Root Cause: ${payload.root_cause}
Resolution / Fix: ${payload.resolution}
Postmortem Lesson: Verified resolution for ${incidentRow.service}. Result recorded as ${payload.result}.`;

    const memoryResult = await hindsightService.retain(
      memoryContent,
      {
        incident_id: incidentRow.id,
        incident_number: incidentRow.incident_number,
        service: incidentRow.service,
        severity: incidentRow.severity,
        result: payload.result,
        resolved_at: now,
      },
      [incidentRow.service, payload.result.toLowerCase(), 'postmortem-learning']
    );

    return {
      success: true,
      incident: updatedIncident,
      resolution: insertedResolution,
      memoryRetained: {
        ...memoryResult,
        content: memoryContent,
        bankId: hindsightService.getBankId(),
      },
    };
  }

  async getIncidentMemories(incidentId: string): Promise<{ incident: any; memories: RecalledMemoryItem[] }> {
    const incidentRow: any = findIncidentOrHydrate(incidentId);

    if (!incidentRow) {
      throw new Error(`Incident '${incidentId}' not found.`);
    }

    let symptomsList: string[] = [];
    try {
      symptomsList = JSON.parse(incidentRow.symptoms);
    } catch {
      symptomsList = [incidentRow.symptoms];
    }

    const query = `${incidentRow.service} ${incidentRow.title} ${symptomsList.join(' ')}`;
    const memories = await hindsightService.recall(query, {
      limit: 6,
      service: incidentRow.service,
    });

    return {
      incident: incidentRow,
      memories,
    };
  }
}

export const agentService = new AgentService();
