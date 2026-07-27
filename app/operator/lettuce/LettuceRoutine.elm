port module LettuceRoutine exposing (main)

{-| Routine laitue — Elm island (route #laitue).

Operator day-checklist for the continuous 10-ft R&D machine. This module
is the canonical routine — there is no separate protocol doc behind it.
Auto-opens on today's weekday (or the next task day); tap a task to
reveal its numbers; tap the box to tick it off (kept for the week).

View + static data only. No model math.

-}

import Browser
import Html exposing (Html, a, button, div, span, text)
import Html.Attributes exposing (class, classList, href, id, style)
import Html.Events exposing (onClick, stopPropagationOn)
import Json.Decode as Decode
import Set exposing (Set)
import Svg exposing (Svg)
import Svg.Attributes as SA
import Task
import Time



-- MODEL


type Day
    = Lun
    | Mer
    | Ven


{-| The physical locations a plant passes through, in order. Two germination
entries share the rack but differ by light status.
-}
type Location
    = Sowing
    | GermOff
    | GermOn
    | GrowthRack
    | GreenhouseW3
    | GreenhouseW4
    | GreenhouseW5
    | Bed
    | Harvest


{-| A step's visual: a diagram location, or a bare emoji for actions with
no station of their own.
-}
type Vis
    = L Location
    | E String


type alias Step =
    { key : String
    , stamp : String

    -- The action drawn with the diagram's own glyphs: [from, to] for a
    -- transfer, [where] for an in-place action.
    , visual : List Vis
    , verb : String

    -- Un-bulleted lead-in shown above the lines. "" to omit.
    , intro : String
    , lines : List String
    , targets : List ( String, String )
    }


type alias Model =
    { selected : Day
    , today : Maybe Day

    -- The day came from the URL, so the clock must not override it.
    , pinned : Bool
    , expanded : Set String
    , done : Set String
    }


{-| Sends the picked day to the host router, which keeps it in the hash. -}
port persistDay : String -> Cmd msg


{-| Asks the host to (re)draw the supplemental-LED table into the slot the
light card renders. Fired each time that card opens, because Elm discards
the slot on collapse. -}
port renderLight : () -> Cmd msg


{-| Sends the ticked steps to localStorage. The host stamps them with the
current week, so the list comes back empty from Monday 00:00. -}
port persistDone : List String -> Cmd msg


{-| `day` = the day segment already in the URL; `done` = steps ticked
earlier THIS week (the host already dropped any older week). -}
type alias Flags =
    { day : Maybe String
    , done : List String
    }


init : Flags -> ( Model, Cmd Msg )
init flags =
    let
        fromUrl =
            Maybe.andThen dayFromSlug flags.day
    in
    ( { selected = Maybe.withDefault Ven fromUrl
      , today = Nothing
      , pinned = fromUrl /= Nothing
      , expanded = Set.empty
      , done = Set.fromList flags.done
      }
    , Task.perform GotZoneTime (Task.map2 Tuple.pair Time.here Time.now)
    )


daySlug : Day -> String
daySlug d =
    case d of
        Lun ->
            "lundi"

        Mer ->
            "mercredi"

        Ven ->
            "vendredi"


dayFromSlug : String -> Maybe Day
dayFromSlug slug =
    case slug of
        "lundi" ->
            Just Lun

        "mercredi" ->
            Just Mer

        "vendredi" ->
            Just Ven

        _ ->
            Nothing



-- UPDATE


type Msg
    = GotZoneTime ( Time.Zone, Time.Posix )
    | Select Day
    | ToggleExpand String
    | ToggleDone String
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotZoneTime ( zone, now ) ->
            let
                weekday =
                    Time.toWeekday zone now
            in
            ( { model
                | selected =
                    if model.pinned then
                        model.selected

                    else
                        nextTaskDay weekday
                , today = exactTaskDay weekday
              }
            , Cmd.none
            )

        Select d ->
            ( { model | selected = d, pinned = True }, persistDay (daySlug d) )

        ToggleExpand k ->
            let
                expanded =
                    toggle k model.expanded
            in
            ( { model | expanded = expanded }
            , if k == lightStepKey && Set.member k expanded then
                renderLight ()

              else
                Cmd.none
            )

        ToggleDone k ->
            let
                done =
                    toggle k model.done
            in
            ( { model | done = done }, persistDone (Set.toList done) )

        NoOp ->
            ( model, Cmd.none )


toggle : String -> Set String -> Set String
toggle k s =
    if Set.member k s then
        Set.remove k s

    else
        Set.insert k s


{-| Today when it is itself a task day, else the next one coming up. -}
nextTaskDay : Time.Weekday -> Day
nextTaskDay wd =
    case wd of
        Time.Mon ->
            Lun

        Time.Tue ->
            Mer

        Time.Wed ->
            Mer

        Time.Thu ->
            Ven

        Time.Fri ->
            Ven

        _ ->
            Lun


{-| Only set when today IS a task day — drives the "•" marker. -}
exactTaskDay : Time.Weekday -> Maybe Day
exactTaskDay wd =
    case wd of
        Time.Mon ->
            Just Lun

        Time.Wed ->
            Just Mer

        Time.Fri ->
            Just Ven

        _ ->
            Nothing



-- DATA — the canonical weekly routine


stepsFor : Day -> List Step
stepsFor day =
    case day of
        Ven ->
            vendredi

        Lun ->
            lundi

        Mer ->
            mercredi


vendredi : List Step
vendredi =
    [ Step "v-peser"
        ""
        [ L Bed ]
        "Peser plants en planche"
        "Peser 2 plants représentatifs de leur génération"
        [ "Un qui sera récolté cette semaine."
        , "Un qui sera récolté la semaine prochaine."
        ]
        []
    , Step "v-recolte"
        ""
        [ L Bed, L Harvest ]
        "Récolter avant 8h"
        ""
        [ "Récolter les plants en planche depuis 2 semaines."
        , "Peser la récolte."
        ]
        []
    , Step "v-transplant"
        ""
        [ L GreenhouseW5, L Bed ]
        "Transplanter semis"
        ""
        [ "Mesurer CE 1:1 + pH 1:1."
        , "Fertiliser avec la farine de plume."
        , "Drench pots 2,5 po."
        , "Drench planche."
        , "Transplanter en 4 rangs × 6 po."
        ]
        []
    , Step "v-damier"
        ""
        [ L GreenhouseW4, L GreenhouseW5 ]
        "Espacer les semis"
        ""
        [ "Espacer les semis en enlevant 1 plant sur 2 des plateaux."
        , "Faire un pattern comme un échiquier."
        , "Mettre les plants enlevés dans de nouveaux plateaux."
        , "Mettre tous ces plateaux sur la table semaine 5."
        ]
        []
    , Step "v-remonter"
        ""
        [ L GreenhouseW3, L GreenhouseW4 ]
        "Déplacer les semis"
        ""
        []
        []
    , Step "v-serre"
        ""
        [ L GrowthRack, L GreenhouseW3 ]
        "Entrer en serre"
        ""
        []
        []
    , Step "v-t5"
        ""
        [ L GermOn, L GrowthRack ]
        "Changer de rack"
        ""
        []
        []
    , Step "v-semer"
        ""
        [ L Sowing, L GermOff ]
        "Semis → Rack, LED OFF"
        ""
        [ "Semer 3 plateaux."
        , "Plateaux de 32 pots de 2,5 po."
        , "Mettre thermomètre dans substrat d'un pot témoin."
        , "Alerter Guillaume si température en dehors de 18 à 21 °C."
        , "Éteindre les LED."
        , "Ne pas fertiguer les plants dans le rack de germination."
        , "Eau plate seulement."
        ]
        []
    ]


lundi : List Step
lundi =
    [ Step "l-germ"
        ""
        [ L GermOff, L GermOn ]
        "Allumer LED"
        ""
        []
        []
    , Step "l-lumiere"
        "1er lundi du mois"
        [ E "💡" ]
        "Ajuster LED serre pour le mois"
        "Ajuster Orisha avec :"
        []
        []
    ]


{-| Steps that point at another page. Keyed by step key so the Step
constructor stays flat.
-}
stepLinks : String -> List ( String, String )
stepLinks key =
    case key of
        "v-peser" ->
            [ ( "Entrer données ici", "https://docs.google.com/spreadsheets/d/1Y-kIn3a3MMxpns7jsDiBQwGIRSaf2InWFMgYprV8UYM/edit?gid=620360155#gid=620360155" ) ]

        "v-recolte" ->
            [ ( "Entrer données ici", "https://docs.google.com/spreadsheets/d/1Y-kIn3a3MMxpns7jsDiBQwGIRSaf2InWFMgYprV8UYM/edit?gid=620360155#gid=620360155" ) ]

        "v-transplant" ->
            [ ( "Entrer données ici", "https://docs.google.com/spreadsheets/d/1Y-kIn3a3MMxpns7jsDiBQwGIRSaf2InWFMgYprV8UYM/edit?gid=620360155#gid=620360155" )
            , ( "Recette farine de plume →", "#sol/lettuce" )
            ]

        "m-mesure" ->
            [ ( "Entrer données ici", "https://docs.google.com/spreadsheets/d/1Y-kIn3a3MMxpns7jsDiBQwGIRSaf2InWFMgYprV8UYM/edit?gid=2053664587#gid=2053664587" ) ]

        _ ->
            []


mercredi : List Step
mercredi =
    [ Step "m-mesure"
        ""
        [ L GrowthRack ]
        "Mesurer chaque génération en plateau"
        "Pour les générations agées de 0 à 4 semaines :"
        [ "Peser un semis représentatif"
        , "Pour-through CE"
        , "Pour-through pH"
        ]
        []
    ]



-- LOCATION JOURNEY — the path a plant travels, sowing → harvest


journey : List Location
journey =
    [ Sowing, GermOff, GermOn, GrowthRack, GreenhouseW3, GreenhouseW4, GreenhouseW5, Bed, Harvest ]



-- VIEW


view : Model -> Html Msg
view model =
    div []
        [ journeyPath
        , dayTabs model
        , div [] (List.map (stepCard model) (stepsFor model.selected))
        ]


{-| Short label for the circle node (the long form lives in the modal).
-}
locationShort : Location -> String
locationShort loc =
    case loc of
        Sowing ->
            "Semis"

        GermOff ->
            "Germ OFF"

        GermOn ->
            "Germ ON"

        GrowthRack ->
            "Rack semaine 2"

        GreenhouseW3 ->
            "Serre S3"

        GreenhouseW4 ->
            "Serre S4"

        GreenhouseW5 ->
            "Damier"

        Bed ->
            "Planche"

        Harvest ->
            "Récolte"


{-| Serpentine path: row 0 left→right, row 1 right→left, row 2 left→right.
Arrows link consecutive stations and carry the transfer day.
-}
journeyPath : Html Msg
journeyPath =
    div
        [ class "card"
        , style "padding" "16px 12px"
        , style "margin-bottom" "14px"
        ]
        [ Svg.svg
            [ SA.viewBox "0 0 500 670"
            , SA.width "100%"
            , style "max-width" "440px"
            , style "display" "block"
            , style "margin" "0 auto"
            ]
            (zoneBands
                ++ (arrowMarker :: List.map segEl segments)
                ++ List.concatMap nodeEl journey
            )
        ]


{-| Background bands + captions identifying where each row happens:
row 1 in the nursery, rows 2–3 in the greenhouse (on tables, then in beds).
-}
zoneBands : List (Svg Msg)
zoneBands =
    [ regionRect 14 30 472 196 "rgba(120,132,150,0.22)" "rgba(120,132,150,0.45)"
    , regionRect 14 250 472 400 "rgba(34,160,94,0.16)" "rgba(34,160,94,0.40)"
    , caption 32 50 13 "PÉPINIÈRE"
    , caption 32 272 13 "SERRE"
    ]


regionRect : Float -> Float -> Float -> Float -> String -> String -> Svg Msg
regionRect x y w h fill stroke =
    Svg.rect
        [ SA.x (String.fromFloat x)
        , SA.y (String.fromFloat y)
        , SA.width (String.fromFloat w)
        , SA.height (String.fromFloat h)
        , SA.rx "12"
        , SA.fill fill
        , SA.stroke stroke
        , SA.strokeWidth "1"
        ]
        []


caption : Float -> Float -> Float -> String -> Svg Msg
caption x y size txt =
    Svg.text_
        [ SA.x (String.fromFloat x)
        , SA.y (String.fromFloat y)
        , SA.fontSize (String.fromFloat size)
        , SA.fontWeight "700"
        , SA.textAnchor "start"
        , SA.dominantBaseline "central"
        , SA.fill "var(--text-muted)"
        ]
        [ Svg.text txt ]


arrowMarker : Svg Msg
arrowMarker =
    Svg.defs []
        [ Svg.marker
            [ SA.id "arrowhead"
            , SA.markerWidth "7"
            , SA.markerHeight "7"
            , SA.refX "5.5"
            , SA.refY "3.5"
            , SA.orient "auto"
            , SA.markerUnits "userSpaceOnUse"
            ]
            [ Svg.polygon [ SA.points "0,0 7,3.5 0,7", SA.fill "var(--text-muted)", SA.opacity "0.4" ] [] ]
        ]


{-| Three bands: nursery row (top), greenhouse tables row (middle, the
3 tables side by side, traversed right→left), bed row (bottom).
-}
stationPos : Location -> ( Float, Float )
stationPos loc =
    case loc of
        Sowing ->
            ( 78, 118 )

        GermOff ->
            ( 202, 118 )

        GermOn ->
            ( 328, 118 )

        GrowthRack ->
            ( 442, 118 )

        GreenhouseW3 ->
            ( 404, 366 )

        GreenhouseW4 ->
            ( 250, 366 )

        GreenhouseW5 ->
            ( 96, 366 )

        Bed ->
            ( 96, 560 )

        Harvest ->
            ( 276, 560 )


type ArrowKind
    = Straight
    | Curved


segments : List ( Location, Location, ( String, ArrowKind ) )
segments =
    [ ( Sowing, GermOff, ( "1er Vendredi", Curved ) )
    , ( GermOff, GermOn, ( "1er Lundi", Curved ) )
    , ( GermOn, GrowthRack, ( "2e Vendredi", Curved ) )
    , ( GrowthRack, GreenhouseW3, ( "3e Vendredi", Straight ) )
    , ( GreenhouseW3, GreenhouseW4, ( "4e Vendredi", Curved ) )
    , ( GreenhouseW4, GreenhouseW5, ( "5e Vendredi", Curved ) )
    , ( GreenhouseW5, Bed, ( "6e Vendredi", Straight ) )
    , ( Bed, Harvest, ( "8e Vendredi", Curved ) )
    ]


{-| Half-size (horizontal, vertical) of a node, to trim the arrow ends.
-}
radiusOf : Location -> ( Float, Float )
radiusOf loc =
    case loc of
        GreenhouseW3 ->
            ( 44, 30 )

        GreenhouseW4 ->
            ( 44, 30 )

        GreenhouseW5 ->
            ( 44, 30 )

        GermOff ->
            ( 24, 28 )

        GermOn ->
            ( 24, 28 )

        GrowthRack ->
            ( 24, 28 )

        Bed ->
            ( 44, 26 )

        Harvest ->
            ( 24, 22 )

        _ ->
            ( 22, 22 )


segEl : ( Location, Location, ( String, ArrowKind ) ) -> Svg Msg
segEl ( from, to, ( label, kind ) ) =
    case kind of
        Straight ->
            arrowStraight from to label

        Curved ->
            arrowCurved from to label


arrowStraight : Location -> Location -> String -> Svg Msg
arrowStraight from to label =
    let
        ( x1, y1 ) =
            stationPos from

        ( x2, y2 ) =
            stationPos to

        dx =
            x2 - x1

        dy =
            y2 - y1

        len =
            sqrt (dx * dx + dy * dy)

        ux =
            dx / len

        uy =
            dy / len

        f =
            String.fromFloat

        vertical =
            abs dy > abs dx

        ( fromRx, _ ) =
            radiusOf from

        ( toRx, toRy ) =
            radiusOf to

        -- Vertical arrows must start below the source node's label band
        -- (label sits ~42–52 px under the node) so they don't cross the text.
        startTrim =
            if vertical then
                -- Clear the source's whole label block (44 to the first line,
                -- 13 per line) so a descent never crosses its own caption.
                44 + toFloat (List.length (labelLines from)) * 13 + 14

            else
                fromRx + 10

        endTrim =
            if vertical then
                toRy + 14

            else
                toRx + 14

        -- Offset the label from the LINE's midpoint (not the node's x), so a
        -- diagonal descent can't run through its own text.
        midY =
            (y1 + startTrim + (y2 - endTrim)) / 2

        midX =
            x1 + (dx / dy) * (midY - y1)

        ( lx, ly, anchor ) =
            if vertical then
                -- Keep the label inside the frame: descents on the right half
                -- put their text to the LEFT of the line, and vice versa.
                if x1 > 250 then
                    ( midX - 12, midY, "end" )

                else
                    ( midX + 12, midY, "start" )

            else
                ( (x1 + x2) / 2, y1 - 12, "middle" )
    in
    Svg.g []
        [ Svg.line
            [ SA.x1 (f (x1 + ux * startTrim))
            , SA.y1 (f (y1 + uy * startTrim))
            , SA.x2 (f (x2 - ux * endTrim))
            , SA.y2 (f (y2 - uy * endTrim))
            , SA.stroke "var(--text-muted)"
            , SA.strokeWidth "0.9"
            , SA.opacity "0.4"
            , SA.markerEnd "url(#arrowhead)"
            ]
            []
        , arrowLabel lx ly anchor label
        ]


