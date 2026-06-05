# Code shape

**Audience:** coder primary; test-writer (fixture code) + specialist (when sketching algorithm shape in `derivation.md`).

## Elm-influenced JS

Calc/model layers are pure (no I/O, no globals, no `Date.now`). Beyond purity, write JS in a shape that would translate mechanically to Elm later.

- **Discriminated unions as tagged objects.** Variant data carries a `kind` discriminant: `{kind: 'foliar', ...}`, `{kind: 'fertigation', ...}`. Branch on `kind`. No duck-typing, no "if this field exists then…".
- **Exhaustive switches.** Every `switch (x.kind)` ends with `default: throw new Error(`unreachable: ${x.kind}`)` (the Elm `_ -> Debug.todo` equivalent). New variant added → every switch breaks loud, not silent.
- **Result / Maybe shapes for partial functions.** When a calc can fail (missing input, out-of-range), return `{ok: true, value}` / `{ok: false, error}` or `{some: true, value}` / `{some: false}` — never `null`, never throw for expected branches. Throw only for true invariant violations.
- **Immutable data.** No in-place mutation of inputs. Functions return new objects. Spread freely; arrays via `.map` / `.filter` / `.reduce`, never `.push` on a passed-in array.
- **Total functions over defaults.** Prefer signatures that force the caller to handle every case over silent defaults that paper over missing inputs.
- **No nullable mixed-shape returns.** A function returns one shape, not "object or null or number." If it can return nothing, use Maybe.

Lazy migration: existing code stays until next touched; when you edit a calc/model function, refactor its shape to match. No big-bang rewrite.

## Purity + boundaries

- **Pure functions** (`feedback_pure_code.md`): calc/model are pure — no I/O, no globals, no `Date.now()`. Side effects at thin edges (renderers/handlers).
- **Model SRP** (`feedback_model_srp.md`): functions accept pre-normalized inputs and apply ONE rule. Shape detection / source selection / reshape live at the caller. No mode flags at the model boundary.

## Comments + naming

- **No trace comments** (`feedback_no_trace_comments.md`, CLAUDE.md 2026-05-12): trace lives in `<subproject>/derivation.md` + `learnings.md`. Don't add `// <slug>: derived from X × Y`.
- **No comments by default.** Only when WHY is non-obvious (hidden constraint, invariant, bug workaround). Never WHAT.
- **Long variable names.** Spell out `temperature`, `request`, `index`. No `temp`, `req`, `idx`.

## Scope + UI text

- **Spec is floor and ceiling.** Build only what the test (via the spec) demands. No "nice to have", no future-proofing.
- **French user-facing text** (`ui-language-ce-not-ec` / `ui-language-algue-not-kelp` / `ui-language-plain-french`): CE not EC, Algue not Kelp.
- **No narrative in operator UI** (`feedback_no_unspecced_narrative.md`): deterministic derivation from spec/data. No `// stable —`. Test asserts page content → render via deterministic helper, not hand-written string.
