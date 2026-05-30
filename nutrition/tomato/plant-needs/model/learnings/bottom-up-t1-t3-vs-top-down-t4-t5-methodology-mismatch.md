# Bottom-up T1-T3 vs top-down T4-T5 — methodology mismatch

T1-T3 derive from Haifa F-144 (kg/ha/day tables, ~20 % QC winter
discount). T4-T5 anchor top-down off `TOMATO_REMOVAL` at 1.5 kg/m²/wk
minus fruit export. The two approaches can drift if Haifa is updated
without re-checking the T5 anchor or vice versa. Spot-check at boundary
transitions when retuning either table.