{-| Round arrow arcing above the greenhouse table row (right→left).
-}
arrowCurved : Location -> Location -> String -> Svg Msg
arrowCurved from to label =
    let
        ( x1, y1 ) =
            stationPos from

        ( x2, _ ) =
            stationPos to

        ( fromRx, _ ) =
            radiusOf from

        ( toRx, _ ) =
            radiusOf to

        f =
            String.fromFloat

        -- Works in both directions: left→right and right→left.
        dir =
            if x2 > x1 then
                1

            else
                -1

        sx =
            x1 + dir * (fromRx + 10)

        ex =
            x2 - dir * (toRx + 12)

        mid =
            (sx + ex) / 2

        ctrlY =
            y1 - 58

        d =
            "M " ++ f sx ++ " " ++ f y1 ++ " Q " ++ f mid ++ " " ++ f ctrlY ++ " " ++ f ex ++ " " ++ f y1
    in
    Svg.g []
        [ Svg.path
            [ SA.d d
            , SA.fill "none"
            , SA.stroke "var(--text-muted)"
            , SA.strokeWidth "0.9"
            , SA.opacity "0.4"
            , SA.markerEnd "url(#arrowhead)"
            ]
            []
        , arrowLabel mid (ctrlY + 8) "middle" label
        ]


arrowLabel : Float -> Float -> String -> String -> Svg Msg
arrowLabel lx ly anchor label =
    Svg.text_
        [ SA.x (String.fromFloat lx)
        , SA.y (String.fromFloat ly)
        , SA.fontSize "10.5"
        , SA.fontWeight "600"
        , SA.textAnchor anchor
        , SA.dominantBaseline "central"
        , SA.fill "var(--text-muted)"
        ]
        [ Svg.text label ]


