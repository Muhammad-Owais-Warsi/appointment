import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:../appointments.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

await db.execute(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    status TEXT DEFAULT 'booked',
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

export default db;
