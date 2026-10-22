import { createPool } from './index.ts';

export async function initDbTables() {
  const pool = createPool();
  try {
    const client = await pool.connect();
    try {
      console.log('[PostgreSQL Auto-Init] Checking and initializing database tables...');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          uid TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS hardware (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'ap',
          manufacturer TEXT NOT NULL DEFAULT '',
          model TEXT NOT NULL DEFAULT '',
          serial_number TEXT NOT NULL DEFAULT '',
          mac_address TEXT NOT NULL UNIQUE,
          device_key TEXT DEFAULT '',
          site TEXT DEFAULT '',
          ip_address TEXT DEFAULT '',
          poe_voltage TEXT DEFAULT '',
          status TEXT NOT NULL DEFAULT 'online',
          last_seen TEXT DEFAULT '',
          auto_provisioned BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS towers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          location TEXT DEFAULT '',
          ip_address TEXT DEFAULT '',
          mac_address TEXT DEFAULT '',
          status TEXT NOT NULL DEFAULT 'active',
          last_ping_ms INTEGER DEFAULT 5,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS vouchers (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL UNIQUE,
          package_id TEXT NOT NULL,
          package_name TEXT NOT NULL,
          price INTEGER NOT NULL,
          duration_minutes INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'unused',
          customer_phone TEXT DEFAULT '',
          payment_reference TEXT DEFAULT '',
          created_at TIMESTAMP DEFAULT NOW(),
          activated_at TIMESTAMP,
          expires_at TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS active_sessions (
          id TEXT PRIMARY KEY,
          voucher_code TEXT NOT NULL,
          mac_address TEXT NOT NULL,
          ip_address TEXT DEFAULT '',
          customer_phone TEXT DEFAULT '',
          device_info TEXT DEFAULT '',
          bytes_downloaded TEXT DEFAULT '0 MB',
          bytes_uploaded TEXT DEFAULT '0 MB',
          status TEXT NOT NULL DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          expires_at TIMESTAMP
        );
      `);
      console.log('[PostgreSQL Auto-Init] ✅ Database tables verified and ready.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('[PostgreSQL Auto-Init] ⚠️ Note: Database auto-init skipped or waiting for connection:', (err as any)?.message || err);
  }
}
