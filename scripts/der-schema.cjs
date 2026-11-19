// Rebuild an empty, isolated PostgreSQL-compatible database; never reads .env.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const backend = path.join(root, 'meatshop-backend');
process.env.TS_NODE_PROJECT = path.join(backend, 'tsconfig.json');
process.env.NODE_ENV = 'test';
require(path.join(backend, 'node_modules/ts-node/register/transpile-only'));
const { PGlite } = require(path.join(backend, 'node_modules/@electric-sql/pglite'));

async function main() {
  const db = new PGlite();
  const runner = {
    isTransactionActive: true,
    query: async (sql, params) => (await db.query(sql, params)).rows,
    hasTable: async (table) => (await db.query('SELECT 1 FROM information_schema.tables WHERE table_schema=\'public\' AND table_name=$1', [table])).rows.length > 0,
    getTable: async (table) => ({ foreignKeys: (await db.query(`SELECT c.conname AS name, ARRAY(SELECT a.attname FROM unnest(c.conkey) k JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=k) AS "columnNames" FROM pg_constraint c WHERE c.contype='f' AND c.conrelid=$1::regclass`, [table])).rows }),
    dropForeignKey: async (table, fk) => db.exec(`ALTER TABLE "${table}" DROP CONSTRAINT "${fk.name}"`),
  };
  const directory = path.join(backend, 'src/database/migrations');
  const files = fs.readdirSync(directory).filter(x => x.endsWith('.ts')).sort();
  for (const file of files) {
    const Migration = Object.values(require(path.join(directory, file))).find(x => typeof x === 'function' && x.prototype.up);
    try { await db.exec('BEGIN'); await new Migration().up(runner); await db.exec('COMMIT'); }
    catch (error) { throw new Error(`${file}: ${error.message}`, { cause: error }); }
  }
  const tables = (await db.query(`SELECT table_name AS name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`)).rows;
  for (const table of tables) {
    table.columns = (await db.query(`SELECT column_name AS name, data_type AS type, udt_name, is_nullable='YES' AS nullable, column_default AS "default", character_maximum_length AS length, numeric_precision AS precision, numeric_scale AS scale FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`, [table.name])).rows;
    table.constraints = (await db.query(`SELECT conname AS name, contype AS type, pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid=$1::regclass ORDER BY conname`, [table.name])).rows;
    table.indexes = (await db.query('SELECT indexname AS name,indexdef AS definition FROM pg_indexes WHERE schemaname=\'public\' AND tablename=$1 ORDER BY indexname', [table.name])).rows;
  }
  const enums = (await db.query(`SELECT t.typname AS name, array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid GROUP BY t.typname ORDER BY t.typname`)).rows;
  fs.writeFileSync(path.join(root, 'docs/DER_SCHEMA.json'), JSON.stringify({ migrations: files, enums, tables }, null, 2) + '\n');
  await db.close();
  console.log(`Validated ${files.length} migrations; extracted ${tables.length} tables.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
