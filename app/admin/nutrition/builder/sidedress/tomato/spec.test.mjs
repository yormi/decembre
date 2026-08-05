// Retired 2026-07-18. The predicted soil-root-zone CE/pH strip was removed
// from the sidedress bilan block (Guillaume) — sidedress is granular, does not
// tank-mix, and had no first-principles soil-CE model (the value was pinned at
// the band midpoint). `predicted-ph-ce-shown-on-builder-blocks` still applies
// to the fertigation + foliar builder blocks, which retain their predicted CE.
//
// This suite intentionally holds no assertions; restore from git history if a
// real soil-root-zone CE derivation ships later.

import { test } from 'node:test';

test('sidedress predicted-CE strip retired 2026-07-18', () => {});
