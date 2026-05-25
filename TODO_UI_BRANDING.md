# TODO - UI / Branding Updates

## Plan summary
1. Unify global MAINLOGO.png usage between Onboarding header and Dashboard header.
2. Standardize logo Tailwind dimensions so it renders at identical size in both places.
3. Global text replacement: change SKADIA / Skadia -> ARCADIA / Arcadia everywhere in the UI.
4. Verify no leftover occurrences and update any related inline brand variables/text.

## Steps
- [ ] Locate where Dashboard navigation/header renders the main logo (likely in Sidebar or admin layout).
- [ ] Update Dashboard logo asset reference to use `/assets/MAINLOGO.png`.
- [ ] Create a shared Tailwind class/constant for logo sizing (or apply identical classes in both components) to ensure exact same rendering.
- [ ] Update Onboarding header logo markup to use the standardized classes.
- [ ] Perform global search/replace for `SKADIA` and `Skadia` (including any case variants) to `ARCADIA`/`Arcadia`.
- [ ] Re-run searches to confirm zero remaining `SKADIA`/`Skadia` occurrences.
- [ ] Run TypeScript/ESLint checks (or at least `npm test`/`npm run lint`) to ensure changes compile.

