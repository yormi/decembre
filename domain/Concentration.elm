module Concentration exposing
    ( Cation(..)
    , ChargeConcentration
    , MassConcentration
    , toCharge
    , toMass
    )


type alias MassConcentration =
    { ppm : Float }


type alias ChargeConcentration =
    { meqPer100gSoil : Float }


type Cation
    = Calcium
    | Magnesium
    | Potassium


gramsPerEquivalent : Cation -> Float
gramsPerEquivalent cation =
    case cation of
        Calcium ->
            20.0

        Magnesium ->
            12.2

        Potassium ->
            39.1


gramsPerKilogram : Float
gramsPerKilogram =
    1000


soilTestBasisGrams : Float
soilTestBasisGrams =
    100


kilogramToSoilTestBasis : Float
kilogramToSoilTestBasis =
    soilTestBasisGrams / gramsPerKilogram


toCharge : Cation -> MassConcentration -> ChargeConcentration
toCharge cation massConcentration =
    let
        milligramsPer100gSoil =
            massConcentration.ppm * kilogramToSoilTestBasis
    in
    { meqPer100gSoil = milligramsPer100gSoil / gramsPerEquivalent cation }


toMass : Cation -> ChargeConcentration -> MassConcentration
toMass cation chargeConcentration =
    let
        milligramsPer100gSoil =
            chargeConcentration.meqPer100gSoil * gramsPerEquivalent cation
    in
    { ppm = milligramsPer100gSoil / kilogramToSoilTestBasis }
