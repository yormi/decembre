// renderSpec(requirementId, key, interpolation) — operator-facing strings whose bytes the
// spec owns. See spec.md REQ-144 + the per-domain spec entries that
// declare `Renders:` blocks. The build step parses those blocks across the
// spec tree into window.SPEC_STRINGS; this helper resolves the lookup +
// optional ${var} substitution.
function renderSpec(requirementId, key, interpolation) {
  const bucket = (window.SPEC_STRINGS && window.SPEC_STRINGS[requirementId]) || null;
  if (!bucket) throw new Error(`renderSpec: ${requirementId} has no Renders: block in any spec.md`);
  if (!Object.prototype.hasOwnProperty.call(bucket, key)) {
    throw new Error(`renderSpec: ${requirementId} has no render key "${key}" (available: ${Object.keys(bucket).join(', ')})`);
  }
  let text = bucket[key];
  if (interpolation) {
    text = text.replace(/\$\{(\w+)\}/g, (m, name) => {
      if (Object.prototype.hasOwnProperty.call(interpolation, name)) return String(interpolation[name]);
      return m;
    });
  }
  return text;
}
