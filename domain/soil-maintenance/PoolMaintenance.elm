module PoolMaintenance exposing
    ( Band
    , intensityFloor
    , magnesiumWindowPpm
    , poolDose
    , poolNutrientBandInPpm
    )

import Concentration


type alias Band =
    { lowPpm : Float
    , highPpm : Float
    }


ppmToMgPerM2 : Float
ppmToMgPerM2 =
    200


horizonDays : Float
horizonDays =
    100


buildOverMaintenance : Float
buildOverMaintenance =
    0.25


potassiumIntensityFloorFraction : Float
potassiumIntensityFloorFraction =
    0.20


poolNutrientBandInPpm :
    { k : Band
    , p : Band
    , ca : Band
    , mg : Float -> Float -> Band
    , mn : Band
    , zn : Band
    , cu : Band
    }
poolNutrientBandInPpm =
    { k = { lowPpm = 200, highPpm = 250 }
    , p = { lowPpm = 31, highPpm = 40 }
    , ca = { lowPpm = 1000, highPpm = 2000 }
    , mg = magnesiumWindowPpm
    , mn = { lowPpm = 20, highPpm = 50 }
    , zn = { lowPpm = 10, highPpm = 50 }
    , cu = { lowPpm = 0.5, highPpm = 3 }
    }


magnesiumAbsoluteFloorMeq : Float
magnesiumAbsoluteFloorMeq =
    0.4


magnesiumWindowPpm : Float -> Float -> Band
magnesiumWindowPpm calciumPpm potassiumPpm =
    let
        chargeOf cation ppm =
            (Concentration.toCharge cation { ppm = ppm }).meqPer100gSoil

        magnesiumPpmFor meqPer100gSoil =
            (Concentration.toMass Concentration.Magnesium
                { meqPer100gSoil = meqPer100gSoil }
            ).ppm

        calciumMeq =
            chargeOf Concentration.Calcium calciumPpm

        potassiumMeq =
            chargeOf Concentration.Potassium potassiumPpm

        lowMeq =
            max (max (calciumMeq / 8) (potassiumMeq / 2))
                magnesiumAbsoluteFloorMeq

        highMeq =
            max (calciumMeq / 6) lowMeq
    in
    { lowPpm = magnesiumPpmFor lowMeq
    , highPpm = magnesiumPpmFor highMeq
    }


poolDose : Band -> Float -> Float -> Float
poolDose band currentPpm uptakeMgPerM2PerWeek =
    let
        drawdownPpmPerDay =
            uptakeMgPerM2PerWeek / ppmToMgPerM2 / 7

        poolAtHorizonPpm =
            currentPpm - drawdownPpmPerDay * horizonDays

        floorPpm =
            (band.lowPpm + band.highPpm) / 2
    in
    if poolAtHorizonPpm < floorPpm then
        uptakeMgPerM2PerWeek * (1 + buildOverMaintenance)

    else
        0


intensityFloor : Float -> Float
intensityFloor uptakeMgPerM2PerWeek =
    potassiumIntensityFloorFraction * uptakeMgPerM2PerWeek
