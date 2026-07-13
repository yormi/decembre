# app/

Web-app UI source. Entry = `app/index.html`, assembled from `@include` partials by `scripts/build.mjs`. `dist/index.html` is a gitignored build artifact — never edit; dev server rebuilds on save.

Layout mirrors the navigation:

- `core/` — app-wide chrome: router (`setPage`/`setCrop`/`toggleAdmin`), session state + greenhouse constants, page-recalc, Bilan dispatch, top tool-bar. Powers both operator and admin.
- `operator/` — operator-facing pages, `<section>/<function>/<crop>/` (e.g. `operator/nutrition/foliar/tomato/`, `operator/effeuillage/lettuce/`, `operator/lumiere/lettuce/`). A page that serves all crops from one shared toggle drops the `<crop>` level (e.g. `operator/nutrition/fertigation/`).
- `admin/` — admin pages: `nutrition/{bilan,builder,historique}/`, `irrigation/<crop>/`, `diagnostic/`, `week/`, `rendement/`.
- `lib/` — shared styles + cross-cutting primitives (`global.css`, `admin.css`, `sun.js`, `spec-strings.js`, `tomato.css`).

Partials also pull model/spec code from `nutrition/` and `yield-range/` (each subproject's `domain/` + `protocol/`). `nutrition/lib/` holds nutrition-shared helpers (`format.js`, `pourquoi.js`, …) and stays put.
