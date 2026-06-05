# Diagnostic-page image curation — tomato

**Date:** 2026-05-28
**Target:** `app/diagnostic/` symptom guide (13 tomato entries, `DIAG_DATA.tomato`).
**Goal:** attach one reference image per symptom so an operator can match what they see.
**Decision (Guillaume, 2026-05-28):** hybrid source, tomato first.

## Source-accuracy rule

A diagnostic image drives a real action (which dose to change). A wrong or
mismatched image is worse than none. So:

- **Own photos** (greenhouse) — preferred. Authentic cultivar + conditions, zero
  licence risk.
- **Open-licence reference** (Wikimedia CC) — only where the *pattern* is
  unambiguous and species-shape doesn't mislead. Per-file licence + attribution
  must be checked on download.
- **Extension pages** (Missouri Botanical Garden, UMN, RHS) — tomato-specific but
  all-rights-reserved → **link out only, never bundle**.
- **No AI-generated symptom images** — they encode plausible-but-wrong patterns.

## Sourcing reality (checked 2026-05-28)

- Tomato-specific, licence-clean exemplars covering all 13 entries do **not**
  exist in one CC repository.
- Wikimedia `Category:Diseases and disorders of plants due to nutritional
  deficiencies` has per-element subcats (Fe 11F, K 13F, Mg 3F, Mn 1F, Mo 5F,
  N 3F, P 7F, Zn 5F, Ca 5F) — but most files are grape / maize / citrus /
  cannabis, not tomato.
- **Conclusion:** the durable answer is our own photo library. We already own 5
  (`doc/symptoms-2026-05-21/`). Mid-crisis now = ideal time to photograph the
  rest. Link-out fills gaps until a clean photo exists.

## Per-entry manifest

Legend — **Source:** OWN = farm photo · CC = open-licence candidate · LINK =
extension link-out · GAP = no good image yet. **Cert** = match confidence 0–5.

| id | Cause (cert) | Source | Asset / candidate | Cert | Note |
|---|---|---|---|---:|---|
| `t-n` | N (5) | OWN | `symptoms-2026-05-21/PXL_20260521_172950014.jpg` | 4 | Lower-leaf senescence by truss — textbook fit. |
| `t-k` | K (5) | CC ✓ + OWN | `diagnostic-images/k-deficiency-tomato-leaf.jpg` (primary) · farm `172934654` (alt) | 4 | Tomato-specific Wikimedia leaf, verified. Cleaner than the ambiguous farm shot. |
| `t-ber` (BER) | Ca/BER (5) | CC ✓ | `diagnostic-images/ber-1-blossom-end-rot.jpg` (primary) · `ber-2-closeup.jpg` (closeup) | 5 | Tomato BER on vine, verified. Unambiguous. (`fruit` = location id; `t-ber` = symptom id.) |
| `t-mg` | Mg (5) | IRIIS ✓ | `diagnostic-images/mg-deficiency-tomato-leaf.jpg` | 5 | Tomato leaf, interveinal "sapin de Noël", verified. French MAPAQ credit. |
| `t-fe` | Fe (5) | LINK/GAP | extension link-out | — | Clean young-leaf interveinal. Photograph our apex (Fe likely at pH 7.4). |
| `t-mn` | Mn (4) | GAP | — | — | **Do NOT use `172634558`** — that is Mn *toxicity* (bronze speckling), opposite mechanism. Need a true Mn-*deficiency* image. |
| `t-zn` | Zn (4) | GAP/LINK | extension link-out | — | Rosette / tiny-leaf morphology — shape-dependent, photograph our own. |
| `t-cu` | Cu (3) | GAP | — | — | Rare; defer image until observed. |
| `t-b-apex` | B (4) | GAP/LINK | extension link-out | — | Apex death. |
| `t-p` | P (3) | GAP/LINK | extension link-out | — | Purple underside; our cultivar's anthocyanin response is muted (see `symptoms-2026-05-21/diagnosis.md`) — own photo preferred. |
| `t-mo` | Mo (3) | GAP | — | — | Rare; defer. |
| `t-b-fruit` | B (4) | IRIIS ✓ | `diagnostic-images/b-deficiency-tomato-fruit-corky.jpg` | 4 | Green fruit, copper-brown corky pedicel-zone lesion, verified. |
| `t-b-stem` | B (4) | GAP | — | — | Hollow stem cross-section — photograph if we cut one. |

## Recommendation

1. **Now (verified images in hand):** wire the 5 covered entries — `t-n`, `t-k`,
   `t-ber`, `t-mg`, `t-b-fruit`. → coder cascade.
2. **This week (crisis window):** photograph apex Fe, any Zn rosette, BER fruit,
   true Mn-deficiency leaf if found. Add to `doc/symptoms-YYYY-MM-DD/` with the
   same caption+diagnosis discipline, then wire.
3. **Gaps:** link out to one named extension page per remaining entry rather than
   embed a mismatched-species CC image.

## Lane / next step

Image *wiring* into `app/diagnostic/page.html` + `logic.js` (e.g. an optional
`image` field per symptom + render block) is **coder lane**, routed via
team-leader. This manifest is the sourcing + cert input for that cascade.
