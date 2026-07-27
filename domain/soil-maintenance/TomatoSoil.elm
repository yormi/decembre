module TomatoSoil exposing (soilMaintenanceDose)

import PoolMaintenance exposing (Band)
import Tomato exposing (Dose, ElementDoses)


type alias PoolPpm =
    { p : Float
    , k : Float
    , ca : Float
    , mg : Float
    , mn : Float
    , zn : Float
    , cu : Float
    }


currentMehlich3Ppm : PoolPpm
currentMehlich3Ppm =
    { p = 278.85
    , k = 1059.2
    , ca = 5494.55
    , mg = 823.15
    , mn = 50.7
    , zn = 11.5
    , cu = 4.6
    }


soilMaintenanceDose : ElementDoses -> ElementDoses
soilMaintenanceDose uptake =
    let
        pool =
            currentMehlich3Ppm

        band =
            PoolMaintenance.poolNutrientBandInPpm

        magnesiumBandPpm =
            PoolMaintenance.magnesiumWindowPpm pool.ca pool.k

        poolForming elementBand currentPpm dose =
            Dose (PoolMaintenance.poolDose elementBand currentPpm dose.mgPerM2PerWeek)

        potassiumDose =
            max
                (PoolMaintenance.poolDose band.k pool.k uptake.k.mgPerM2PerWeek)
                (PoolMaintenance.intensityFloor uptake.k.mgPerM2PerWeek)

        soilCovered =
            Dose 0
    in
    { n = uptake.n
    , p = poolForming band.p pool.p uptake.p
    , k = Dose potassiumDose
    , ca = poolForming band.ca pool.ca uptake.ca
    , mg = poolForming magnesiumBandPpm pool.mg uptake.mg
    , fe = soilCovered
    , mn = poolForming band.mn pool.mn uptake.mn
    , zn = poolForming band.zn pool.zn uptake.zn
    , cu = poolForming band.cu pool.cu uptake.cu
    , b = uptake.b
    , mo = soilCovered
    }
