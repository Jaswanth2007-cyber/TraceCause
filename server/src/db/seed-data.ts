export interface SeedIncident {
  id: string;
  incident_number: string;
  title: string;
  service: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  environment: string;
  description: string;
  symptoms: string[];
  status: 'RESOLVED' | 'OPEN';
  created_at: string;
  resolution?: {
    root_cause: string;
    resolution: string;
    result: 'SUCCESS' | 'FAILED' | 'MITIGATED' | 'PARTIAL';
    created_at: string;
  };
}

export const SEED_DATA: SeedIncident[] = [
  // Deliberate Cluster: Database Connection Pool Exhaustion (Historical Incident 1 - Failed Fix)
  {
    id: 'inc-seed-001',
    incident_number: 'INC-2024-012',
    title: 'payment-api HTTP 504 Gateway Timeouts under checkout surge',
    service: 'payment-api',
    severity: 'CRITICAL',
    environment: 'production',
    description: 'During a flash campaign, payment-api latency spiked to >15,000ms and returned 504s on /v1/charges endpoint. Telemetry showed connection pool acquisition timeouts.',
    symptoms: [
      'Connection pool acquisition timeout: pool exhausted (50/50 active)',
      'HTTP 504 Gateway Timeout on POST /v1/charges',
      'Database connection queue depth > 450 requests',
      'p99 latency spiked from 120ms to 18,200ms',
    ],
    status: 'RESOLVED',
    created_at: '2024-03-15T14:22:00Z',
    resolution: {
      root_cause: 'PostgreSQL connection pool max size was too low (50) for traffic burst; unhandled async error in checkout handler prevented connection release.',
      resolution: 'FAILED ATTEMPT: Increased pool size from 50 to 250 connections. Result: PostgreSQL RDS instance experienced memory pressure (OOM killer terminated postmaster process), causing a 6-minute full database outage.',
      result: 'FAILED',
      created_at: '2024-03-15T15:45:00Z',
    },
  },

  // Deliberate Cluster: Database Connection Pool Exhaustion (Historical Incident 2 - Mitigated / Partial)
  {
    id: 'inc-seed-002',
    incident_number: 'INC-2024-018',
    title: 'payment-api recurrent DB pool saturation after container restart',
    service: 'payment-api',
    severity: 'HIGH',
    environment: 'production',
    description: 'Follow-up incident on payment-api. Connection pool saturated within 10 minutes of traffic increase. On-call engineer executed container pod rollout restart.',
    symptoms: [
      'Node.js pg-pool error: timeout exceeded when trying to connect',
      'Active connections saturated at 50/50',
      'Upstream gateway reported 502/504 surge',
    ],
    status: 'RESOLVED',
    created_at: '2024-04-02T09:15:00Z',
    resolution: {
      root_cause: 'Hanging idle-in-transaction connections from third-party webhook callbacks holding connections open indefinitely.',
      resolution: 'PARTIAL MITIGATION: Rolling restarted container pods and enabled PgBouncer transaction pooling. This temporarily relieved the pool for 40 minutes, but did not resolve root cause.',
      result: 'MITIGATED',
      created_at: '2024-04-02T10:30:00Z',
    },
  },

  // Deliberate Cluster: Database Connection Pool Exhaustion (Historical Incident 3 - PROVEN SUCCESSFUL FIX)
  {
    id: 'inc-seed-003',
    incident_number: 'INC-2024-029',
    title: 'payment-api permanent fix for DB connection leak and idle exhaustion',
    service: 'payment-api',
    severity: 'CRITICAL',
    environment: 'production',
    description: 'Permanent architectural remediation of payment-api database connection starvation under concurrent load.',
    symptoms: [
      'Connection pool acquisition delay > 3000ms',
      'pg_stat_activity showing 40+ connections in state "idle in transaction"',
      'Lock contention on payments ledger table',
    ],
    status: 'RESOLVED',
    created_at: '2024-05-10T18:00:00Z',
    resolution: {
      root_cause: 'Missing idle connection reaping timeout and unhandled promise rejection in Stripe webhook handler that left transactions uncommitted.',
      resolution: 'PROVEN SUCCESS: 1) Configured aggressive connection reaping with idleTimeoutMillis=10000, connectionTimeoutMillis=2000, maxUses=7500. 2) Wrapped checkout/webhook transaction logic in try-finally with explicit client.release(). 3) Set postgres idle_in_transaction_session_timeout = 5000ms. Zero connection pool exhaustion incidents observed since.',
      result: 'SUCCESS',
      created_at: '2024-05-10T19:40:00Z',
    },
  },

  // Incident 4: Auth Service JWT verification latency
  {
    id: 'inc-seed-004',
    incident_number: 'INC-2024-033',
    title: 'auth-service JWKS endpoint rate limited causing 401 cascading failures',
    service: 'auth-service',
    severity: 'CRITICAL',
    environment: 'production',
    description: 'Auth service started failing token verification across all microservices due to Auth0 JWKS endpoint rate limiting.',
    symptoms: [
      'Cascading HTTP 401 Unauthorized across payment, orders, and user services',
      'Auth0 JWKS endpoint returning 429 Too Many Requests',
      'Auth verification latency increased from 4ms to 2,400ms',
    ],
    status: 'RESOLVED',
    created_at: '2024-05-22T11:10:00Z',
    resolution: {
      root_cause: 'jwks-rsa library cache was disabled in the recent v2.4.1 release, causing every incoming request to make an outbound HTTP call to fetch public signing keys.',
      resolution: 'Enabled in-memory JWKS public key caching (cache: true, rateLimit: true, jwksRequestsPerMinute: 10) with 24-hour TTL and Redis secondary fallback.',
      result: 'SUCCESS',
      created_at: '2024-05-22T12:05:00Z',
    },
  },

  // Incident 5: Order Service Deadlock
  {
    id: 'inc-seed-005',
    incident_number: 'INC-2024-041',
    title: 'order-service Postgres deadlocks on concurrent inventory allocation',
    service: 'order-service',
    severity: 'HIGH',
    environment: 'production',
    description: 'Concurrent checkout threads attempting to reserve inventory for identical SKU batches caused transaction deadlocks in PostgreSQL.',
    symptoms: [
      'Postgres error: deadlock detected (Process 28194 waits for ShareLock on transaction 91283)',
      'HTTP 500 Internal Server Error rate at 18% on /v1/orders/create',
      'Inventory allocation queue backed up by 1,200 jobs',
    ],
    status: 'RESOLVED',
    created_at: '2024-06-08T16:30:00Z',
    resolution: {
      root_cause: 'Non-deterministic lock acquisition order across multiple SKUs within the same order transaction.',
      resolution: 'Enforced sorted SKU locking in transaction queries (SELECT ... WHERE sku IN (...) ORDER BY sku_id FOR UPDATE) ensuring all transactions acquire row locks in strict ascending order.',
      result: 'SUCCESS',
      created_at: '2024-06-08T17:45:00Z',
    },
  },

  // Incident 6: Notification Worker SQS Backlog
  {
    id: 'inc-seed-006',
    incident_number: 'INC-2024-048',
    title: 'notification-worker SQS message ingestion stuck on SendGrid API timeout',
    service: 'notification-worker',
    severity: 'MEDIUM',
    environment: 'production',
    description: 'Email notification dispatch fell behind by 45,000 messages. Worker thread pool was blocked waiting on slow SendGrid third-party socket responses.',
    symptoms: [
      'SQS ApproximateNumberOfMessagesVisible rose to 45,000+',
      'Message age reached 3.5 hours',
      'Worker CPU utilization dropped to 3% while memory remained high',
    ],
    status: 'RESOLVED',
    created_at: '2024-06-25T08:00:00Z',
    resolution: {
      root_cause: 'Default HTTP socket timeout on SendGrid client was 60 seconds without exponential backoff or circuit breaking.',
      resolution: 'Reduced HTTP socket timeout to 3000ms, enabled p-limit concurrency limiter (max 25 concurrent requests), and added dead-letter queue (DLQ) routing for retries.',
      result: 'SUCCESS',
      created_at: '2024-06-25T09:15:00Z',
    },
  },

  // Incident 7: Search Indexer ElasticSearch Cluster Yellow
  {
    id: 'inc-seed-007',
    incident_number: 'INC-2024-053',
    title: 'search-indexer Elasticsearch unassigned replica shards during node rebalance',
    service: 'search-indexer',
    severity: 'MEDIUM',
    environment: 'production',
    description: 'Elasticsearch cluster entered YELLOW state. Search queries on product catalog showed elevated p95 latency.',
    symptoms: [
      'ES cluster health status: YELLOW',
      '14 unassigned replica shards on products_v3 index',
      'Search query latency increased by 350ms',
    ],
    status: 'RESOLVED',
    created_at: '2024-07-04T13:20:00Z',
    resolution: {
      root_cause: 'Disk watermark exceeded 85% on data node es-data-03, preventing shard allocation.',
      resolution: 'Cleaned up obsolete index snapshots older than 30 days and increased EBS volume size from 250GB to 500GB with dynamic volume expansion.',
      result: 'SUCCESS',
      created_at: '2024-07-04T14:40:00Z',
    },
  },

  // Incident 8: User Profile Redis Replica Read Lag
  {
    id: 'inc-seed-008',
    incident_number: 'INC-2024-060',
    title: 'user-profile Redis replica synchronization lag causing stale session reads',
    service: 'user-profile',
    severity: 'HIGH',
    environment: 'production',
    description: 'Users reported login status reverting after profile updates. Read-replica Redis nodes were lagging behind primary by 12+ seconds.',
    symptoms: [
      'Redis replication offset lag > 12,000ms on redis-read-02',
      'Stale user preference data served to frontend clients',
      'Replication buffer backlog overflow warnings in Redis logs',
    ],
    status: 'RESOLVED',
    created_at: '2024-07-19T20:15:00Z',
    resolution: {
      root_cause: 'Heavy bulk export job running against primary Redis instance during peak hours saturated the replication buffer (client-output-buffer-limit slave).',
      resolution: 'Increased client-output-buffer-limit replica from 256mb to 1gb and rescheduled analytics batch export queries to off-peak hours (02:00 UTC).',
      result: 'SUCCESS',
      created_at: '2024-07-19T21:30:00Z',
    },
  },

  // Incident 9: Inventory DB Buffer Pool Saturation
  {
    id: 'inc-seed-009',
    incident_number: 'INC-2024-067',
    title: 'inventory-db MySQL buffer pool churn caused by unindexed sequential scan',
    service: 'inventory-db',
    severity: 'HIGH',
    environment: 'production',
    description: 'Database CPU climbed to 98% with disk I/O bottleneck. Analytics query without covering index evicted hot cache from InnoDB buffer pool.',
    symptoms: [
      'MySQL CPU utilization 98%',
      'InnoDB buffer pool hit rate dropped from 99.8% to 64.2%',
      'Slow query log flooded with queries taking >8,500ms on table `stock_reservations`',
    ],
    status: 'RESOLVED',
    created_at: '2024-08-03T10:00:00Z',
    resolution: {
      root_cause: 'Newly deployed admin reporting query performed full table scan on stock_reservations filtering by (warehouse_id, updated_at).',
      resolution: 'Created composite B-tree index `idx_stock_wh_updated (warehouse_id, updated_at, status)` and killed long-running reporting thread.',
      result: 'SUCCESS',
      created_at: '2024-08-03T11:15:00Z',
    },
  },

  // Incident 10: Reporting Service Memory Leak
  {
    id: 'inc-seed-010',
    incident_number: 'INC-2024-074',
    title: 'reporting-service Node.js V8 heap out of memory during PDF generation',
    service: 'reporting-service',
    severity: 'MEDIUM',
    environment: 'production',
    description: 'Reporting worker containers repeatedly killed by Linux OOM killer during monthly invoice generation.',
    symptoms: [
      'Container termination signal: SIGKILL (OOMKilled exit code 137)',
      'Node.js V8 heap usage grew monotonically to 1.8GB ceiling',
      'Puppeteer headless browser instances orphaned in background',
    ],
    status: 'RESOLVED',
    created_at: '2024-08-15T15:00:00Z',
    resolution: {
      root_cause: 'Puppeteer browser page instances were not closed on PDF render errors, leaking browser processes and uncollected DOM buffers.',
      resolution: 'Implemented robust browser pool with explicit `page.close()` and `browser.disconnect()` in finally blocks, plus container memory limit bump to 3GB.',
      result: 'SUCCESS',
      created_at: '2024-08-15T16:20:00Z',
    },
  },

  // Incident 11: CDN Cache Invalidation Storm
  {
    id: 'inc-seed-011',
    incident_number: 'INC-2024-079',
    title: 'frontend-cdn Cloudflare wildcard purge triggered origin server thundering herd',
    service: 'frontend-cdn',
    severity: 'HIGH',
    environment: 'production',
    description: 'Deployment script executed global `/*` CDN cache purge, sending 35,000 req/sec directly to origin API servers.',
    symptoms: [
      'Origin server CPU at 100%',
      'Origin response time spiked from 45ms to 6,200ms',
      'CDN cache hit ratio dropped from 94% to 0.4%',
    ],
    status: 'RESOLVED',
    created_at: '2024-08-28T17:30:00Z',
    resolution: {
      root_cause: 'Automated CI/CD webhook triggered broad cache purge all URLs instead of targeted surrogate key invalidation.',
      resolution: 'Switched CDN cache invalidation to tag-based surrogate keys (Cache-Tag: release-v1.4) and configured origin stale-while-revalidate protection.',
      result: 'SUCCESS',
      created_at: '2024-08-28T18:15:00Z',
    },
  },

  // Incident 12: Order Service Kafka Consumer Lag
  {
    id: 'inc-seed-012',
    incident_number: 'INC-2024-082',
    title: 'order-service Kafka consumer group rebalance loop causing processing stalls',
    service: 'order-service',
    severity: 'HIGH',
    environment: 'production',
    description: 'Order fulfillment events stopped processing. Consumer group was stuck in continuous rebalancing loop.',
    symptoms: [
      'Kafka consumer lag on topic `orders.placed` increased by 800 msgs/min',
      'Logs: CommitFailedException (max.poll.interval.ms exceeded)',
      'Consumer instances continuously revoking and reassigning partitions',
    ],
    status: 'RESOLVED',
    created_at: '2024-09-05T09:40:00Z',
    resolution: {
      root_cause: 'A single complex fraud-check batch took 340 seconds to process, exceeding max.poll.interval.ms (300,000ms), causing Kafka broker to consider the consumer dead.',
      resolution: 'Increased max.poll.interval.ms to 600,000ms, reduced max.poll.records from 500 to 50, and offloaded async fraud checks to dedicated worker thread.',
      result: 'SUCCESS',
      created_at: '2024-09-05T10:50:00Z',
    },
  },

  // Incident 13: Payment API Webhook Signature Desync
  {
    id: 'inc-seed-013',
    incident_number: 'INC-2024-085',
    title: 'payment-api Stripe webhook signature verification failed after secret rotation',
    service: 'payment-api',
    severity: 'HIGH',
    environment: 'production',
    description: 'Inbound Stripe charge event notifications were rejected with HTTP 400 invalid signature after periodic secrets rotation.',
    symptoms: [
      'HTTP 400 Bad Request on /webhooks/stripe (99.4% error rate)',
      'Stripe dashboard showing webhook delivery failures and retries disabled',
      'Order fulfillment stalled for 340 customer transactions',
    ],
    status: 'RESOLVED',
    created_at: '2024-09-12T14:10:00Z',
    resolution: {
      root_cause: 'Kubernetes deployment pods cached old STRIPE_WEBHOOK_SECRET environment variable in memory after AWS Secrets Manager rotation without pod rollout.',
      resolution: 'Executed graceful pod restart and updated secrets loader to poll Secrets Manager with 15-minute rotation grace period supporting dual active signing keys.',
      result: 'SUCCESS',
      created_at: '2024-09-12T14:45:00Z',
    },
  },

  // Incident 14: Auth Service Redis Eviction Policy Error
  {
    id: 'inc-seed-014',
    incident_number: 'INC-2024-088',
    title: 'auth-service user sessions unexpectedly logged out due to Redis volatile-lru eviction',
    service: 'auth-service',
    severity: 'MEDIUM',
    environment: 'production',
    description: '15,000 active users logged out simultaneously during rate limiting burst.',
    symptoms: [
      'Sudden spike in user login requests (8x normal volume)',
      'Redis maxmemory reached 100%',
      'Session keys missing before standard 7-day TTL expiration',
    ],
    status: 'RESOLVED',
    created_at: '2024-09-18T11:00:00Z',
    resolution: {
      root_cause: 'Redis maxmemory-policy was set to `volatile-lru`. Rate limit keys and session tokens shared the same Redis instance, causing high-volume rate limiter keys to evict session keys.',
      resolution: 'Separated rate limiting cache into dedicated Redis cluster and switched session Redis maxmemory-policy to `noeviction` with proactive alerting at 75% capacity.',
      result: 'SUCCESS',
      created_at: '2024-09-18T12:15:00Z',
    },
  },

  // Incident 15: Notification Worker Push Notification Queue Overflow
  {
    id: 'inc-seed-015',
    incident_number: 'INC-2024-090',
    title: 'notification-worker APNs HTTP/2 connection reset under Apple Push surge',
    service: 'notification-worker',
    severity: 'LOW',
    environment: 'production',
    description: 'iOS push notification delivery delays observed during product release announcement.',
    symptoms: [
      'APNs socket error: GOAWAY frame received from gateway.push.apple.com',
      'Push notification dispatch latency increased from 800ms to 45 mins',
      'Retry queue backing up with duplicate device token notifications',
    ],
    status: 'RESOLVED',
    created_at: '2024-09-22T19:00:00Z',
    resolution: {
      root_cause: 'Worker maintained a single static HTTP/2 TCP connection that hit Apple APNs 24-hour connection age termination limit.',
      resolution: 'Configured APNs connection pool with maxAge of 60 minutes, automatic ping keepalive frames every 30s, and graceful socket recycling.',
      result: 'SUCCESS',
      created_at: '2024-09-22T19:40:00Z',
    },
  },
];
