import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { SEED_DATA } from './seed-data.js';

class SQLiteWrapper {
  private db: SqlJsDatabase | null = null;
  private SQL: any = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initialized && this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      this.SQL = await initSqlJs();
      // Initialize pure in-memory SQLite database (zero filesystem I/O, 100% Vercel safe)
      this.db = new this.SQL.Database();
      this.createTables();
      this.populateDefaultSeed();
      this.initialized = true;
    })();

    return this.initPromise;
  }

  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        incident_number TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        service TEXT NOT NULL,
        severity TEXT NOT NULL,
        environment TEXT NOT NULL DEFAULT 'production',
        description TEXT NOT NULL,
        symptoms TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'OPEN',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS resolutions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id TEXT NOT NULL,
        root_cause TEXT NOT NULL,
        resolution TEXT NOT NULL,
        result TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
      CREATE INDEX IF NOT EXISTS idx_incidents_service ON incidents(service);
    `);
  }

  private populateDefaultSeed(): void {
    if (!this.db) return;

    // Check if incidents already exist in memory
    const countCheck = this.prepare('SELECT COUNT(*) as count FROM incidents').get();
    if (countCheck && countCheck.count > 0) {
      return;
    }

    console.log(`[DB] Pre-populating in-memory SQLite with ${SEED_DATA.length} synthetic incidents...`);

    const insertIncident = this.prepare(`
      INSERT INTO incidents (id, incident_number, title, service, severity, environment, description, symptoms, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertResolution = this.prepare(`
      INSERT INTO resolutions (incident_id, root_cause, resolution, result, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

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

      if (item.resolution) {
        insertResolution.run([
          item.id,
          item.resolution.root_cause,
          item.resolution.resolution,
          item.resolution.result,
          item.resolution.created_at,
        ]);
      }
    }

    console.log('[DB] In-memory SQLite pre-population completed.');
  }

  exec(sql: string): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.exec(sql);
  }

  prepare(sql: string) {
    if (!this.db) throw new Error('Database not initialized');
    const self = this;
    return {
      all: (params: any[] | Record<string, any> = []): any[] => {
        if (!self.db) throw new Error('Database not initialized');
        const stmt = self.db.prepare(sql);
        if (Array.isArray(params)) {
          stmt.bind(params);
        } else if (params && typeof params === 'object') {
          stmt.bind(params);
        }
        const results: any[] = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      get: (params: any[] | Record<string, any> = []): any | undefined => {
        if (!self.db) throw new Error('Database not initialized');
        const stmt = self.db.prepare(sql);
        if (Array.isArray(params)) {
          stmt.bind(params);
        } else if (params && typeof params === 'object') {
          stmt.bind(params);
        }
        let result: any = undefined;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result;
      },
      run: (params: any[] | Record<string, any> = []): { changes: number } => {
        if (!self.db) throw new Error('Database not initialized');
        const stmt = self.db.prepare(sql);
        if (Array.isArray(params)) {
          stmt.bind(params);
        } else if (params && typeof params === 'object') {
          stmt.bind(params);
        }
        stmt.step();
        stmt.free();
        return { changes: 1 };
      },
    };
  }
}

export const db = new SQLiteWrapper();

export async function initializeDatabase(): Promise<void> {
  await db.init();
}
