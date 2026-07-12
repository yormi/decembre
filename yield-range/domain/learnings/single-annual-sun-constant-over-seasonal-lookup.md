# Single annual sun constant chosen over seasonal lookup

Seasonal DLI lookup considered (winter ~10 mol/m²/d outdoor → summer
~50 mol/m²/d). Rejected for the v1 surface — operators planning
cohort cycles run on annual-average expectations; the seasonal lookup
adds an axis (sow date) that compounds with `ledHours` and tray
choice without delivering matching planning value at current Décembre
scale. If a "when in the year do I sow X" optimizer ever lands, the
seasonal lookup can be added on top.
