# SENKOM Git workflow

Remote: `origin` → `https://github.com/dejul/senkom.git`. `main` holds stable accepted baselines. Phase 2A remains WIP; initial commit records current baseline, not Phase 2A completion. Do not start Phase 2B automatically.

## Initial baseline

1. Review `git status --short`, branch, remotes, and local staging manifest at `.artifacts/final-fix-01-staging-manifest.tsv` when available. The manifest is ignored; regenerate it after source changes.
2. Check every candidate and staged diff for secrets and unexpected files. Keep `.env`, credentials, private keys, MySQL data, `.artifacts`, dependencies, build output, logs, and caches out of Git. Track safe `.env.example`, lockfiles, migrations, tests, fixtures, OpenAPI, generated shared types, and documentation.
3. Request explicit user approval for the initial commit and push. Only after approval, stage reviewed files, inspect `git diff --cached --check` and `git diff --cached --stat`, then commit as `chore: initial SENKOM Phase 2A baseline`.
4. Push `main` to `origin` without force. Verify local SHA, remote SHA, upstream, and remaining working tree. Stop on rejected push, failed authentication, or divergent remote state.
5. Clone the committed remote to a separate disposable directory. Follow [DB/API setup](phase-2a-setup.md), install from npm/Composer lockfiles, use a verified disposable MySQL database, then run migration, DEMO seed, contract checks, build, and relevant smoke. Record commit SHA, commands, exits, skips, and cleanup. Source-copy evidence does not prove this checkout gate.

No initial commit, push, clean checkout, or GitHub CI run is complete until separately observed and recorded.

## Branches and commits

- `main`: stable accepted baseline. Initial baseline commit is an explicit exception while Phase 2A final acceptance remains WIP.
- `feature/phase-2b`, `feature/phase-3`: start only when that phase is approved. Use actual phase name from source-of-truth.
- `fix/<description>`: bug fixes. `hotfix/<description>`: urgent fixes.
- No `develop` branch without a concrete need.

Use Conventional Commits: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`, `ci:`. Scope when useful, for example `feat(phase-2b): implement 2B-01a`. Do not claim VERIFIED in a message before acceptance passes.

## Micro-batch and parent gates

At start, inspect branch/status/remote/upstream, preserve existing changes, and read checkpoint, exact V2 scope, and parent criteria. Work only requested batch. After changes, run its acceptance checks, update verification and checkpoint, review diff and secrets, then record `VERIFIED`, `INCOMPLETE`, or `BLOCKED` honestly. Record branch and commit SHA when available.

For VERIFIED work, prepare a scoped commit on the phase feature branch and request approval before commit and push. For INCOMPLETE/BLOCKED work, keep evidence, do not merge, and request approval before any clearly labeled WIP commit. Never reset or clean user work to obtain a clean tree.

When all child batches are VERIFIED, run the parent acceptance separately, update evidence and checkpoint, and request approval before committing/pushing parent evidence. Do not merge parent work to `main` automatically.

## Phase acceptance, PR, and tags

Phase COMPLETE requires all parent gates, security/data integrity, contracts, full regression, lint/typecheck/build, smoke, clean Git checkout, actual CI evidence, documentation, and remaining decision review. Local PASS never substitutes for CI PASS. If any mandatory gate remains open, keep phase WIP and feature branch unmerged.

Once complete, prepare a PR from the phase branch to `main`. Request approval before merge; require GitHub checks to pass, then verify merge SHA on `main`. Request approval again before creating and pushing an annotated milestone tag. Use a truthful tag such as `phase-2a-complete` only after Phase 2A is COMPLETE. Do not overwrite published tags or create a Phase 2A completion tag while it is WIP.

## CI and secret hygiene

PR checks should run backend PHPUnit without skipped mandatory tests, schema and contract checks, frontend tests, PHP lint, ESLint, Prettier, typecheck/build, Electron smoke, and API HTTP smoke on disposable MySQL. Windows CI must verify MySQL executable, version, loopback port, datadir, and dedicated `*_test` DBs before migration; use separate unit/HTTP DBs and shut down on all outcomes. Do not use production credentials. A YAML file alone is not CI PASS; record successful run URL/SHA and test counts.

Store secrets outside Git. Review staged paths and content, including examples, fixtures, scripts, and docs. Never paste secret values into reports. Ignore rules are a guard, not a substitute for staged diff review.

## Failure policy

On conflict, divergent branches, rejected push, authentication failure, failed CI, missing identity, unexpected files, or wrong remote: stop risky operations, preserve state, and report cause. Do not force push, hard reset, clean, delete branches/tags/user files, alter an existing remote, or rebase shared history without approval.
