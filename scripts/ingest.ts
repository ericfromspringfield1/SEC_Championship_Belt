import path from 'path';
import { ingestAll } from '../lib/ingest/ingestAll';

const DB_PATH = path.join(process.cwd(), 'data', 'sec-belt.sqlite');

ingestAll(DB_PATH, { forceRebuild: true });
