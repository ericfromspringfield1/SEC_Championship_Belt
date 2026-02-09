import fs from 'fs';
import path from 'path';
import { hasRequiredTables, ingestAll } from '@/lib/ingest/ingestAll';

let bootstrapInProgress = false;

export function ensureDb(dbPath: string) {
  if (bootstrapInProgress) return;

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const shouldRebuild = !fs.existsSync(dbPath) || !hasRequiredTables(dbPath);
  if (!shouldRebuild) return;

  bootstrapInProgress = true;
  try {
    ingestAll(dbPath, { forceRebuild: true });
  } finally {
    bootstrapInProgress = false;
  }
}
