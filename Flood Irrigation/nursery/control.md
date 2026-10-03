# Nursery control — Orisha hardware, sensors, relays, drain-valve power (weeks 1–4)


## Hardware

- **Fill (per zone):**
    - Orisha output
    → relais 24 V
    → Orisha fill valve (`water-supply.md` § Zone line lib)
- **Drain (all zones together):**
    - Orisha output
    → relais 24 V
    → contactor coil
    → contactor switches the PSU bus (§ Drain-valve power)
    → all 63 drain valves

| Item | Qty | Note |
|---|---|---|
| Orisha irrigation automation | 2 | |
| Orisha fill valve 1 po FPT × FPT | 5 | 1/zone (wk 1, 2, 3, 4a, 4b); supplied by Orisha |
| Orisha tensiometer 6" mini | 4 | 1 per rack zone (wk 1, 2, 3, 4) |
| [Relais 24 V](https://www.amazon.ca/DPDT-Electromagnetic-Power-Relay-Socket/dp/B00K82ZBJA) | 6 | 1/zone fill valve + 1 contactor coil |

## Drain-valve power

- **Drain-valve power:**
    - PSU 24 V, plug cut off, leads stripped (polarity checked with a multimeter)
    → + lead on the contactor input stud (ring terminal)
    → contactor output stud → WAGO 221-415 chain → + of each rack run (fil 18/2)
    → − lead → WAGO 221-415 chain → − of each rack run
    → drain valves

| Item | Qty | Note |
|---|---|---|
| [PSU 24 V / 10 A 240 W](https://www.amazon.ca/Adapter-100-240V-Portable-Transformers-Security/dp/B0CDWHH2T3) | 1 | 59 × 2 W (new ¾ in) + 4 SS × 5 W moving at once ≈ 6 A; mount dry |
| Fil 18/2 | 300 ft | 2-wire valves |
| [WAGO 221, 90-pack](https://www.amazon.ca/Compact-Splicing-Connector-Assortment-221-2401/dp/B0BN6MBR7X) | 2 | |

## Total

| Block | $ CA |
|---|---|
| Orisha irrigation automation × 2 | ~2 400 |
| Tensiometers × 4 | ~400 |
| Relays | ~90 |
| Drain-valve power | ~290 |
| **Nursery control** | **~3 180** |
