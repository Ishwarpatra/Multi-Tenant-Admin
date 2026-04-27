export const INITIAL_NODES = [
  { id: '1', region: 'US-East', status: 'Online', capacity: 42, throughput: '240 env/s', isOnline: true, isWarning: false, isCritical: false, heartbeat: '< 1s ago', throughputInt: 240 },
  { id: '2', region: 'US-East', status: 'High Latency', capacity: 82, throughput: '1.2k env/s', isOnline: true, isWarning: true, isCritical: false, heartbeat: '4s ago', throughputInt: 1200 },
  { id: '3', region: 'EU-Central', status: 'Critical', capacity: 94, throughput: '3.1k env/s', isOnline: true, isWarning: false, isCritical: true, heartbeat: '< 1s ago', throughputInt: 3100 },
  { id: '4', region: 'AP-South', status: 'Offline', capacity: 0, throughput: '0 env/s', isOnline: false, isWarning: false, isCritical: false, heartbeat: 'Offline', throughputInt: 0 },
];

export const INITIAL_SECRETS = [
  { id: '1', keyName: 'SUPABASE_JWT_SECRET', value: 'ey...6tI', env: 'Production', timestamp: Date.now() - 86400000 },
  { id: '2', keyName: 'STRIPE_API_KEY_LIVE', value: 'sk_live_...9xz', env: 'Production', timestamp: Date.now() - 4000000 },
  { id: '3', keyName: 'AWS_ACCESS_KEY', value: 'AKIA...1X2', env: 'Staging', timestamp: Date.now() - 120000 },
  { id: '4', keyName: 'REDIS_CACHE_URL', value: 'redis://...1', env: 'Development', timestamp: Date.now() - 5000 },
];

export const INITIAL_WORKSPACE_FILES = [
  { name: '.env', vars: [] },
  { name: '.env.local', vars: [] },
  { name: '.env.production', vars: [] }
];

export const INITIAL_ARCH_LOGS = [
  "2023-10-[SYS] Bootstrapping global proxy router...",
  "2023-10-[EXT] Mounting 4 available telemetry nodes.",
  "2023-10-[INF] V8 Engine allocated. JIT compiler warm.",
  "2023-10-[NET] Bound secure TLS listeners on wildcard interfaces.",
  "2023-10-[SYS] Core ready. Awaiting distributed state commands."
];

export const MockApiService = {
  getTelemetryNodes: async () => {
    return new Promise<typeof INITIAL_NODES>(resolve => setTimeout(() => resolve([...INITIAL_NODES]), 600));
  },
  getSecrets: async () => {
    return new Promise<typeof INITIAL_SECRETS>(resolve => setTimeout(() => resolve([...INITIAL_SECRETS]), 400));
  },
  getWorkspaceFiles: async () => {
    return new Promise<typeof INITIAL_WORKSPACE_FILES>(resolve => setTimeout(() => resolve([...INITIAL_WORKSPACE_FILES]), 300));
  },
  getArchLogs: async () => {
    return new Promise<typeof INITIAL_ARCH_LOGS>(resolve => setTimeout(() => resolve([...INITIAL_ARCH_LOGS]), 500));
  }
};
