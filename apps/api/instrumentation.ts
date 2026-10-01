export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { parseServerConfig } = await import('@portfolio-pilot/config/server');
  parseServerConfig(process.env);
  const { closeConnections } = await import('@portfolio-pilot/db');
  const state = globalThis as typeof globalThis & { __portfolioPilotShutdownRegistered?: boolean };
  if (state.__portfolioPilotShutdownRegistered) return;
  state.__portfolioPilotShutdownRegistered = true;
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void closeConnections().finally(() => process.exit(signal === 'SIGINT' ? 130 : 143));
    });
  }
}
