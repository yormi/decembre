---
name: push-to-team
description: Publish the current branch to production and announce to #recherche-et-developpement. If a PR exists, show its "Ce qui change" bullets and ask whether to change anything before sending, then merge (notify-team.yml deploys + posts to the team). If no PR exists, ask what changes to communicate, create the PR, push, and merge so the team gets notified. Triggers: "push to the team", "publish to the team", "annonce à l'équipe", "envoyer à l'équipe".
---

# Publish to the team (#recherche-et-developpement)

Merging the PR to `main` fires `notify-team.yml` → deploy + `history.json` + Slack post to the team (built by `scripts/build-review-message.mjs`, prod app link, no footer) from the PR's `## Ce qui change` bullets.

## Step 1 — find the PR

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
gh pr list --head "$BRANCH" --state open --json number,title,body
```

## Step 2 — gather or confirm the bullets

The `## Ce qui change` bullets ARE the team message. Page names in italics.

**PR exists** → show Guillaume the current `## Ce qui change` bullets verbatim and ask if he wants to change anything before sending. Edit if yes (`gh pr edit <N> --body ...`, keep the heading).

**No PR exists** → ask Guillaume what changes to communicate to the team (bullet points + a ≤70-char French title). Then create it non-draft and ensure the branch is pushed:

```bash
git push 2>&1 | tail -3
gh pr create --title "$TITLE" --body "$(cat <<'EOF'
## Ce qui change

- <bullet 1>
- <bullet 2>
EOF
)"
```

## Step 3 — merge → notifies the team

Merging deploys to prod AND announces to the whole team. Once Guillaume has confirmed the bullets (Step 2), merge:

```bash
gh pr merge <N> --merge
```

## Step 4 — report

- Merge commit + URL.
- `notify-team.yml` runs: waits for the Netlify prod deploy, updates `history.json`, then posts.
- "Annonce à #recherche-et-developpement après le déploiement (1-10 min)."

## Hard constraints

- Merging is irreversible and team-facing — only merge after Guillaume confirms the bullets in Step 2.
- The `## Ce qui change` bullets drive the team message.
- Never `--force`.
- For Catherine's review ping (no merge), use `send-for-review` instead.
