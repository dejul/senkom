# SENKOM Git workflow

Remote: `origin` → `https://github.com/dejul/senkom.git`. `main` holds stable accepted baselines. Phase 2A remains WIP; initial commit records current baseline, not Phase 2A completion. Do not start Phase 2B automatically. VERIFIED work may be committed and pushed automatically only on the correct feature branch after the gates below pass.

## Initial baseline (completed historical procedure)

These steps describe the approved initial setup; current automatic authorization applies only to feature branches.

1. Review `git status --short`, branch, remotes, and local staging manifest at `.artifacts/final-fix-01-staging-manifest.tsv` when available. The manifest is ignored; regenerate it after source changes.
2. Check every candidate and staged diff for secrets and unexpected files. Keep `.env`, credentials, private keys, MySQL data, `.artifacts`, dependencies, build output, logs, and caches out of Git. Track safe `.env.example`, lockfiles, migrations, tests, fixtures, OpenAPI, generated shared types, and documentation.
3. Request explicit user approval for the initial commit and push. Only after approval, stage reviewed files, inspect `git diff --cached --check` and `git diff --cached --stat`, then commit as `chore: initial SENKOM Phase 2A baseline`.
4. Push `main` to `origin` without force. Verify local SHA, remote SHA, upstream, and remaining working tree. Stop on rejected push, failed authentication, or divergent remote state.
5. Clone the committed remote to a separate disposable directory. Follow [DB/API setup](phase-2a-setup.md), install from npm/Composer lockfiles, use a verified disposable MySQL database, then run migration, DEMO seed, contract checks, build, and relevant smoke. Record commit SHA, commands, exits, skips, and cleanup. Source-copy evidence does not prove this checkout gate.

The initial commit and push completed at `83c481aaea3426f10feb291f7636751cf0cdb1e0`; literal clean checkout passed. GitHub CI failed at Composer audit and its disposable MySQL zero-skip gate remains open. The initial `main` commit was an approved exception, not a precedent for automatic direct pushes to `main`.

## Branches and commits

- `main`: stable accepted baseline. Initial baseline commit is an explicit exception while Phase 2A final acceptance remains WIP.
- `feature/phase-2b`, `feature/phase-3`: start only when that phase is approved. Use actual phase name from source-of-truth; reuse its feature branch for successive VERIFIED micro-batches and parent gates.
- `fix/<description>`: bug fixes. `hotfix/<description>`: urgent fixes.
- No `develop` branch without a concrete need.

