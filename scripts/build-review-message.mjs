// Builds the Slack payload for the #review notification (posted by
// .github/workflows/notify-review.yml when a PR flips to ready_for_review).
//
// Format is owned here, in one tested place — NOT inline in the workflow YAML.
// Node handles apostrophes/Unicode natively, so the French strings
// ("l'app", "l'aperçu", "c'est") can't break shell/jq quoting the way the
// old inline `jq -n '{...}'` did.
//
// Input: the PR body's "## Ce qui change" bullets + the Netlify preview URL.
// Output: the Slack incoming-webhook payload object.

const BOT_NAME = "Nouvelle version de l'app Décembre";
const ICON_EMOJI = ':robot_face:';
const LINK_TEXT = "Ouvrir l'aperçu";
const FOOTER_TEXT = "Réponds dans ce fil quand c'est bon pour publier.";
const EMPTY_CHANGES = '(aucun résumé fourni)';

// Pull the lines under "## Ce qui change" (up to the next "## " heading),
// drop HTML comments + blank lines, and render markdown "- " as a real
// bullet glyph for Slack.
export function extractChanges(prBody) {
  const lines = (prBody || '').split('\n');
  const start = lines.findIndex((line) => /^## Ce qui change/.test(line));
  if (start === -1) return '';
  const bullets = [];
  for (const line of lines.slice(start + 1)) {
    if (/^## /.test(line)) break;
    if (/^<!--/.test(line) || line.trim() === '') continue;
    bullets.push(line.replace(/^- /, '• '));
  }
  return bullets.join('\n');
}

export function buildReviewMessage({ prBody, previewUrl }) {
  const changes = extractChanges(prBody) || EMPTY_CHANGES;
  return {
    username: BOT_NAME,
    icon_emoji: ICON_EMOJI,
    text: BOT_NAME,
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: changes } },
      { type: 'section', text: { type: 'mrkdwn', text: `<${previewUrl}|:link: ${LINK_TEXT}>` } },
      { type: 'context', elements: [{ type: 'mrkdwn', text: FOOTER_TEXT }] },
    ],
  };
}

// CLI edge: read inputs from env, print the payload as JSON to stdout.
if (import.meta.url === `file://${process.argv[1]}`) {
  const payload = buildReviewMessage({
    prBody: process.env.PR_BODY,
    previewUrl: process.env.PREVIEW_URL,
  });
  process.stdout.write(JSON.stringify(payload));
}
