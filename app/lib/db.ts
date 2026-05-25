// app/lib/db.ts

export function getDbConfig() {
  return {
    host:     process.env.DB_HOST   ?? 'localhost',
    port:     parseInt(process.env.DB_PORT ?? '5432',   10),
    user:     process.env.DB_USER   ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME   ?? 'fusionadevs_renovation',
  };
}

export function getConnectionUrl(): string {
  const { host, port, user, password, database } = getDbConfig();
  const ssl     = process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0' ? '?sslmode=require' : '';
  const encoded = encodeURIComponent;
  return `postgres://${encoded(user)}:${encoded(password)}@${host}:${port}/${database}${ssl}`;
}

export function isDev(): boolean {
  return process.env.NODE_ENV !== 'production';
}
