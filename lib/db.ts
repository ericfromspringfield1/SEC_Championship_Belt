import Database from 'better-sqlite3';
import path from 'path';
import { ensureDb } from '@/lib/ingest/bootstrap';

const DB_PATH = path.join(process.cwd(), 'data', 'sec-belt.sqlite');

let dbInstance: Database.Database | null = null;

export function getDb() {
  if (!dbInstance) {
    ensureDb(DB_PATH);
    dbInstance = new Database(DB_PATH, { readonly: false });
  }
  return dbInstance;
}

export function closeDb() {
  dbInstance?.close();
  dbInstance = null;
}

export { DB_PATH };
