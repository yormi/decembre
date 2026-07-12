# app/

Web-app UI source. Entry = `app/index.html`, assembled from `@include` partials by `scripts/build.mjs`. `dist/index.html` is a gitignored build artifact — never edit; dev server rebuilds on save.

Layout mirrors the navigation:

- `core/` — app-wide chrome: router (`setPage`/`setCrop`/`toggleAdmin`), session state + greenhouse constants, page-recalc, Bilan dispatch, top tool-bar. Powers both operator and admin.
- `operator/` — operator-facing pages, `<section>/<function>/<crop>/` (e.g. `operator/nutrition/fertigation/tomato/`, `operator/effeuillage/lettuce/`, `operator/lumiere/lettuce/`).
- `admin/` — admin pages: `nutrition/{bilan,builder,historique}/`, `irrigation/<crop>/`, `diagnostic/`, `week/`, `rendement/`.
- `lib/` — app-scoped styles.

Partials also pull model/spec code from `nutrition/` and `yield-range/` (each subproject's `domain/` + `protocol/`). Root `lib/` holds cross-cutting primitives (`global.css`, `sun.js`, `spec-strings.js`).
