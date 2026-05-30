// Cross-crop contribution-block recipe-table renderer (contribution-block-recipe-table).
//
// Emits a 3-column table `Produit | Composition (% m/m) | Quantité` that
// sits between the block title and the 6-column gap-grid (contribution-block-gap-grid). Each
// row is one product in the live recipe; composition lists the product's
// elemental % m/m in canonical element order (N · P · K · Ca · Mg · Fe ·
// Mn · Zn · Cu · B · Mo), zero entries omitted, `·` separator.
//
// Inputs:
//   recipe: Array<{ productId: string, doseLabel: string }>
//     - productId keys into `productRegistry` for the composition + label.
//     - doseLabel is channel-native and pre-formatted (e.g., `5 322 g`,
//       `2 g / 15 L`, `25,4 kg/m²`). The renderer never reformats it.
//   productRegistry: { [productId]: { label: string, composition: { [el]: number } } }
//     - composition values are MASS FRACTIONS (e.g., 0.415 for 41.5 %).
//     - Elements not in the composition map are omitted from the cell.
//
// Returns: an HTML string. The caller is responsible for placing it as the
// FIRST child after the block title, with the gap-grid as the immediate
// next sibling.

const RECIPE_TABLE_ELEMENT_ORDER = ['N','P','K','Ca','Mg','Fe','Mn','Zn','Cu','B','Mo'];

function formatPercent(massFraction) {
  // Mass fraction → display percent. Precision scales so small values stay
  // legible (0.0437 % → "0,044") while big ones stay compact (41,5 ; 25).
  // French comma as decimal separator. Trailing zeros trimmed.
  const pct = massFraction * 100;
  let rendered;
  if (pct >= 10) {
    rendered = pct.toFixed(1);
  } else if (pct >= 1) {
    rendered = pct.toFixed(2);
  } else {
    rendered = pct.toFixed(3);
  }
  rendered = rendered.replace(/\.?0+$/, '');
  return rendered.replace('.', ',');
}

function renderCompositionCell(composition) {
  const parts = [];
  for (const symbol of RECIPE_TABLE_ELEMENT_ORDER) {
    const fraction = composition[symbol];
    if (fraction == null || fraction <= 0) continue;
    parts.push(`${symbol} · ${formatPercent(fraction)} %`);
  }
  return parts.join(' · ');
}

function renderRecipeTable(recipe, productRegistry) {
  const rows = recipe.map(entry => {
    const product = productRegistry[entry.productId] || {};
    const label = product.label || entry.productId;
    const compositionCell = renderCompositionCell(product.composition || {});
    return `<tr>
      <td style="padding:6px 10px; border-bottom:1px solid var(--border);">${label}</td>
      <td style="padding:6px 10px; border-bottom:1px solid var(--border); font-family:'DM Mono',monospace; font-size:11.5px;">${compositionCell}</td>
      <td style="padding:6px 10px; border-bottom:1px solid var(--border); font-family:'DM Mono',monospace; font-weight:600;">${entry.doseLabel}</td>
    </tr>`;
  }).join('');
  return `<table style="width:100%; border-collapse:collapse; font-size:12.5px; margin-bottom:10px;">
    <thead>
      <tr>
        <th style="text-align:left; padding:6px 10px; border-bottom:1.5px solid var(--border); font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Produit</th>
        <th style="text-align:left; padding:6px 10px; border-bottom:1.5px solid var(--border); font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Composition (% m/m)</th>
        <th style="text-align:left; padding:6px 10px; border-bottom:1.5px solid var(--border); font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Quantité</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}
