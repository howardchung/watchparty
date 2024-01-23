import { postgres } from './utils/postgres';

cleanupPostgres();
setInterval(cleanupPostgres, 5 * 60 * 1000);

async function cleanupPostgres() {
  if (!postgres) {
    return;
  }
  console.time('[CLEANUP]');
  const result = await postgres?.query(
    `DELETE FROM room WHERE owner IS NULL AND ("lastUpdateTime" < NOW() - INTERVAL '1 day' OR "lastUpdateTime" IS NULL)`,
  );
  console.log(result.command, result.rowCount);
  console.timeEnd('[CLEANUP]');
}
