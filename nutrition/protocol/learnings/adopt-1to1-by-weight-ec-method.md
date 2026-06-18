# Official bed-EC method: 1:1 by weight, EC pen — not the in-soil Pulse

2026-06-14. Adopted `measure-bed-ec.md` (1:1 soil:water by weight, read with a Bluelab EC pen) as the canonical bed-salinity method, and dropped the in-soil Bluelab Pulse as an absolute measure.

The in-soil Pulse reads bulk EC across water + air + particles → dominated by moisture at probe time, which floats and isn't recorded. That's a confound, not noise: it can't be error-barred and even anti-correlated with true salt (see [[pulse-in-soil-tracks-moisture-not-salt]]). The 1:1 slurry adds a large known dose of water, demoting the soil's residual moisture from the whole signal path to a bounded ~20% correction — and by **weight** (not eyeballed volume) that residual closes further. Tap (~0.10 mS/cm per the 2026-04 water test) is clean enough to ignore on saline beds — no blank, just a seasonal water-EC check — so distilled isn't required.

Canonical recorded value is **EC_1:1**; pore-water (the input the Ψ_osmotic model wants) is the derived estimate EC_1:1 × ~4 — never logged as data. The Pulse stays useful only for relative trend at a fixed moisture (container capacity), never an absolute. Cation ratios (f_Ca, Na) are out of scope here — they need a lab SME panel, not the pen.
