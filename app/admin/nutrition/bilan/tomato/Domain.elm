module Domain exposing
    ( SideDressDoses
    , sideDressRecipe
    )

{-| Bilan tomate — domain model.

Side-dress pipeline, pure:
yield (kg/m²/sem) → plantUptake → soilMaintenanceDose
→ deductCompostContribution → productsForGap.

First three stages speak ElementDoses (mg/m²/sem per element);
the last returns SideDressDoses (g/planche/sem per product).

-}

import Compost
import Tomato exposing (Dose, ElementDoses, plantUptake)
import TomatoSoil exposing (soilMaintenanceDose)


-- DOMAIN RECORDS


zeroElementDoses : ElementDoses
zeroElementDoses =
    let
        zero =
            Dose 0
    in
    { n = zero, p = zero, k = zero, ca = zero, mg = zero
    , fe = zero, mn = zero, zn = zero, cu = zero, b = zero, mo = zero
    }


type alias SideDressDoses =
    { farinePlumesGramsPerBedPerWeek : Float
    , alfalfaMealGramsPerBedPerWeek : Float
    , actisolGramsPerBedPerWeek : Float
    }


zeroSideDressDoses : SideDressDoses
zeroSideDressDoses =
    { farinePlumesGramsPerBedPerWeek = 0
    , alfalfaMealGramsPerBedPerWeek = 0
    , actisolGramsPerBedPerWeek = 0
    }



-- PIPELINE


{-| Remaining gap after compost release.

Compost supplies five elements; the other six pass through untouched.
A compost surplus on one element is not a credit against any other, so
each element floors at zero.
-}
deductCompostContribution : ElementDoses -> ElementDoses
deductCompostContribution doses =
    let
        release =
            Compost.releasePerWeek

        remaining dose releaseMgPerM2PerWeek =
            Dose (max 0 (dose.mgPerM2PerWeek - releaseMgPerM2PerWeek))
    in
    { doses
        | n = remaining doses.n release.n
        , p = remaining doses.p release.p
        , k = remaining doses.k release.k
        , ca = remaining doses.ca release.ca
        , mg = remaining doses.mg release.mg
    }


{-| Product doses covering the gap. -}
productsForGap : ElementDoses -> SideDressDoses
productsForGap _ =
    zeroSideDressDoses


sideDressRecipe : Float -> SideDressDoses
sideDressRecipe yieldKgPerM2PerWeek =
    yieldKgPerM2PerWeek
        |> plantUptake
        |> soilMaintenanceDose
        |> deductCompostContribution
        |> productsForGap
