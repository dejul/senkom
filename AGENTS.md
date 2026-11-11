# SENKOM agent instructions

- Postman CLI is available for API engineering.
- Before edits, inspect Git branch/status/upstream and read `docs/phase-2-checkpoint.md`, `docs/codegen-microbatch-plan-v2.md`, and relevant parent criteria in `docs/codegen-plan.md`.
- Work only requested micro-batch or gate. Never advance phase automatically. Preserve existing user changes.
- Keep `main` stable. Use approved phase feature branches for new phases and `fix/<description>` or `hotfix/<description>` for fixes. Do not create branches for unapproved phases.
- Verify acceptance before marking `VERIFIED`; mark unrun checks `NOT RUN`. Never mark phase `COMPLETE` without final acceptance.
- Update `docs/phase-2-verification.md` and `docs/phase-2-checkpoint.md` as applicable. Record branch, commit SHA when one exists, commands, exits, counts, and skips.
- Review diff and secret hygiene before staging. Never commit credentials, `.env`, private keys, local DB data, dependencies, logs, or build output.
- Never commit or push directly to `main` automatically. Codex and GitHub Actions may automatically merge a phase final acceptance PR to `main` only after Phase Final Acceptance is COMPLETE, every mandatory CI check passes without skipped mandatory tests, and security/integrity gates pass. Never force push, bypass branch protection, destructively reset/clean, or rewrite shared history. Release tags still require explicit user approval.
- Local PASS is not CI PASS. Require actual successful CI execution for CI acceptance.
- Follow [Git workflow](docs/git-workflow.md) for branch, PR, failure, and release procedures.

## Git Automation Policy — VERIFIED Micro-Batches

- Automatic commit and push to the correct feature branch are authorized for VERIFIED micro-batches and parent gates without extra approval. For COMPLETE phase final acceptance, commit and push final evidence on the feature branch, then create a PR. The trusted auto-merge workflow may merge only after its separate eligibility checks pass; no extra manual merge approval is required after initial policy activation.
- First verify every mandatory acceptance criterion and required test, lint, build, and relevant smoke check; no mandatory skip. Update verification evidence and checkpoint. `NOT RUN` is not PASS.
- Check branch, status, upstream, official remote, conflicts/divergence, and ownership of existing changes. Review the diff and audit every staged file for secrets. Stage only in-scope paths; never include unrelated user work, credentials, `.env`, private keys, local DB data, dependencies, logs, or build output.
- If any gate fails, status is WIP/INCOMPLETE/BLOCKED, branch is `main`, or Git/secret review is unsafe, preserve local changes and stop automatic commit/push. Never use force push or destructive Git commands to make a gate pass.
- Use Conventional Commits; push only to the feature branch without force. Verify and report branch, local/remote SHA, and push status. Do not advance to the next batch automatically.