nodeEl : Location -> List (Svg Msg)
nodeEl loc =
    let
        ( nx, ny ) =
            stationPos loc
    in
    nodeGlyph loc nx ny
        :: List.indexedMap (labelLine loc nx ny) (labelLines loc)


{-| Node label, one or two lines below the glyph.
-}
labelLines : Location -> List String
labelLines loc =
    case loc of
        GermOff ->
            [ "Rack", "de germination", "LED Off" ]

        GermOn ->
            [ "Rack", "de germination", "LED On" ]

        GrowthRack ->
            [ "Rack", "semaine 2" ]

        GreenhouseW3 ->
            [ "Table", "Semaine 3" ]

        GreenhouseW4 ->
            [ "Table", "Semaine 4" ]

        GreenhouseW5 ->
            [ "Table", "Semaine 5" ]

        _ ->
            [ locationShort loc ]


labelLine : Location -> Float -> Float -> Int -> String -> Svg Msg
labelLine loc nx ny j line =
    Svg.text_
        [ SA.x (String.fromFloat nx)
        , SA.y (String.fromFloat (ny + 44 + toFloat j * 13))
        , SA.fontSize "11.5"
        , SA.fontWeight
            (if String.startsWith "LED " line then
                "400"

             else
                "600"
            )
        , SA.textAnchor "middle"
        , SA.dominantBaseline "central"
        , SA.fill
            (if String.startsWith "LED " line then
                "var(--text-muted)"

             else
                "var(--text)"
            )
        ]
        [ Svg.text line ]


