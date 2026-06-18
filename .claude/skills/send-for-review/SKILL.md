---
name: send-for-review
description: Send the current branch's PR to Catherine for review (#review Slack ping). Pushes, ensures the PR is ready, then manually dispatches `post-to-slack.yml` (channel=review) to post the Slack message with the Netlify preview link. If no PR exists yet, opens one as draft first, then readies it. Use when Guillaume says "send this for review", "ping Catherine", "/send-for-review", or when work is ready for her sign-off.
---

# Send the current branch to Catherine for review

Get the open PR for the current branch ready, then **manually** post to `#review` by dispatching `.github/workflows/post-to-slack.yml` with `channel=review`. The Slack post is no longer automatic — it fires only on this dispatch (the message format lives in `scripts/build-review-message.mjs`).

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

Pushing never pings anyone now — posting is manual (Step 4 dispatch only).

If the push fails (rebased history, force-push needed, etc.) — stop, surface the failure, do not `--force` without explicit user instruction.

## Step 3 — find or create the PR

```bash
gh pr list --head "$BRANCH" --state open --json number,isDraft,title
```

**No PR exists:** create one as draft. Ask Guillaume for:

1. **Titre** (≤70 chars, French, no jargon — Catherine reads it first).
2. **Ce qui change** — 3 to 5 short bullets, French, plain language. These bullets ARE the Slack message; put page names in italics (`_Fertigation > Laitue_`).

Then:

```bash
gh pr create --draft --title "$TITLE" --body "$(cat <<'EOF'
## Ce qui change

- <bullet 1>
- <bullet 2>
- <bullet 3>
EOF
)"
```

**PR exists:** continue to Step 4.

## Step 4 — ensure ready, then post

```bash
gh pr ready <PR_NUMBER>   # no-op if already ready; readies it for Catherine
gh workflow run post-to-slack.yml --ref main -f pr=<PR_NUMBER> -f channel=review
```

The dispatch builds the message from the PR's `## Ce qui change` bullets (via `scripts/build-review-message.mjs`), waits up to 10 min for the Netlify preview, then posts to `#review`. `--ref main` because `workflow_dispatch` only runs from a workflow file present on the default branch; the `pr` input scopes it to this PR regardless.

## Step 5 — report

Return to user:

- PR number + URL
- "Catherine pingée sur #review — aperçu Netlify se construit, le post Slack arrive dans 1-10 min."

## Hard constraints

- Never `--force` push.
- Never edit PR body / title without asking; the `## Ce qui change` bullets drive the Slack message.
- Don't run on `main` / `master`.
- Posting is manual — only the `post-to-slack.yml` dispatch sends. Pushing or readying a PR no longer pings anyone.

## Out of scope

- Opening PRs for other branches than the currently checked-out one.
- Editing `post-to-slack.yml` / `build-review-message.mjs` (separate task).
- Posting to `#recherche-et-developpement` — that's `channel=rnd` on the same workflow, triggered when Guillaume asks, not part of this review skill.
