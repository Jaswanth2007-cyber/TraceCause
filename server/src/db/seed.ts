import { db, initializeDatabase } from './index.js';
import { hindsightService } from '../services/hindsight.service.js';
import { SEED_DATA, type SeedIncident } from './seed-data.js';

export { SEED_DATA, type SeedIncident };

export async function runSeed(): Promise<{ inserted: number; retainedMemories: number }> {
  await initializeDatabase();

  console.log('[Seed] Resetting in-memory incidents and resolutions...');
  db.exec('DELETE FROM resolutions');
  db.exec('DELETE FROM incidents');

  console.log(`[Seed] Inserting ${SEED_DATA.length} synthetic historical incidents into in-memory SQLite...`);

  const insertIncident = db.prepare(`
    INSERT INTO incidents (id, incident_number, title, service, severity, environment, description, symptoms, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertResolution = db.prepare(`
    INSERT INTO resolutions (incident_id, root_cause, resolution, result, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  let insertedCount = 0;
  let retainedCount = 0;

  for (const item of SEED_DATA) {
    insertIncident.run([
      item.id,
      item.incident_number,
      item.title,
      item.service,
      item.severity,
      item.environment,
      item.description,
      JSON.stringify(item.symptoms),
      item.status,
      item.created_at,
    ]);
    insertedCount++;

    if (item.resolution) {
      insertResolution.run([
        item.id,
        item.resolution.root_cause,
        item.resolution.resolution,
        item.resolution.result,
        item.resolution.created_at,
      ]);

      // Retain memory into Hindsight Memory Bank
      const memoryContent = `[${item.incident_number}] Service: ${item.service} | Severity: ${item.severity}
Title: ${item.title}
Symptoms: ${item.symptoms.join('; ')}
Root Cause: ${item.resolution.root_cause}
Resolution & Postmortem Lessons: ${item.resolution.resolution}
Result: ${item.resolution.result}`;

      try {
        await hindsightService.retain(
          memoryContent,
          {
            incident_number: item.incident_number,
            service: item.service,
            severity: item.severity,
            result: item.resolution.result,
            status: item.status,
          },
          [item.service, item.resolution.result.toLowerCase(), 'historical-postmortem']
        );
        retainedCount++;
      } catch (err: any) {
        console.warn(`[Seed] Notice: Could not retain ${item.incident_number} in Hindsight Cloud:`, err.message);
      }
    }
  }

  console.log(`[Seed] Completed! Inserted ${insertedCount} incidents, retained ${retainedCount} memories into institutional bank.`);
  return { inserted: insertedCount, retainedMemories: retainedCount };
}

// Allow running directly from CLI via tsx src/db/seed.ts
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