Use Conventional Commits: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`, `ci:`. Scope when useful, for example `feat(phase-2b): implement 2B-01a`. Do not claim VERIFIED in a message before acceptance passes.

## Micro-batch and parent gates

At start, inspect branch/status/remote/upstream, preserve existing changes, and read checkpoint, exact V2 scope, and parent criteria. Work only requested batch. After changes, run its acceptance checks, update verification and checkpoint, review diff and secrets, then record `VERIFIED`, `INCOMPLETE`, or `BLOCKED` honestly. Record branch and commit SHA when available.

For VERIFIED work on the correct feature branch, commit and push automatically without extra approval only after every mandatory acceptance criterion and required check passes with zero mandatory skips. Check branch, status, upstream, official remote, conflict/rebase state, divergence, and ownership of existing changes. Review the diff and audit every staged file for secrets; stage only in-scope paths, never unrelated user work. Use a truthful Conventional Commit, push without force, then verify and report branch, local/remote SHA, and push status. Stop after the requested batch.

For WIP/INCOMPLETE/BLOCKED work, failed or skipped mandatory checks, wrong branch/remote, conflicts, divergence, or unsafe files, preserve changes and stop automatic commit/push; report the cause. Never reset or clean user work to obtain a clean tree. A WIP commit needs separate user direction.

When all child batches are VERIFIED, run parent acceptance separately, update evidence and checkpoint, apply the same gates, then commit and push VERIFIED parent evidence automatically to the feature branch. Do not merge parent work to `main` automatically.

Example after Phase 2B is approved: finish only `2B-01a`, prove its acceptance and zero mandatory skips, update evidence/checkpoint, review diff and secrets, then commit `feat(phase-2b): implement micro-batch 2B-01a` and push `feature/phase-2b`. Verify remote SHA; stop before `2B-01b`. That push does not authorize a merge to `main`.

## Phase acceptance, PR, and tags

Phase COMPLETE requires all parent gates, security/data integrity, contracts, full regression, lint/typecheck/build, smoke, clean Git checkout, actual CI evidence, documentation, and remaining decision review. Local PASS never substitutes for CI PASS. If any mandatory gate remains open, keep phase WIP and feature branch unmerged.

Once complete, commit and push final evidence to the phase feature branch after the same checks, then create a PR to `main` with change summary, acceptance evidence, CI results, risks, and known limits. Add PR body line `Phase-Final-Acceptance: 2A` (use the actual phase) and label `phase-final-acceptance`. The trusted merge workflow may merge without another manual approval only when its checks below pass. Verify the merge SHA on `main`. Request separate approval before creating or pushing an annotated milestone tag. Use a truthful tag such as `phase-2a-complete` only after Phase 2A is COMPLETE. Do not overwrite published tags or create a Phase 2A completion tag while it is WIP.

Never automatically commit or push directly to `main`, force push, rebase/rewrite, delete, or change branch protection. Automatic merge is limited to COMPLETE phase final acceptance PRs. Micro-batch, parent gate, WIP phase, and PRs changing merge policy require manual merge. No automatic release-tag approval follows from merge eligibility.

## Trusted phase auto-merge

`.github/workflows/auto-merge.yml` runs only after the `Desktop Phase 1` PR CI workflow completes. It checks out trusted `main` without persisted credentials, then runs `scripts/auto-merge.mjs` with `actions: read`, `contents: write`, and `pull-requests: read`. CI jobs retain read-only permissions. The merge job never checks out or executes PR code. The initial PR that adds or changes this policy must be reviewed and merged manually; a PR changing `.github/`, `AGENTS.md`, `docs/git-workflow.md`, or the merge script cannot approve itself.

Eligibility requires an internal, open, conflict-free PR targeting `main`; exact CI workflow ID/path, successful completed run for the current PR head SHA, successful `checks` job, and every named mandatory CI step successful. Required steps are Composer validate/audit, backend PHPUnit, disposable MySQL integration, zero skipped mandatory tests, HTTP smoke, frontend/schema tests, PHP lint, ESLint, Prettier, typecheck, build, Electron smoke, OpenAPI contract, and npm audit. Missing, failed, pending, or skipped steps block merge. Final-Fix-03 exposes these steps and disposable MySQL on the feature branch; GitHub run `43141274133` passed on commit `ee060ddadedbade17c5a84fcc08d1220fcf744b7`. A PR carrying this CI workflow change still requires manual review and merge under the trusted policy. Local PASS does not replace CI PASS.

The PR must have label `phase-final-acceptance`, body line `Phase-Final-Acceptance: <phase>`, and matching COMPLETE status in `docs/phase-<number>-approval.md`, `docs/phase-<number>-checkpoint.md`, and the `## Phase <phase> Final Acceptance` section of `docs/phase-<number>-verification.md`. Use exact status lines `Status: **Phase <phase> COMPLETE**` in approval, `Tanggal: ... Status: **Phase <phase> COMPLETE**` at the checkpoint top, and `Status: **COMPLETE**` as the first status in the final acceptance section. A marker or label alone is insufficient. The trusted script reviews changed filenames and added lines for private material and rejects unreviewable patches. It re-reads PR head/base/mergeability before the API merge, passes the checked head SHA to the merge endpoint, and verifies the resulting `main` SHA. API denial, conflict, changed head, or missing evidence stops merge. It never uses admin bypass or force merge.

To disable automatic merges, disable the `Phase final acceptance merge` workflow in GitHub Actions. Cancel a pending run or close the PR to stop a pending merge. If a bad merge already occurred, use a new revert PR and normal CI; do not rewrite shared history. GitHub Free currently returns HTTP 403 for branch protection on this private repository, so repository settings cannot enforce these rules against other write-capable actors. The trusted workflow enforces only its own merges. Merge is not deployment; this workflow starts no production deployment.

## CI and secret hygiene

PR checks should run backend PHPUnit without skipped mandatory tests, schema and contract checks, frontend tests, PHP lint, ESLint, Prettier, typecheck/build, Electron smoke, and API HTTP smoke on disposable MySQL. Windows CI must verify MySQL executable, version, loopback port, datadir, and dedicated `*_test` DBs before migration; use separate unit/HTTP DBs and shut down on all outcomes. Do not use production credentials. A YAML file alone is not CI PASS; record successful run URL/SHA and test counts.

Store secrets outside Git. Review staged paths and content, including examples, fixtures, scripts, and docs. Never paste secret values into reports. Ignore rules are a guard, not a substitute for staged diff review.

## Failure policy

On conflict, divergent branches, rejected push, authentication failure, failed CI, missing identity, unexpected files, or wrong remote: stop risky operations, preserve state, and report cause. Keep a local commit if its push fails; diagnose before any retry. Do not force push, hard reset, clean, delete branches/tags/user files, alter an existing remote, or rebase shared history without approval. Never print or store authentication credentials.
