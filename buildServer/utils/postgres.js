"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postgres = void 0;
exports.newPostgres = newPostgres;
exports.updateObject = updateObject;
exports.insertObject = insertObject;
exports.upsertObject = upsertObject;
const pg_1 = require("pg");
const config_1 = __importDefault(require("../config"));
exports.postgres = undefined;
if (config_1.default.DATABASE_URL) {
    exports.postgres = new pg_1.Client({
        connectionString: config_1.default.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
    exports.postgres.connect();
}
/**
 * Use this if we need a new connection instead of sharing.
 * Guarantees we'll return a client because we throw if we don't have it configured
 * @returns
 */
function newPostgres() {
    if (!config_1.default.DATABASE_URL) {
        throw new Error('postgres not configured');
    }
    const postgres = new pg_1.Client({
        connectionString: config_1.default.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
    postgres.connect();
    return postgres;
}
async function updateObject(postgres, table, object, condition) {
    const columns = Object.keys(object);
    const values = Object.values(object);
    // TODO support compound conditions, not just one
    let query = `UPDATE ${table} SET ${columns
        .map((c, i) => `"${c}" = $${i + 1}`)
        .join(',')}
    WHERE "${Object.keys(condition)[0]}" = $${Object.keys(object).length + 1}
    RETURNING *`;
    //console.log(query);
    const result = await postgres.query(query, [
        ...values,
        condition[Object.keys(condition)[0]],
    ]);
    return result;
}
async function insertObject(postgres, table, object) {
    const columns = Object.keys(object);
    const values = Object.values(object);
    let query = `INSERT INTO ${table} (${columns.map((c) => `"${c}"`).join(',')})
    VALUES (${values.map((_, i) => '$' + (i + 1)).join(',')})
    RETURNING *`;
    // console.log(query);
    const result = await postgres.query(query, values);
    return result;
}
async function upsertObject(postgres, table, object, conflict) {
    const columns = Object.keys(object);
    const values = Object.values(object);
    let query = `INSERT INTO ${table} (${columns.map((c) => `"${c}"`).join(',')})
    VALUES (${values.map((_, i) => '$' + (i + 1)).join(',')})
    ON CONFLICT (${Object.keys(conflict)
        .map((k) => `"${k}"`)
        .join(',')})
    DO UPDATE SET ${Object.keys(object)
        .map((c) => `"${c}" = EXCLUDED."${c}"`)
        .join(',')}
    RETURNING *`;
    // console.log(query);
    const result = await postgres.query(query, values);
    return result;
}
