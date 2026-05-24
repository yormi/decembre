# Foliar strategy — Tomato

The plan and weekly procedure for foliar-feeding the tomato
crop: which mixes to spray, how many times each, on which days.

> **Note:** subproject directory is still named `foliar-recipe/`
> at the time of writing; rename to `foliar-strategy/` is
> approved and pending coordination with the in-flight model
> session. Vocabulary below uses the post-rename terms.

## Language

### Strategy structure

**Foliar strategy**:
The tomato crop's foliar-feeding plan as a whole — the set of
recipes the model recommends, the per-recipe cadence, and the
resulting weekly schedule. One per crop.
_Avoid_: foliar program, foliar plan, foliar protocol.

**Foliar recipe**:
One tank's mix — products, dose, surfactant flag. Many recipes
per strategy. Each recipe is REQ-029-clean: ions in one recipe
must not precipitate with the recipe's own product set in-tank.
_Avoid_: spray mix, tank recipe, foliar formula, oligo mix.

**Spray**:
One execution of a recipe on a specific day. The strategy
generates a weekly list of sprays — e.g. *Monday: oligo. Wednesday: Ca. Friday: Ca.*
_Avoid_: application, spray event, execution, treatment.

### Constraints

**Weekly leaf-tolerance cap**:
The maximum number of times a recipe may be sprayed in one week
before cumulative cuticle damage / burn risk becomes
unacceptable. Per-recipe. Bounds the model's optimal cadence
even when a nutrient gap could absorb more sprays.
_Avoid_: cuticle cap, burn cap, spray cap, weekly cap.

**Farm working days**:
The set of weekdays Décembre's operator is on-farm and may run
sprays. Currently Mon-Fri. The strategy spreads sprays across
these days only.
_Avoid_: spray days, available days, work week, schedule days.

## Example

> *Jordane:* "What am I spraying this week?"
>
> *Strategy:* "Three sprays. Monday — oligo recipe. Wednesday —
> Ca recipe. Friday — Ca recipe."
>
> *Jordane:* "Why two Ca?"
>
> *Strategy:* "Canopy Ca gap is 315 mg/m²/wk. Each Ca spray
> delivers about 28. Two gets you to 56 — closes ~18 %. A third
> would help but the weekly leaf-tolerance cap on the Ca recipe
> is two — third spray risks burn."
>
> *Jordane:* "Can I move Wednesday to Saturday?"
>
> *Strategy:* "No — Saturday isn't a farm working day."

## Flagged ambiguities

None currently.
