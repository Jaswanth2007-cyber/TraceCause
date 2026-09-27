import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { initializeDatabase } from './db/index.js';
import { incidentsRouter } from './routes/incidents.routes.js';
import { hindsightService } from './services/hindsight.service.js';
import { groqService } from './services/groq.service.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', incidentsRouter);

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
    },
  });
});

async function bootstrap() {
  try {
    await initializeDatabase();
    console.log('[DB] SQLite database initialized successfully.');

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

bootstrap();
