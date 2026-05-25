// types/pg.d.ts
// ─────────────────────────────────────────────────────────────────────────────
// Minimal type stub for the `pg` npm package.
//
// Why this file exists
// ─────────────────────────────────────────────────────────────────────────────
// The `pg` package (v3) no longer ships ambient `.d.ts` declarations in some
// ESM build configurations, so TypeScript surface the following error when it
// encounters:
//
//   import pg from 'pg'
//
//   TS7016: Could not find a declaration file for module 'pg'.
//   .../pg/esm/index.mjs implicitly has an 'any' type.
//
// This stub is deliberately narrow — it only declares the symbols we actually
// use in the codebase and uses `any` for their members to avoid over-specifying.
// Full typings live at `@types/pg` and may be installed separately if precision
// is required in consuming files.
// ─────────────────────────────────────────────────────────────────────────────

declare module 'pg' {
  // Minimal structural declaration sufficient for the `pg-native` optional
  // import used in app/lib/models.ts.
  interface NativeTypes {
    native: (() => unknown) | undefined;
  }

  const p: NativeTypes;
  export default p;
}
