# Salanova — crop removal per kg fresh

Steady-state replenishment: mass of each element exported in the
harvested heads, per kg fresh. Replace this to hold the soil pool
flat. Same constants as the demand model (`data.js`), reframed per
kg fresh instead of per m²/wk. Derivation of the demand formula
itself → `derivation.md`.

```
removal[el] = 1 kg fresh × LETTUCE_DM_FRACTION × LETTUCE_TISSUE_DW[el]
            = 50 g DM × LETTUCE_TISSUE_DW[el]
```


## Per-element removal

| Element | DW fraction | Removed / kg fresh | Cert |
|---------|-------------|--------------------|------|
| K       | 7.0 %       | 3 500 mg           | 4    |
| N       | 4.5 %       | 2 250 mg           | 4    |
| Ca      | 1.5 %       | 750 mg             | 4    |
| P       | 0.5 %       | 250 mg             | 4    |
| Mg      | 0.4 %       | 200 mg             | 4    |
| Fe      | 200 ppm     | 10 mg              | 3    |
| Mn      | 50 ppm      | 2.5 mg             | 3    |
| Zn      | 40 ppm      | 2.0 mg             | 3    |
| B       | 30 ppm      | 1.5 mg             | 3    |
| Cu      | 8 ppm       | 0.4 mg             | 3    |
| Mo      | 0.5 ppm     | 0.025 mg           | 3    |


## Caveats

- Export-only — covers what leaves in the heads, not leaching,
  P/Fe fixation, or denitrification (separate soil losses on top).

- Full tissue targets apply only once the pH lockout is cleared.
  Under lockout, P / Fe / Mn / Zn uptake falls short of these and
  replenishment need drops with it.

- Element mass, not product — divide by channel efficiency to size
  an amendment. Organic-cert status (CAN/CGSB-32.311) attaches to
  the product picked, sized separately.
