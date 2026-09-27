import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'incidentmind.sqlite');

class SQLiteWrapper {
  private db: SqlJsDatabase | null = null;
  private SQL: any = null;
  private initialized: boolean = false;

  async init() {
    if (this.initialized && this.db) return;

    this.SQL = await initSqlJs();
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      this.db = new this.SQL.Database(buffer);
    } else {
      this.db = new this.SQL.Database();
      this.save();
    }
    this.initialized = true;
    this.createTables();
  }

  save() {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }

  private createTables() {
    this.exec(`
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

  exec(sql: string) {
    if (!this.db) throw new Error('Database not initialized');
    this.db.exec(sql);
    this.save();
  }

  prepare(sql: string) {
    if (!this.db) throw new Error('Database not initialized');
    const self = this;
    return {
      all: (params: any[] | Record<string, any> = []): any[] => {
        const stmt = self.db!.prepare(sql);
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
        const stmt = self.db!.prepare(sql);
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
        const stmt = self.db!.prepare(sql);
        if (Array.isArray(params)) {
          stmt.bind(params);
        } else if (params && typeof params === 'object') {
          stmt.bind(params);
        }
        stmt.step();
        stmt.free();
        self.save();
        return { changes: 1 };
      },
    };
  }
}

export const db = new SQLiteWrapper();

export async function initializeDatabase() {
  await db.init();
}
