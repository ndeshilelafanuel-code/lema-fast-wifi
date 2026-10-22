import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users table (Admins and Operators authenticated via Firebase Auth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').default('admin').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Hardware Equipment table (APs, Routers, Switches, Outdoor Radios)
export const hardware = pgTable('hardware', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').default('ap').notNull(), // ap | router | switch | starlink | power
  manufacturer: text('manufacturer').default('').notNull(),
  model: text('model').default('').notNull(),
  serialNumber: text('serial_number').default('').notNull(),
  macAddress: text('mac_address').notNull().unique(),
  deviceKey: text('device_key').default(''),
  site: text('site').default(''),
  ipAddress: text('ip_address').default(''),
  poeVoltage: text('poe_voltage').default(''),
  status: text('status').default('online').notNull(),
  lastSeen: text('last_seen').default(''),
  autoProvisioned: boolean('auto_provisioned').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Network Sites / Towers
export const towers = pgTable('towers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').default(''),
  ipAddress: text('ip_address').default(''),
  macAddress: text('mac_address').default(''),
  status: text('status').default('active').notNull(),
  lastPingMs: integer('last_ping_ms').default(5),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. WiFi Vouchers
export const vouchers = pgTable('vouchers', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  packageId: text('package_id').notNull(),
  packageName: text('package_name').notNull(),
  price: integer('price').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  status: text('status').default('unused').notNull(), // unused | active | expired
  customerPhone: text('customer_phone').default(''),
  paymentReference: text('payment_reference').default(''),
  createdAt: timestamp('created_at').defaultNow(),
  activatedAt: timestamp('activated_at'),
  expiresAt: timestamp('expires_at'),
});

// 5. Active Customer Hotspot Sessions
export const activeSessions = pgTable('active_sessions', {
  id: text('id').primaryKey(),
  voucherCode: text('voucher_code').notNull(),
  macAddress: text('mac_address').notNull(),
  ipAddress: text('ip_address').default(''),
  customerPhone: text('customer_phone').default(''),
  deviceInfo: text('device_info').default(''),
  bytesDownloaded: text('bytes_downloaded').default('0 MB'),
  bytesUploaded: text('bytes_uploaded').default('0 MB'),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
});
