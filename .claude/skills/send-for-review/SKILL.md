---
name: send-for-review
description: Send the current branch's PR to Catherine for review (#review Slack ping). If no PR exists, ask Guillaume for the changes as bullet points and create the PR. If a PR exists, show its current "Ce qui change" bullets and ask whether to change anything. Then ready the PR → notify-review.yml posts to #review with the Netlify preview link. Triggers: "send for review", "ping Catherine", "/send-for-review".
---

# Send the current branch to Catherine for review

Get the PR into `ready_for_review` → `notify-review.yml` fires → Slack post to `#review` (built by `scripts/build-review-message.mjs`, preview link + footer).

**Refuse on `main` / `master`** — review is for feature branches.

## Step 1 — context

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
gh pr list --head "$BRANCH" --state open --json number,isDraft,title,body
```

## Step 2 — gather or confirm the bullets

The `## Ce qui change` bullets ARE the Slack message. Page names in italics (`_Fertigation > Laitue_`).

**No PR exists** → ask Guillaume for the changes as bullet points, plus a ≤70-char French title. Then:

```bash
gh pr create --draft --title "$TITLE" --body "$(cat <<'EOF'
## Ce qui change

- <bullet 1>
- <bullet 2>
EOF
)"
```

**PR exists** → show Guillaume the current `## Ce qui change` bullets verbatim and ask if he wants to change anything. If yes, edit (keep the heading):

```bash
gh pr edit <N> --body "$(cat <<'EOF'
## Ce qui change

- <updated bullets>
EOF
)"
```

## Step 3 — push if local is ahead

```bash
git push 2>&1 | tail -3
```

Never `--force`. On failure, stop and surface it.

## Step 4 — fire the #review post

- PR was draft → `gh pr ready <N>` (fires `ready_for_review`).
- PR already ready → re-fire by toggling: `gh pr ready <N> --undo` then `gh pr ready <N>`.

## Step 5 — report

- PR number + URL.
- "Catherine pingée sur #review — le post Slack arrive dans 1-10 min."

## Hard constraints

- Never `--force`.
- The `## Ce qui change` bullets drive the Slack message — confirm before changing them.
- Don't run on `main` / `master`.
- This skill posts to #review only. Publishing to the team is `push-to-team`.