{-| Node face: a drawn glyph for stations we illustrate, else the emoji.
-}
nodeGlyph : Location -> Float -> Float -> Svg Msg
nodeGlyph loc nx ny =
    case loc of
        Sowing ->
            sowingGlyph nx ny

        GermOff ->
            rackGlyph 0 "" "" GermOff nx ny

        GermOn ->
            rackGlyph 8 "#f5b301" "#fde68a" GermOn nx ny

        GrowthRack ->
            rackGlyph 4 "#2563eb" "#bfdbfe" GrowthRack nx ny

        GreenhouseW3 ->
            greenhouseTable False loc nx ny

        GreenhouseW4 ->
            greenhouseTable False loc nx ny

        GreenhouseW5 ->
            greenhouseTable True loc nx ny

        Bed ->
            bedGlyph nx ny

        Harvest ->
            opinelGlyph nx ny


{-| Market-garden bed (top view): a soil strip planted with lettuce on
4 rows at 6" spacing.
-}
bedGlyph : Float -> Float -> Svg Msg
bedGlyph cx cy =
    let
        f =
            String.fromFloat

        lettuce px py =
            Svg.circle
                [ SA.cx (f px), SA.cy (f py), SA.r "2.6", SA.fill "#5aa845", SA.stroke "#3f7d33", SA.strokeWidth "0.5" ]
                []

        rows =
            List.concatMap
                (\py ->
                    List.map (\k -> lettuce (cx - 33 + toFloat k * 13.2) py) (List.range 0 5)
                )
                [ cy - 15, cy - 5, cy + 5, cy + 15 ]
    in
    Svg.g
        []
        (Svg.rect
            [ SA.x (f (cx - 42))
            , SA.y (f (cy - 24))
            , SA.width "84"
            , SA.height "48"
            , SA.rx "4"
            , SA.fill "#e7ddca"
            , SA.stroke "#8a6d4f"
            , SA.strokeWidth "1.5"
            ]
            []
            :: rows
        )


