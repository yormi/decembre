# Rejected: blend optimization (mixed-product per-stage dose)

`computeStageSidedress(stage, product)` takes one product per call by
design. Mixed-product weighting (e.g. 60 % FarinePlumes + 40 %
AlfalfaMeal for N-with-K-trickle) was considered and rejected:
(a) operator weighs one product per planche per week — two-bag mixing
adds reliability risk vs. N-gap-coverage benefit that's nil at current
chemistry (FarinePlumes is N-only by label, Eco-luzerne adds
negligible K ~0.4 % elemental per the 3-0.5-2 label);
(b) the mass-balance simplifies to two independent runs summed if a
future blend ever becomes useful — no model-shape lock-in. If a
Ca-free K-bearing organic-N product surfaces, revisit. Until then,
single-product per call stays.
