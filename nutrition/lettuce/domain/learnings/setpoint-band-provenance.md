# Setpoint band provenance + validation status

Provenance for the lettuce climate/soil setpoint bands in `../domain.md` — kept out of the domain file, which states truths only.

## EC/pH are method-specific

- Pour-through, Bluelab Pulse, and 1:1 soil:water each read EC/pH on **their own scale** — the absolute numbers are **not interconvertible**, and none equals a lab saturated-paste or 1:2 reading.

- The domain rows are method-tagged for this reason; a band is only meaningful with its method.

## Weakest number — bed EC on the Bluelab Pulse

- The bed `Soil EC (Bluelab Pulse)` band (1.5, 1.2–2.0) was **carried over from saturated-paste norms**, not measured on the Pulse. The Pulse's direct-soil scale differs.

- **Action:** take paired Pulse + lab readings on the beds, then reset the band to the real Pulse scale. Treat the current band as a placeholder until then. **Caveat (2026-06-13):** no *constant* offset exists while soil moisture floats — the in-soil Pulse tracks moisture, not salt. Pair only at a fixed moisture (container capacity). See `pulse-in-soil-tracks-moisture-not-salt.md`.