{-| Harvest: an Opinel folding knife (wood handle + steel blade).
-}
opinelGlyph : Float -> Float -> Svg Msg
opinelGlyph cx cy =
    let
        f =
            String.fromFloat
    in
    Svg.g
        [ SA.cursor "pointer"
        , SA.transform ("rotate(150 " ++ f cx ++ " " ++ f cy ++ ")")
        ]
        [ -- blade (steel), curved point to the left
          Svg.path
            [ SA.d
                ("M "
                    ++ f (cx - 2)
                    ++ " "
                    ++ f (cy - 5)
                    ++ " Q "
                    ++ f (cx - 22)
                    ++ " "
                    ++ f (cy - 6)
                    ++ " "
                    ++ f (cx - 26)
                    ++ " "
                    ++ f cy
                    ++ " Q "
                    ++ f (cx - 22)
                    ++ " "
                    ++ f (cy + 3)
                    ++ " "
                    ++ f (cx - 2)
                    ++ " "
                    ++ f (cy + 4)
                    ++ " Z"
                )
            , SA.fill "#c3c7ce"
            , SA.stroke "#8a8f98"
            , SA.strokeWidth "0.8"
            ]
            []
        , -- handle (beechwood)
          Svg.rect
            [ SA.x (f (cx - 3))
            , SA.y (f (cy - 6))
            , SA.width "28"
            , SA.height "12"
            , SA.rx "6"
            , SA.fill "#c8975a"
            , SA.stroke "#8a6a3a"
            , SA.strokeWidth "1"
            ]
            []
        , -- pivot rivet (Opinel's Virobloc collar hint)
          Svg.circle
            [ SA.cx (f (cx + 1)), SA.cy (f cy), SA.r "1.7", SA.fill "#8a8f98" ]
            []
        ]


{-| Sowing: a hand (pinch) dropping a seed into a pot.
-}
sowingGlyph : Float -> Float -> Svg Msg
sowingGlyph cx cy =
    let
        f =
            String.fromFloat
    in
    Svg.g
        []
        [ Svg.path
            [ SA.d
                ("M "
                    ++ f (cx - 12)
                    ++ " "
                    ++ f (cy + 8)
                    ++ " L "
                    ++ f (cx + 12)
                    ++ " "
                    ++ f (cy + 8)
                    ++ " L "
                    ++ f (cx + 8)
                    ++ " "
                    ++ f (cy + 24)
                    ++ " L "
                    ++ f (cx - 8)
                    ++ " "
                    ++ f (cy + 24)
                    ++ " Z"
                )
            , SA.fill "#cd7f52"
            , SA.stroke "#9c5a30"
            , SA.strokeWidth "1"
            ]
            []
        , Svg.ellipse
            [ SA.cx (f cx), SA.cy (f (cy + 8)), SA.rx "12", SA.ry "2.6", SA.fill "#4e3620" ]
            []
        , Svg.ellipse
            [ SA.cx (f (cx + 2)), SA.cy (f (cy - 1)), SA.rx "1.7", SA.ry "2.6", SA.fill "#6b4423" ]
            []
        , Svg.text_
            [ SA.x (f (cx - 3))
            , SA.y (f (cy - 13))
            , SA.fontSize "19"
            , SA.textAnchor "middle"
            , SA.dominantBaseline "central"
            ]
            [ Svg.text "🤏" ]
        ]


{-| Greenhouse table (top view): a surface holding three 1020 trays side
by side in one row. Each tray shows its plants on a 2×5 grid — fully
planted normally; when `checker`, the plants sit on a checkerboard
(Week 5 damier is a plant pattern inside the trays, not spaced trays).
-}
greenhouseTable : Bool -> Location -> Float -> Float -> Svg Msg
greenhouseTable checker loc cx cy =
    let
        f =
            String.fromFloat

        surface =
            Svg.rect
                [ SA.x (f (cx - 44))
                , SA.y (f (cy - 30))
                , SA.width "88"
                , SA.height "60"
                , SA.rx "5"
                , SA.fill "var(--input-bg)"
                , SA.stroke "var(--text)"
                , SA.strokeWidth "1.6"
                ]
                []

        plantDot px py =
            Svg.circle
                [ SA.cx (f px), SA.cy (f py), SA.r "1.5", SA.fill "#3f8f43" ]
                []

        -- 2 cols × 5 rows of plant cells inside one 1020 tray
        plants tx =
            List.concatMap
                (\( ri, py ) ->
                    List.filterMap
                        (\( ci, ox ) ->
                            if not checker || modBy 2 (ci + ri) == 0 then
                                Just (plantDot (tx + ox) py)

                            else
                                Nothing
                        )
                        [ ( 0, -5 ), ( 1, 5 ) ]
                )
                [ ( 0, cy - 20 ), ( 1, cy - 10 ), ( 2, cy ), ( 3, cy + 10 ), ( 4, cy + 20 ) ]

        -- one 1020 tray: portrait long rectangle
        trayEl tx =
            Svg.g []
                (Svg.rect
                    [ SA.x (f (tx - 11))
                    , SA.y (f (cy - 25))
                    , SA.width "22"
                    , SA.height "50"
                    , SA.rx "2"
                    , SA.fill "#eef7e8"
                    , SA.stroke "#4a7c3f"
                    , SA.strokeWidth "0.9"
                    ]
                    []
                    :: plants tx
                )

        trays =
            List.map (\ox -> trayEl (cx + ox)) [ -28, 0, 28 ]
    in
    Svg.g
        []
        (surface :: trays)


{-| Uline wire-shelving rack: two uprights + four shelves. `ledsPerShelf`
LEDs are drawn lit on each shelf in `dotColor` (with a `haloColor` glow);
0 means lights off. Germination rack = 8 warm-yellow; week-2 rack = 4 blue.
-}
rackGlyph : Int -> String -> String -> Location -> Float -> Float -> Svg Msg
rackGlyph ledsPerShelf dotColor haloColor loc cx cy =
    let
        f =
            String.fromFloat

        shelfYs =
            [ cy - 26, cy - 9, cy + 9, cy + 26 ]

        post x =
            Svg.line
                [ SA.x1 (f x)
                , SA.y1 (f (cy - 26))
                , SA.x2 (f x)
                , SA.y2 (f (cy + 26))
                , SA.stroke "var(--text)"
                , SA.strokeWidth "1.6"
                ]
                []

        shelf y =
            Svg.line
                [ SA.x1 (f (cx - 22))
                , SA.y1 (f y)
                , SA.x2 (f (cx + 22))
                , SA.y2 (f y)
                , SA.stroke "var(--text)"
                , SA.strokeWidth "1.6"
                ]
                []

        led x y =
            Svg.g []
                [ Svg.circle
                    [ SA.cx (f x), SA.cy (f (y + 3.2)), SA.r "2.6", SA.fill haloColor, SA.opacity "0.6" ]
                    []
                , Svg.circle
                    [ SA.cx (f x), SA.cy (f (y + 3.2)), SA.r "1.3", SA.fill dotColor ]
                    []
                ]

        ledX k =
            if ledsPerShelf == 1 then
                cx

            else
                cx - 18 + toFloat k * (36 / toFloat (ledsPerShelf - 1))

        ledRow y =
            List.map (\k -> led (ledX k) y) (List.range 0 (ledsPerShelf - 1))

        -- Lights hang UNDER a shelf to light the level below, so the bottom
        -- shelf carries none.
        leds =
            if ledsPerShelf > 0 then
                List.concatMap ledRow (List.take 3 shelfYs)

            else
                []
    in
    Svg.g
        []
        (post (cx - 20)
            :: post (cx + 20)
            :: List.map shelf shelfYs
            ++ leds
        )


dayTabs : Model -> Html Msg
dayTabs model =
    div [ class "stage-selector", style "margin-bottom" "14px" ]
        [ dayTab model Lun "Lundi"
        , dayTab model Mer "Mercredi"
        , dayTab model Ven "Vendredi"
        ]


dayTab : Model -> Day -> String -> Html Msg
dayTab model d label =
    button
        [ class "stage-btn"
        , classList [ ( "active", model.selected == d ) ]
        , onClick (Select d)
        ]
        [ span [ class "stage-label" ]
            [ text
                (if model.today == Just d then
                    label ++ " •"

                 else
                    label
                )
            ]
        ]


stepCard : Model -> Step -> Html Msg
stepCard model s =
    let
        isOpen =
            hasDetail s && Set.member s.key model.expanded

        isDone =
            Set.member s.key model.done
    in
    div
        [ class "card"
        , style "padding" "0"
        , style "overflow" "hidden"
        , style "margin-bottom" "8px"
        ]
        (headerRow model s isOpen isDone
            :: (if isOpen then
                    [ detailPanel s ]

                else
                    []
               )
        )


{-| A step with nothing more to say doesn't expand.
-}
hasDetail : Step -> Bool
hasDetail s =
    s.intro
        /= ""
        || not (List.isEmpty s.lines)
        || not (List.isEmpty s.targets)
        || not (List.isEmpty (stepLinks s.key))
        || not (List.isEmpty (hostSlot s.key))


headerRow : Model -> Step -> Bool -> Bool -> Html Msg
headerRow _ s isOpen isDone =
    div
        [ style "display" "flex"
        , style "align-items" "center"
        , style "gap" "10px"
        , style "padding" "12px 14px"
        , style "cursor"
            (if hasDetail s then
                "pointer"

             else
                "default"
            )
        , onClick
            (if hasDetail s then
                ToggleExpand s.key

             else
                NoOp
            )
        ]
        [ checkbox isDone s.key
        , stepVisual s
        , div [ style "flex" "1", style "min-width" "0" ]
            ([ div
                [ style "font-size" "14px"
                , style "font-weight" "700"
                , style "color" "var(--text)"
                , classList [ ( "step-done", isDone ) ]
                , style "text-decoration"
                    (if isDone then
                        "line-through"

                     else
                        "none"
                    )
                , style "opacity"
                    (if isDone then
                        "0.5"

                     else
                        "1"
                    )
                ]
                [ text s.verb ]
             ]
                ++ (if s.stamp == "" then
                        []

                    else
                        [ div
                            [ style "font-size" "11px"
                            , style "color" "var(--text-muted)"
                            , style "margin-top" "2px"
                            ]
                            [ text s.stamp ]
                        ]
                   )
            )
        , span
            [ style "color" "var(--text-muted)"
            , style "font-size" "12px"
            ]
            [ text
                (if not (hasDetail s) then
                    ""

                 else if isOpen then
                    "▾"

                 else
                    "▸"
                )
            ]
        ]


{-| The card's action drawn with the diagram's own glyphs:
from → to for a transfer, a single glyph for an in-place action.
Inert (pointer-events none) so taps still hit the card.
-}
stepVisual : Step -> Html Msg
stepVisual s =
    div
        [ style "display" "flex"
        , style "align-items" "center"
        , style "gap" "3px"
        , style "flex-shrink" "0"
        , style "pointer-events" "none"
        ]
        (List.intersperse miniArrow (List.map miniGlyph s.visual))


miniGlyph : Vis -> Html Msg
miniGlyph vis =
    case vis of
        L loc ->
            Svg.svg
                [ SA.viewBox "0 0 100 84"
                , SA.width "60"
                , SA.height "50"
                ]
                (nodeGlyph loc 50 36 :: miniCaption loc)

        E emoji ->
            span
                [ style "font-size" "34px"
                , style "line-height" "48px"
                , style "width" "60px"
                , style "text-align" "center"
                ]
                [ text emoji ]


{-| Which greenhouse table this is — the mini glyphs are otherwise
indistinguishable. -}
miniCaption : Location -> List (Svg Msg)
miniCaption loc =
    let
        label =
            case loc of
                GermOff ->
                    "Germination"

                GermOn ->
                    "Germination"

                GrowthRack ->
                    "Semaine 2"

                GreenhouseW3 ->
                    "Semaine 3"

                GreenhouseW4 ->
                    "Semaine 4"

                GreenhouseW5 ->
                    "Semaine 5"

                _ ->
                    ""
    in
    if label == "" then
        []

    else
        [ Svg.text_
            [ SA.x "50"
            , SA.y "78"
            , SA.fontSize "15"
            , SA.fontWeight "700"
            , SA.textAnchor "middle"
            , SA.dominantBaseline "central"
            , SA.fill "var(--text)"
            ]
            [ Svg.text label ]
        ]


miniArrow : Html Msg
miniArrow =
    span
        [ style "font-size" "18px"
        , style "font-weight" "700"
        , style "line-height" "1"
        , style "color" "var(--text)"
        ]
        [ text "→" ]


checkbox : Bool -> String -> Html Msg
checkbox isDone key =
    span
        [ stopPropagationOn "click" (Decode.succeed ( ToggleDone key, True ))
        , style "font-size" "20px"
        , style "line-height" "1"
        , style "cursor" "pointer"
        , style "color"
            (if isDone then
                "var(--text)"

             else
                "var(--text-muted)"
            )
        ]
        [ text
            (if isDone then
                "☑"

             else
                "☐"
            )
        ]


detailPanel : Step -> Html Msg
detailPanel s =
    div
        [ style "padding" "10px 14px 14px"
        , style "border-top" "1px solid var(--border)"
        ]
        (introView s.intro
            ++ List.map lineView s.lines
            ++ List.map targetView s.targets
            ++ List.map linkButton (stepLinks s.key)
            ++ hostSlot s.key
        )


{-| Step key whose body hosts the JS-rendered LED-hours table. -}
lightStepKey : String
lightStepKey =
    "l-lumiere"


{-| An empty node the host fills. Elm always renders it childless, so it
never fights the JS that writes into it. -}
hostSlot : String -> List (Html Msg)
hostSlot key =
    if key == lightStepKey then
        [ div [ id "lum-suppl-table", style "margin-top" "10px" ] [] ]

    else
        []


linkButton : ( String, String ) -> Html Msg
linkButton ( label, target ) =
    a
        [ href target
        , style "display" "inline-block"
        , style "margin" "10px 8px 0 0"
        , style "font-size" "12px"
        , style "font-weight" "600"
        , style "color" "var(--text)"
        , style "background" "var(--input-bg)"
        , style "border" "1px solid var(--border)"
        , style "border-radius" "var(--radius-sm)"
        , style "padding" "6px 10px"
        , style "text-decoration" "none"
        ]
        [ text label ]


introView : String -> List (Html Msg)
introView intro =
    if intro == "" then
        []

    else
        [ div
            [ style "font-size" "13px"
            , style "line-height" "1.5"
            , style "color" "var(--text)"
            , style "padding" "2px 0 4px"
            ]
            [ text intro ]
        ]


lineView : String -> Html Msg
lineView line =
    div
        [ style "font-size" "13px"
        , style "line-height" "1.5"
        , style "color" "var(--text)"
        , style "padding" "2px 0"
        ]
        [ text ("• " ++ line) ]


targetView : ( String, String ) -> Html Msg
targetView ( label, val ) =
    div
        [ style "display" "flex"
        , style "gap" "8px"
        , style "font-size" "12px"
        , style "margin-top" "6px"
        ]
        [ span [ style "color" "var(--text-muted)" ] [ text label ]
        , span [ style "font-weight" "600", style "color" "var(--text)" ] [ text val ]
        ]



-- MAIN


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        }
