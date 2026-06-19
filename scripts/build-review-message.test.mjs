import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReviewMessage, extractChanges, REVIEW, RND } from './build-review-message.mjs';

const PR_BODY = `## Ce qui change

- Ajout de la page _Fertigation > Laitue_
- Modification des instructions pour le boost de racines dans _Fertilisation > Tomate_

## Comment vérifier

ne doit pas apparaître`;

const URL = 'https://deploy-preview-5--decembre-staging.netlify.app';
const review = (prBody = PR_BODY) => buildReviewMessage({ prBody, url: URL, ...REVIEW });

test('markdown dashes become bullet glyphs', () => {
  assert.equal(
    extractChanges(PR_BODY),
    '• Ajout de la page _Fertigation > Laitue_\n• Modification des instructions pour le boost de racines dans _Fertilisation > Tomate_',
  );
});

test('only "Ce qui change" is kept — verify section excluded', () => {
  assert.ok(!extractChanges(PR_BODY).includes('apparaître'));
});

test('apostrophes survive intact (the bug that bit twice)', () => {
  const payload = review();
  assert.equal(payload.username, "Nouvelle version de l'app Décembre");
  assert.ok(payload.blocks[1].text.text.includes("Ouvrir l'aperçu"));
  assert.ok(payload.blocks[2].elements[0].text.includes("c'est bon"));
});

test('no header block — bot name carries the title', () => {
  const payload = review();
  assert.ok(!payload.blocks.some((block) => block.type === 'header'));
  assert.equal(payload.icon_emoji, ':robot_face:');
});

test('preview link uses the passed URL and link text', () => {
  const payload = review();
  assert.ok(payload.blocks[1].text.text.includes(URL));
  assert.ok(payload.blocks[1].text.text.includes("Ouvrir l'aperçu"));
});

test('missing changes section falls back to placeholder', () => {
  const payload = buildReviewMessage({ prBody: 'rien ici', url: URL, ...REVIEW });
  assert.equal(payload.blocks[0].text.text, '(aucun résumé fourni)');
});

test('R&D variant keeps the link but drops the footer', () => {
  const payload = buildReviewMessage({ prBody: PR_BODY, url: URL, ...RND });
  assert.ok(!payload.blocks.some((block) => block.type === 'context'));
  assert.ok(payload.blocks[1].text.text.includes("Ouvrir l'app"));
  assert.equal(payload.blocks.length, 2);
});

test('payload serializes to valid JSON', () => {
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(review())));
});
