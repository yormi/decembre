module Main exposing (main)

{-| Bilan tomate — Elm island (route #admin/nutriment/tomato).

View only; the side-dress pipeline lives in Domain.elm.

-}

import Browser
import Domain exposing (SideDressDoses, sideDressRecipe)
import Html exposing (Html, div, input, label, table, tbody, td, text, th, thead, tr)
import Html.Attributes exposing (class, step, type_, value)
import Html.Events exposing (onInput)


type alias Model =
    { yieldInput : String }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { yieldInput = "1.5" }, Cmd.none )


type Msg
    = YieldChanged String


update : Msg -> Model -> ( Model, Cmd Msg )
update (YieldChanged raw) model =
    ( { model | yieldInput = raw }, Cmd.none )


view : Model -> Html Msg
view model =
    let
        yieldKgPerM2PerWeek =
            Maybe.withDefault 0 (String.toFloat model.yieldInput)
    in
    div []
        [ div [ class "card" ]
            [ div [ class "card-title" ] [ text "Cible & contexte" ]
            , div [ class "input-row" ]
                [ div [ class "input-group" ]
                    [ label [] [ text "Cible récolte (kg/m²/sem)" ]
                    , input
                        [ type_ "number"
                        , step "0.1"
                        , value model.yieldInput
                        , onInput YieldChanged
                        ]
                        []
                    ]
                ]
            ]
        , div [ class "card" ]
            [ div [ class "card-title" ] [ text "Fertilisation (side-dress) — g/planche/sem" ]
            , recipeTable (sideDressRecipe yieldKgPerM2PerWeek)
            ]
        ]


recipeTable : SideDressDoses -> Html msg
recipeTable recipe =
    table []
        [ thead []
            [ tr []
                [ th [] [ text "Produit" ]
                , th [] [ text "g/planche/sem" ]
                ]
            ]
        , tbody []
            [ productRow "Farine de plumes" recipe.farinePlumesGramsPerBedPerWeek
            , productRow "Éco-luzerne" recipe.alfalfaMealGramsPerBedPerWeek
            , productRow "Actisol" recipe.actisolGramsPerBedPerWeek
            ]
        ]


productRow : String -> Float -> Html msg
productRow name gramsPerBedPerWeek =
    tr []
        [ td [] [ text name ]
        , td [] [ text (String.fromFloat gramsPerBedPerWeek) ]
        ]


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        }
