import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReviewMessage, extractChanges } from './build-review-message.mjs';

const PR_BODY = `## Ce qui change

- Ajout de la page _Fertigation > Laitue_
- Modification des instructions pour le boost de racines dans _Fertilisation > Tomate_

## Comment vérifier

ne doit pas apparaître`;

const PREVIEW = 'https://deploy-preview-5--decembre-staging.netlify.app';

test('markdown dashes become bullet glyphs', () => {
  const changes = extractChanges(PR_BODY);
  assert.equal(
    changes,
    '• Ajout de la page _Fertigation > Laitue_\n• Modification des instructions pour le boost de racines dans _Fertilisation > Tomate_',
  );
});

test('only "Ce qui change" is kept — verify section excluded', () => {
  const changes = extractChanges(PR_BODY);
  assert.ok(!changes.includes('apparaître'));
});

test('apostrophes survive intact (the bug that bit twice)', () => {
  const payload = buildReviewMessage({ prBody: PR_BODY, previewUrl: PREVIEW });
  assert.equal(payload.username, "Nouvelle version de l'app Décembre");
  assert.ok(payload.blocks[1].text.text.includes("Ouvrir l'aperçu"));
  assert.ok(payload.blocks[2].elements[0].text.includes("c'est bon"));
});

test('no header block — bot name carries the title', () => {
  const payload = buildReviewMessage({ prBody: PR_BODY, previewUrl: PREVIEW });
  assert.ok(!payload.blocks.some((block) => block.type === 'header'));
  assert.equal(payload.icon_emoji, ':robot_face:');
});

test('preview link uses the passed URL', () => {
  const payload = buildReviewMessage({ prBody: PR_BODY, previewUrl: PREVIEW });
  assert.ok(payload.blocks[1].text.text.includes(PREVIEW));
});

test('missing changes section falls back to placeholder', () => {
  const payload = buildReviewMessage({ prBody: 'rien ici', previewUrl: PREVIEW });
  assert.equal(payload.blocks[0].text.text, '(aucun résumé fourni)');
});

test('payload serializes to valid JSON', () => {
  const payload = buildReviewMessage({ prBody: PR_BODY, previewUrl: PREVIEW });
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(payload)));
});
