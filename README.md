# TraceCause 🧠⚡
### AI Incident-Response Agent with Institutional Memory via Hindsight Cloud & Groq

**TraceCause** is an enterprise AI incident-response agent demonstrating persistent institutional memory. When complex outages occur, traditional on-call teams suffer from amnesia—repeating past failed fixes or taking hours to rediscover solutions documented in past postmortems. TraceCause bridges this gap using the official **Hindsight Cloud** TypeScript SDK (`@vectorize-io/hindsight-client`) for institutional memory indexing and **Groq GPT-OSS-120B** for rapid, zero-hallucination root-cause analysis with **strict evidence separation**.

---

## 🌟 Key Architectural Principles

1. **Official Hindsight Cloud SDK Integration**:
   - Uses `@vectorize-io/hindsight-client` with Hindsight Cloud (`HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io`).
   - All credentials (`HINDSIGHT_API_KEY`, `HINDSIGHT_BANK_ID`) remain strictly server-side.
   - Fully implements `retain` (for storing postmortems), `recall` (for multi-strategy retrieval during investigations), and `reflect` (for cross-incident synthesis).
2. **Strict 3-Way Evidence Separation (Zero-Hallucination Guarantee)**:
   - **Current Facts**: Live telemetry, metrics, error status codes, and observed symptoms.
   - **Historical Memory (Hindsight)**: Matched past postmortems, proven historical fixes, and explicit warnings against previous failed attempts.
   - **AI Inference**: Diagnostic deduction, confidence rating, and ordered immediate action plan.
3. **Institutional Learning Loop**:
   - Every resolved incident is retained into Hindsight (`retain`), indexing the root cause, what worked, and what failed.
   - Subsequent incidents in the same or related microservices instantly recall accumulated learnings.
4. **Interactive 7-Stage Demo Script Stepper**:
   - Built-in one-click demo tour guiding evaluators through the full memory lifecycle: Seed → Incident #1 → Investigate → Separate Evidence → Resolve → Retain → Incident #2 (Accumulated Memory).

---

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, TypeScript
- **Persistence**: SQLite (`sql.js` WebAssembly + file sync)
- **Memory Bank**: Hindsight Cloud (`@vectorize-io/hindsight-client`)
- **Reasoning Engine**: Groq API (`groq-sdk`, `openai/gpt-oss-120b`)

---

## 🚀 Quick Start

### 1. Environment Configuration
Copy the example configuration file:
```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your API keys:
```env
PORT=4000
NODE_ENV=development

# Hindsight Cloud (Official TypeScript SDK)
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BANK_ID=TraceCause

# Groq API
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```
*(Note: If API keys are omitted during evaluation, TraceCause automatically uses its built-in high-fidelity institutional memory & reasoning engine so you can test all features offline seamlessly).*

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database & Institutional Memory Bank
```bash
npm run seed
```

### 4. Run Development Servers
```bash
npm run dev
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000](http://localhost:4000)

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/incidents` | Create a new active incident |
| `GET` | `/api/incidents` | List all incidents with optional service/status filters |
| `GET` | `/api/incidents/:id` | Retrieve single incident details and linked resolution |
| `POST` | `/api/incidents/:id/investigate` | Trigger AI agent investigation (`recall` + Groq inference) |
| `POST` | `/api/incidents/:id/resolve-learn` | Mark incident resolved and retain postmortem in Hindsight |
| `GET` | `/api/incidents/:id/memories` | Retrieve raw Hindsight memories recalled for this incident |
| `POST` | `/api/seed` | Seed 15 historical incidents & populate memory bank |

---

## 🎬 7-Stage Demo Script

Follow along using the interactive top bar in the UI:

1. **Stage 1: Seed Memory Bank** — Seeds 15 historical postmortems across services, including the **Database Connection Pool Exhaustion** cluster with recorded failed and successful fix attempts.
2. **Stage 2: Spawn Incident #1** — Spawns `INC-2024-091` (`payment-api` 504 Gateway Timeouts under checkout surge).
3. **Stage 3: Agent Investigation** — Calls `/investigate`, queries Hindsight for past postmortems, and prompts Groq LLM.
4. **Stage 4: Review Evidence Separation** — Inspect the Tri-Fold view keeping live telemetry facts separate from past institutional memory and AI deduction.
5. **Stage 5: Resolve Incident** — Apply the verified fix (connection reaping timeout `idleTimeoutMillis=10000` + unclosed transaction fix).
6. **Stage 6: Institutional Learning** — Calls `/resolve-learn`, persisting the new knowledge unit into Hindsight Cloud bank.
7. **Stage 7: Incident #2 Recalls Accumulated Memory** — Spawns `INC-2024-092` in `order-service`. The agent immediately recalls the exact lesson learned in Stage 6 and warns against previous failed attempts!
