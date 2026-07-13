# strategy — per-crop season strategy

Farm-level nutrition strategy, above the per-subproject spec tree:
what's binding, what we're aiming for, in what order. One sub-dir
per crop.

- `tomato/` — tomato nutrition strategy: goal, problem, and the
  sequenced guiding policies (`sg1` free-P → `sg2` nitrogen →
  `sg3` calcium).

- `lettuce/` — salanova yield-recovery strategy (60 → 200 kg/bed),
  Rumelt kernel (diagnosis → guiding policy → coherent action) +
  dated diagnostic evidence.

Mechanism/setpoints live in each crop's `nutrition/<crop>/domain/`;
farm gestures in `nutrition/<crop>/protocol/`.
