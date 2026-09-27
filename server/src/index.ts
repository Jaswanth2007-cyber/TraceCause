import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { initializeDatabase } from './db/index.js';
import { incidentsRouter } from './routes/incidents.routes.js';
import { hindsightService } from './services/hindsight.service.js';
import { groqService } from './services/groq.service.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Ensure in-memory database is initialized before processing any request (Vercel serverless safe)
app.use(async (_req, _res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (err) {
    console.error('[DB Initialization Error]:', err);
    next(err);
  }
});

// Root info endpoint
app.get('/', (_req, res) => {
  res.json({
    app: 'TraceCause API',
    status: 'online',
    description: 'Autonomous AI Incident-Response Agent powered by Hindsight Cloud & Groq',
    hindsight: {
      cloudConnected: hindsightService.isCloudConnected(),
      bankId: hindsightService.getBankId(),
    },
    groq: {
      configured: groqService.isConfigured(),
      model: config.groq.model,
    },
    endpoints: {
      health: '/api/health',
      incidents: '/api/incidents',
      investigate: '/api/incidents/:id/investigate',
      resolveAndLearn: '/api/incidents/:id/resolve-learn',
      memories: '/api/incidents/:id/memories',
      seed: '/api/seed',
    },
  });
});

// System Status & Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'TraceCause Backend',
    timestamp: new Date().toISOString(),
    hindsight: {
      cloudConnected: hindsightService.isCloudConnected(),
      bankId: hindsightService.getBankId(),
      baseUrl: hindsightService.getBaseUrl(),
    },
    groq: {
      configured: groqService.isConfigured(),
      model: config.groq.model,
    },
  });
});

// API Routes
app.use('/api', incidentsRouter);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
  });
});

export async function bootstrap() {
  try {
    await initializeDatabase();
    console.log('[DB] In-memory SQLite database initialized successfully.');

    app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🚀 TraceCause API Server running on port ${config.port}`);
      console.log(`   Healthcheck: http://localhost:${config.port}/api/health`);
      console.log(`   Hindsight Base URL: ${config.hindsight.baseUrl}`);
      console.log(`   Hindsight Bank: ${config.hindsight.bankId}`);
      console.log(`   Hindsight Cloud: ${hindsightService.isCloudConnected() ? 'CONNECTED' : 'OFFLINE / FALLBACK'}`);
      console.log(`   Groq Model: ${config.groq.model} (${groqService.isConfigured() ? 'READY' : 'OFFLINE / FALLBACK'})`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start TraceCause server:', err);
    process.exit(1);
  }
}

// Only start the standalone HTTP listener when not running in a Vercel serverless function environment
if (!process.env.VERCEL) {
  bootstrap();
}

export default app;
