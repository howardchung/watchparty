import { Client } from 'pg';
import config from './config';

const postgres = new Client({
  connectionString: config.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
postgres.connect();

setInterval(cleanupPostgres, 5 * 60 * 1000);

async function cleanupPostgres() {
  if (!postgres) {
    return;
  }
  console.time('[CLEANUP]');
  await postgres?.query(
    `DELETE FROM room WHERE owner IS NULL AND "lastUpdateTime" < NOW() - INTERVAL '1 day'`
  );
  console.timeEnd('[CLEANUP]');
}
