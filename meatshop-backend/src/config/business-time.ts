/**
 * Legacy PostgreSQL `timestamp` columns contain Brasilia wall-clock values.
 * Load before pg/TypeORM so reads and writes agree with the database session.
 * JSON dates still use ISO 8601 UTC; clients display America/Sao_Paulo.
 */
process.env.TZ = 'America/Sao_Paulo';
