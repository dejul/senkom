# Web Admin operator SOP — Phase 2B

Status: 2B-09b operator review approved on 2026-11-18. Parent 2B-09 acceptance remains separate.

## Access and roles

1. Open configured Web Admin origin and sign in with assigned account. Use HTTPS outside local testing.
2. Infrastructure editor can edit and save draft. Publisher can validate, publish, inspect history, and roll back. System admin can do both. Viewer token opens published map read-only.
3. If **Akses ditolak** appears, ask administrator to check account role and map grant. Do not share credentials or viewer tokens in tickets or screenshots.

## Edit and publish

1. Open **Kanvas**. Check loaded draft and **Draft tanpa perubahan** before editing. Changes to site nodes, visual connections, and inventory stay local until saved.
2. Make one change. Use **Undo** or **Redo** if needed. Check **Draft berubah**, then select **Simpan draft**. Wait for **Draft tersimpan di server**. Reload page and confirm change remains before handing off to publisher.
3. Publisher selects **Validasi draft** after saved draft loads. Resolve every item under **Draft belum valid** in draft and validate again. Publish button remains disabled until validation succeeds.
4. Select **Publikasikan draft** once **Draft valid dan siap dipublikasikan** appears. Wait for revision ID and publication time. Select **Muat ulang riwayat**, open new revision preview, and confirm expected map. Published revision is immutable; later draft edits do not change it.

## History and rollback

1. In **Riwayat published**, use **Sebelumnya** and **Berikutnya** to find revision. Select revision to inspect read-only preview.
2. Publisher or system admin selects **Pilih revisi untuk rollback**. Review revision ID and draft version. **Batal** leaves published pointer unchanged.
3. Select **Konfirmasi rollback** only for intended revision. Confirm success message and active published map. Rollback changes active revision pointer; saved draft content stays separate. Revision history remains immutable.

## Conflict and failure recovery

- If **Draft server berubah** appears, preserve old tab: it holds local edits and Undo/Redo. Open linked fresh draft in new tab, compare changes, reapply intended edits, then save with current version. Do not retry write from stale tab or close it before copying edits.
- If rollback reports a changed draft, reopen confirmation with current version after checking active published revision. Never assume failed or timed-out publication/rollback had no effect; inspect history and published map before retry.
- For validation errors, correct listed paths and validate again. For session expiry, sign in again. For forbidden access, request proper role/map grant. Report repeated API failures with time, map ID, action, and error code; omit passwords, tokens, and private data.

## Verification environment

For release review, run `powershell -NoProfile -File scripts/phase2-browser-e2e.ps1` from clean feature checkout. Runner uses disposable loopback MySQL `_test`, random DEMO map, isolated sessions, and removes database and temporary credentials. Inspect `admin-desktop.png` and `admin-narrow.png` in latest ignored `.artifacts/browser-e2e-*` directory. Screenshot evidence uses DEMO data only. Existing CI matrix does not execute this browser suite; record local result separately from CI.
