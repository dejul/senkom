# SENKOM agent instructions

- Postman CLI is available for API engineering.
- Before edits, inspect Git branch/status/upstream and read `docs/phase-2-checkpoint.md`, `docs/codegen-microbatch-plan-v2.md`, and relevant parent criteria in `docs/codegen-plan.md`.
- Work only requested micro-batch or gate. Never advance phase automatically. Preserve existing user changes.
- Keep `main` stable. Use approved phase feature branches for new phases and `fix/<description>` or `hotfix/<description>` for fixes. Do not create branches for unapproved phases.
- Verify acceptance before marking `VERIFIED`; mark unrun checks `NOT RUN`. Never mark phase `COMPLETE` without final acceptance.
- Update `docs/phase-2-verification.md` and `docs/phase-2-checkpoint.md` as applicable. Record branch, commit SHA when one exists, commands, exits, counts, and skips.
- Review diff and secret hygiene before staging. Never commit credentials, `.env`, private keys, local DB data, dependencies, logs, or build output.
- Ask explicit user approval before commit, push, merge, or tag. Never force push, auto merge, destructive reset/clean, or rewrite shared history without approval.
- Local PASS is not CI PASS. Require actual successful CI execution for CI acceptance.
- Follow [Git workflow](docs/git-workflow.md) for branch, PR, failure, and release procedures.
