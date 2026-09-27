import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SEED_DATA } from './seed-data.js';

const nodeRequire = createRequire(import.meta.url);

/**
 * Resolve the WebAssembly binary path for sql.js in a serverless-safe,
 * package-relative manner without hardcoding local directories.
 */
function resolveSqlJsWasm(): { wasmPath: string; wasmBinary?: Buffer } {
  let wasmPath: string | null = null;

  // 1. Try package-relative resolution via require.resolve
  try {
    const resolved = nodeRequire.resolve('sql.js/dist/sql-wasm.wasm');
    if (fs.existsSync(resolved)) {
      wasmPath = resolved;
    }
  } catch (e) {
    // Continue to candidate searches
  }

  // 2. Candidate fallback paths for Vercel Serverless / local / monorepo environments
  if (!wasmPath) {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const candidates = [
      path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
      path.join(process.cwd(), '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
      path.join(currentDir, 'sql-wasm.wasm'),
      path.join(currentDir, '..', 'sql-wasm.wasm'),
      path.join(currentDir, '..', '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
      path.join('/var/task', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
      path.join('/var/task', 'server', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
    ];

    for (const candidate of candidates) {
      try {
        if (fs.existsSync(candidate)) {
          wasmPath = candidate;
          break;
        }
      } catch {}
    }
  }

  if (!wasmPath) {
    wasmPath = 'node_modules/sql.js/dist/sql-wasm.wasm';
  }

  let wasmBinary: Buffer | undefined;
  try {
    if (fs.existsSync(wasmPath)) {
      wasmBinary = fs.readFileSync(wasmPath);
    }
  } catch {}

  return { wasmPath, wasmBinary };
}

class SQLiteWrapper {
  private db: SqlJsDatabase | null = null;
  private SQL: any = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initialized && this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const { wasmPath, wasmBinary } = resolveSqlJsWasm();

      const config: any = {
        locateFile: (filename: string) => {
          if (filename.endsWith('.wasm')) {
            return wasmPath;
          }
          return filename;
        },
      };

      if (wasmBinary) {
        config.wasmBinary = wasmBinary;
      }

      this.SQL = await initSqlJs(config);
      // Initialize pure in-memory SQLite database (zero filesystem database files, 100% Vercel safe)
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
