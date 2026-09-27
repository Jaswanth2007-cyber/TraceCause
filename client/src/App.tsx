import React, { useState, useEffect } from 'react';
import { api } from './api/incidents.api';
import { Incident, SystemHealth, InvestigationResponse, ResolutionResult } from './types';
import { Navbar } from './components/Navbar';
import { DemoGuideBar } from './components/DemoGuideBar';
import { IncidentListPage } from './pages/IncidentListPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { NewIncidentModal } from './components/NewIncidentModal';

export function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // 7-Stage Demo Script State (Strictly synchronized with real application state)
  const [demoStage, setDemoStage] = useState<number>(1);
  const [isExecutingDemoStage, setIsExecutingDemoStage] = useState(false);
  const [stage7Incident, setStage7Incident] = useState<Incident | null>(null);
  const [stage7Completed, setStage7Completed] = useState<boolean>(false);
  const [activeInvestigationData, setActiveInvestigationData] = useState<Record<string, InvestigationResponse>>({});

  // Fetch initial incidents and health
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [incList, sysHealth] = await Promise.all([
        api.getIncidents(),
        api.getHealth().catch(() => null),
      ]);
      setIncidents(incList);
      if (sysHealth) setHealth(sysHealth);

      // Check if Stage 7 incident already exists in database
      const existingStage7 = incList.find(
        (i) => i.service === 'order-service' || i.incident_number === 'INC-2024-092'
      );
      if (existingStage7) {
        setStage7Incident(existingStage7);
      }

      // If we have incidents loaded and currently on Stage 1, sync stage to Stage 2
      if (incList.length > 0 && demoStage === 1) {
        setDemoStage(2);
      }

      // If viewing an incident, refresh its details
      if (selectedIncident) {
        const updated = incList.find((i) => i.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await api.runSeed();
      await fetchData();
      setDemoStage(2); // Stage 1 completed -> Stage 2 ready
    } catch (err) {
      console.error('Seed failed:', err);
      alert('Failed to seed database.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateIncident = async (payload: any) => {
    const created = await api.createIncident(payload);
    await fetchData();
    setSelectedIncident(created);

    if (demoStage === 7 || payload.service === 'order-service' || payload.incident_number === 'INC-2024-092') {
      setStage7Incident(created);
      setDemoStage(7);
    } else {
      setDemoStage(3); // Incident created -> ready for Stage 3 Investigation
    }
    return created;
  };

  const handleInvestigate = async (id: string): Promise<InvestigationResponse> => {
    const res = await api.investigateIncident(id);
    setActiveInvestigationData((prev) => ({ ...prev, [id]: res }));
    await fetchData();

    if (demoStage === 7 || selectedIncident?.service === 'order-service' || res.incidentNumber === 'INC-2024-092') {
      setStage7Completed(true);
      setDemoStage(7);
    } else {
      setDemoStage(4); // Investigation succeeded & evidence separated -> Stage 4 active
    }
    return res;
  };

  const handleResolveAndLearn = async (
    id: string,
    payload: { root_cause: string; resolution: string; result: ResolutionResult }
  ) => {
    const res = await api.resolveAndLearn(id, payload);
    await fetchData();
    setDemoStage(6); // Hindsight retain succeeded -> Stage 6 confirmed
    return res;
  };

  const handleSelectIncident = (inc: Incident) => {
    setSelectedIncident(inc);
    if (inc.service === 'order-service' || inc.incident_number === 'INC-2024-092') {
      setDemoStage(7);
    } else if (inc.status === 'RESOLVED' || inc.status === 'MITIGATED') {
      setDemoStage(6);
    } else if (inc.status === 'INVESTIGATING') {
      setDemoStage(4);
    } else {
      setDemoStage(3);
    }
  };

  // 7-Stage Demo Script Controller
  const handleExecuteDemoStage = async (stageId: number) => {
    setIsExecutingDemoStage(true);
    try {
      switch (stageId) {
        case 1: {
          // Stage 1: Seed memory bank
          await handleSeed();
          break;
        }
        case 2: {
          // Stage 2: Create new incident #1 (payment-api 504 checkout)
          await handleCreateIncident({
            incident_number: 'INC-2024-091',
            title: 'payment-api HTTP 504 Gateway Timeouts under checkout surge',
            service: 'payment-api',
            severity: 'CRITICAL',
            environment: 'production',
            description:
              'During a flash campaign, payment-api latency spiked to >15,000ms and returned 504s on /v1/charges endpoint. Telemetry showed connection pool acquisition timeouts and database connection queue depth backing up.',
            symptoms: [
              'Connection pool acquisition timeout: pool exhausted (50/50 active)',
              'HTTP 504 Gateway Timeout on POST /v1/charges',
              'Database connection queue depth > 450 requests',
              'p99 latency spiked from 120ms to 18,200ms',
            ],
          });
          break;
        }
        case 3: {
          // Stage 3: Trigger AI Investigation
          if (selectedIncident) {
            await handleInvestigate(selectedIncident.id);
          } else {
            const firstOpen = incidents.find((i) => i.status === 'OPEN' || i.status === 'INVESTIGATING');
            if (firstOpen) {
              setSelectedIncident(firstOpen);
              await handleInvestigate(firstOpen.id);
            }
          }
          break;
        }
        case 4: {
          // Stage 4: Review Evidence Separation -> Proceed to resolve
          setDemoStage(5);
          break;
        }
        case 5: {
          // Stage 5 & 6: Resolve Incident & Retain in Hindsight
          if (selectedIncident) {
            await handleResolveAndLearn(selectedIncident.id, {
              root_cause:
                'PostgreSQL connection pool exhausted due to unclosed transaction references in checkout error handler during high-concurrency request bursts, compounded by missing idle connection reap timeout.',
              resolution:
                '1) Configured aggressive connection reaping with idleTimeoutMillis=10000, connectionTimeoutMillis=2000. 2) Wrapped checkout transaction logic in try-finally with explicit client.release(). 3) Zero connection pool starvation observed since.',
              result: 'SUCCESS',
            });
          }
          break;
        }
        case 6: {
          // Stage 6: Move to Stage 7 (Recall Again)
          setDemoStage(7);
          break;
        }
        case 7: {
          // Stage 7: Spawn 2nd related incident (order-service) demonstrating accumulated memory
          let targetInc = stage7Incident;

          if (!targetInc) {
            console.log('[TRACECAUSE][STAGE7] Creating Incident #2');
            const inc2 = await handleCreateIncident({
              incident_number: 'INC-2024-092',
              title: 'order-service database connection starvation during inventory commit',
              service: 'order-service',
              severity: 'CRITICAL',
              environment: 'production',
              description:
                'Order service backend experiencing severe database connection exhaustion and 504 Gateway Timeouts on /v1/orders/commit during high traffic checkout surge. Database queue depth climbing rapidly.',
              symptoms: [
                'Connection pool acquisition timeout: pool exhausted (60/60 active)',
                'Database pool utilization at 100% with connection wait queue depth > 380',
                'HTTP 504 Gateway Timeout on POST /v1/orders/commit',
                'Elevated order processing latency p99 spiked to 16,500ms',
              ],
            });
            targetInc = inc2;
            setStage7Incident(inc2);
            setSelectedIncident(inc2);
            console.log(`[TRACECAUSE][STAGE7] Incident created: ${inc2.id}`);
          } else {
            setSelectedIncident(targetInc);
          }

          // Run investigation to demonstrate Hindsight recall of newly learned lesson
          console.log('[TRACECAUSE][STAGE7] Calling Hindsight recall');
          const invResult = await handleInvestigate(targetInc.id);
          console.log(`[TRACECAUSE][STAGE7] Memories returned: ${invResult.recalledMemoriesCount}`);

          const newlyLearnedMem = invResult.recalledMemories.find(
            (m) => m.isNewlyLearned || m.incidentNumber === 'INC-2024-091' || m.content.includes('INC-2024-091')
          );
          if (newlyLearnedMem) {
            console.log(`[TRACECAUSE][STAGE7] Newly learned memory found: ${newlyLearnedMem.incidentNumber || newlyLearnedMem.id}`);
          }
          console.log('[TRACECAUSE][STAGE7] Stage 7 completed');

          setStage7Completed(true);
          setDemoStage(7);
          break;
        }
      }
    } catch (err) {
      console.error('Demo stage error:', err);
    } finally {
      setIsExecutingDemoStage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        health={health}
        onSeed={handleSeed}
        onNewIncident={() => setIsNewModalOpen(true)}
        isSeeding={isSeeding}
        activeView={selectedIncident ? 'detail' : 'list'}
        onNavigateHome={() => setSelectedIncident(null)}
      />

      {/* 7-Stage Demo Script Stepper Banner */}
      <DemoGuideBar
        currentStage={demoStage}
        onSelectStage={(stage) => setDemoStage(stage)}
        onExecuteStageAction={handleExecuteDemoStage}
        isExecuting={isExecutingDemoStage}
        stage7IncidentCreated={Boolean(stage7Incident)}
        isStage7Completed={stage7Completed}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {selectedIncident ? (
          <IncidentDetailPage
            incident={selectedIncident}
            onBack={() => setSelectedIncident(null)}
            onInvestigate={handleInvestigate}
            onResolveAndLearn={handleResolveAndLearn}
            onRefresh={fetchData}
            externalInvestigationData={activeInvestigationData[selectedIncident.id] || null}
          />
        ) : (
          <IncidentListPage
            incidents={incidents}
            onSelectIncident={handleSelectIncident}
            onNewIncident={() => setIsNewModalOpen(true)}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* New Incident Modal */}
      <NewIncidentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreateIncident={handleCreateIncident}
      />
    </div>
  );
}

export default App;
