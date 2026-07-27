module Tomato exposing (Dose, ElementDoses, plantUptake)


type alias Dose =
    { mgPerM2PerWeek : Float }


type alias ElementDoses =
    { n : Dose
    , p : Dose
    , k : Dose
    , ca : Dose
    , mg : Dose
    , fe : Dose
    , mn : Dose
    , zn : Dose
    , cu : Dose
    , b : Dose
    , mo : Dose
    }


type alias Elements =
    { n : Float
    , p : Float
    , k : Float
    , ca : Float
    , mg : Float
    , fe : Float
    , mn : Float
    , zn : Float
    , cu : Float
    , b : Float
    , mo : Float
    }


fruitExportMgPerKg : Elements
fruitExportMgPerKg =
    { n = 1620
    , p = 264
    , k = 2400
    , ca = 75
    , mg = 142.5
    , fe = 6
    , mn = 3
    , zn = 1.8
    , cu = 0.6
    , b = 1.8
    , mo = 0.03
    }


biomassMgT5 : Elements
biomassMgT5 =
    { n = 1620
    , p = 264
    , k = 2400
    , ca = 2138
    , mg = 641
    , fe = 6
    , mn = 3
    , zn = 1.8
    , cu = 0.6
    , b = 1.8
    , mo = 0.03
    }


plantUptake : Float -> ElementDoses
plantUptake yieldKgPerM2PerWeek =
    let
        fruit =
            fruitExportMgPerKg

        biomass =
            biomassMgT5

        uptake fruitExportPerKg biomassAtT5 =
            Dose (fruitExportPerKg * yieldKgPerM2PerWeek + biomassAtT5)
    in
    { n = uptake fruit.n biomass.n
    , p = uptake fruit.p biomass.p
    , k = uptake fruit.k biomass.k
    , ca = uptake fruit.ca biomass.ca
    , mg = uptake fruit.mg biomass.mg
    , fe = uptake fruit.fe biomass.fe
    , mn = uptake fruit.mn biomass.mn
    , zn = uptake fruit.zn biomass.zn
    , cu = uptake fruit.cu biomass.cu
    , b = uptake fruit.b biomass.b
    , mo = uptake fruit.mo biomass.mo
    }
