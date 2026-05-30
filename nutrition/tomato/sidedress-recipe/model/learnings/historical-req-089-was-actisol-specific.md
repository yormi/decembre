# Historical: the Ca-aware product gate was Actisol-specific

Pre-2026-05-09 the gate locked `actisol_g === 0` directly. Too narrow:
any future Ca-bearing product (Selectus 4-2-5, Ca-bearing frass) would
slip through. Generalized to `ca_pct === 0` 2026-05-09.
