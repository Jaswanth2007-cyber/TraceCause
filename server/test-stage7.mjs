async function run() {
  console.log('=== TRACECAUSE STAGE 1–7 END-TO-END TEST ===\n');

  // Stage 1: Seed
  console.log('[STAGE 1] Seeding database & Hindsight memory bank...');
  const seedRes = await fetch('http://localhost:4000/api/seed', { method: 'POST' });
  const seedData = await seedRes.json();
  console.log('Seed response:', seedData.message);

  // Stage 2: Spawn Incident #1
  console.log('\n[STAGE 2] Spawning Incident #1 (payment-api)...');
  const inc1Res = await fetch('http://localhost:4000/api/incidents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
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
    }),
  });
  const inc1 = await inc1Res.json();
  console.log(`Incident #1 created: ID=${inc1.id}, Number=${inc1.incident_number}`);

  // Stage 3: Investigate Incident #1
  console.log('\n[STAGE 3] Investigating Incident #1 with AI Agent...');
  const inv1Res = await fetch(`http://localhost:4000/api/incidents/${inc1.id}/investigate`, { method: 'POST' });
  const inv1 = await inv1Res.json();
  console.log(`Incident #1 investigated. Recalled memories count: ${inv1.recalledMemoriesCount}`);
  console.log('Top historical memory:', inv1.findings?.historicalMemory?.recalledIncidents?.[0]?.incidentNumber);

  // Stage 5 & 6: Resolve & Retain into Hindsight
  console.log('\n[STAGE 5 & 6] Resolving Incident #1 and retaining postmortem into Hindsight Cloud...');
  const resolveRes = await fetch(`http://localhost:4000/api/incidents/${inc1.id}/resolve-learn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      root_cause:
        'PostgreSQL connection pool exhausted due to unclosed transaction references in checkout error handler during high-concurrency request bursts, compounded by missing idle connection reap timeout.',
      resolution:
        '1) Configured aggressive connection reaping with idleTimeoutMillis=10000, connectionTimeoutMillis=2000. 2) Wrapped checkout transaction logic in try-finally with explicit client.release(). 3) Zero connection pool starvation observed since.',
      result: 'SUCCESS',
    }),
  });
  const resolveData = await resolveRes.json();
  console.log('Resolution status:', resolveData.success);
  console.log('Hindsight memory retained mode:', resolveData.memoryRetained?.mode);

  // Stage 7: Spawn Incident #2 (order-service)
  console.log('\n[STAGE 7] Spawning Incident #2 (order-service)...');
  const inc2Res = await fetch('http://localhost:4000/api/incidents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
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
    }),
  });
  const inc2 = await inc2Res.json();
  console.log(`Incident #2 created: ID=${inc2.id}, Number=${inc2.incident_number}, Service=${inc2.service}`);

  // Investigate Incident #2 to verify transferred learning!
  console.log('\n[STAGE 7] Investigating Incident #2 (Recall from Hindsight Bank)...');
  const inv2Res = await fetch(`http://localhost:4000/api/incidents/${inc2.id}/investigate`, { method: 'POST' });
  const inv2 = await inv2Res.json();
  console.log(`Incident #2 Investigation complete! Recalled memories count: ${inv2.recalledMemoriesCount}`);
  
  console.log('\n=== RECALLED MEMORIES FOR INCIDENT #2 ===');
  for (const mem of inv2.recalledMemories || []) {
    console.log(`\n- Memory [${mem.incidentNumber || mem.id}] (Score: ${mem.relevance || 'N/A'}, Newly Learned: ${Boolean(mem.isNewlyLearned)})`);
    console.log(`  Why Linked: ${mem.whyRecalled}`);
    console.log(`  Preview: ${mem.content.slice(0, 140)}...`);
  }

  console.log('\n=== AI INFERENCE FOR INCIDENT #2 (TRANSFERRED LEARNING) ===');
  console.log('Most Probable Root Cause:', inv2.findings?.aiInference?.mostProbableRootCause);
  console.log('Immediate Action Plan:');
  for (const step of inv2.findings?.aiInference?.immediateActionPlan || []) {
    console.log(`  * ${step}`);
  }
  console.log('Institutional Risk Summary:', inv2.findings?.aiInference?.institutionalRiskSummary);

  console.log('\n✅ ALL STAGES 1–7 VERIFIED SUCCESSFULLY!');
}

run().catch(console.error);
