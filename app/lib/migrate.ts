/**
 * migrate.ts
 * Umzug v3 runner for the `migrations/` SQL directory.
 */

import { Umzug, JSONStorage } from 'umzug';
import { join as pathJoin } from 'path';
import { fileURLToPath } from 'url';
import { getSequelize } from './models';

const MIGRATIONS_PATH = pathJoin(
  pathDirname(fileURLToPath(import.meta.url)),
  '..',
  'migrations'
);

function pathDirname(p: string): string {
  const lastSep = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
  return lastSep >= 0 ? p.slice(0, lastSep) : '.';
}

async function buildUmzug(): Promise<Umzug> {
  const sequelize = await getSequelize();
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

export async function runMigrations() {
  const umzug = await buildUmzug();
  try {
    await umzug.up();
  } finally {
    const maybeDispose = (umzug as unknown as { dispose?: () => Promise<void> }).dispose;
    if (maybeDispose) await maybeDispose();
  }
}

export async function undoLastMigration() {
  const umzug = await buildUmzug();
  try {
    await umzug.down();
  } finally {
    const maybeDispose = (umzug as unknown as { dispose?: () => Promise<void> }).dispose;
    if (maybeDispose) await maybeDispose();
  }
}
