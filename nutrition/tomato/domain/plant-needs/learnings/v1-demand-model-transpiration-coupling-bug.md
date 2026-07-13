# v1 demand model — transpiration coupling bug

Pre-ca-mg-biomass-transpiration-coupled (applied 2026-05-09), the biomass term for every element was
multiplied by `transpFactor`. This over-scaled phloem-mobile N/P/K and
active-transport micros, which don't track instantaneous transpiration
over weekly windows. Single biggest design bug in v1.
