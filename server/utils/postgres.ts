import { Client, QueryResult } from 'pg';

export async function updateObject(
  postgres: Client,
  table: string,
  object: any
): Promise<QueryResult<any>> {
  const columns = Object.keys(object);
  const values = Object.values(object);
  let query = `UPDATE ${table} SET ${columns
    .map((c, i) => `"${c}" = ${i + 1}`)
    .join(',')}
    RETURNING *`;
  const result = await postgres.query(query, values);
  return result;
}

export async function insertObject(
  postgres: Client,
  table: string,
  object: any
): Promise<QueryResult<any>> {
  const columns = Object.keys(object);
  const values = Object.values(object);
  let query = `INSERT INTO ${table} (${columns.map((c) => `"${c}"`).join(',')})
    VALUES (${values.map((_, i) => '$' + (i + 1)).join(',')})
    RETURNING *`;
  const result = await postgres.query(query, values);
  return result;
}

async function upsertObject(
  postgres: Client,
  table: string,
  object: any,
  conflict: any
): Promise<null> {
  // TODO implement
  return null;
}
