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

Once complete, commit and push final evidence to the phase feature branch after the same checks, then prepare a PR to `main` with change summary, acceptance evidence, CI results, risks, and known limits. Request explicit approval before merge; require GitHub checks to pass, then verify merge SHA on `main`. Request separate approval before creating or pushing an annotated milestone tag. Use a truthful tag such as `phase-2a-complete` only after Phase 2A is COMPLETE. Do not overwrite published tags or create a Phase 2A completion tag while it is WIP.

Never automatically commit, push, merge, force push, rebase/rewrite, delete, or change branch protection on `main`. Automatic feature-branch push authorization grants no merge or release-tag approval.

## CI and secret hygiene

PR checks should run backend PHPUnit without skipped mandatory tests, schema and contract checks, frontend tests, PHP lint, ESLint, Prettier, typecheck/build, Electron smoke, and API HTTP smoke on disposable MySQL. Windows CI must verify MySQL executable, version, loopback port, datadir, and dedicated `*_test` DBs before migration; use separate unit/HTTP DBs and shut down on all outcomes. Do not use production credentials. A YAML file alone is not CI PASS; record successful run URL/SHA and test counts.

Store secrets outside Git. Review staged paths and content, including examples, fixtures, scripts, and docs. Never paste secret values into reports. Ignore rules are a guard, not a substitute for staged diff review.

## Failure policy

On conflict, divergent branches, rejected push, authentication failure, failed CI, missing identity, unexpected files, or wrong remote: stop risky operations, preserve state, and report cause. Keep a local commit if its push fails; diagnose before any retry. Do not force push, hard reset, clean, delete branches/tags/user files, alter an existing remote, or rebase shared history without approval. Never print or store authentication credentials.
