import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL;

    if (connectionString) {
      global._postgresPool = new Pool({
        connectionString,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
        max: 5,
        connectionTimeoutMillis: 3000,
      });

      global._postgresPool.on('error', (err) => {
        console.warn('[PostgreSQL Pool] Warning on idle client:', err?.message || err);
      });
    } else {
      // Offline / Mock pool for AI Studio environment without active Cloud SQL connection
      const mockPool = {
        query: async () => ({ rows: [], rowCount: 0 }),
        connect: async () => ({
          query: async () => ({ rows: [], rowCount: 0 }),
          release: () => {},
        }),
        on: () => {},
        end: async () => {},
      } as unknown as Pool;
      global._postgresPool = mockPool;
    }
  }
  return global._postgresPool;
};

const pool = createPool();
let db: any;
try {
  db = drizzle(pool, { schema });
} catch {
  console.warn('[AI Studio] Database not connected — using mock proxy');
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  db = new Proxy({}, {
    get: (_, prop) => (prop === 'query' ? new Proxy({}, { get: () => noOp }) : async () => []),
  });
}

export { db };

