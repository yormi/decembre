# Soil contribution — domain

How the soil nutrient bank behaves: which nutrients hold a stable
Mehlich-3 pool the fertigation model can steer, and which move too
fast to bank.


## Scope

This model keeps the **soil pools** healthy — each pool-forming
nutrient held in its Mehlich-3 optimal band. It assumes two things
are handled by separate protocols:

- Plant sufficiency (is the crop actually fed?) → tissue-testing
  protocol.

- Root-zone pH / lockout → soil-pH protocol.

So a pool sitting in-band here does **not** by itself claim the crop
is fed — that check lives in the tissue protocol.


## Nutrient mobility

Mobility decides whether a nutrient forms a Mehlich-3 pool worth
steering. Mobile nutrients leach instead of banking, so the
pool-control law excludes them — they are dosed to removal + tissue
instead.

| Nutrient | Mobility |
|---|---|
| N (nitrate) | mobile — leaches, no stable pool |
| B (borate) | mobile — weakly held, leaches |
| S (sulfate) | mobile — leaches |
| Mo (molybdate) | mobile — anion, leaches |
| Mg | semi-mobile — held on the CEC but leaches faster than Ca / K |

Pool-forming, steerable by the M3 law: **K, Ca, P, Fe, Mn, Zn, Cu**.

The dosing method that uses this split → `/domain/soil-maintenance.md`.
