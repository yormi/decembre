---
name: announce-rnd
description: Announce an app update to the #recherche-et-developpement Slack channel. Dispatches post-to-slack.yml with channel=rnd, which builds the message from a PR's "Ce qui change" bullets and posts to the team channel (prod app link, no review footer). Use when Guillaume says "annonce sur #recherche-et-developpement", "post to R&D", "annonce la nouvelle version à l'équipe". Do NOT use for the #review ping — that's send-for-review.
---

# Announce an update to #recherche-et-developpement

Posts the app-update message to the team channel (`SLACK_WEBHOOK_TEAM`).
Same format as the #review post but with the **prod app link** and **no
"reply in thread" footer**. Format lives in `scripts/build-review-message.mjs`
(channel preset `RND`); the send runs in `.github/workflows/post-to-slack.yml`.

## Step 1 — get the PR number

The message bullets come from a PR's `## Ce qui change` section. Ask which PR
if not obvious (usually the one just merged/published).

## Step 2 — dispatch

```bash
gh workflow run post-to-slack.yml --ref main -f pr=<PR_NUMBER> -f channel=rnd
```

`--ref main` because `workflow_dispatch` only runs from the workflow file on
the default branch. The `pr` input scopes which bullets get posted; the link
always points at the production app.

## Step 3 — report

- Confirm the run was queued (`gh run list --workflow=post-to-slack.yml --limit 1`).
- "Annonce postée sur #recherche-et-developpement."

## Hard constraints

- This posts to the **team** channel, not #review. For Catherine's review
  ping use `send-for-review`.
- Only dispatch when Guillaume asks — posting is manual by design.
- Don't edit `post-to-slack.yml` / `build-review-message.mjs` here (separate task).
