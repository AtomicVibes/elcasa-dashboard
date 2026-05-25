/**
 * migrate.ts
 * ───────────────────────────────────────────────────────────────────────────
 * Umzug v3 runner for the `migrations/` SQL directory.
 *
 * Design decisions
 * ────────────────
 * • The module-level `sequelize` singleton from `models.ts` is referenced
 *   directly — no new connection pool is ever spawned here.
 * • `sequelize.getQueryInterface()` returns `Promise<SequelizeQueryInterface>`.
 *   Umzug v3 expects `{ context: SequelizeQueryInterface }`, so we serialise
 *   the promise at call-site with an async wrapper instead of a type-cast.
 * • The JSON storage file is written to `<workspace-root>/migrate_log.json`
 *   alongside this file so the tracker always lands in the same place between
 *   dev and production.
 * • `resolveAbsolutePath` was a v2-only Umzug option and is intentionally
 *   omitted; `cwd` anchors all glob matches to the sql/ folder.
 */

import { Umzug, JSONStorage } from 'umzug';
import { join as pathJoin } from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './models';

const MIGRATIONS_PATH = pathJoin(
  pathDirname(fileURLToPath(import.meta.url)),
  '..',
  'migrations'
);

function pathDirname(p: string): string {
  const lastSep = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
  return lastSep >= 0 ? p.slice(0, lastSep) : '.';
}

/** Build and run Umzug against the live database. */
async function buildUmzug(): Promise<Umzug> {
  const qi = await sequelize.getQueryInterface();

  return new Umzug({
    migrations: {
      glob: ['*.sql', { cwd: MIGRATIONS_PATH }],
    },
    context:   { context: qi },
    storage:   new JSONStorage({ path: pathJoin(MIGRATIONS_PATH, '..', 'migrate_log.json') }),
    logger: {
      log:   (msg: string) => console.info(`[umzug] ${msg}`),
      error: (msg: string) => console.error(`[umzug] ${msg}`),
      warn:  (msg: string) => console.warn(`[umzug] ${msg}`),
    },
  } as any);
}

/** Apply all pending migrations. */
export async function runMigrations() {
  const umzug = await buildUmzug();
  try {
    await umzug.up();
  } finally {
    const maybeDispose = (umzug as unknown as { dispose?: () => Promise<void> }).dispose;
    if (maybeDispose) await maybeDispose();
  }
}

/** Roll back the most recently applied migration batch. */
export async function undoLastMigration() {
  const umzug = await buildUmzug();
  try {
    await umzug.down();
  } finally {
    const maybeDispose = (umzug as unknown as { dispose?: () => Promise<void> }).dispose;
    if (maybeDispose) await maybeDispose();
  }
}
