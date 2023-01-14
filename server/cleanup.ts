import { Client } from 'pg';
import config from './config';

const postgres = new Client({
  connectionString: config.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
postgres.connect();

cleanupPostgres();
setInterval(cleanupPostgres, 5 * 60 * 1000);

async function cleanupPostgres() {
  if (!postgres) {
    return;
  }
  console.time('[CLEANUP]');
  const result = await postgres?.query(
    `DELETE FROM room WHERE owner IS NULL AND "lastUpdateTime" < NOW() - INTERVAL '1 day'`
  );
  console.log(result.command, result.rowCount);
  console.timeEnd('[CLEANUP]');
}
