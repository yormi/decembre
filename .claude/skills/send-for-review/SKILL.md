---
name: send-for-review
description: Send the current branch's PR to Catherine for review (#review Slack ping). Flips the PR from draft → ready_for_review, which fires `notify-review.yml` and posts the Slack message with the Netlify preview link. If no PR exists yet, opens one as draft first, then flips. Use when Guillaume says "send this for review", "ping Catherine", "/send-for-review", or when work is ready for her sign-off. Do NOT use when work is still in flight — the workflow is silent on drafts by design.
---

# Send the current branch to Catherine for review

One-shot operation: get the open PR for the current branch into the `ready_for_review` state, which fires `.github/workflows/notify-review.yml` and posts the Slack message to `#review` with the Netlify preview link.

**Refuse on `main` or `master`** — review flow is for feature branches only.

## Step 1 — context

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
REMOTE_AHEAD=$(git log @{u}..HEAD --oneline 2>/dev/null | wc -l)
REMOTE_BEHIND=$(git log HEAD..@{u} --oneline 2>/dev/null | wc -l)
```

- `$BRANCH` is `main` / `master` → refuse, surface "this isn't a review branch".
- `$REMOTE_BEHIND > 0` → branch is behind remote; surface, ask whether to pull before proceeding. Don't auto-pull.
- `$REMOTE_AHEAD > 0` → push first (Step 2). Else skip to Step 3.

## Step 2 — push if needed

```bash
git push 2>&1 | tail -3
```

Pushing to a draft PR (or a branch with no PR yet) does **not** ping Catherine, per the `draft == false` guard in `notify-review.yml`.

If the push fails (rebased history, force-push needed, etc.) — stop, surface the failure, do not `--force` without explicit user instruction.

## Step 3 — find or create the PR

```bash
gh pr list --head "$BRANCH" --state open --json number,isDraft,title
```

**No PR exists:** create one as draft. Ask Guillaume for:

1. **Titre** (≤70 chars, French, no jargon — Catherine reads it first).
2. **Ce qui change** — 3 to 5 short bullets, French, plain language.
3. **Comment vérifier** — one sentence pointing at what to check on the Netlify preview.

Then:

```bash
gh pr create --draft --title "$TITLE" --body "$(cat <<'EOF'
## Ce qui change

- <bullet 1>
- <bullet 2>
- <bullet 3>

## Comment vérifier

<sentence>
EOF
)"
```

**PR exists and is draft:** continue to Step 4.

**PR exists and is already ready (`isDraft: false`):** no-op. Surface "PR #N is already ready for review; Catherine was pinged on the last push to this branch." Skip Step 4.

## Step 4 — flip draft → ready_for_review

```bash
gh pr ready <PR_NUMBER>
```

This fires the `ready_for_review` GitHub event → `notify-review.yml` runs → Slack post to `#review` with the Netlify preview link. The workflow waits up to 10 minutes for the preview to be reachable before posting.

## Step 5 — report

Return to user:

- PR number + URL
- "Catherine pingée sur #review — aperçu Netlify se construit, le post Slack arrive dans 1-10 min."

## Hard constraints

- Never `--force` push.
- Never edit PR body / title without asking; the body content drives the Slack message.
- Don't run on `main` / `master`.
- Don't bypass the draft guard — if Guillaume wants to silence pings, he flips the PR back to draft (`gh pr ready <N> --undo`); this skill is the *opposite* operation.

## Out of scope

- Opening PRs for other branches than the currently checked-out one.
- Editing the `notify-review.yml` workflow itself (separate task).
- Re-firing the notification on an already-ready PR — that requires either a new push (synchronize event) or close → reopen.
