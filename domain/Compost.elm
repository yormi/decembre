module Compost exposing (Release, releasePerWeek)

{-| Compost contribution — Savaria ORGANIMIX marin.

Applied fall 2025 across all production beds, tomato and lettuce alike,
so this module is crop-agnostic.

Everything is mg/m²/week, matching plant uptake — no unit conversion
anywhere in the pipeline.

Year-1 mineralization only. That window closes fall 2026; see
`validUntil`.

Organic status: CAN/CGSB-32.311 §4.2 (organic shrimp + lime) — allowed.

-}


{-| The five elements compost supplies. The other six the plant needs
(Fe, Mn, Zn, Cu, B, Mo) get no compost credit at all, which is why they
are absent here rather than present as zeros.
-}
type alias Release =
    { n : Float
    , p : Float
    , k : Float
    , ca : Float
    , mg : Float
    }


{-| Product label percentages (mass fraction). K and P are already
converted from oxide (K₂O × 0.83, P₂O₅ × 0.437).

Mg is NOT declared on the label — 0.3% is a low-end assumption for a
shrimp-base compost, and the least trustworthy number in this module.
-}
labelFraction : Release
labelFraction =
    { n = 0.005
    , p = 0.000437
    , k = 0.00083
    , ca = 0.011
    , mg = 0.003
    }


{-| Share of each element that mineralizes during year 1.

P is low because it stays pH-locked at the current root-zone pH; that
lockout is already baked in here rather than applied downstream.
-}
year1MineralizedFraction : Release
year1MineralizedFraction =
    { n = 0.30
    , p = 0.05
    , k = 0.65
    , ca = 0.60
    , mg = 0.30
    }


{-| Applied rate, mg/m². Roughly two inches over the beds.
-}
appliedMgPerM2 : Float
appliedMgPerM2 =
    25400000


{-| Q10 multiplier: mineralization roughly doubles per 10 °C, and
greenhouse soil during the T3-T5 window runs above the annual mean.
-}
seasonalFactor : Float
seasonalFactor =
    1.5


weeksPerYear : Float
weeksPerYear =
    52


{-| The season through which year-1 rates hold. Past this, the residual
pool is more recalcitrant than year-1 rates assume and this module will
overstate release. Re-measure with Mehlich-3 rather than extrapolating.
-}
validUntil : String
validUntil =
    "2026-fall"


{-| Conservative Mg substitute for the derived value.

The derivation yields ~659 mg/m²/week, but it rests entirely on the
assumed label fraction above. Held down to 500 until a vendor assay or
a soil test replaces the assumption.
-}
mgConservativeMgPerM2PerWeek : Float
mgConservativeMgPerM2PerWeek =
    500


{-| Weekly plant-available release, mg/m²/week.
-}
releasePerWeek : Release
releasePerWeek =
    let
        derive labelPart mineralizedPart =
            appliedMgPerM2
                * labelPart
                * mineralizedPart
                / weeksPerYear
                * seasonalFactor
    in
    { n = derive labelFraction.n year1MineralizedFraction.n
    , p = derive labelFraction.p year1MineralizedFraction.p
    , k = derive labelFraction.k year1MineralizedFraction.k
    , ca = derive labelFraction.ca year1MineralizedFraction.ca
    , mg = mgConservativeMgPerM2PerWeek
    }
