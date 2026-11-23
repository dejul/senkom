# Checkpoint Phase 2

**Parent 2C-04: VERIFIED — CLOSED.** [PR closure #61](https://github.com/dejul/senkom/pull/61) merged at `9c3656001eb333ecb9f0cef45696f89792d4de8a`; [postmerge CI `45106004707`](https://github.com/dejul/senkom/actions/runs/45106004707) on that SHA passed 16/16 mandatory checks, 0 skipped. Phase 2C remains WIP; 2C-05 NOT STARTED.

## Parent 2C-04 — closure setelah gate merge (2026-11-23)

Commit bukti closure: `6fccf96f081ff3c30c270594934ab32d943cfbfe`.

[PR gate #60](https://github.com/dejul/senkom/pull/60) merge manual `cccbc7a308c01821623296bad5a9bea17dc24209`; head `351148f7d201832a0ef23a4e127c49925c6ba348` ancestor. [CI postmerge `44712007958`](https://github.com/dejul/senkom/actions/runs/44712007958) exact merge SHA PASS 16/16 mandatory, 0 skip. Lima dokumen gate terintegrasi identik; 2C-04a/b VERIFIED dan acceptance parent PASS. Branch closure `fix/phase-2c-04-closure` dari merge SHA, worktree awal bersih. PR #61 merge dan CI postmerge memenuhi syarat terakhir; **Parent 2C-04 VERIFIED — CLOSED.** 2C-05 NOT STARTED.

Lokal closure: `npm run lint` exit 0; tes fokus desktop 28/28, 6 file, exit 0. Tes produk penuh dan smoke **NOT RUN ulang lokal**; CI PR closure wajib 16/16 mandatory, 0 skip.

## Parent 2C-04 — verification gate (2026-11-20)

Commit gate: `0a5859fe1f00a446137e83e058f8af3b16a62990`.

[PR closure #59](https://github.com/dejul/senkom/pull/59) merge manual `544bf3fb8032108387cc98cd1c494aaffd0ac33c`; [CI postmerge `44708132041`](https://github.com/dejul/senkom/actions/runs/44708132041) exact merge SHA PASS 16/16 mandatory, 0 skip. Lima dokumen closure terintegrasi identik; 2C-04a/b VERIFIED. Branch `feature/phase-2c-04-gate` dari merge SHA, worktree awal bersih. **Parent 2C-04 WIP sampai gate PR merge dan CI postmerge PASS; acceptance lokal PASS.** Scheduler, no-overlap, backoff/jitter, status ONLINE/STALE/OFFLINE, last-sync, 200/304/401 dan recovery, cache last-good, HTTPS/token/timeout/size, view-only, carousel, dan regresi sebelumnya tercatat dalam [matriks](phase-2-verification.md#parent-2c-04--verification-gate-2026-11-20).

Lokal: fokus 28/28 (6 file), frontend 193/193 (34 file), lint/OpenAPI, typecheck/build, Windows Electron smoke, Composer validate/audit dan npm audit PASS; audit 0 temuan. PHPUnit/MySQL/HTTP dan browser Laravel/MySQL nyata **NOT RUN lokal**; CI PR gate wajib mengulang semua mandatory. Tidak ada kode produk berubah; 2C-05 belum dimulai.

## 2C-04b — closure setelah merge (2026-11-20)

[PR #58](https://github.com/dejul/senkom/pull/58) merge manual `bcc4f4aeca4dbc01298b586f399eba948d9f8dca`; [CI PR `44705348641`](https://github.com/dejul/senkom/actions/runs/44705348641) pada head `f7591a0dc6edf749d9275011a6107acf44d9c430` PASS 16/16 mandatory, 0 skip. [CI postmerge `44706195556`](https://github.com/dejul/senkom/actions/runs/44706195556) exact merge SHA PASS 16/16 mandatory, 0 skip. **2C-04b VERIFIED**. Branch closure `fix/phase-2c-04b-closure` dari merge SHA; kode produk tidak berubah. Commit `bec4342abd8bda048dba758167d348fd784231df` pada branch implementasi dibuat setelah PR merge, belum terintegrasi, dan tidak digunakan. Parent 2C-04 WIP; gate parent belum dimulai.

## 2C-04b — status koneksi dan recovery published (2026-11-20)

Commit implementasi: `d4fae040bf38fa4b1fbccf43b559e52a3b150698`.

Gangguan koneksi Packagist sebelumnya menyebabkan tiga kegagalan Composer audit (`curl error 28`). Koneksi pulih; `composer --working-dir apps/api audit --locked` exit 0, `No security vulnerability advisories found`. Gate lokal lainnya lulus; PR dan CI exact-head masih diperlukan.

[PR rekonsiliasi #57](https://github.com/dejul/senkom/pull/57) merge manual `952c74fe99dbacbe9fc59964339e444286e8a61a`; [CI postmerge `44694442250`](https://github.com/dejul/senkom/actions/runs/44694442250) exact SHA PASS 16/16 mandatory, 0 skip. Branch `feature/phase-2c-04b` dari merge SHA, worktree awal bersih. **2C-04b WIP sampai PR merge dan CI postmerge PASS; acceptance lokal PASS.** Main process mengirim status OFFLINE/STALE/ONLINE dan last-sync lewat IPC status existing; 200/304 mengubah ONLINE, kegagalan menjaga peta serta waktu sync, retry scheduler/manual memulihkan ONLINE. UI menampilkan status dan waktu WIB; CCTV dan interaksi peta tetap. Tes/evidence di [verifikasi](phase-2-verification.md#2c-04b--status-koneksi-dan-recovery-published-2026-11-20). Parent 2C-04 WIP; gate parent belum dijalankan.

## 2C-04a — rekonsiliasi merge dan CI (2026-11-20)

[PR #56](https://github.com/dejul/senkom/pull/56) merge manual `58c24fdaaac19229aba096c8a352f1b4e251828f`; head `06f316e0ced7eb54086204a03cf900f28feeb1b9` terintegrasi. [CI postmerge `44688783846` attempt 2](https://github.com/dejul/senkom/actions/runs/44688783846/attempts/2) exact merge SHA PASS 16/16 mandatory, 0 skip. Attempt 1 gagal `UnknownVizError` pada Electron smoke; penyebab belum terkonfirmasi, dicatat sebagai observasi stabilitas CI di [verifikasi](phase-2-verification.md#2c-04a--rekonsiliasi-setelah-pr-56-2026-11-20). **2C-04a VERIFIED**. Branch rekonsiliasi `fix/phase-2c-04a-closure`, worktree awal bersih; worktree/stash lain dipertahankan. Parent 2C-04 WIP; 2C-04b NOT STARTED sampai PR rekonsiliasi merge dan CI postmerge PASS.

## 2C-04a — scheduler sinkronisasi published (2026-11-20)

Commit implementasi: `5d4fcec4bd03b824eada365f303ba0ca3e1e9be2`.

[PR #55](https://github.com/dejul/senkom/pull/55) MERGED manual pada `53638954f633adda9698a9b3dafb383c46d611ef`; head `e6b7db939ecd54118036ba1a67bf56423e531f5b` ancestor dan empat dokumen closure identik. [CI postmerge `44681521170`](https://github.com/dejul/senkom/actions/runs/44681521170) event `push`, exact merge SHA, 16/16 mandatory PASS, 0 skip. **PARENT 2C-03 VERIFIED — CLOSED**. Branch `feature/phase-2c-04a` dari merge SHA, worktree awal bersih.

**2C-04a WIP sampai PR merge dan CI postmerge PASS; acceptance lokal PASS.** Main menjadwalkan refresh published tiap dasar 5 menit dengan jitter ±20%; gagal memakai backoff 10/20/30 menit sebelum jitter, maksimal 36 menit aktual. Timer berikut menunggu request selesai; lock bersama refresh manual mencegah overlap. Revisi baru dikirim ke renderer setelah validasi dan atomic cache write; 304 tidak memicu swap. Tidak ada status OFFLINE/STALE/last-sync atau reconnect UI; 2C-04b NOT STARTED, Parent 2C-04 WIP.

Fokus scheduler/origin/cache/token 27/27, frontend 193/193, lint/OpenAPI, typecheck/build desktop+admin, Windows Electron smoke, Composer validate/audit dan npm production audit PASS lokal; audit 0 temuan. PHPUnit/MySQL/HTTP dan browser Laravel/MySQL nyata **NOT RUN lokal**; CI PR mandatory pending. [Matriks](phase-2-verification.md#2c-04a--scheduler-sinkronisasi-published-2026-11-20).

## Parent 2C-03 — closure setelah gate merge (2026-11-20)

[PR #54](https://github.com/dejul/senkom/pull/54) MERGED manual pada `a6878e1a8723e6bf9cc900423fe59841cf4c76d5`; head `e233b96fda8e973eae53707feb8468e1bbe2bddf` ancestor dan tujuh path gate terintegrasi identik. [CI postmerge `44649328499`](https://github.com/dejul/senkom/actions/runs/44649328499) event `push`, exact merge SHA, 16/16 mandatory PASS, 0 skip. Acceptance Parent 2C-03 dan security/regresi sudah terbukti di gate; 2C-03a/b VERIFIED. Branch closure `fix/phase-2c-03-closure` dari merge SHA, worktree awal bersih.

**Parent 2C-03 WIP sampai PR closure dokumentasi ini merge dan CI postmerge PASS; sesudah itu PARENT 2C-03 VERIFIED — CLOSED.** Tidak ada kode produk berubah pada closure. Phase 2C WIP; 2C-04 NOT STARTED. [Bukti](phase-2-verification.md#parent-2c-03--closure-setelah-gate-merge-2026-11-20).

Lokal closure: `npm run lint` exit 0; tes schema/cache/render 47/47, 5 file, 0 skip. Full backend/MySQL/HTTP/Electron lokal NOT RUN ulang; CI postmerge #54 PASS 16/16, 0 skip. CI PR closure dan postmerge masih wajib.

Commit closure `c5c5613ff2b6f826f7cf8d2d21fff43cbfc07a1c`; commit bukti dan CI exact-head PR menyusul.

## Parent 2C-03 — verification gate (2026-11-20)

[PR #53](https://github.com/dejul/senkom/pull/53) MERGED manual pada `5c278f6425b432f90d367cde7a9d92c65e2d895d`; head `441b140cf3b6bb70fdbfbf9669cd8fad6f9de7f0` ancestor, 20 path identik. [CI postmerge `44542722465`](https://github.com/dejul/senkom/actions/runs/44542722465) event `push`, exact merge SHA, 16/16 mandatory PASS, 0 skip. **2C-03b VERIFIED**; 2C-03a sudah VERIFIED.

Branch `feature/phase-2c-03-gate` dari merge SHA. **Parent 2C-03 WIP — acceptance lokal PASS; gate PR, merge, dan CI postmerge pending**. Restore v2, atomic write, swap revisi tanpa restart, render label/simbol, 304, last-valid-map, first-run produksi tanpa DEMO, view-only, dan kontrol keamanan lulus. Smoke Windows baru menguji klik refresh 200, 304, lalu 401 sambil memeriksa revisi/cache lama bertahan. Fokus 51/51, frontend 190/190, lint/OpenAPI, typecheck/build, Windows Electron, audit Composer/npm, dan browser Laravel/MySQL nyata PASS lokal. PHPUnit/MySQL/HTTP standalone lokal **NOT RUN**; CI postmerge #53 PASS, CI gate wajib mengulang. [Matriks](phase-2-verification.md#parent-2c-03--verification-gate-2026-11-20). Phase 2C WIP; 2C-04 NOT STARTED.

Commit gate `ea53b5e09e7d85ed63c89ab17700639d1cbc50af`; commit bukti dan CI exact-head PR menyusul.

## 2C-03b — hot swap published revision (2026-11-19)

[PR #52](https://github.com/dejul/senkom/pull/52) **MERGED** pada `b8929b3e324399d33492d0c453614434300724b4`; head `79010bc9844a962dd96f0a70740d176273685568` ancestor dan lima dokumen closure terintegrasi. [CI postmerge `44534985286`](https://github.com/dejul/senkom/actions/runs/44534985286) event `push` pada exact merge SHA, 16/16 mandatory PASS, 0 skip. **2C-03a VERIFIED**.

Branch `feature/phase-2c-03b` dari `origin/main` merge SHA; worktree awal bersih. **2C-03b WIP sampai PR merge dan CI postmerge PASS**; acceptance lokal PASS. Startup memulihkan cache published v2 tervalidasi tanpa fallback DEMO produksi. Tombol `Perbarui peta` meminta main process melakukan satu GET manual melalui jalur HTTPS/timeout 10 detik/batas 8 MiB/checksum/schema existing. Respons 200 disimpan atomik sebelum revisi tampil; 304 harus cocok dengan cache valid. Kegagalan mempertahankan peta lama. Viewer tetap view-only; scheduler, reconnect/backoff, dan parent gate belum dimulai.

Commit implementasi `eb3bd4a427453330d53c155a339cdafbd78b7d0d`; commit bukti dan CI exact-head PR menyusul.

Fokus published viewer/render 3/3, frontend 190/190, lint/OpenAPI, typecheck/build desktop+admin, Windows Electron smoke DEMO/offline/corrupt/empty/published/published-empty, Composer validate/audit, npm production audit PASS lokal; audit 0 temuan. PHPUnit/MySQL/HTTP dan browser Laravel/MySQL nyata **NOT RUN lokal**; CI PR awal PASS; final head pending. [Matriks](phase-2-verification.md#2c-03b--hot-swap-published-revision-2026-11-19). Parent 2C-03 dan Phase 2C tetap WIP; 2C-04 tidak dimulai.

[PR #53](https://github.com/dejul/senkom/pull/53) CI awal `44538422039` pada `e30ecd92c2f30df5ae1ced2b3c3d4f8c990e23a4` PASS 16/16 mandatory, 0 skip. Auto-Merge V2 `44539259840` memblokir merge otomatis (`Wrong branch for verified work`); perubahan Electron main/preload juga perlu merge manual. Commit bukti ini perlu exact-head CI ulang; 2C-03b WIP sampai merge dan CI postmerge PASS.

## 2C-03a — closure setelah PR merge (2026-11-19)

[PR #51](https://github.com/dejul/senkom/pull/51) merge manual pada `5f221249cf7b8d5320d49efa208dba975d1409c7`; head `8504a2e23d891aebcd1b83210bccff1c5c25e37a` ancestor. [CI postmerge `44530790514`](https://github.com/dejul/senkom/actions/runs/44530790514) event `push`, exact merge SHA, job `checks` SUCCESS, 16/16 mandatory PASS, 0 skip. Kode cache, tes, dan lima dokumen batch terintegrasi identik. **2C-03a VERIFIED**; status WIP historis di bawah tidak lagi berlaku. Parent 2C-03 WIP; 2C-03b NOT STARTED. Branch closure `fix/phase-2c-03a-closure` dari merge SHA; PR dokumentasi closure pending.

## 2C-03a — published cache restore dan atomic write (2026-11-19)

PR #50 **MERGED** pada `f789de5fc16973df51b61cf5de4130db428fd747`; [CI postmerge `44488893237`](https://github.com/dejul/senkom/actions/runs/44488893237) event `push` pada SHA itu, job `checks` SUCCESS, 16/16 mandatory PASS, 0 skip. Head `dd594cfffae8f3e9143b58303ff161d9362ab98f` ancestor; empat dokumen closure terintegrasi identik. **PARENT 2C-02 VERIFIED — CLOSED**. Branch `feature/phase-2c-03a` dari merge SHA, worktree awal bersih; tiga worktree lain dan dua stash historis utuh.

2C-03a **WIP — acceptance lokal PASS; PR exact-head CI, merge, dan CI postmerge pending**. `storage.ts` menyediakan save/restore cache published v2 terpisah dari cache DEMO. Snapshot divalidasi schema v2 sebelum tulis dan setelah baca; envelope menyimpan revisi, waktu fetch, checksum SHA-256 lokal, ETag, dan snapshot. Respons 304 hanya dapat dipakai bersama cache valid dengan ETag/checksum cocok. Batas kandidat 8 MiB dan berkas cache 16 MiB; write memakai `atomicJson` sehingga input invalid atau rename gagal mempertahankan cache terakhir. Berkas absen/korup mengembalikan status eksplisit tanpa fallback DEMO. Tidak ada fetch, startup restore, renderer IPC, hot swap, atau scheduler baru; 2C-03b NOT STARTED dan Parent 2C-03 WIP.

Implementasi commit `c5cc5e0db5f326df0f5ac831c3e47dbb835766c3` pada [PR #51](https://github.com/dejul/senkom/pull/51); commit catatan ini dan CI exact-head final pending. Merge manual wajib untuk Electron main storage.

Fokus storage/origin/token 32/32, frontend 187/187, lint/OpenAPI, typecheck/build desktop+admin, Windows Electron smoke, Composer validate/audit, npm production audit PASS lokal; audit 0 temuan. PHPUnit/MySQL/HTTP/schema standalone dan browser Laravel/MySQL nyata **NOT RUN** lokal karena batch hanya storage main; mandatory PR CI pending. [Matriks dan perintah](phase-2-verification.md#2c-03a--published-cache-restore-dan-atomic-write-2026-11-19).

## Parent 2C-02 — closure setelah gate merge (2026-11-19)

[PR #49](https://github.com/dejul/senkom/pull/49) gate merge manual pada `355ce33271685cf436be4cbe778b0d0b728dab7f`; head `43fffd80c1bc1b38e2faf6dfe557dde8f85fcff4` ancestor. [CI postmerge `44486785441`](https://github.com/dejul/senkom/actions/runs/44486785441) event `push`, exact merge SHA, job `checks` SUCCESS, 16/16 mandatory PASS, 0 skip. Gate acceptance GET published, 200/304, checksum/schema/ETag, unauthorized, timeout/abort, batas 8 MiB, Windows Electron, dan regresi lulus. **Parent 2C-02 VERIFIED/CLOSED**; status WIP di bagian historis di bawah tidak lagi berlaku. Phase 2C keseluruhan WIP; 2C-03a NOT STARTED. Branch closure `fix/phase-2c-02-closure` dibuat dari merge SHA; PR closure dokumentasi menunggu gate tersendiri.

## Parent 2C-02 — verification gate (2026-11-19)

PR #48 **MERGED** pada `f532c0c21d56151011d87a7fb07faca245c81273`; [CI postmerge `44484587079`](https://github.com/dejul/senkom/actions/runs/44484587079) event `push` pada SHA tersebut, job `checks` SUCCESS, 16/16 mandatory PASS, 0 skip. Head PR `bbeff39d486b761c91fd581def12f727cc6701a4` adalah ancestor; tujuh berkas kode, tes, dan dokumen terintegrasi tanpa perubahan. **2C-02b VERIFIED**. Dua anak 2C-02a/b VERIFIED; rencana V2 menjadikan parent gate langkah berikutnya. Branch `feature/phase-2c-02-gate` dari merge SHA, worktree awal bersih, tiga worktree dan dua stash lain utuh.

Parent 2C-02 **WIP — acceptance lokal PASS; PR gate, CI exact-head, merge, dan CI postmerge pending**. GET published v2 pada Electron main memegang Bearer token, HTTPS origin, path/redirect guard, 200/304 dan ETag; 200 memerlukan checksum SHA-256 exact body, ETag cocok, API/schema v2, dan snapshot valid. Unauthorized, timeout/abort, body >8 MiB, hash mismatch, schema tak dikenal, dan payload rusak ditolak. Tidak ada fetch startup/sync/cache atau IPC baru. [Matriks dan tes](phase-2-verification.md#parent-2c-02--verification-gate-2026-11-19).

Commit gate `2ab2863c735a75f89fe40b6396361537ff399f95` pada [PR #49](https://github.com/dejul/senkom/pull/49); commit catatan ini dan CI exact-head final pending. PR docs-only memerlukan merge manual.

Lokal: fokus origin/token 10/10, frontend 175/175, lint/OpenAPI, typecheck/build, Windows Electron smoke, Composer validate/audit, npm production audit, dan browser Laravel/MySQL nyata PASS; audit 0 temuan. Browser E2E mencakup editor, publish, history, konflik 409, rollback, role/viewer dan layout desktop/narrow; MySQL disposable dihentikan/dihapus. PHPUnit/MySQL/HTTP/schema standalone lokal **NOT RUN**; CI postmerge #48 membuktikan baseline, CI PR gate masih diperlukan. Parent 2C-02 belum VERIFIED; 2C-03a belum dimulai.

## 2C-02b — checksum dan schema published (2026-11-19)

PR #47 **MERGED** pada `b7039830ff558dc7ad3b8c233ded8956bac4e0bc`; [CI postmerge `44468345655`](https://github.com/dejul/senkom/actions/runs/44468345655) berjalan pada SHA itu, 16/16 mandatory PASS, 0 skip. Implementasi dan enam dokumen 2C-02a terintegrasi; **2C-02a VERIFIED**. Branch 2C-02b `feature/phase-2c-02b` dibuat dari `origin/main` pada merge SHA; tiga worktree lain dan dua stash historis dipertahankan.

2C-02b **WIP — tes lokal PASS; PR exact-head CI, merge, dan CI postmerge pending**. Electron main memeriksa SHA-256 atas byte respons 200, header checksum dan ETag, envelope `data`/`meta` API v1/schema v2, serta validasi snapshot v2 dan referensinya. Hash mismatch, header hilang/rusak, ETag tidak cocok, schema tak dikenal, dan payload rusak ditolak dengan error generik. Respons 304 tetap tanpa body; cache/revision binding, scheduler, dan renderer/sync milik batch berikutnya. Timeout 10 detik, batas 8 MiB, origin HTTPS, redirect, dan isolasi token tetap berlaku. Parent 2C-02 WIP.

Implementasi commit `92bed015936d85964ed0107a77be4eee2f7213c4` pada [PR #48](https://github.com/dejul/senkom/pull/48); commit evidence dan CI exact-head final pending. Perubahan keamanan Electron main memerlukan merge manual.

[CI PR `44474964614`](https://github.com/dejul/senkom/actions/runs/44474964614) pada head evidence `f4d272dd7d05917172210863d5457d25b81958d4` PASS 16/16 mandatory, 0 skip. [Auto-Merge V2 `44475519547`](https://github.com/dejul/senkom/actions/runs/44475519547) blocked karena `PR head, base, or mergeability changed`; PR tetap OPEN. CI exact-head ulang diperlukan setelah commit catatan ini.

Tes fokus 7/7, frontend 175/175, lint/kontrak, typecheck/build desktop+admin, Windows Electron smoke, Composer validate/audit, npm production audit PASS lokal; audit 0 temuan. PHPUnit/MySQL/HTTP/schema standalone dan browser Laravel/MySQL lokal **NOT RUN**; mandatory PR CI pending. [Perintah dan hasil](phase-2-verification.md#2c-02b--validasi-checksum-dan-schema-published-2026-11-19).

## 2C-02a — bounded published HTTP fetch (2026-11-19)

Status: **WIP — local gate PASS; PR exact-head CI, merge, dan postmerge CI pending**. Branch `feature/phase-2c-02a` dari `origin/main` `bcee41c8a768aad6c66cdcddb2350920a3ec9763` sesudah parent 2C-01 VERIFIED. Worktree awal bersih; tiga worktree lain dan dua stash historis utuh. Scope hanya GET published viewer v2 dengan Bearer token pada Electron main module, `ETag`/`If-None-Match`, respons 200/304, timeout dan batas ukuran respons. Belum ada fetch otomatis, scheduler, cache, checksum/schema validation, atau IPC baru.

`fetchAllowedApi` kini mengembalikan byte bounded, bukan `Response` yang dapat dibaca tanpa batas. Timeout 10.000 ms berlaku sampai body selesai; abort request/reader pada timeout atau pembatalan caller. Maksimum body 8 MiB; `Content-Length` besar ditolak awal, pembacaan stream tetap menghitung byte untuk header hilang/menyesatkan, stream berlebih dibatalkan. Origin HTTPS, path, redirect, dan URL respons tetap divalidasi. Error transport/status generik tidak memuat token. Kedua limit adalah default konservatif 2C-02a, bukan angka spesifikasi produk.

Fokus origin/fetch 6/6, full frontend 174/174, lint, OpenAPI, typecheck/build desktop+admin, PHP lint, Composer validate/audit, npm production audit, Windows Electron smoke dan browser Laravel/MySQL nyata exit 0; audit 0 temuan, database disposable dihapus. Enam staged path in-scope, `git diff --cached --check` exit 0, 347 added lines/0 high-confidence secret-pattern hit. PHPUnit/MySQL/HTTP/schema standalone lokal **NOT RUN**; mandatory PR CI diperlukan. [Matriks dan perintah](phase-2-verification.md#2c-02a--bounded-published-http-fetch-2026-11-19). Parent 2C-02 WIP; 2C-02b NOT STARTED.

## Parent 2C-01 gate — Stage B (2026-11-19)

Closure: **PARENT 2C-01 VERIFIED — CLOSED**. [PR #46](https://github.com/dejul/senkom/pull/46) MERGED manual pada `bcee41c8a768aad6c66cdcddb2350920a3ec9763`; final head `61839c5344da5170604cc9f3aa157b472cacaace` ancestor. [CI postmerge `44464371849`](https://github.com/dejul/senkom/actions/runs/44464371849) SUCCESS tepat pada merge SHA: 16/16 mandatory PASS, 0 skip. Status WIP di bawah adalah snapshot pra-merge.

Status: **WIP — local gate PASS; PR exact-head CI, merge, dan postmerge CI pending**. [PR #45](https://github.com/dejul/senkom/pull/45) MERGED pada `bb785652f90237f1c8355ddb5b739992804cd4d8`; final head `8f99e0eb679a41c76021f88c27d620d17ebfd014` ancestor `origin/main`, dan enam dokumen realignment sama pada head dan merge. [CI postmerge `44457252842`](https://github.com/dejul/senkom/actions/runs/44457252842) SUCCESS pada exact merge SHA: 16/16 mandatory PASS, 0 skip. Branch gate `feature/phase-2c-01-gate` dari merge itu; worktree awal bersih, tiga worktree dan dua stash historis utuh.

Kriteria revisi: origin HTTPS operator pada main process; origin invalid, path lintas-origin, dan redirect ditolak; token viewer Windows `safeStorage` tersimpan terlindung, rotasi gagal mempertahankan token lama, tanpa token pada renderer/IPC/log. Fokus desktop/security 25/25 dan full frontend 170/170 PASS lokal. Lint, typecheck/build desktop+admin, kontrak OpenAPI, PHP lint, Composer validate/audit, npm production audit, dan Windows Electron smoke PASS lokal; audit 0 temuan. Browser Laravel/MySQL nyata PASS (editor/publish/history/409/rollback/role/viewer, desktop/narrow); database disposable dihapus. PHPUnit/MySQL/HTTP/schema standalone lokal **NOT RUN**; CI postmerge #45 membuktikan baseline, CI exact-head PR gate masih diperlukan. [Matriks dan perintah](phase-2-verification.md#parent-2c-01-gate-stage-b-2026-11-19).

Review repository Public: tracked paths dan riwayat `origin/main` tidak memuat `.env` aktual, key, database, dependency, atau log; hanya `.env.example` historis. Scan signature key/provider token pada tracked dan relevant history 0 hit; delapan assignment panjang adalah fixture sintetis pada tes/smoke. CI `contents: read`; trusted auto-merge `actions: read`, `contents: write`, `pull-requests: read` dan menjalankan script dari `main`. Log token viewer direduksi, IPC/bootstrap tidak membawanya. Tidak ditemukan host produksi/credential operasional dalam pemeriksaan terarah. Tidak ada nilai secret ditampilkan. Timeout request dan batas body HTTP tetap **NOT IMPLEMENTED**, wajib 2C-02a; published fetch/sync tidak boleh dikirim sebelum keduanya terverifikasi. Parent 2C-01 tetap WIP sampai PR gate merge dan CI postmerge PASS; 2C-02a NOT STARTED.

Tanggal: 2026-11-17. Status: **Phase 2A COMPLETE**.
Phase 2B: **parent 2B-01 sampai 2B-09 VERIFIED/terintegrasi**; tidak ada gate closure 2B terpisah. 2C-01a, 2C-01b dan parent 2C-01 VERIFIED; 2C-02a WIP.
Baseline produk yang selesai mencakup Phase 2A. Status WIP pada [audit historis](phase-2-wip-audit.md) kini digantikan
bukti gate parent 2A-01 sampai 2A-11 dan Final Acceptance terintegrasi.

Next permitted: selesaikan gate 2C-02a; 2C-02b dan parent 2C-02 belum dimulai. Catatan Stage A berikut historis.

## Realignment rencana 2C-01/2C-02a — Stage A (2026-11-19)

Status: **WIP — menunggu CI PR dan merge**. Branch `feature/phase-2c-plan-realignment` dari `origin/main` `81accd0cfb3698c3d4dbc3e4d65274ad5222cf37`; worktree awal bersih, tiga worktree lain dan dua stash historis tidak diubah. [PR #44](https://github.com/dejul/senkom/pull/44) MERGED pada SHA tersebut. [CI postmerge `44430926308`, attempt 2](https://github.com/dejul/senkom/actions/runs/44430926308/attempts/2) SUCCESS pada SHA merge, 16/16 mandatory PASS, 0 skip; attempt 1 gagal sebelum job berjalan karena pembatasan billing GitHub Actions.

Konflik: parent `docs/codegen-plan.md` dahulu menempatkan timeout dan batas respons pada 2C-01; V2 menempatkan timeout di 2C-02a tanpa menyebut batas respons. Pengguna menyetujui Option B: 2C-01 hanya provisi dan isolasi origin/token; timeout request dan batas body HTTP diwajibkan pada 2C-02a. Fetch published baru ada pada 2C-02a, sehingga kontrol ditempatkan pada jalur yang memakai respons, tanpa menghapus kewajiban keamanan. Fetch HTTP published/sinkronisasi dilarang dikirim sebelum kedua kontrol diimplementasi dan diverifikasi. Parent 2C-01 tetap WIP sampai revisi rencana merge, CI postmerge PASS, dan gate parent terpisah lulus. 2C-02a NOT STARTED.

Stage A lokal: `npm run contracts:check` exit 0; schema `npm test -- tests/map-schema.test.ts tests/map-v2.test.ts tests/cable-patch.test.ts` exit 0, 33/33; Prettier dokumen, traceability/dependency, `git diff --check`, dan `git diff --cached --check` exit 0. Enam staged path hanya dokumen; 35 added lines, 0 high-confidence secret-pattern hit. Head PR CI **NOT RUN** sebelum PR dibuat; browser/MySQL lokal dan parent gate **NOT RUN** pada Stage A. Tidak ada perubahan produk.

## 2C-01b — viewer token OS-protection, IPC/log redaction (2026-11-18)

- Closure: [PR #43](https://github.com/dejul/senkom/pull/43) MERGED manual oleh `dejul` pada `adb6cf172a5bed9ac9d35c51780b3403300ff70a`; final head `264980f9015328d684715591a49e722c2792dd6f` terintegrasi. [CI PR exact-head `44326927940`](https://github.com/dejul/senkom/actions/runs/44326927940) dan [CI postmerge `44328358284`](https://github.com/dejul/senkom/actions/runs/44328358284) SUCCESS pada SHA masing-masing: **16/16 mandatory PASS, 0 skip**. [Auto-Merge V2 `44328216526`](https://github.com/dejul/senkom/actions/runs/44328216526) memblokir `Missing or ambiguous verification claim`; merge manual terjadi sesudahnya. **2C-01b VERIFIED**; status WIP di bawah snapshot pra-merge. Parent 2C-01 tetap WIP; parent gate dan 2C-02 belum dimulai.
- Prasyarat **2C-01a VERIFIED**: [PR #42](https://github.com/dejul/senkom/pull/42) MERGED manual pada `5e55dc67c39f1cc06e7d2af7a7bf9fe254949230`; final head `9d184600f9d862af7158578c5fb1a6c5f76e2fc8` terintegrasi. [CI PR exact-head `44320673059`](https://github.com/dejul/senkom/actions/runs/44320673059) dan [CI postmerge `44322957575`](https://github.com/dejul/senkom/actions/runs/44322957575) SUCCESS pada SHA masing-masing: **16/16 mandatory PASS, 0 skip**.
- Branch `feature/phase-2c-01b` dari merge SHA #42; worktree awal bersih, tiga worktree dan dua stash historis utuh. Scope V2 baris 103: token viewer diproteksi OS/DPAPI pada main process, tidak mencapai renderer/IPC/log. Origin HTTPS dan redirect guard 2C-01a dipertahankan. HTTP fetch/ETag/cache/scheduler serta parent gate di luar batch.
- Operator menyalin token viewer scoped dari file provisioning backend ke `%APPDATA%\SENKOM\viewer-token.pending` dengan ACL terbatas. Main Windows memakai Electron `safeStorage` async, memverifikasi roundtrip sebelum atomic replace `viewer-token.protected.json`, lalu menghapus plaintext staging pada sukses dan kegagalan validasi/enkripsi; gagal hapus ditolak untuk penanganan operator. Token invalid/oversized atau OS encryption unavailable ditolak; versi encrypted lama bertahan saat import gagal. Rotasi memakai import berikutnya; tidak ada token di IPC/bootstrap, log, error, atau screenshot. [Prosedur](operations-runbook.md#phase-2c-01b-provisi-token-viewer-desktop).
- Fokus desktop/security 25/25, full frontend 170/170, lint/kontrak, typecheck/build desktop+admin, Electron smoke Windows dengan enkripsi OS nyata dan renderer/log exclusion, PHP lint, Composer validate/audit, npm production audit exit 0; audit 0 temuan. Browser Laravel/MySQL nyata exit 0, flow editor/publish/rollback dan screenshot desktop/narrow PASS; MySQL disposable dihapus. PHPUnit/MySQL/HTTP/schema lokal mandiri **NOT RUN**; mandatory PR CI diperlukan. [Matriks](phase-2-verification.md#2c-01b--viewer-token-os-protection-ipclog-redaction-2026-11-18).
- Implementation commit `45e5f7e8e5608ce9aabd5b50cf826e07f2c1dda4` pushed pada [PR #43](https://github.com/dejul/senkom/pull/43), target `main`. Status **WIP — local gate PASS; PR exact-head CI, merge, dan postmerge CI pending**. Token server berlaku maksimal 24 jam dan dapat dicabut; klien belum melakukan fetch/refresh. Parent 2C-01 WIP; batch berikutnya tidak dimulai.

## 2C-01a — main-process API origin provisioning/allowlist (2026-11-18)

- Closure: [PR #42](https://github.com/dejul/senkom/pull/42) MERGED manual pada `5e55dc67c39f1cc06e7d2af7a7bf9fe254949230`; final head `9d184600f9d862af7158578c5fb1a6c5f76e2fc8` terintegrasi. [CI postmerge `44322957575`](https://github.com/dejul/senkom/actions/runs/44322957575) SUCCESS tepat pada merge SHA, **16/16 mandatory PASS, 0 skip**. **2C-01a VERIFIED**; catatan WIP di bawah snapshot pra-merge.
- Branch `feature/phase-2c-01a` dari `origin/main` `8360510092c409fc7459cebb727050a37b70c37a`; worktree awal bersih, tiga worktree dan dua stash historis tidak diubah. Scope V2 baris 102: origin API pada main process; HTTPS, redirect, dan origin invalid ditolak. Parent 2C-01 menambahkan token/DPAPI, timeout, dan batas respons di batch berikutnya; 2C-01b dan fetch/cache/sync belum dikerjakan.
- `%APPDATA%\SENKOM\api-origin.json` hanya memuat origin HTTPS, maksimum 2 KiB, field tambahan ditolak; absent berarti unconfigured, invalid ditolak dengan log generik tanpa origin. Main process tidak meneruskan origin atau token melalui renderer/IPC. Guard request hanya menerima path pada origin tersebut, mengirim `redirect: 'error'`, dan menolak URL respons berbeda. [Provisi operator](operations-runbook.md#phase-2c-01a-provisi-origin-api-desktop).
- Fokus `npm test -- tests/desktop-api-origin.test.ts`: 2/2 PASS; full frontend 167/167, lint/kontrak, typecheck/build desktop+admin, Electron smoke, PHP lint, Composer validate/audit, npm production audit exit 0; audit 0 temuan. Browser E2E Laravel/MySQL nyata exit 0, seluruh skenario editor/publish/rollback dan screenshot desktop/narrow PASS; disposable MySQL dihapus. Backend PHPUnit/MySQL/HTTP/schema lokal mandiri **NOT RUN**; mandatory PR CI masih diperlukan. [Matriks](phase-2-verification.md#2c-01a--main-process-api-origin-provisioningallowlist-2026-11-18).
- Implementation commit `777be3aa18807198b065cb1636985b75e07b5ff4` pushed pada [PR #42](https://github.com/dejul/senkom/pull/42), target `main`. Status **WIP — local gate PASS; PR exact-head CI, merge, dan postmerge CI pending**. Tidak ada API fetch otomatis, token viewer, atau perubahan perilaku renderer. Next hanya menyelesaikan gate 2C-01a; 2C-01b memerlukan permintaan terpisah.

## Closure Phase 2B dan entry 2C (2026-11-18)

- [PR parent #41](https://github.com/dejul/senkom/pull/41) MERGED manual pada `8360510092c409fc7459cebb727050a37b70c37a`; final head `fa4fbb705971e9a2813d39823cef30b9cc4bd79b` terintegrasi. [CI PR exact-head `44312920056`](https://github.com/dejul/senkom/actions/runs/44312920056) dan [CI postmerge `44316726467`](https://github.com/dejul/senkom/actions/runs/44316726467) SUCCESS pada SHA masing-masing: **16/16 mandatory PASS, 0 skip**. Parent **2B-09 VERIFIED**; browser Laravel/MySQL, screenshot/SOP disetujui, UI/backend/kontrak/security tetap PASS.
- `docs/codegen-plan.md` baris 149–157 dan V2 baris 95–103: gate 2B-09/child 2B-09b menutup 2B dan membuka 2C; **tidak ada gate closure 2B tambahan**. Phase 2 secara keseluruhan belum COMPLETE (2C-05 tetap pending). Phase 2C telah disetujui di `docs/phase-2-approval.md`; first batch resmi **2C-01a**, main-process API origin provisioning/allowlist, exit HTTPS serta redirect/origin invalid ditolak. Token viewer/DPAPI milik 2C-01b; fetch/cache/sync milik batch berikutnya.

## Parent 2B-09 gate (2026-11-18)

- Prasyarat: 2B-09a dan 2B-09b **VERIFIED**. [PR #40](https://github.com/dejul/senkom/pull/40) MERGED manual pada `59d28b9107e3d4f59d0534aad7c9f7d6625ab538`; final head `49490717206a14cba6b8e6fdf52461a720b01ba6` ancestor `origin/main`. [CI postmerge `44310516992`](https://github.com/dejul/senkom/actions/runs/44310516992) SUCCESS tepat pada merge SHA: **16/16 mandatory PASS, 0 skip**, PHPUnit 141 tes/4.133 asersi. Closure evidence terintegrasi.
- Branch gate `feature/phase-2b-09-gate` dari `origin/main` SHA merge #40; worktree awal bersih, tiga worktree lain dan dua stash historis utuh. Scope hanya gate parent `docs/codegen-plan.md` baris 149; tidak ada perubahan produk/Phase 2C.
- Browser API nyata `powershell -NoProfile -File scripts/phase2-browser-e2e.ps1`: exit 0; draft/reload, error validasi, publish, history paginated dan preview immutable, dua editor 409/recovery, Undo/Redo, rollback cancel/stale/confirm, role/viewer/anonim PASS. MySQL loopback `_test`, sesi/fixture DEMO terisolasi; runner menghapus MySQL dan kredensial sementara. Browser E2E lokal **di luar matriks CI**.
- Screenshot DEMO baru `.artifacts/browser-e2e-aHjbBc/admin-desktop.png` dan `admin-narrow.png` diperiksa: desktop dan CSS narrow 376 px, tanpa overflow horizontal/clipping kontrol penting. Label peta fit zoom kecil pada narrow; zoom tersedia. SOP operator disetujui pengguna dan cocok dengan role, Save Draft, validasi, publish, history, rollback, konflik, dan batas operasi.
- Fokus UI 32/32, frontend 165/165, `npm run lint`, `npm run build` (kontrak/typecheck/build desktop+admin), `npm run smoke:desktop`, PHP lint, Composer validate/audit, npm production audit: exit 0; audit 0 temuan. PHPUnit/MySQL/HTTP/schema lokal mandiri **NOT RUN**; CI postmerge #40 membuktikan semua pada SHA merge. [Matriks parent](phase-2-verification.md#parent-2b-09-gate-2026-11-18).
- Evidence commit `aada9a61aefb481e64302ce338f233274d6de750` pada [PR parent #41](https://github.com/dejul/senkom/pull/41), target `main`; CI exact-head final menunggu. **2B-09 PARENT GATE PASSED — AWAITING MERGE**. Status parent **WIP** sampai PR gate merge dan CI postmerge PASS. PR parent-only memerlukan merge manual; Phase 2C tidak dimulai.

## 2B-09b — UI regression, responsive screenshots, SOP (2026-11-18)

- Closure: [PR #39](https://github.com/dejul/senkom/pull/39) MERGED manual pada `03cb968445075566b5ca058f1ab2a77f04a2e76c`; final head `364d7c761e8e86a73d5133980ac8597970a7e416` terintegrasi. [CI postmerge `44297273822`](https://github.com/dejul/senkom/actions/runs/44297273822) SUCCESS tepat pada merge SHA, **16/16 mandatory PASS, 0 skip**. Approval SOP/screenshot pengguna PASS; **2B-09b VERIFIED**. Catatan OPEN/WIP di bawah snapshot pra-merge. Parent 2B-09 tetap WIP sampai gate terpisah.
- Prasyarat **2B-09a VERIFIED**: [PR #38](https://github.com/dejul/senkom/pull/38) MERGED manual pada `40478ef5cc6056ae06594cb6bc661e0ae834c025`; final head `6799d265c18a0ca13fdd10833790308217d61983` terintegrasi. [CI PR exact-head `44291626090`](https://github.com/dejul/senkom/actions/runs/44291626090) dan [CI postmerge `44293444089`](https://github.com/dejul/senkom/actions/runs/44293444089) SUCCESS pada SHA masing-masing, 16/16 mandatory PASS, 0 skip. Browser API nyata tetap bukti lokal terpisah dari matriks CI.
- Branch `feature/phase-2b-09b` dari SHA merge #38, worktree awal bersih; tiga worktree lain dan dua stash historis utuh. Scope V2 baris 96: regresi UI, screenshot desktop/narrow, SOP operator, full UI/backend/contract tests dan approval. Parent gate 2B-09/Phase 2C tidak dikerjakan.
- `powershell -NoProfile -File scripts/phase2-browser-e2e.ps1`: exit 0 dengan API Laravel/MySQL nyata, seluruh skenario 2B-09a tetap PASS; screenshot DEMO desktop 1583×942 dan narrow 453×922 pada display scale, CSS viewport narrow 376 px tanpa horizontal overflow. Keduanya diperiksa visual; map/history dan panel properti tampil. Label peta pada fit zoom kecil di narrow, kontrol zoom tersedia. MySQL/env/port runner bersih. Fokus UI 32/32, frontend 165/165, lint/kontrak, typecheck/build, Electron smoke, PHP lint, Composer validate/audit, npm production audit exit 0. [SOP operator](phase-2b-operator-sop.md) tersedia; [matriks](phase-2-verification.md#2b-09b--ui-regression-responsive-screenshots-sop-2026-11-18).
- Snapshot pra-merge: pengguna menyetujui SOP dan kedua screenshot DEMO pada 2026-11-18. Implementation commit `364d7c761e8e86a73d5133980ac8597970a7e416` pushed; [CI PR implementation-head `44296133008`](https://github.com/dejul/senkom/actions/runs/44296133008) SUCCESS 16/16 mandatory PASS, 0 skip; PHPUnit 141/4.133, frontend 165, schema 33, MySQL/HTTP, lint/build/Electron/kontrak/audit PASS. [Auto-Merge V2 `44297158439`](https://github.com/dejul/senkom/actions/runs/44297158439) memblokir klaim VERIFIED yang belum dibuat saat itu; merge manual. Status WIP saat catatan ini ditulis; parent gate/Phase 2C tidak dimulai.

## 2B-09a — real API browser E2E (2026-11-18)

- Prasyarat parent 2B-08 **VERIFIED**: [PR #37](https://github.com/dejul/senkom/pull/37) MERGED manual pada `b7a6fba7c7c05bed95e00cc3f4e5e3d3460f2a74`; final head `80b1ba8bee3cdd8d6db4daf63c9a7dabf6c1309c` terintegrasi. [CI postmerge `44285811651`](https://github.com/dejul/senkom/actions/runs/44285811651) pada merge SHA SUCCESS, 16/16 mandatory PASS, 0 skip. Snapshot WIP parent di bawah historis.
- Branch `feature/phase-2b-09a` dari merge SHA itu, worktree awal bersih; tiga worktree lain dan dua stash historis utuh. V2 baris 95: E2E editor→draft→validate→publish memakai API Laravel nyata, flow lengkap dan negative tests. Parent 2B-09 tetap WIP; 2B-09b dan gate parent tidak dikerjakan.
- E2E memakai MySQL disposable loopback `senkom_ci_http_test`, Laravel `APP_ENV=testing`, fixture DEMO acak, storage sesi terisolasi, Vite proxy loopback dan Chromium Electron. `powershell -NoProfile -File scripts/phase2-browser-e2e.ps1` exit 0 dua kali: draft/reload, validasi positif/negatif, publish, 11 revisi/pagination, konflik dua editor HTTP 409 dan Undo/Redo/recovery, rollback cancel/stale/sukses, role/viewer/anonim. MySQL/env/port runner bersih setelah tes; [matriks lengkap](phase-2-verification.md#2b-09a--real-api-browser-e2e-2026-11-18).
- Full frontend 165/165, lint/kontrak, typecheck/build, Electron smoke, Composer validate/audit dan npm production audit exit 0. PHPUnit/MySQL/HTTP/schema/PHP lint lokal **NOT RUN**; CI PR wajib membuktikan. CI 16-check existing belum menjalankan suite browser API nyata.
- Implementasi commit `56a4d0ec93230cc2953ddc26b3bdb6318c7f6484` pushed; [PR #38](https://github.com/dejul/senkom/pull/38) OPEN. [CI PR implementation-head `44290153808`](https://github.com/dejul/senkom/actions/runs/44290153808) SUCCESS 16/16 mandatory PASS, 0 skip; PHPUnit 141/4.133, frontend 165, schema 33, HTTP/MySQL, lint/build/Electron/kontrak/audit PASS. [Auto-Merge V2 `44291159476`](https://github.com/dejul/senkom/actions/runs/44291159476) memblokir klaim VERIFIED yang sengaja tidak dibuat; merge manual. CI exact-head evidence commit masih diperlukan.
- Status **WIP — local gate dan implementation-head CI PASS; awaiting manual merge**. 2B-09a belum VERIFIED sebelum integrasi dan CI postmerge. Parent 2B-09 WIP; 2B-09b tidak dimulai.

## Parent 2B-08 gate (2026-11-18)

- Closure: PR #37 MERGED pada `b7a6fba7c7c05bed95e00cc3f4e5e3d3460f2a74`; [CI postmerge `44285811651`](https://github.com/dejul/senkom/actions/runs/44285811651) SUCCESS tepat pada SHA itu, **16/16 mandatory PASS, 0 skip**. **Parent 2B-08 VERIFIED**; status WIP berikut snapshot pra-merge.
- Branch `feature/phase-2b-08-gate` dari `origin/main` `b7cf2da83520d76edd690c9698f9320fbd2d82e8`; worktree awal bersih, tiga worktree lain dan dua stash historis utuh. Scope parent `docs/codegen-plan.md` baris 148: preview/history published dan rollback sesuai role; snapshot immutable, konfirmasi/audit, draft terpisah. Hanya bukti dokumentasi, tidak ada product change atau 2B-09.
- Prasyarat 2B-08b [PR #36](https://github.com/dejul/senkom/pull/36) MERGED manual pada SHA itu; final head `b780c88608929578d5d70bd2daf27e1f16960b02` ancestor `origin/main`. [CI PR exact-head `44238332704`](https://github.com/dejul/senkom/actions/runs/44238332704) dan [CI postmerge `44240949024`](https://github.com/dejul/senkom/actions/runs/44240949024) SUCCESS, masing-masing **16/16 mandatory PASS, 0 skip**; postmerge PHPUnit 141/4.133, MySQL/HTTP, frontend 165, schema 33, lint/build/Electron/OpenAPI/audit PASS. [Auto-Merge V2 `44239073232`](https://github.com/dejul/senkom/actions/runs/44239073232) memblokir klaim verifikasi ambigu; merge manual. **2B-08b VERIFIED**; snapshot WIP di bawah historis.
- Parent fokus 32/32, full frontend 165/165; lint, kontrak, build/typecheck, Electron smoke, PHP lint, Composer validate/audit dan npm production audit exit 0. Dua preview Electron Chromium + API mock exit 0: pagination, immutable preview, cancel 0 write, stale 409 0 mutasi, dua rollback sukses, role, dirty Undo/Redo/Save, 376 px, 0 error konsol. Backend/MySQL/HTTP lokal dan browser API nyata **NOT RUN**; CI merged baseline membuktikan backend, browser API nyata tetap 2B-09a. [Matriks rinci](phase-2-verification.md#parent-2b-08-gate-2026-11-18).
- Snapshot pra-merge: status **WIP** sampai PR gate MERGED dan CI postmerge pada SHA merge PASS. PR parent-only memerlukan merge manual; 2B-09 belum dimulai saat catatan ini ditulis.
- Bukti gate commit `ead99f60314b762df1241f6ff576e7de4e885acb`; dua dokumen scope, `git diff --cached --check` exit 0, 28 added lines/0 high-confidence secret hit. Evidence commit/push/PR/CI exact-head menyusul.

## 2B-08b - Rollback UI confirmation/role (2026-11-18)

- Closure 2026-11-18: PR #36 MERGED dan CI exact-head/postmerge di atas membuktikan integrasi. **2B-08b VERIFIED**; snapshot WIP di bawah historis.
- Prasyarat 2B-08a **VERIFIED**: [PR #35](https://github.com/dejul/senkom/pull/35) MERGED manual pada `883d7aeafc710fe569d0633285e42116eb7b07f4`; final head `8a1a18ae331113d3c74e9f282e47052438ba0ac2` ancestor `origin/main`. [CI PR exact-head `44234916790`](https://github.com/dejul/senkom/actions/runs/44234916790) dan [CI postmerge `44235676386`](https://github.com/dejul/senkom/actions/runs/44235676386) SUCCESS, **16/16 mandatory PASS, 0 skip**. Postmerge PHPUnit 141 tes/4.133 asersi, HTTP/MySQL, frontend 156, schema 33, lint/build/Electron/OpenAPI/audit PASS. Catatan 2B-08a OPEN/WIP di bawah historis.
- Branch `feature/phase-2b-08b` dari SHA merge #35, worktree awal bersih; tiga worktree lain dan dua stash historis utuh. V2 baris 94: rollback UI dengan konfirmasi dan role. Publisher/admin memilih revision history, membaca draft ETag, mengonfirmasi lalu POST dengan CSRF/`If-Match`; API existing menjaga audit, revision immutable, map scope dan atomisitas. Dirty draft/Undo/Redo dipertahankan; mismatch memakai recovery 409 existing. Backend/schema/OpenAPI/dependency tidak berubah.
- Fokus 27/27, full frontend 165/165, lint/kontrak/typecheck/build/Electron/PHP lint/Composer validate+audit/npm production audit exit 0, 0 vulnerability. Mock Electron Chromium exit 0: cancel 0 write, 409 tanpa mutasi, dua rollback sukses, role, snapshot/draft terpisah, dirty Undo/Redo/Save, 376 px, 0 console error. PHPUnit/MySQL/HTTP lokal dan browser API nyata **NOT RUN**; CI PR wajib membuktikan backend. [Matriks rinci](phase-2-verification.md#2b-08b---rollback-ui-confirmation-and-role).
- Status **WIP** sampai PR exact-head CI 16/16 tanpa skip, merge, dan CI postmerge. Parent 2B-08 WIP; 2B-09a UI API nyata tetap deferred.
- Implementasi commit `2b4443835052420b42406cf7044dfd4aea370ac8`; staged review enam path/336 added lines, `git diff --cached --check` exit 0, 0 high-confidence secret hit. Evidence commit/push/PR/CI exact-head menyusul.

## 2B-08a - Published preview/history (2026-11-18)

- Closure 2026-11-18: PR #35 MERGED dan CI exact-head/postmerge di atas membuktikan integrasi. **2B-08a VERIFIED**; snapshot OPEN/WIP berikut historis.
- Prasyarat parent 2B-07: [PR gate #34](https://github.com/dejul/senkom/pull/34) MERGED manual pada `695ac4110ea427b8cac18d98d6e201e92e8dd8cc`; final head `523086bf486d64a5c0afe3b0110d20d5cb32aa22` ancestor `origin/main`. [CI PR exact-head `44228932856`](https://github.com/dejul/senkom/actions/runs/44228932856) dan [CI postmerge `44230289073`](https://github.com/dejul/senkom/actions/runs/44230289073) SUCCESS pada SHA masing-masing, **16/16 mandatory PASS, 0 skip**. Postmerge PHPUnit 141 tes/4.133 asersi, HTTP/MySQL, frontend 153, schema 33, lint/build/Electron/OpenAPI/audit PASS. **Parent 2B-07 VERIFIED**; catatan OPEN/WIP di bawah historis.
- Branch `feature/phase-2b-08a` dari SHA merge #34, worktree awal bersih, worktree/stash lain utuh. Scope V2 baris 93: riwayat revisi published dan pratinjau snapshot immutable terpisah dari draft. UI menampilkan daftar berhalaman dari `GET /admin/map-revisions`, membuka `GET /admin/map-revisions/{id}` dalam kanvas read-only, dan memberi refresh eksplisit. Tidak ada rollback UI, write API baru, perubahan backend/schema/OpenAPI/dependency, atau perubahan alur Save/Validate/Publish.
- Fokus `npm test -- tests/admin-map-revision-history.test.ts tests/admin-map-canvas.test.ts`: exit 0, 8/8. Full `npm test`: exit 0, 156/156; `npm run lint`, `npm run build`, `npm run smoke:desktop`, PHP lint, Composer validate/audit, npm production audit: exit 0, 0 audit findings. Preview Electron Chromium + API mock: 11 revisi, halaman 1/2, snapshot lama vs baru, read-only, draft terpisah, 376 px, hanya GET, 0 error konsol; preview Save/Validate/Publish dan 409 existing tetap PASS. PHPUnit/MySQL/HTTP lokal dan UI browser API nyata **NOT RUN**; CI PR harus menjalankan backend. [Matriks rinci](phase-2-verification.md#2b-08a---published-preview-and-history).
- Implementasi commit `569cd3d61df8e36db851db842ebee74d9c01a4ad` pushed ke `feature/phase-2b-08a`; [PR #35](https://github.com/dejul/senkom/pull/35) OPEN, target `main`. [CI PR `44234050161`](https://github.com/dejul/senkom/actions/runs/44234050161) SUCCESS tepat pada head itu: **16/16 mandatory PASS, 0 skip**; PHPUnit 141/4.133, HTTP/MySQL, frontend 156, schema 33, lint/build/Electron/kontrak/audit PASS. [Auto-Merge V2 `44234702965`](https://github.com/dejul/senkom/actions/runs/44234702965) memblokir `PR head, base, or mergeability changed` saat evaluasi. Commit pembaruan bukti ini memerlukan CI exact-head baru. **GATE PASSED — AWAITING MERGE** setelah CI final; 2B-08a tetap WIP sampai integrasi dan CI postmerge. Refresh riwayat manual setelah publish; 2B-08b rollback, UI API nyata 2B-09a, dan parent 2B-08 di luar batch ini.

## Parent 2B-07 gate (2026-11-18)

- Closure 2026-11-18: PR #34 MERGED dan CI exact-head/postmerge di atas membuktikan bukti parent terintegrasi; semua acceptance Save Draft, Validate, Publish, konflik 409, role dan integritas PASS tanpa defect blocking. **Parent 2B-07 VERIFIED**. Snapshot WIP/OPEN berikut historis.
- [PR #33](https://github.com/dejul/senkom/pull/33) MERGED manual pada `51eb5e97d934705046ae14f214037998d74da112`; head final `2c5a5d6897453ef1af933266ec308b9fa1bef73a` ancestor `origin/main`. [CI PR exact-head `44221223490`](https://github.com/dejul/senkom/actions/runs/44221223490) dan [CI postmerge `44223766808`](https://github.com/dejul/senkom/actions/runs/44223766808) SUCCESS, masing-masing **16/16 mandatory PASS, 0 skip**. Postmerge PHPUnit 141 tes/4.133 asersi/0 skip, HTTP/MySQL, frontend 153, schema 33, lint/build/Electron/OpenAPI/audit PASS. **2B-07c VERIFIED/terintegrasi**; status PR OPEN di bawah historis.
- Branch `feature/phase-2b-07-gate` dari `origin/main` SHA merge #33; worktree awal bersih, worktree/stash lain utuh. Acceptance parent Save Draft, Validate, Publish, HTTP 409 dan integritas Phase 2A/2B **PASS** berdasarkan tes fokus 15/15, frontend 153/153, lint/build, Electron, PHP/Composer/npm, preview mock gabungan, dan backend/HTTP/MySQL CI postmerge #33. [Matriks dan batasan](phase-2-verification.md#parent-2b-07-gate-2026-11-18). UI browser API nyata dan PHPUnit/MySQL/HTTP lokal **NOT RUN**; backend CI nyata PASS. Preview gabungan exit 0 setelah skrip 2B-07b lama disesuaikan di artefak ignored untuk freeze 409; 0 console error, viewport 376 px.
- [PR gate #34](https://github.com/dejul/senkom/pull/34) OPEN, target `main`, head evidence awal `9aa7a16f3d661161c833d95aa010e5e12eac95b3`. [CI PR `44227814522`](https://github.com/dejul/senkom/actions/runs/44227814522) SUCCESS pada head itu, **16/16 mandatory PASS, 0 skip**; PHPUnit 141/4.133, HTTP/MySQL, frontend 153, schema 33 dan semua gate lain PASS. [Auto-Merge V2 `44228673671`](https://github.com/dejul/senkom/actions/runs/44228673671) memblokir `Missing or ambiguous verification claim` untuk parent-only PR; merge manual wajib. **GATE PASSED — AWAITING MERGE** setelah CI ulang head final pembaruan bukti. Parent **VERIFIED** hanya setelah PR gate MERGED, bukti di `main`, dan CI postmerge SHA merge PASS. 2B-08 belum dimulai.

## 2B-07c - Concurrent editing dan pemulihan konflik 409 (2026-11-18)

- Prasyarat 2B-07b: [PR #32](https://github.com/dejul/senkom/pull/32) MERGED manual pada `532d08f0518898a26f70cfde62d984cb41f80599`; head final `180058e631a3488f628598f823ccd17c69c3a6ee` ancestor `origin/main`. [CI exact-head `44200635829`](https://github.com/dejul/senkom/actions/runs/44200635829) dan [CI postmerge `44216871566`](https://github.com/dejul/senkom/actions/runs/44216871566) SUCCESS pada SHA masing-masing, 16/16 mandatory PASS, 0 skip. Postmerge: PHPUnit 141 tes/4.133 asersi, HTTP smoke dua editor, frontend 152, schema 33 PASS. **2B-07b VERIFIED/terintegrasi**; catatan WIP di bawah historis.
- Branch `feature/phase-2b-07c` dari `origin/main` SHA merge #32; worktree awal bersih, worktree dan dua stash historis tetap utuh. Scope V2 baris 92: konflik concurrent editing dan 409 tanpa hilangnya edit lokal. Backend existing memakai exact `If-Match`, menolak 409 sebelum write/audit, meminta muat ulang dan gabungkan perubahan. Tidak ada desain merge otomatis yang disetujui.
- UI membekukan Save/Validate/Publish pada `409 DRAFT_CONFLICT`, menghapus validasi lama, mempertahankan draft lokal dan Undo/Redo. Tautan eksplisit membuka draft server terbaru di tab baru; operator menyalin ulang edit yang diperlukan ke versi terbaru sebelum menyimpan. Tidak ada retry/overwrite otomatis, backend/schema/OpenAPI/dependency change, atau perubahan published snapshot.
- Fokus `npm test -- tests/admin-map-conflict-recovery.test.ts tests/admin-map-draft-save.test.ts tests/admin-map-validation-publish.test.ts`: exit 0, 15/15. Full `npm test`: exit 0, 153/153; `npm run lint`, `npm run build`, `npm run smoke:desktop`, PHP lint, Composer validate/audit, npm production audit: exit 0, 0 audit findings. Preview Electron Chromium + API mock dua editor: 409, local Undo/Redo, tab baru memuat server terkini, reapply manual, role, validate/publish 409, 376 px dan 0 write tambahan PASS. PHPUnit/MySQL/HTTP API nyata **NOT RUN lokal**; CI PR head awal di bawah menjalankannya.
- Implementasi commit `6a46e504eec13adf74553e73f82fa7821e45f89b`. [PR #33](https://github.com/dejul/senkom/pull/33) OPEN, head awal `2b3cf22d989d618b84ea85cd3245e48d7c3bd2d4`; [CI PR `44219799721`](https://github.com/dejul/senkom/actions/runs/44219799721) SUCCESS tepat pada head itu, 16/16 mandatory PASS, 0 skip: PHPUnit 141/4.133, frontend 153, schema 33, HTTP/MySQL/lint/build/Electron/kontrak/audit PASS. [Auto-Merge V2 `44220592477`](https://github.com/dejul/senkom/actions/runs/44220592477) memblokir `Missing or ambiguous verification claim`; merge manual wajib. Status **WIP: LOCAL/PR CI PASS; FINAL DOC HEAD CI, MERGE/POSTMERGE PENDING**. Parent 2B-07 WIP. [Matriks rinci](phase-2-verification.md#2b-07c---concurrent-editing-and-409-conflict-recovery).

## 2B-07b - Validate/Publish dan error detail (2026-11-18)

- Closure 2026-11-18: PR #32 dan CI exact-head/postmerge di atas membuktikan integrasi Validate/Publish; **2B-07b VERIFIED**. Snapshot implementasi berikut historis.
- Prasyarat 2B-07a: [PR #31](https://github.com/dejul/senkom/pull/31) MERGED manual pada `df80bea194405b97b97b07e4ae402f79e02a4da1`; head final `24ff961c4b10a8acd008217e46f59069f02286f9` ancestor `origin/main`. [CI exact-head `44149983084`](https://github.com/dejul/senkom/actions/runs/44149983084) dan [CI postmerge `44197592133`](https://github.com/dejul/senkom/actions/runs/44197592133) SUCCESS pada SHA masing-masing, 16/16 mandatory PASS, 0 skip. Backend postmerge: PHPUnit 141 tes/4.133 asersi, HTTP smoke, MySQL disposable, frontend 145, schema 33 PASS. **2B-07a VERIFIED/terintegrasi**. Catatan WIP di bawah adalah snapshot pra-merge.
- Branch `feature/phase-2b-07b` dari SHA merge #31; worktree awal bersih, dua stash/worktree lain utuh. Scope V2 hanya Validate/Publish dan detail error: `POST /api/v1/admin/map/validate` atas draft tersimpan memberi `valid`, `version`, `issues(path,code,message)`; `POST /api/v1/admin/map/publish` membutuhkan draft tervalidasi dan membuat snapshot immutable. Publisher/admin dapat validasi/publish; editor hanya Save Draft; viewer/published read-only. Semua write memakai CSRF dan exact `If-Match`; server menjaga RBAC/map scope, referensi, transaksi, audit dan versioning. Recovery 409 2B-07c, preview/history 2B-08 dan E2E API nyata 2B-09 di luar scope. Tanpa backend/schema/OpenAPI/dependency change.
- UI menolak validasi saat draft dirty, menampilkan issue detail aman, mengaktifkan Publish hanya setelah validasi sukses untuk ETag sama, serta mempertahankan perubahan lokal pada kegagalan. Publish sukses menampilkan revision ID/waktu dan memuat versi draft terbaru; jika reload gagal, versi lokal ditandai tidak tersedia tanpa membuang edit. Save Draft, Undo/Redo dan isolasi published tetap.
- Fokus `npm test -- tests/admin-map-validation-publish.test.ts tests/admin-map-draft-save.test.ts`: exit 0, 14/14. Full `npm test`: exit 0, 152/152. `npm run lint`, `npm run build`, `npm run smoke:desktop`, `php apps/api/tools/lint.php`, `composer --working-dir apps/api validate --strict`, `composer --working-dir apps/api audit --locked`, `npm audit --omit=dev --audit-level=low`: exit 0; audit 0 temuan. Preview Electron Chromium + API mock: save gagal/retry, issue `PATH_GAP`, 409 validasi/publish, publish sukses, viewer isolation, role gates, 376 px, CSRF/If-Match, 0 error konsol PASS. PHPUnit/HTTP/MySQL lokal dan UI API nyata NOT RUN; CI PR wajib menjalankan backend.
- Implementasi commit `8db4ffd1d7e72b162ee1ea06f1a378ad787e9b1d`. Status **WIP: LOCAL ACCEPTANCE PASS; PR/CI/MERGE PENDING**. 2B-07b belum VERIFIED; parent 2B-07 WIP. [Matriks rinci](phase-2-verification.md#2b-07b---validatepublish-and-error-detail).

## 2B-07a - Save Draft, dirty state, request failure (2026-11-18)

- Closure 2026-11-18: PR #31, merge SHA dan CI exact-head/postmerge di atas membuktikan integrasi Save Draft; **2B-07a VERIFIED**. Bukti WIP berikut adalah snapshot historis.
- Prasyarat: [PR closure #30](https://github.com/dejul/senkom/pull/30) MERGED pada `ee32cf73e6f9b30eadb8e09c379f3e48bd3a902d`; head `686821d8acec8e7e4ae01b77067b0cf154625602` ancestor `origin/main`. [CI postmerge `44145850265`](https://github.com/dejul/senkom/actions/runs/44145850265) SUCCESS pada SHA merge, 16/16 mandatory PASS, 0 skip. Dokumen closure parent 2B-06 VERIFIED terintegrasi; tidak ada defect blocking.
- Branch `feature/phase-2b-07a` dari SHA merge #30; worktree awal bersih, worktree/stash lain utuh. Scope V2 hanya Save Draft, dirty state dan request failure: draft lokal bertahan saat simpan gagal. `PUT /api/v1/admin/map/draft` existing memakai CSRF dan exact `If-Match` ETag. Editor/admin dapat menyimpan draft; publisher/viewer/published read-only. Server memvalidasi, mengotorisasi dan menyimpan atomik. Validate/publish 2B-07b, pemulihan konflik 409 2B-07c, E2E API nyata 2B-09a; tanpa perubahan backend, schema, OpenAPI atau dependency.
- Implementasi: GET draft memeriksa versi/ETag; tombol Simpan draft aktif hanya ketika dirty dan tidak sedang menyimpan; PUT mengirim konten penuh, CSRF dan If-Match. Respons sukses memperbarui baseline/ETag kanonis tanpa membuang edit baru selama request. Kegagalan network/403/409/419/422 mempertahankan present, Undo/Redo dan dirty; pesan error tampil. Copy form menjelaskan perubahan lokal sampai Simpan draft.
- Fokus `npm test -- tests/admin-map-draft-save.test.ts tests/admin-map-canvas.test.ts`: exit 0, 12/12. Full `npm test`: exit 0, 145/145. `npm run lint`, `npm run build` (kontrak/typecheck/production builds), `npm run smoke:desktop`, `php apps/api/tools/lint.php`, `composer --working-dir apps/api validate --strict`, `composer --working-dir apps/api audit --locked`, `npm audit --omit=dev --audit-level=low`: exit 0; audit 0 temuan. Preview Electron Chromium + API mock: save/reload, 422/409 mempertahankan edit dan Undo/Redo, role/published, 376 px, 0 error konsol PASS. PHPUnit/HTTP/MySQL lokal dan UI API nyata NOT RUN; CI PR wajib menjalankan backend/HTTP/MySQL.
- Implementasi commit `24555d6cdce09eb227ea44bd9280d0b7a19971ba`. Status **WIP: LOCAL ACCEPTANCE PASS; PR/CI/MERGE PENDING**. 2B-07a belum VERIFIED; parent 2B-07 WIP. [Matriks rinci](phase-2-verification.md#2b-07a---save-draft-dirty-state-request-failure).

## Parent 2B-06 gate (2026-11-17)

- Closure 2026-11-18: [PR parent #29](https://github.com/dejul/senkom/pull/29) MERGED manual pada `cd20d914a2b24bbffc8acb40ac4eb6811dadf5da`; head final `cdcf293bb235c40fd49a2a2355260a64f1fcf3d6` ancestor `origin/main`. [CI PR exact-head `44105907590`](https://github.com/dejul/senkom/actions/runs/44105907590) dan [CI postmerge `44107426624`](https://github.com/dejul/senkom/actions/runs/44107426624) SUCCESS, masing-masing 16/16 mandatory PASS, 0 skip. [Auto-Merge V2 `44107348690`](https://github.com/dejul/senkom/actions/runs/44107348690) memblokir parent-only PR karena `Missing or ambiguous verification claim`; merge manual selesai. **Parent 2B-06 VERIFIED** tanpa defect blocking. Catatan WIP/pending berikut adalah snapshot pra-merge. 2B-07 belum dimulai.
- Branch `feature/phase-2b-06-gate` dari `origin/main` `e71d3cf7d945f205755ebae17085a635b31bc431`; worktree awal bersih, stash/worktree lain utuh. PR #26/#27/#28 MERGED; SHA merge dan CI postmerge ketiganya diverifikasi, masing-masing 16/16 mandatory PASS, 0 skip. Bukti child 2B-06a/b terintegrasi.
- Acceptance yang tersedia: create kabel/sirkuit Power dan edit sirkuit, validasi source/load/terminal/supply/path, koridor FO+Power, referensi dan duplikat, integritas kabel/sirkuit/logical/layout, draft/role/Undo/Redo, serta regresi canvas/node/edge/FO/logical PASS. Fokus 24/24; frontend 138/138; lint, kontrak, typecheck, build, Electron, PHP lint, Composer dan npm audit exit 0. Preview Web Admin gabungan dengan API mock exit 0, viewport 376 px, 0 API write/error konsol. PHPUnit/HTTP/MySQL lokal dan UI API nyata NOT RUN; CI postmerge #28 menjalankan backend. [Matriks dan perintah](phase-2-verification.md#parent-2b-06-gate-2026-11-17).
- Rekonsiliasi scope **B**: V2 2B-06a/b (`docs/codegen-microbatch-plan-v2.md` baris 88–89) dan acceptance parent (`docs/codegen-plan.md` baris 146) tidak mensyaratkan edit kabel Power. Instruksi edit kabel pada prompt gate sebelumnya melampaui plan; bukti lama tetap utuh. [Analisis rinci](phase-2-verification.md#parent-2b-06-gate-2026-11-17).
- Snapshot pra-merge: **Parent 2B-06 WIP**; acceptance approved lokal PASS tanpa defect blocking; saat itu menunggu PR gate, CI exact-head, merge dan CI postmerge sebelum VERIFIED. 2B-07 belum dimulai.
- Commit evidence awal `3bd8400d23bd5f46e6de9caecd1e708609a2384e` pushed; [PR parent #29](https://github.com/dejul/senkom/pull/29) OPEN. CI exact-head PR berjalan; merge parent-only tetap manual.
- Commit dokumentasi `ee12dfd0d558de90418eee1fff3af0e4017373a2` ter-push setelah PR #29 MERGED dan tidak masuk merge SHA; branch `fix/phase-2b-06-closure` dari merge SHA merekonsiliasi bukti tanpa mengubah source produk.

## 2B-06b - form koridor/jalur bersama (2026-11-17)

- Closure 2026-11-17: [PR #27](https://github.com/dejul/senkom/pull/27) MERGED pada `b9696b29cba783dde9a0074daa12bb55cac0194c`; head final `7ac911bea18cb71fd0b0fbddca8560814dc259ad` ancestor `origin/main`. [CI PR exact-head `44097282091`](https://github.com/dejul/senkom/actions/runs/44097282091) dan [CI postmerge `44098705647`](https://github.com/dejul/senkom/actions/runs/44098705647) SUCCESS pada SHA masing-masing, 16/16 mandatory PASS, 0 skip. **2B-06b VERIFIED/terintegrasi** tanpa defect blocking. Auto-Merge V2 [`44098460458`](https://github.com/dejul/senkom/actions/runs/44098460458) menolak `Missing or ambiguous verification claim`; PR kemudian MERGED manual. Parent 2B-06 tetap **WIP**, gate parent belum dijalankan. Catatan OPEN/pending di bawah adalah snapshot pra-merge.
- PR #26 MERGED manual pada `946c46efdbd5bb696d14e876a7fe2f966212a1ec`; head final `4da31e9d218f3a0ffce321df1a3c4bf289c42a8b` ancestor `origin/main`. [CI PR exact-head `44088905722`](https://github.com/dejul/senkom/actions/runs/44088905722) dan [CI postmerge `44090910579`](https://github.com/dejul/senkom/actions/runs/44090910579) SUCCESS, masing-masing 16/16 mandatory PASS, 0 skip. 2B-06a **VERIFIED/terintegrasi**; catatan OPEN/pending di bawah adalah snapshot historis.
- Scope V2 `2B-06b`: form corridor/shared-route memakai `routes(id,code,name,cableIds)`, membership kabel FO/Power eksplisit dari draft API; tanpa urutan kabel, metadata/status, relasi site/device langsung, eksklusivitas kabel, atau inferensi dari layout. Branch `feature/phase-2b-06b` dari PR #26 merge SHA, worktree awal bersih; stash/worktree lain utuh. Form create/edit koridor menolak nama kosong, kabel kosong/hilang/duplikat, dan kode duplikat; kabel dan sirkuit Power tetap utuh. Parent 2B-06 masih WIP, 2B-07 tidak dimulai.
- Fokus koridor+regresi Power/FO/logical/canvas 24/24, frontend 138/138, typecheck, lint/format/kontrak/build, Electron smoke, PHP lint, Composer validate/audit, npm production audit exit 0. Preview Electron Chromium + API mock: koridor FO+Power, Power cable dari form 2B-06a, error kode/kabel kosong, Undo/Redo, dirty, editor/admin/publisher/viewer/published, viewport 376 px, 0 API write/error konsol PASS. PHPUnit/HTTP/MySQL lokal dan UI API nyata **NOT RUN**; CI PR wajib menjalankan backend. [Matriks rinci](phase-2-verification.md#2b-06b---corridorshared-route-forms).
- Commit implementasi `8e5a8cb263fbbaed56d4bc6677216b41a939c95c` pushed; [PR #27](https://github.com/dejul/senkom/pull/27) OPEN. [CI PR awal `44097046227`](https://github.com/dejul/senkom/actions/runs/44097046227) berjalan pada SHA implementasi saat catatan ini; commit evidence memerlukan CI exact-head baru. Status **LOCAL ACCEPTANCE PASS; EVIDENCE CI/MERGE PENDING**. Jangan tandai 2B-06b VERIFIED atau mulai parent gate/2B-07 sebelum integrasi.

## 2B-06a - form Power source/load/main/backup (2026-11-17)

- Closure 2026-11-17: PR #26 dan postmerge CI di atas membuktikan integrasi 2B-06a; **VERIFIED**. Catatan status pending berikut adalah snapshot pra-merge.

- PR #25 MERGED pada `824aca0c43d1318f10135d4a082f0e909b258948`; commit koreksi `f6f71fef573a4de6c170a7adfe606aa5f343d6be` ancestor `origin/main`. [CI PR exact-head `44038157094`](https://github.com/dejul/senkom/actions/runs/44038157094) dan [CI postmerge `44039229982`](https://github.com/dejul/senkom/actions/runs/44039229982) SUCCESS pada SHA masing-masing, 16/16 mandatory PASS, 0 skip. Dokumen koreksi terintegrasi; parent **2B-05 VERIFIED** tanpa defect blocking.
- Scope V2 berikutnya `2B-06a`: form Power source/load/main/backup dan validasi terminal/supply type; parent `docs/codegen-plan.md` mewajibkan relasi Power terlihat. Branch `feature/phase-2b-06a` dari merge SHA PR #25, worktree awal bersih; stash/worktree lain utuh. Form lokal menambah kabel Power, memilih terminal sumber/beban dan supply PLN/UPS/backup, mengurutkan kabel circuit, menolak referensi/duplikat/jenis sumber salah, dan memperlihatkan masalah path. 2B-06b corridor/shared-route, 2B-07 save/publish, API/backend/schema, dan konektivitas dari gambar di luar scope.
- Tes fokus Power+regresi 15/15, frontend 134/134, typecheck, lint/format/kontrak/build, Electron smoke, PHP lint, Composer validate/audit, npm production audit exit 0. Preview Electron Chromium + API mock: tambah kabel/sirkuit backup, UPS invalid, path, Undo/Redo, role, inventory/FO/logical/node-edge, viewport 376 px, 0 API write/error konsol PASS. PHPUnit/HTTP/MySQL lokal dan UI API nyata **NOT RUN**; CI PR wajib menguji backend. [Matriks rinci](phase-2-verification.md#2b-06a---power-sourceloadmainbackup-forms).
- Commit implementasi `dcb1469f1200b9216ba719fc472446b4cc34ee6c` pushed; [PR #26](https://github.com/dejul/senkom/pull/26) OPEN. [CI PR `44087815330`](https://github.com/dejul/senkom/actions/runs/44087815330) SUCCESS pada commit itu, 16/16 mandatory PASS, 0 skip. [Auto-Merge V2 `44088524887`](https://github.com/dejul/senkom/actions/runs/44088524887) menolak: `Missing or ambiguous verification claim`; status belum VERIFIED sehingga tidak ada claim. Commit evidence berikutnya memerlukan CI exact-head ulang. Status **LOCAL ACCEPTANCE PASS; EVIDENCE CI/MERGE PENDING**. Jangan mulai 2B-06b.

## Parent 2B-05 gate (2026-11-17)

- PR #24 MERGED pada `5c2ffc40d95d48e15f36ba01db01b6a356a614a4`; head final `1e237f74996e86756fb2faa671d0a22c2ff84f95` ancestor `origin/main`. [CI PR exact-head `44036119275`](https://github.com/dejul/senkom/actions/runs/44036119275) dan [CI postmerge `44037036093`](https://github.com/dejul/senkom/actions/runs/44037036093) SUCCESS, masing-masing 16/16 mandatory PASS, 0 skip. Tes integrasi dan dokumentasi terintegrasi, tanpa defect blocking. **Parent 2B-05 VERIFIED**; catatan WIP/OPEN di bawah adalah snapshot pra-merge.
- PR #23 MERGED manual pada `45d27b750bf77770406d56b1e28e04a77b865e07`; head final `e6916eb105a00406ab4485fbec1fd4dbdd70a84f` ancestor `origin/main`. [CI PR exact-head `44032596615`](https://github.com/dejul/senkom/actions/runs/44032596615) dan [CI postmerge `44033664504`](https://github.com/dejul/senkom/actions/runs/44033664504) SUCCESS, masing-masing 16/16 mandatory PASS, 0 skip. **2B-05c VERIFIED/terintegrasi**; catatan OPEN/pending di bawah adalah snapshot historis.
- Branch `feature/phase-2b-05-gate` dari merge SHA, worktree awal bersih; stash dan worktree lain utuh. Acceptance gabungan device/port, kabel/core/terminasi/splice FO, Ring A/B dan alokasi memakai ID draft, memisahkan inventory fisik dari logical/layout, serta mempertahankan role, published read-only, dirty dan Undo/Redo. Tes integrasi+regresi 19/19, frontend 130/130, policy 51/51, lint/kontrak/typecheck/build, Electron, PHP lint, Composer/npm audit PASS. Preview Chromium dengan API mock menjalankan rantai form gabungan, konflik, role, node/edge, viewport 376 px, 0 write/error konsol. UI API nyata dan backend lokal NOT RUN; CI postmerge menjalankan PHPUnit 141/4.133, HTTP dan MySQL. [Bukti rinci](phase-2-verification.md#parent-2b-05-gate-2026-11-17).
- Commit gate `7685e01e7d5ff4d5dc3988c6dbb7589089f35154` pushed; [PR #24](https://github.com/dejul/senkom/pull/24) OPEN. [CI PR awal `44035929418`](https://github.com/dejul/senkom/actions/runs/44035929418) berjalan pada SHA itu; commit evidence berikutnya memerlukan CI exact-head ulang. Parent **2B-05 WIP** sampai PR gate MERGED, CI exact-head PR dan postmerge `main` 16/16 PASS, 0 skip. Server save/publish tetap milik 2B-07; 2B-06 tidak dimulai.

## 2B-05c - logical Ring A/B dan alokasi (2026-11-17)

- PR #22 MERGED manual pada `9f31daa3f88ee7e7a53a0b00f5b36e17b52d20fd`; head final `cdee506e9ed5f1e241ecbfa692304871bb1e895b` ancestor `origin/main`. [CI PR exact-head `44016645578`](https://github.com/dejul/senkom/actions/runs/44016645578) dan [CI postmerge `44017760477`](https://github.com/dejul/senkom/actions/runs/44017760477) SUCCESS, masing-masing 16/16 mandatory PASS, 0 skip. **2B-05b VERIFIED/terintegrasi**; catatan PR OPEN di bawah adalah snapshot historis.
- Branch `feature/phase-2b-05c` dari merge SHA, worktree awal bersih; stash/worktree lain utuh. Scope V2 hanya form logical link `fo_ring_a`/`fo_ring_b` dan alokasi core berurutan. Referensi port optik/core harus berasal dari draft API. `CORE_CONFLICT` ditolak saat draft; `PORT_CONFLICT`, faulty/unknown, `PATH_START`/`PATH_GAP`/`PATH_END` ditampilkan sebagai masalah publish lokal sesuai Phase 2A. Tidak ada perubahan FO fisik, API write, server save, backend/schema, atau fitur 2B-06/07.
- `apps/admin-web/src/logical-forms.tsx` menambah create/edit link, urutan core dengan pindah/hapus/tambah, pemisahan Ring A/B, error draft, dan pratinjau masalah publish. Integrasi `map-canvas.tsx` memakai riwayat Undo/Redo dan hanya tampil untuk editor/admin draft. Fokus logical+regresi FO/device/node-edge 18/18; frontend 129/129; policy 51/51; lint/format/kontrak/typecheck/build, Electron smoke, PHP lint, Composer install dry-run/validate/audit, npm production audit PASS. Preview Chromium Electron + API mock: Ring B, konflik core/port, faulty/unknown, path gap, Undo/Redo, role, viewport 376 px, regresi FO/node-edge, 0 API write/error konsol PASS. PHPUnit/HTTP/MySQL lokal dan UI API nyata NOT RUN; PR CI wajib menjalankan backend. Bukti rinci di `docs/phase-2-verification.md`.
- Commit implementasi `724bf5b854da1ab8698b4fd64c4bccc08aede7e4` pushed; [PR #23](https://github.com/dejul/senkom/pull/23) OPEN. [CI PR awal exact-head `44031609963`](https://github.com/dejul/senkom/actions/runs/44031609963) SUCCESS pada SHA itu, 16/16 mandatory PASS, 0 skip; commit evidence ini memerlukan CI exact-head ulang. Status **2B-05c GATE PASSED pada head awal; AWAITING CI EVIDENCE HEAD DAN MERGE**. Parent **2B-05 WIP** sampai gate parent terpisah setelah semua child terintegrasi.

## 2B-05b - form inventaris FO (2026-11-17)

- PR #21 MERGED pada `576467c809875ec11cf602c0f30cf20c19245bff`; [CI postmerge `44011871890`](https://github.com/dejul/senkom/actions/runs/44011871890) SUCCESS, 16/16 mandatory, 0 skip. **2B-05a VERIFIED/terintegrasi**. Snapshot PR #21 OPEN di bawah tetap bukti historis sebelum merge.
- Branch `feature/phase-2b-05b` dari merge SHA; worktree awal bersih, stash dan worktree lain utuh. Konflik scope prompt lama diselesaikan oleh instruksi pengguna: sesuai V2, 2B-05b hanya form cable/core/termination/splice FO; logical Ring A/B dan alokasi milik 2B-05c, save server milik 2B-07.
- Form lokal editor/admin memakai site, cable, core, optical port, dan closure ID dari draft API. Validasi menolak referensi hilang, duplikat, kapasitas/nomor core, ujung terminasi salah/terpakai, self-splice, closure/site salah, dan reverse duplicate. Core faulty/unknown tetap boleh menjadi inventaris fisik; status `allocated` tidak diisi manual. Perubahan masuk Undo/Redo dan dirty state; publisher/viewer/published read-only. Tidak ada API write, backend/schema, atau logical edit.
- Fokus FO + regresi inventory/node-edge 13/13; frontend 124/124; policy 51/51. Lint/format/kontrak/typecheck/build, Electron smoke, PHP lint, Composer install dry-run/validate/audit, npm production audit PASS. Preview Chromium Electron + API mock: 4 form, konflik, Undo/Redo, role, device/port regresi, node/edge regresi, viewport 376 px, 0 API write/error konsol PASS. PHPUnit/HTTP/MySQL lokal dan UI API nyata NOT RUN; CI PR wajib menjalankan backend. Rincian di `docs/phase-2-verification.md`.
- Commit implementasi `ac5f380` dan koreksi encoding sejarah `96eaed03f2a4b6f4efaefa04c7fbce4d3a619e2c` pushed; [PR #22](https://github.com/dejul/senkom/pull/22) OPEN. [CI PR awal exact-head `44015738219`](https://github.com/dejul/senkom/actions/runs/44015738219) SUCCESS pada `96eaed03`, 16/16 mandatory PASS, 0 skip; commit evidence ini memerlukan CI exact-head ulang. Status **2B-05b GATE PASSED pada head awal; AWAITING CI EVIDENCE HEAD DAN MERGE**. Parent **2B-05 WIP**; jangan mulai 2B-05c sebelum instruksi baru.

## 2B-05a - form perangkat/port dan validasi referensi (2026-11-17)

- PR #20 MERGED manual pada `574f554742e96b8f7061ff73931c22e549e4780c`; head `1625214f7dd95dd70aec5faa9351da667f66739b` ancestor `origin/main`. [CI PR exact-head `43996062512`](https://github.com/dejul/senkom/actions/runs/43996062512) dan [CI postmerge `main` `43997799061`](https://github.com/dejul/senkom/actions/runs/43997799061) SUCCESS, masing-masing 16/16 mandatory, 0 skip. Parent **2B-04 VERIFIED**; kegagalan dan recovery Electron historis tetap di bawah.
- Scope V2 2B-05a: form device/port pada draft, pilihan site/device dengan ID dari API, validasi referensi dan duplikat, pesan error relasi. Tidak ada form FO/logical, mutasi API, save server, perubahan backend/schema, atau konektivitas yang disimpulkan dari gambar. Parent 2B-05 tetap **WIP**.
- Branch `feature/phase-2b-05a` dari `origin/main` merge SHA; worktree awal bersih. `apps/admin-web/src/map-canvas.tsx` menambah form lokal editor/admin dan dirty state inventory; `tests/admin-map-inventory-form.test.ts` menguji referensi, skema, riwayat. Fokus 2/2, frontend 119/119, policy 51/51, lint/format/kontrak/typecheck/build, Electron smoke, PHP lint, Composer install/validate/audit, npm production audit PASS. Preview Web Admin + API mock: create device/port, ID API, error duplikat/relasi, Undo/Redo, read-only role, viewport 376 px, 0 API write/console error PASS; preview node/edge regresi PASS. API UI nyata serta PHPUnit/HTTP/MySQL lokal NOT RUN; CI PR wajib menjalankan backend lengkap. Bukti rinci di `docs/phase-2-verification.md`.
- Commit implementasi `757065e8b5544ce7ab0e1ed9b88fcd6ef14d834a` pushed; [PR #21](https://github.com/dejul/senkom/pull/21) OPEN. [CI PR awal `44000542132`](https://github.com/dejul/senkom/actions/runs/44000542132) berjalan pada SHA itu; commit dokumentasi ini memerlukan CI exact-head ulang. Status **2B-05a LOCAL GATE PASSED; PR CI PENDING**. Jangan tandai VERIFIED sebelum gate PR exact-head terpenuhi; jangan mulai 2B-05b.

## Parent 2B-04 gate dilanjutkan (2026-11-17)

- PR #19 MERGED manual pada `74ce164104e414296c6b9a5f2950265a9ef1749f`; head `5c3582554bfae560f32b9367624b4ed38423a98f` ancestor `origin/main`. [CI PR exact-head `43938179839`](https://github.com/dejul/senkom/actions/runs/43938179839) dan [CI postmerge `43993703538`](https://github.com/dejul/senkom/actions/runs/43993703538) SUCCESS pada SHA masing-masing, 16/16 mandatory, 0 skip. Crash monitoring dan assertion tetap aktif; **2B-04b VERIFIED/terintegrasi**. Kegagalan CI `43898923692` tetap tercatat di bawah sebagai riwayat.
- Branch `feature/phase-2b-04-gate` fast-forward ke merge SHA. Dua dokumen gate WIP lama dicadangkan di `.artifacts/phase2b04-gate-preserved/`, disimpan dalam stash, lalu direkonsiliasi tanpa menghapus bukti historis; stash tetap ada. Tidak ada perubahan kode produk.
- Acceptance gabungan: create edge dari koneksi inventory, node/layer valid, rute ortogonal dan endpoint binding; insert/drag/input angka/remove waypoint; delete confirm/cancel; Undo/Redo dan dirty node/edge; editor/admin draft versus publisher/viewer/published; inventory fisik tetap. Fokus 21/21, frontend 117/117, role/schema 37/37, policy 51/51 PASS. Lint/kontrak/typecheck/build, Electron, PHP lint, Composer/npm audit PASS. Preview Chromium Electron + API mock menguji node create, edge create, node move, numeric `(480,320)`, drag/cancel/delete/Undo/Redo, role read-only, viewport 376 px, 0 write API dan 0 console error: PASS. API nyata UI dan PHPUnit/HTTP/MySQL lokal NOT RUN; CI postmerge menjalankan backend lengkap. Bukti di `docs/phase-2-verification.md`.
- Commit evidence `73003d0937fefd593c8f06a3ece78e675ea14c66` pushed ke branch gate; [PR #20](https://github.com/dejul/senkom/pull/20) OPEN. Commit dokumentasi ini memerlukan CI exact-head baru. Parent 2B-04 **WIP** sampai PR gate MERGED dan CI postmerge `main` PASS; 2B-05a belum dimulai.

## Recovery Electron CI untuk parent 2B-04 (2026-11-16)

- PR #18 MERGED pada `c824558e859162411f0e32fb7ffcc5e444701907`; head `e0dc07395a59f3d571a477b088a0d29132d7737b` ancestor `origin/main`. [CI PR `43894841264`](https://github.com/dejul/senkom/actions/runs/43894841264) PASS 16/16, 0 skip; [CI postmerge `43898923692`](https://github.com/dejul/senkom/actions/runs/43898923692) FAIL 13/16: Electron smoke `rendererFailures` 0, expected 1; OpenAPI dan npm audit SKIPPED.
- Branch fix `fix/electron-renderer-metrics` dari integrated `main`; worktree terpisah. Perubahan dokumentasi belum di-commit pada `feature/phase-2b-04-gate` tetap utuh. Root cause: event renderer crash menaikkan counter, tetapi objek performance yang dikembalikan IPC baru diperbarui interval 5 detik. Fix menyinkronkan counter pada event; smoke memeriksa counter segera setelah recovery.
- Reproduksi lokal Node 24.22.2/Electron 45.2.1 sebelum fix: 3/3 smoke PASS; kegagalan spesifik CI tidak terulang lokal. Setelah fix: 3/3 smoke PASS, frontend 117/117, fokus node/edge 21/21, policy 51/51, lint/kontrak/typecheck/build, Composer/npm audit PASS. Preview Web Admin API mock: input angka waypoint `(480,320)`, rute ortogonal, endpoint tetap, Undo/Redo, role read-only dan 0 write/browser error PASS. Backend MySQL/HTTP/PHPUnit lokal NOT RUN karena Composer install tertahan saat autoload; CI wajib menguji.
- Status fix: implementasi `0cf969d4938825a44226e53cbc16fbce20fc0958` dan evidence `0943dd8bc156ee2b00d5b63d8758e7748827607b` pushed; [PR #19](https://github.com/dejul/senkom/pull/19) OPEN. [CI PR `43913179637`](https://github.com/dejul/senkom/actions/runs/43913179637) pada SHA evidence PASS 16/16 mandatory, 0 skip, termasuk Electron, PHPUnit 141/4.133, MySQL/HTTP, kontrak dan audit. [Auto-Merge V2 `43914142876`](https://github.com/dejul/senkom/actions/runs/43914142876) menolak file sensitif dan mensyaratkan merge manual. Commit dokumentasi ini perlu CI exact-head ulang; postmerge `main` belum diverifikasi. Parent 2B-04 **WIP**; parent gate PR belum dibuat. Bukti rinci di `docs/phase-2-verification.md`.

## Parent 2B-04 gate - tertahan postmerge CI (2026-11-16)

- PR #18 MERGED manual pada `c824558e859162411f0e32fb7ffcc5e444701907`; head `e0dc07395a59f3d571a477b088a0d29132d7737b` ancestor `origin/main`. [CI PR exact-head `43894841264`](https://github.com/dejul/senkom/actions/runs/43894841264) SUCCESS, 16/16 mandatory, 0 skip. `main` lokal fast-forward ke merge SHA; worktree awal bersih; branch gate `feature/phase-2b-04-gate` dibuat.
- [CI postmerge `43898923692`](https://github.com/dejul/senkom/actions/runs/43898923692) pada exact merge SHA **FAIL**: 13/16 mandatory PASS, Electron smoke FAIL (`scripts/phase1-smoke.cjs:254`, `rendererFailures` 0, expected 1), OpenAPI contract dan npm audit SKIPPED. Integrasi kode ada, tetapi status 2B-04b final **belum VERIFIED** akibat gate postmerge. Penyebab kegagalan Electron belum dipastikan.
- Lokal pada branch gate: fokus node/edge 21/21, frontend 117/117, lint/kontrak, typecheck/build, Electron smoke, policy 51/51, PHP lint, Composer install/validate/audit, npm production audit PASS. Preview Chromium Electron + API mock PASS untuk create edge, waypoint, cancel/delete/Undo/Redo, node move, role read-only, viewport 376 px; 0 write API dan 0 browser console error. API nyata dan MySQL/HTTP/PHPUnit lokal NOT RUN; CI postmerge menjalankan backend sebelum gagal pada Electron.
- **Parent 2B-04 WIP**. Tidak ada commit, push, atau PR gate selama mandatory postmerge CI gagal. Bukti rinci di `docs/phase-2-verification.md`.

## 2B-04b - waypoint editing, edge delete, undo/redo (2026-11-16)

- Preflight: PR #17 MERGED manual pada `479ce313946cf60b9f60d9e371616048cef63f0d`; final head `828d76c8599fe3ec441cf20210b8b43a934649e4` ancestor `origin/main`. [CI PR final `43885592042`](https://github.com/dejul/senkom/actions/runs/43885592042) dan [CI integrated main `43889765426`](https://github.com/dejul/senkom/actions/runs/43889765426) SUCCESS pada exact SHA, 16/16 mandatory, 0 skip. `main` fast-forward ke merge SHA, worktree awal bersih, branch `feature/phase-2b-04b` dibuat. **2B-04a VERIFIED/terintegrasi**; catatan OPEN di bawah historis.
- Scope V2: tambah/pindah/hapus waypoint visual dengan rute ortogonal dan endpoint terikat node; hapus edge visual dengan konfirmasi; Undo/Redo dan dirty lokal. Editor/admin draft boleh edit; publisher/viewer/published read-only. Inventory kabel/core dan API/DB tetap. Save server 2B-07; parent 2B-04 tetap WIP sampai gate terpisah.
- Implementasi: `apps/admin-web/src/map-canvas.tsx`, `style.css`; tes fokus baru `tests/admin-map-edge-history.test.ts`. Lokal: fokus 11/11, frontend 117/117, role/schema 37/37, policy 51/51; lint/kontrak/typecheck/build, Composer install/validate/audit, npm production audit dan Electron smoke PASS. Preview Chromium Electron + API mock: waypoint drag setelah zoom/pan, cancel, remove, delete cancel/confirm, Undo/Redo, node terhubung, publisher/viewer/published read-only, viewport 376 px, 0 write/console error PASS. Preview API nyata dan PHPUnit/HTTP/MySQL lokal NOT RUN; [PR #18](https://github.com/dejul/senkom/pull/18) OPEN. [CI PR source `43893049295`](https://github.com/dejul/senkom/actions/runs/43893049295) pada SHA `a8f47749c8e15bbab009ccd2c5f9906566fce3b1` SUCCESS 16/16, 0 skip. Commit dokumentasi ini memerlukan CI exact-head ulang; branch khusus memerlukan merge manual. **2B-04b GATE PASSED - AWAITING MERGE**. Bukti rinci di `docs/phase-2-verification.md`.

## 2B-04a - create edge, orthogonal route, endpoint binding (2026-11-16)

- Rekonsiliasi final: PR #17 MERGED manual pada `479ce313946cf60b9f60d9e371616048cef63f0d`; final head `828d76c8599fe3ec441cf20210b8b43a934649e4` ancestor `main`. [CI PR final `43885592042`](https://github.com/dejul/senkom/actions/runs/43885592042) dan [CI integrated main `43889765426`](https://github.com/dejul/senkom/actions/runs/43889765426) SUCCESS, 16/16 mandatory, 0 skip. **2B-04a VERIFIED/terintegrasi**; catatan CI pending di bawah historis.
- Preflight: PR #16 MERGED manual pada `e4ac8c41858a9c3eb1ea74af87850577b15d07cd`; head final `bcf37914e1efd9f9e79c4f07ee33b66235412b1d` ancestor `origin/main`. [CI PR final `43875398717`](https://github.com/dejul/senkom/actions/runs/43875398717) dan [CI integrated main `43877182140`](https://github.com/dejul/senkom/actions/runs/43877182140) SUCCESS, exact SHA, 16/16 mandatory, 0 skip. `main` fast-forward ke merge SHA, worktree awal bersih, branch `feature/phase-2b-04a` dibuat. **Parent 2B-03 VERIFIED**; catatan WIP di bawah historis.
- Scope V2: buat edge visual dari koneksi inventory yang ada, rute ortogonal, ikat waypoint ujung ke node saat drag. Validasi node, koneksi, layer dan pasangan site mengikuti kontrak. Tidak mengubah konektivitas kabel/core atau API/DB. Waypoint edit, delete dan undo/redo khusus edge milik 2B-04b; parent 2B-04 WIP.
- Implementasi: `apps/admin-web/src/map-canvas.tsx`; tes baru `tests/admin-map-edge-create.test.ts`, penyesuaian regresi `tests/admin-map-site-edit.test.ts`. `docs/phase-2-verification.md` memuat bukti lengkap. Lokal: fokus 9/9, frontend 113/113, role/schema 37/37, lint/kontrak/typecheck/build, Electron smoke, Composer install/validate/audit, npm production audit PASS. Preview Electron + API mock: create, undo/redo, publisher read-only, narrow, 0 write/console error PASS; real API preview NOT RUN. [PR #17](https://github.com/dejul/senkom/pull/17) OPEN; [CI PR awal `43879735070`](https://github.com/dejul/senkom/actions/runs/43879735070) pada SHA `3ed9d2a3c81fd94eb43257ef231065daec254bcc` SUCCESS 16/16, 0 skip. [CI PR source final `43884438224`](https://github.com/dejul/senkom/actions/runs/43884438224) pada SHA `38b156362bb9f0f9f252f222f5fd5a94d0fa3ece` SUCCESS 16/16, 0 skip. Commit dokumentasi ini memerlukan CI exact-head ulang; merge manual karena tes existing berubah. **2B-04a GATE PASSED - AWAITING MERGE**.

## Parent 2B-02 gate (2026-11-16)

- Rekonsiliasi final: PR #11 MERGED manual pada `0160068fcedbb4ace81809046c499b6d63adfdb6`; head final `6bab05cd2bfc36daf1ef3a95d58fafe4ab7abe7e` ancestor `main`. `main` dan `origin/main` sama, worktree bersih sebelum branch 2B-03a. [CI PR final `43828983354`](https://github.com/dejul/senkom/actions/runs/43828983354) dan [CI integrated main `43830179853`](https://github.com/dejul/senkom/actions/runs/43830179853) SUCCESS pada SHA masing-masing, 16/16 mandatory, 0 skip. **Parent 2B-02 VERIFIED**; catatan WIP di bawah historis.

- PR #10 MERGED manual pada `52986cdff7085fdac9e874e55d5b5a5da257e5e5`; head `60e1ea215efd6323dad3b4e1c3754d1734b3b155` dan head 2B-02a `8addaf70046af01e5d6d2f778ad6b94ba70678d8` ancestor main. `main`, `origin/main`, dan branch gate sama sebelum edit; worktree bersih. [CI integrated main `43824646388`](https://github.com/dejul/senkom/actions/runs/43824646388) SUCCESS pada exact merge SHA, 16/16 mandatory, 0 skip. **2B-02b VERIFIED dan terintegrasi**; catatan PR OPEN di bawah historis.
- Preview Chromium atas Vite dan API mock menemukan `AdminApi` memanggil native `fetch` tanpa binding: login gagal `Illegal invocation`. Satu perubahan di `apps/admin-web/src/api.ts` mengikat default fetch ke `globalThis`. Preview ulang: login/logout, draft SVG, fit/zoom, layer, search/select, Enter/Escape, lebar 1280/390, console 0 error PASS. Data mock sintetis; screenshot di `.artifacts/phase2b02-preview/` diabaikan Git. Bukti lengkap di [verifikasi parent](phase-2-verification.md#parent-2b-02-gate-2026-11-16).
- Commit implementasi `2a92bb3c88e137be9cd2584369987820daff8a48` dan evidence `f9386a938782da21af9a3da3ef866e8af2ac82a4` pushed. [PR #11](https://github.com/dejul/senkom/pull/11) OPEN. [CI PR `43828359645`](https://github.com/dejul/senkom/actions/runs/43828359645) pada exact SHA `f9386a9` SUCCESS: 16/16 mandatory, 0 skip; PHPUnit 141/4.133. Commit dokumentasi CI ini memerlukan CI ulang pada head final.
- Parent **WIP** sampai seluruh gate lokal final, PR gate exact-head CI, merge manual, dan main terbaru diperiksa. Tidak ada 2B-03.

## 2B-03a - create/select/move site node (2026-11-16)

- Rekonsiliasi final: PR #12 MERGED pada `4aa248eb3211a873bb860377f856a9e1875a37d8`; head `b6040f4851ef7d6f6abb6082a6987a66fd34ddac` ancestor `origin/main`. [CI integrated main `43836434540`](https://github.com/dejul/senkom/actions/runs/43836434540) pada exact merge SHA SUCCESS, 16/16 mandatory, 0 skip; PHPUnit 141/4.133. PR #13 dokumentasi susulan MERGED pada `c7d31d859111eb54a0cd78014858963bd9ed182b`; head `51307de15fc4cc02977ecfbf47ea7aac71ff2b36` ancestor `origin/main`. [CI integrated main `43848314985`](https://github.com/dejul/senkom/actions/runs/43848314985) pada exact merge SHA SUCCESS, 16/16 mandatory, 0 skip; PHPUnit 141/4.133. `main` dan `origin/main` sama pada SHA itu sebelum branch `fix/phase-2b-03a-closure` dibuat; worktree bersih. **2B-03a VERIFIED/terintegrasi; parent 2B-03 WIP**. Catatan PR OPEN di bawah historis.

- Scope V2: site node dari inventory yang sudah ada, pilih, drag snap-to-grid; map lokal berubah sekali saat pointerup. Editor/admin boleh edit; publisher dan viewer tetap read-only. Tanpa save API, undo/redo, edit properti, delete, atau perubahan backend/schema. Parent 2B-03 tetap WIP.
- Riwayat sebelum merge: commit implementasi `8d3e8dad3140c4e66efb128cbd0be6dc8dfc4aa1` dan evidence `b6040f4851ef7d6f6abb6082a6987a66fd34ddac` pushed. [PR #12](https://github.com/dejul/senkom/pull/12) OPEN; [CI PR `43833306383`](https://github.com/dejul/senkom/actions/runs/43833306383) pada exact head `b6040f4` SUCCESS, 16/16 mandatory, 0 skip, PHPUnit 141/4.133. Commit bukti CI ini memerlukan CI ulang pada head final. **2B-03a GATE PASSED - AWAITING MERGE**; branch khusus memerlukan merge manual menurut Auto-Merge V2.
- Implementasi pada `apps/admin-web/src/map-canvas.tsx`, `workspace.tsx`, dan `style.css`; tes baru `tests/admin-map-site-edit.test.ts`. Lokal: fokus 10/10, frontend 106/106, schema 33/33, lint/contract, typecheck/build, Electron, Composer/npm audit PASS. Preview Chromium + API mock menguji create/select/drag, publisher denial, viewport sempit, 0 write dan 0 console error. PHPUnit/HTTP/MySQL lokal NOT RUN; CI PR wajib. [Bukti](phase-2-verification.md#2b-03a---createselectmove-site-node).

## 2B-03b - site properties, delete, undo/redo (2026-11-16)

- Rekonsiliasi final: PR #15 MERGED manual pada `6659abaf260c38cacdb0fc12b5bff93f0daee82a`; head final `a9832d6e2b7f5242615df0ae5adba8b0c746ca47` ancestor `origin/main`. [CI PR final `43862060464`](https://github.com/dejul/senkom/actions/runs/43862060464) dan [CI integrated main `43872262472`](https://github.com/dejul/senkom/actions/runs/43872262472) SUCCESS pada exact SHA masing-masing, 16/16 mandatory, 0 skip. `main` fast-forward ke merge SHA, worktree bersih sebelum branch gate. **2B-03b VERIFIED/terintegrasi**; catatan PR OPEN di bawah historis. Parent 2B-03 WIP.
- Preflight: PR #14 MERGED manual pada `9abd666806fa39726be73eb5ddfb050e039463f7`; head `747708dfe47f2b5f739cd010e814ddfcbd0e7d46` ancestor `origin/main`. [CI integrated main `43851976955`](https://github.com/dejul/senkom/actions/runs/43851976955) pada exact merge SHA SUCCESS, 16/16 mandatory, 0 skip. `main` fast-forward ke SHA itu, worktree bersih, lalu branch `feature/phase-2b-03b` dibuat. 2B-03a tetap terintegrasi.
- Scope V2: properti visual node site (label/simbol), delete dengan konfirmasi dan penolakan jika edge masih terikat, undo/redo node via tombol dan keyboard, dirty state lokal. Create/select/drag/snap 2B-03a tetap bekerja. Tidak ada save API, perubahan inventory/backend/schema, edit edge, atau parent gate.
- Implementasi: `apps/admin-web/src/map-canvas.tsx`, `workspace.tsx`, `style.css`; tes baru `tests/admin-map-site-history.test.ts`. Perubahan map hanya di memori, satu drag menjadi satu entri undo saat pointerup; riwayat dibatasi 50 aksi. Parent 2B-03 WIP.
- Lokal: fokus site 6/6, role/history 12/12, frontend 110/110, schema 33/33, lint/Prettier/kontrak, typecheck/build, Electron smoke, Composer install dry-run/validate/audit, PHP lint dan npm production audit exit 0. Preview Chromium Electron + API mock: edit, delete batal/konfirmasi, undo tombol/redo keyboard, create/drag 2B-03a, publisher read-only, viewport 376 px, 0 write/console error PASS. PHPUnit/HTTP/MySQL lokal NOT RUN karena backend tidak berubah; CI PR wajib. [Bukti rinci](phase-2-verification.md#2b-03b---site-properties-delete-undoredo).
- Commit implementasi `d4c84c95416e4ade2fea51150f9cfbbd40e413c9` pushed ke `origin/feature/phase-2b-03b`; [PR #15](https://github.com/dejul/senkom/pull/15) OPEN. [CI PR implementasi `43861077433`](https://github.com/dejul/senkom/actions/runs/43861077433) pada exact SHA SUCCESS, 16/16 mandatory, 0 skip; PHPUnit 141/4.133, frontend 110, schema 33, HTTP/MySQL, build/Electron, Composer/npm audit PASS. [Auto-Merge V2 `43861738560`](https://github.com/dejul/senkom/actions/runs/43861738560) menolak `Wrong branch for verified work`; branch khusus membutuhkan merge manual sesudah CI head final. Commit bukti ini memerlukan CI ulang pada head final. **2B-03b GATE PASSED - AWAITING MERGE**; parent 2B-03 WIP.

## Parent 2B-03 gate (2026-11-16)

- Rekonsiliasi final: PR #16 MERGED manual pada `e4ac8c41858a9c3eb1ea74af87850577b15d07cd`; final head `bcf37914e1efd9f9e79c4f07ee33b66235412b1d` ancestor `main`. [CI PR final `43875398717`](https://github.com/dejul/senkom/actions/runs/43875398717) dan [CI integrated main `43877182140`](https://github.com/dejul/senkom/actions/runs/43877182140) SUCCESS pada exact SHA, 16/16 mandatory, 0 skip. `main` fast-forward ke merge SHA, worktree bersih sebelum branch 2B-04a. **Parent 2B-03 VERIFIED**; catatan WIP di bawah historis.
- Branch `feature/phase-2b-03-gate` dari integrated main `6659abaf260c38cacdb0fc12b5bff93f0daee82a`; worktree awal bersih. Scope hanya verifikasi gabungan 2B-03a/b, tanpa kode produk baru. **PARENT GATE PASSED - AWAITING MERGE**; parent belum VERIFIED sampai PR gate merged dan `main` diperiksa.
- Acceptance: create/select, drag snap 40 pada zoom/pan, satu commit saat pointerup; label/simbol site, delete confirm/cancel dan proteksi edge; undo/redo tombol+keyboard, kapasitas 50 dan dirty; role editor/admin vs publisher/viewer/published; layer/search, viewport responsif. Semua PASS berdasarkan tes fokus dan preview mock. [Bukti parent](phase-2-verification.md#parent-2b-03-gate-2026-11-16).
- Lokal: fokus 15/15, frontend 111/111, role 8/8, schema 33/33, policy 51/51, lint/kontrak, typecheck/build, Electron, Composer/npm audit, PHP lint PASS. Preview Chromium Electron + API mock: lima keadaan akses, drag setelah zoom/pan, properti/delete/undo/redo, 0 write dan 0 console error, viewport 376 px PASS. PHPUnit/HTTP/MySQL lokal NOT RUN; CI integrated main `43872262472` PASS dan CI PR gate wajib. Tes kapasitas 50 ditambah pada `tests/admin-map-site-history.test.ts`.
- Commit tes/bukti `27155ced5498af56654f298a47e52c2792b14de9` pushed; [PR #16](https://github.com/dejul/senkom/pull/16) OPEN. [CI PR `43874185195`](https://github.com/dejul/senkom/actions/runs/43874185195) pada exact SHA SUCCESS, 16/16 mandatory, 0 skip; PHPUnit 141/4.133, frontend 111, schema 33, HTTP/MySQL, build/Electron, Composer/npm audit PASS. [Auto-Merge V2 `43875041648`](https://github.com/dejul/senkom/actions/runs/43875041648) menahan parent-only PR karena tidak ada verified micro-batch claim; merge manual wajib. Commit dokumentasi ini memerlukan CI ulang pada head final.

## Parent 2B-01 gate ulang (2026-11-16)

- Rekonsiliasi final: PR #8 MERGED manual, merge SHA `326e31892c7e121b5b38ff782dcd0daa99a33bde`; `main` dan `origin/main` sama dan bersih sebelum branch `feature/phase-2b-02a` dibuat. Head PR final `844a950bcdc0cceef16d7ed076a73e41ca04d12e` telah lulus CI 16/16 mandatory, 0 skip. [CI integrated main `43796382406`](https://github.com/dejul/senkom/actions/runs/43796382406) pada exact merge SHA SUCCESS, 16/16 mandatory, 0 skip. Kriteria parent lengkap; **parent 2B-01 VERIFIED**. Bukti historis di bawah mencatat status sebelum merge.

- PR #7 MERGED manual pada `cc14f5bf85a3cab2d20b220dadd6e71d685848a4`; `main`, `origin/main`, dan branch `feature/phase-2b-01-gate` sudah sama pada SHA itu. Laravel `v13.40.0` terintegrasi. Perubahan gate lama disimpan sebagai patch, dua salinan dokumen, dan stash sebelum fast-forward; konflik checkpoint diselesaikan dengan mempertahankan bukti gate lama dan security fix. [Bukti gate](phase-2-verification.md#parent-2b-01-gate-ulang-2026-11-16).
- Acceptance V2: child 2B-01a/b ancestor; session/CSRF, login/logout, role/401/403, sidebar dan navigasi terbukti; kanvas/properti tetap placeholder; tidak ada token admin persisten atau fitur 2B-02a. Lokal: tes fokus 8, frontend 96, schema 33, policy 51 dan PHPUnit 141/4.133 seluruhnya PASS/0 skip. Composer install/validate/audit, PHP lint, ESLint/Prettier/contract, typecheck/build, npm audit, migration/DEMO seed, HTTP smoke dan Electron smoke PASS. MySQL disposable dihentikan dan credential sementara dihapus.
- CI integrated main [run `43793065588`](https://github.com/dejul/senkom/actions/runs/43793065588) pada SHA PR #7 SUCCESS, 16/16 mandatory, 0 skip. [CI PR #8 `43794863277`](https://github.com/dejul/senkom/actions/runs/43794863277) pada commit `5a0eb8ad62d21ab6ecc107ed5daf607f65e8f7af` SUCCESS: 16/16 mandatory, 0 skip, PHPUnit 141/4.133, frontend 96, schema 33, Composer audit 0 advisory, HTTP/Electron/build PASS. Commit bukti CI ini memerlukan CI ulang pada head final. Status **PARENT GATE PASSED — AWAITING MERGE**, belum VERIFIED. PR docs-only/parent-only memerlukan merge manual menurut Auto-Merge V2.

## 2B-02a - read-only SVG canvas (2026-11-16)

- Branch `feature/phase-2b-02a` dari integrated main `326e31892c7e121b5b38ff782dcd0daa99a33bde`. Scope hanya canvas SVG, fit/zoom/pan/grid, draft via sesi admin dan published via token viewer di memori, viewport responsif. Tidak ada write, layer/search/select/label/symbol workflow atau 2B-02b.
- Acceptance lokal **VERIFIED**: `npm ci` 216 package; 101/101 frontend/schema tests, fokus 7/7, lint/contract, typecheck/build, Electron smoke, npm production audit 0 vulnerability, Composer install dry-run/validate/audit dan PHP lint PASS. Backend PHPUnit dan HTTP/MySQL lokal **NOT RUN** karena backend tidak berubah; mandatory CI akan menjalankannya. [Bukti 2B-02a](phase-2-verification.md#2b-02a---read-only-svg-canvas).
- [CI PR #9 `43798167095`](https://github.com/dejul/senkom/actions/runs/43798167095) pada implementasi SHA `3a4b12bace4ce9967633a610a4079b925be0cbb4` SUCCESS: 16/16 mandatory, 0 skip; PHPUnit 141/4.133, frontend 101, schema 33, HTTP/Electron/build/audit PASS. PR #9 OPEN. [Auto-Merge V2 `43798860487`](https://github.com/dejul/senkom/actions/runs/43798860487) menolak branch khusus ini: `Wrong branch for verified work`; manifest/lockfile juga file sensitif. Merge manual wajib setelah CI pada head final. Parent 2B-02 tetap WIP; 2B-02b hanya atas permintaan terpisah.

- Rekonsiliasi final: PR #9 MERGED manual pada `d4055213bd5baf366d56ef78e0d9b7a53fbed3d0`; implementasi `3a4b12b` dan bukti final `8addaf7` ancestor `main`. [CI PR final `43799028392`](https://github.com/dejul/senkom/actions/runs/43799028392) pada `8addaf7` dan [CI integrated main `43821021669`](https://github.com/dejul/senkom/actions/runs/43821021669) pada exact merge SHA keduanya SUCCESS, 16/16 mandatory, 0 skip. `main` dan `origin/main` sama dan bersih sebelum branch 2B-02b dibuat. **2B-02a VERIFIED dan terintegrasi**; catatan OPEN di atas historis.

## 2B-02b - layer, search/select, label/symbol, keyboard (2026-11-16)

- Branch `feature/phase-2b-02b` dari integrated main `d4055213bd5baf366d56ef78e0d9b7a53fbed3d0`. Scope V2: toggle layer koneksi, cari/pilih node atau koneksi, tampilkan label/simbol, kontrol pointer dan keyboard read-only. Tidak ada editing, save, workflow 2B-03, backend, database, atau API contract baru.
- Lokal **VERIFIED**: fokus 10 tes/3 file, semua 104 tes/13 file, lint/format/kontrak, typecheck/build, Electron smoke, npm production audit 0 vulnerability, Composer install dry-run/validate/audit, dan PHP lint PASS. Backend PHPUnit/HTTP/MySQL lokal NOT RUN karena backend tidak berubah; CI wajib. [Bukti](phase-2-verification.md#2b-02b---layer-searchselect-labelsymbol-keyboard).
- [CI PR #10 `43822879615`](https://github.com/dejul/senkom/actions/runs/43822879615) pada implementasi SHA `4ecfe637f983b7c6d58fb131b7cc6d087448b4f6` SUCCESS: 16/16 mandatory, 0 skip; PHPUnit 141/4.133, frontend 104, schema 33, HTTP/Electron/build/audit PASS. PR #10 OPEN. [Auto-Merge V2 `43823546609`](https://github.com/dejul/senkom/actions/runs/43823546609) menolak `Wrong branch for verified work`; branch khusus ini perlu merge manual sesudah CI head final. Parent 2B-02 tetap WIP; parent gate hanya pada permintaan terpisah.

## Security fix Laravel concurrency advisory (2026-11-16)

- PR #6 MERGED manual; `main`/`origin/main` `4736f713193227d987e179064809667c436b742a`. Perubahan gate parent yang belum di-commit tetap di worktree `feature/phase-2b-01-gate`; fix memakai worktree/branch terpisah `fix/laravel-concurrency-advisory` dari main bersih. Tidak ada perubahan fitur Phase 2B.
- CVE-2026-128083/GHSA-63hm-g96r-2m2q mengenai `laravel/framework v13.39.0`; metadata advisory menetapkan `13.40.0` sebagai patched version pertama untuk Laravel 13. Constraint `^13.39.0` sudah menerima versi aman. Hanya `apps/api/composer.lock` berubah: `v13.39.0` ke `v13.40.0`, 0 perubahan paket lain.
- Lokal: Composer install 103 paket dari lockfile, validate dan audit 0 advisory PASS; PHPUnit 141 tes/4.133 asersi/0 skip dan HTTP smoke pada MySQL 8.4.11 disposable PASS. Frontend 96/0 skip, lint/contract, typecheck/build, PHP lint, npm production audit dan Electron smoke rerun PASS. MySQL disposable dihentikan. [Bukti](phase-2-verification.md#verified-fix-laravel-concurrency-advisory).
- Status fix **VERIFIED** pada implementasi commit `313db9b343f022bc737cddc5f49fd44ff37fcc71`, PR #7. [CI PR `43789695673`](https://github.com/dejul/senkom/actions/runs/43789695673) pada exact SHA itu SUCCESS: 16/16 mandatory steps, 0 skipped; Composer audit 0 advisory, PHPUnit 141/4.133/0 skip, frontend 96, schema 33, HTTP, build, Electron dan npm audit PASS. Lockfile security-sensitive menurut Auto-Merge V2; PR #7 MERGED manual pada `cc14f5bf85a3cab2d20b220dadd6e71d685848a4`. Parent 2B-01 tetap WIP dan gate parent belum diulang.

## Gate parent 2B-01 — rekonsiliasi dan audit (2026-11-16)

- PR #6 MERGED manual pada `4736f713193227d987e179064809667c436b742a`. `git fetch origin --prune`, `git switch main`, dan `git pull --ff-only origin main` exit 0. `main` lokal = `origin/main` pada SHA itu; commit 2B-01a `b7c4f72` dan 2B-01b `a5ea76b` keduanya ancestor. Working tree awal bersih. Branch gate terpisah: `feature/phase-2b-01-gate` dari main tersebut.
- V2 hanya memuat child `2B-01a` dan `2B-01b`; tidak ada `2B-01c`. Parent 2B-01 memerlukan CSRF/session nyata, role UI, unauthorized state, dan tanpa token admin di localStorage. Kode dan tes kedua child sudah terintegrasi. [Audit gate](phase-2-verification.md#gate-parent-2b-01--rekonsiliasi-dan-audit-2026-11-16).
- CI integrated main [run `43178975486`](https://github.com/dejul/senkom/actions/runs/43178975486) pada SHA merge SUCCESS: 16/16 mandatory steps, 0 skipped; PHPUnit 141/4.133/0 skip, frontend 96, schema 33, HTTP smoke, build, Electron, OpenAPI, audit PASS pada 2026-11-12. Auto-Merge V2 aktif, tetapi [run `43178419080`](https://github.com/dejul/senkom/actions/runs/43178419080) menolak PR #6: `Security-sensitive file requires manual merge`; pengguna melakukan merge manual.
- Audit Composer lokal 2026-11-16 exit 1: `laravel/framework` terkunci `v13.39.0`, CVE-2026-128083/PKSA-yxbx-3c9s-cjt9 diumumkan 2026-11-13; versi terdampak `<13.40.0`. Tes fokus 8/0 skip, frontend 96/0 skip, lint/contract, dan npm production audit PASS. Build/Electron dan HTTP/MySQL lokal NOT RUN setelah gate gagal. Status parent **INCOMPLETE**, tanpa commit/push/PR gate dan tanpa perubahan kode produk.

## 2B-01b — shell dan role states (2026-11-12)

- Preflight: PR #5 MERGED pada `eb178b432beebaaeff6280a3f382bbf23bc257d1`; `git fetch origin --prune` exit 0; `main` lokal fast-forward ke `origin/main`. Auto-Merge V2 terpasang. `feature/phase-2b` mempertahankan commit 2B-01a `b7c4f72` dan evidence `302c60b`; merge `origin/main` pada `82fda5c96d391bb95f036cd2e8e8a03ca3f69f3a` tanpa reset/force push. Konflik dokumentasi diselesaikan dengan mempertahankan kedua bagian.
- Shell Web Admin berisi sidebar, kanvas/properti kosong, navigasi anchor, label role, state guest/401/403, dan pesan akses map melalui API. Tidak memuat atau mengubah map pada batch ini. [Bukti](phase-2-verification.md#2b-01b).
- Lokal: tes shell+auth 8 PASS; seluruh frontend 96/0 skip; policy 51/0 skip; lint, contract, typecheck/build, Electron smoke, audit npm produksi PASS. CI PR NOT RUN sebelum push. Parent 2B-01 tetap WIP.
- Commit implementasi `a5ea76b44c818310cadcaea7342daaffedeb315f` pushed ke `origin/feature/phase-2b` tanpa force; SHA lokal dan remote sama. PR CI pada head dokumentasi final masih pending.
- Precheck auto-merge PR kumulatif: diff dari `main` masih memuat `apps/admin-web/src/api.ts`, `apps/admin-web/vite.config.ts`, dan `scripts/electron-smoke.cjs` dari 2B-01a. Ketiganya security-sensitive menurut V2; merge PR memerlukan review manual. Tidak mengubah policy atau evidence untuk menghindari gate.

## 2B-01a — Typed API client, session/CSRF, error mapping (2026-11-12)

- Branch `feature/phase-2b` dari integrated `main` `24ae92738933ed6d847616234a8d0d89ee630b35` (PR #4 Phase 2A closure MERGED); working tree awal bersih. Scope tepat V2 2B-01a; 2B-01b/sidebar/canvas/properties belum dimulai.
- Web Admin memakai generated OpenAPI operation types untuk session/login, cookie same-origin, Laravel `X-CSRF-TOKEN` hanya di memori, error envelope/status konsisten, dan login/logout ke `/api/v1/auth/*`. Vite dev proxy `/api/v1` ke API loopback; deployment perlu same-origin reverse proxy dan HTTPS. Tidak ada token admin di localStorage atau perubahan backend/API contract/dependency.
- Lokal: tes fokus **6 PASS**, seluruh Vitest **94 PASS/0 skip**, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run smoke:desktop` PASS; smoke desktop view-only empat skenario PASS. `npm audit --omit=dev` 0 vulnerability. Diff/staged paths dan secret audit PASS; string password/token pada tes sintetis saja.
- Commit implementasi `b7c4f727c9f67b4bb60e43475715012d230bd423` dipush ke `origin/feature/phase-2b`; SHA remote sama. GitHub [run `43168520667`](https://github.com/dejul/senkom/actions/runs/43168520667) pada SHA tersebut **SUCCESS**: 16/16 mandatory steps, 0 skipped; PHPUnit 141/4.133/0 skip, HTTP auth/CSRF smoke, frontend 94, schema 33, build/Electron/contract/audit/cleanup PASS.
- Status micro-batch **VERIFIED**. Phase 2B parent 2B-01 tetap WIP; PR ke `main` belum dibuat karena Final Acceptance Phase 2B belum tercapai. Next 2B-01b hanya atas permintaan baru. [Bukti rinci](phase-2-verification.md#2b-01a--typed-api-client-sessioncsrf-dan-error-mapping).

## Auto-Merge V2 policy fix (2026-11-12)

- Branch/worktree terpisah `fix/auto-merge-v2` di `D:\BSD\Project\Web\www\senkom-auto-merge-v2`, dari `origin/main` `24ae92738933ed6d847616234a8d0d89ee630b35`; branch `feature/phase-2b` tidak diubah.
- Local policy 51 tes PASS/0 skip; frontend 88 PASS; lint, contract, typecheck, build, Electron smoke, npm production audit PASS. Backend disposable MySQL lokal NOT RUN; CI PR belum dijalankan sebelum push. [Bukti](phase-2-verification.md#verified-fix-auto-merge-v2).
- Implementasi commit `79a3bdf6905081311458c6e9e3fa03baa0ff1fa3` pushed; PR #5 OPEN. Windows PR CI `43172959382` SUCCESS pada SHA itu: 16/16 mandatory, 0 skipped; PHPUnit 141/4.133/0 skip, frontend 88, schema 33. Follow-up dokumentasi memerlukan CI head baru.
- Verified fix/micro-batch dapat eligible setelah CI head SHA dan evidence lolos. Perubahan policy/security-sensitive tetap manual merge tanpa independent approval automation; PR ini tidak boleh auto-merge. Stop setelah setup/verifikasi, tanpa perubahan Phase 2B.

## Phase 2A Final Acceptance — closure (2026-11-12)

- PR #3 MERGED pada `34f3986be27a2602f1a227bbc6870d9c34eacb5d`; local `main` fast-forward ke SHA yang sama. Final-Fix-02/03 terintegrasi.
- Parent 2A-01–11 VERIFIED; literal checkout GitHub, install dari lockfile, build, MySQL 8.4.11 disposable, migration/DEMO seed, dan cleanup PASS.
- GitHub [run `43145937937`](https://github.com/dejul/senkom/actions/runs/43145937937) pada integrated `main`: `checks` SUCCESS; 16/16 mandatory steps success, 0 skipped. PHPUnit **141 tes/4.133 asersi/0 skip**; frontend **88**, schema **33** tes; HTTP auth/CSRF/CORS/RBAC/publish/rollback/viewer PASS. Composer audit 0 advisory; npm production audit 0 vulnerability.
- PHP lint, ESLint, Prettier, typecheck, build, Electron smoke, OpenAPI contract PASS pada run yang sama. Security/integritas: session/CSRF, RBAC map, viewer read-only, secret/private metadata, atomic publish/rollback, If-Match, checksum, immutable trigger dan FK dibuktikan suite serta smoke. UAT empat monitor fisik pending; origin/TLS dan grant user existing prasyarat deployment.
- Status Phase 2A **COMPLETE**; Phase 2B dimulai hanya pada 2B-01a. Bukti rinci di [verifikasi](phase-2-verification.md#phase-2a-final-acceptance--database-dan-api).

## Phase 2A Final-Fix-03 — Windows CI disposable MySQL (2026-11-12)

- Status **VERIFIED untuk Final-Fix-03**, Phase 2A tetap WIP. Branch `fix/phase-2a-final-acceptance` dari `c53a8058187a5f49082d5e6e6c71cefd84034913`, awal bersih. [Gap, uji, dan gate](phase-2-verification.md#phase-2a-final-fix-03--windows-ci-disposable-mysql-dan-mandatory-gates).
- Windows CI sekarang menyiapkan MySQL 8.4.11 ZIP berchecksum, loopback, datadir/DB disposable, user acak terbatas; migration/DEMO seed, PHPUnit `--fail-on-skipped`, HTTP smoke, 16 named mandatory steps, dan shutdown `always()`. Auto-merge policy trusted tidak diubah.
- Lokal: migration/seed PASS; PHPUnit **141 tes/4.133 asersi/0 skip**, HTTP smoke PASS; frontend 88, schema 33, auto-merge 19 tes PASS; lint/typecheck/build/Electron/contract/audit PASS. Probes negatif untuk DB, migration, PHPUnit, HTTP, Composer audit, dan required check menghasilkan kegagalan yang diharapkan.
- GitHub [run `43141274133`](https://github.com/dejul/senkom/actions/runs/43141274133) pada commit provisional `ee060ddadedbade17c5a84fcc08d1220fcf744b7`: **SUCCESS**, Windows Server 2025, MySQL 8.4.11, migration/seed, PHPUnit 141/4.133/0 skip, HTTP smoke, frontend 88, schema 33, Electron, Composer audit, dan cleanup PASS; 16/16 required steps success, 0 skipped step. PR berisi perubahan workflow/test policy ini tidak eligible untuk auto-merge dan perlu review/merge manual terpisah. Phase 2A tetap WIP, Phase 2B belum dimulai.

## Phase 2A Final-Fix-02 — Composer security (2026-11-12)

- Branch `fix/phase-2a-final-acceptance` dari `main`/`origin/main` `ffe99135675ff85e765cd495fd2216fa6dcff02e`. Perubahan rekonsiliasi GitHub pada checkpoint dipertahankan. Composer 2.11.1 terisolasi dengan PHP 8.4.26; `composer.json` dan Laravel `v13.39.0` tidak berubah.
- Audit awal: **6 advisory / 3 paket** (`symfony/http-foundation`, `symfony/http-kernel`, `symfony/routing`), semua pada `v8.1.10`. Targeted solver hanya menaikkan tiga paket transitive tersebut ke patch `v8.1.11` dalam `apps/api/composer.lock`; tidak ada paket lain berubah. [Detail advisory dan perintah](phase-2-verification.md#phase-2a-final-fix-02--composer-security-audit-remediation).
- Lokal: Composer audit 0 advisory, validate strict dan install dari lockfile PASS; PHP lint, OpenAPI/generated contract, PHPUnit **141 tes/4.133 asersi/0 skip**, HTTP smoke dan integritas DB disposable PASS. `npm run lint` dan GitHub CI dicatat pada laporan verifikasi; Phase 2A tetap **WIP**, bukan COMPLETE.
- GitHub CI run `43136152964` pada commit `ef4013ff472a979364358eab6e96fb404711493b` **PASS**, termasuk Composer install, validate, dan audit. Blocker fase tersisa: CI disposable MySQL/zero-skip dan named mandatory steps belum tersedia. Live eligible auto-merge **NOT VERIFIED**. Jangan mulai Phase 2B.

## Rekonsiliasi GitHub (2026-11-12)

- PR #1 **MERGED** (`13f0ab89b6656d74456c2b023fa13f97c8590319`); commit kebijakan `d3f65651cbf37e7fe84cc19d99d0629dc4522d5f` ada pada `origin/main`. PR #2 **MERGED** (`ffe99135675ff85e765cd495fd2216fa6dcff02e`). Remote resmi `https://github.com/dejul/senkom.git`.
- Setelah `git fetch origin --prune` dan `git pull --ff-only origin main` (exit 0), local `main` dan `origin/main` sama: `ffe99135675ff85e765cd495fd2216fa6dcff02e`. Branch `fix/phase-2a-final-acceptance` dibuat dari SHA tersebut. Kebijakan pada `AGENTS.md` dan `docs/git-workflow.md`, serta `.github/workflows/auto-merge.yml`, tersedia pada baseline ini.
- Workflow auto-merge terpasang, tetapi run `43133318053` berstatus **skipped** untuk CI event push; live eligible auto-merge **NOT VERIFIED**. CI run `43132927262` pada SHA terbaru gagal di `composer audit`. CI disposable MySQL/zero-skip dan named mandatory steps masih terbuka. Final-Fix-02 belum dijalankan; dependency tidak diubah. Phase 2A tetap WIP.

## Full Git Automation setup (2026-11-11)

- Branch `chore/phase-auto-merge` dari `main` remote `13f0ab89b6656d74456c2b023fa13f97c8590319`; PR #1 merged. Repo private; GitHub CLI authenticated. Branch protection API untuk private GitHub Free mengembalikan HTTP 403. `main` tidak diubah oleh setup ini.
- Trusted `workflow_run` dari `main` dan `scripts/auto-merge.mjs` memeriksa CI lengkap, head SHA, evidence COMPLETE, internal PR, konflik, dan diff/secret sebelum API merge. PR yang mengubah workflow/policy tidak eligible. PR setup ini memerlukan review dan merge manual sekali untuk aktivasi.
- CI saat ini masih gagal Composer audit dan belum menyediakan MySQL disposable/zero-skip serta semua named mandatory steps. Live auto-merge **NOT VERIFIED**; semua phase PR tetap blocked sampai CI diperbaiki. Next: review/merge manual PR setup, lalu perbaiki Composer audit dan CI dalam batch terpisah. Phase 2A tetap WIP; Phase 2B tidak dimulai.

## GitHub integration dan workflow permanen

- Status **READY FOR APPROVAL**. `origin` ditambahkan tepat ke `https://github.com/dejul/senkom.git`. Query `git ls-remote origin` exit 0 dan mengembalikan 0 ref; branch remote `main` belum ada. Git identity lokal tersedia. Branch lokal `main` masih 0 commit, 0 tracked/staged file, tanpa upstream. Tidak ada commit atau push.
- [Instruksi agent](../AGENTS.md) dan [workflow Git](git-workflow.md) ditambahkan: branch, micro-batch/parent/final gate, PR, tag, secret hygiene, CI, failure policy, dan approval sebelum commit/push/merge/tag. Manifest staging Final-Fix-01 diperbarui untuk **151 kandidat** sesudah dua dokumen baru; `.vscode/settings.json`, `.artifacts`, env aktual, dependency dan key tetap ignored. Secret scan dan lint diulang setelah edit, tanpa perubahan fungsional.
- Initial commit yang disiapkan: `chore: initial SENKOM Phase 2A baseline` pada `main`, lalu push ke `origin` setelah persetujuan eksplisit pengguna. Literal clean checkout, upstream/SHA remote, dan Windows CI zero-skip **NOT VERIFIED**. Phase 2A tetap WIP; Phase 2B tidak dimulai.

## Hasil Phase 2A Final-Fix-01 — Git readiness

- Status **READY untuk review/approval initial commit**, bukan bukti checkout. Branch `main` masih 0 commit/0 tracked/0 remote. Inventaris awal 150 untracked; `.vscode/settings.json` adalah konfigurasi editor personal yang tidak diperlukan build dan kini diabaikan secara spesifik. Manifest dry-run **149 kandidat** di `.artifacts/final-fix-01-staging-manifest.tsv` berisi path, kategori, ukuran, SHA-256; tidak ada `git add`/commit/push/remote.
- Secret hygiene: scan 150 kandidat awal untuk signature private key, token provider, URL berkredensial, JWT, assignment secret, dan nilai panjang; tidak ada secret berkeyakinan tinggi pada kandidat. Literal invalid-password pada smoke/test bersifat sintetis. `.artifacts` menampung test `.env` dan private key MySQL disposable; semuanya di luar kandidat dan terverifikasi ignored. `.env.example` aman, sedangkan `.env` aktual tidak ada. Tidak ada file pengguna dihapus.
- Dua lockfile, migration, seeder, fixture DEMO, OpenAPI, generated types, source frontend/API/Electron, tes, runbook, dan CI ada dalam kandidat. Bukti 2A-11a/11b membuktikan source-copy setup/build; checkout Git literal tetap **NOT VERIFIED** sampai initial commit diotorisasi dan diuji. CI Windows MySQL zero-skip tetap **NOT VERIFIED** dan di luar Final-Fix-01. Phase 2A tetap WIP; Phase 2B tidak dimulai.

## Hasil Phase 2A Final Acceptance

- Status **WIP / INCOMPLETE**. [Matriks final](phase-2-verification.md#phase-2a-final-acceptance--database-dan-api). Parent 2A-01 sampai 2A-11 VERIFIED; backend 141 tes/4.133 asersi tanpa skip, frontend 88 tes, HTTP smoke, Electron, contract, PHP lint, full npm lint, typecheck/build dan integritas MySQL lokal PASS dari gate 2A-11b/parent. Tidak ada source produk berubah sesudah bukti itu. UAT empat monitor fisik tetap terbuka di luar scope DB/API 2A.
- **Blocker Git:** repo `main` punya 0 commit, 0 tracked file, 150 untracked file, 0 remote. Literal clean checkout/build **NOT VERIFIED**; source-copy 2A-11a tidak menggantikannya. Lockfile npm/Composer ada, `.env` aktual tidak ada dan `.gitignore` mengecualikan env, dependency, artifact, key. Initial commit tidak dibuat.
- **Blocker CI:** workflow Windows memakai Node 24 dan PHP 8.4.26 tetapi tidak menyiapkan MySQL disposable, DB unit/HTTP terpisah, `SENKOM_TEST_DB_PORT`, HTTP smoke, atau fail-on-skipped. Tes integrasi PHPUnit akan skip tanpa port. Tidak ada commit/remote untuk menjalankan CI; eksekusi zero-skip **NOT VERIFIED**. Tidak ada perubahan workflow spekulatif atau klaim CI PASS.
- Next: review 150 file untuk initial commit dan secret hygiene, otorisasi commit, uji literal checkout/build; kemudian siapkan serta jalankan CI Windows dengan MySQL 8.4 disposable, PHPUnit `--fail-on-skipped`, DB unit/HTTP terpisah, smoke, dan shutdown. Ulangi Final Acceptance setelah bukti tersedia. Keputusan FO/Power/throttle non-blocking; origin/TLS dan grant map existing prasyarat deployment. Phase 2A tetap WIP; Phase 2B tidak dimulai.

## Hasil parent acceptance gate 2A-11

- Status **VERIFIED**. Judul/scope parent: **Gate 2A: rapikan dokumentasi setup/migration/seeding, OpenAPI/shared types, bukti seluruh backend**. [Matriks acceptance](phase-2-verification.md#parent-acceptance-gate-2a-11--gate-2a-rapikan-dokumentasi-setupmigrationseeding-openapishared-types-bukti-seluruh-backend). Child 2A-11a/b VERIFIED; runbook, provisioning, source-copy setup, OpenAPI/shared types, regresi backend/HTTP/frontend/Electron, lint/typecheck/build dan laporan memenuhi kriteria parent. Audit hash 111 file source produk/tes/script/build terhadap salinan 2A-11a: 0 beda; bukti child tetap berlaku. Tidak ada perubahan runtime/API/schema pada gate ini.
- Full backend 11b **141 tes/4.133 asersi**, 0 skip; frontend **88 tes**, HTTP nyata, Electron empat skenario, contract, PHP lint, ESLint, Prettier, typecheck dan build PASS. Full `npm run lint` diulang setelah dokumentasi parent dan PASS. MySQL disposable 11b untuk unit/HTTP terpisah telah diverifikasi dan shutdown normal; gate parent ini tidak membuka DB baru.
- Literal clean Git checkout **NOT VERIFIED** karena repo belum punya commit. CI Windows belum menyediakan MySQL disposable; tes DB CI dapat skip. Keduanya bukan kriteria khusus parent 2A-11, tetapi tetap terbuka untuk Phase 2A Final Acceptance. Keputusan FO/Power/throttle non-blocking; origin/TLS dan grant map existing prasyarat deployment. Phase 2A tetap WIP; next **Phase 2A Final Acceptance** hanya atas permintaan terpisah.

## Hasil 2A-11b

- Status akhir **VERIFIED** setelah continuation formatting. Judul V2: **Gate 2A: full backend/contract/HTTP/Electron regression**. [Matriks audit dan acceptance](phase-2-verification.md#2a-11b--gate-2a-full-backendcontracthttpelectron-regression). Full backend **141 tes/4.133 asersi**, frontend **88 tes**, HTTP smoke nyata, Electron demo/offline/corrupt/empty, contract, PHP lint, ESLint, typecheck, dan build PASS dari run awal; 0 skip. MySQL disposable `127.0.0.1:59869` aman; unit rollback 0 fixture, HTTP 4 revision dengan 0 checksum salah/pointer yatim, trigger/FK tetap ada.
- Run awal `npm run lint` exit 1 pada empat file Prettier. Continuation memformat hanya `.vscode/settings.json`, `docs/codegen-microbatch-plan-v2.md`, `docs/database.md`, dan `docs/phase-2-verification.md`. Review menemukan tiga filter PHPUnit dengan `|` yang dipad dalam sel tabel; perintah asli dipindahkan utuh ke luar tabel. JSON semantik sama; heading, link, code fence, status, dan bukti historis terjaga. Full lint ulang **PASS** (exit 0); tidak ada perubahan runtime/API/schema, jadi backend/HTTP/Electron tidak diulang.
- CI Windows masih belum menyediakan MySQL disposable/`SENKOM_TEST_DB_PORT`, sehingga CI belum membuktikan tes DB tanpa skip. Literal clean Git checkout belum tersedia karena repo belum punya commit. Keduanya dicatat sebagai keterbatasan non-blocking child ini. Parent 2A-11 dan Phase 2A tetap WIP; next **Parent Acceptance Gate 2A-11** hanya atas permintaan terpisah.

## Hasil 2A-11a

- Status **VERIFIED**. Judul V2: **Dokumentasi DB/API, provisioning dan clean setup**. [Matriks audit dan acceptance](phase-2-verification.md#2a-11a--dokumentasi-dbapi-provisioning-dan-clean-setup). Runbook baru mencakup install dependency, DB kosong, migration, DEMO seed atau map kosong, user/grant/token, konfigurasi API, dan tes DB terisolasi. `.env.example`, README, dan tautan database diperbarui. Tidak ada perubahan runtime/API/schema.
- Salinan source tanpa dependency/`.env` diuji: `npm ci` exit 0; Composer install PHP 8.4 exit 0 setelah retry cache offline; `key:generate`, migration, DEMO seed, HTTP health 200, contract check, schema 32 tes, focused CLI/seed 3 tes/64 asersi, PHP lint PASS. DB baru alternatif membuktikan `senkom:map` membuat draft kosong dan repeat ditolak; repeat DEMO seed ditolak tanpa overwrite. Repo lokal belum punya commit, sehingga salinan source bersih menggantikan checkout Git literal.
- MySQL disposable 8.4.11 `127.0.0.1:59868`, datadir `.artifacts/2a11a/data`, diverifikasi lewat proses dan SQL sebelum DB dibuat. DB unit 0 fixture setelah rollback; DB clean setup 1 map DEMO, 8 site, 1 audit, 0 revision/token; DB map kosong 1 map production, 1 audit. Empat trigger immutable dan FK pointer ada. MySQL dihentikan normal. Keputusan FO/Power/throttle non-blocking; origin/TLS dan grant map existing prasyarat deployment. Parent 2A-11 dan Phase 2A tetap WIP. Next **2A-11b** hanya atas permintaan terpisah.

## Hasil parent acceptance gate 2A-10

- Status **VERIFIED**. Judul parent: **Published Map API, metadata yang diizinkan, checksum/ETag dan negosiasi schema**. [Matriks acceptance dan bukti](phase-2-verification.md#parent-acceptance-gate-2a-10--published-map-api-metadata-yang-diizinkan-checksumetag-dan-negosiasi-schema). Child 2A-10a/b/c dan seluruh kriteria parent PASS; Phase 2A tetap WIP.
- Smoke HTTP diperluas untuk byte checksum/ETag dan 304 kosong pada map v1/v2, cameras, site detail; token/secret tidak bocor, draft/write viewer ditolak, unsupported schema 406, snapshot JSON/schema korup 503 tanpa payload/ETag. Pointer dipulihkan setelah fixture korup; tidak ada perubahan runtime/API/schema produk.
- Full backend **141 tes/4.133 asersi**; focused parent **9 tes/423 asersi**; 0 skip. HTTP smoke nyata, schema **32 tes**, OpenAPI/generated types, PHP lint, ESLint, Prettier PASS; seluruh exit 0.
- MySQL portable 8.4.11 `127.0.0.1:59867`, DB unit dan HTTP final baru terpisah. Unit rollback 0 fixture; HTTP 4 revision (2 valid dan 2 korup sintetis), 0 checksum salah/pointer yatim, pointer aktif kembali ke JSON valid. Empat trigger immutable dan FK pointer ada; direct UPDATE revision/audit ditolak `45000`. Shutdown normal exit 0; proses dan listener hilang. Keputusan FO/Power/throttle tetap non-blocking; origin/TLS dan grant map existing prasyarat deployment. Next **2A-11a** hanya pada permintaan terpisah.

## Hasil 2A-10c

- Status **VERIFIED** untuk V2 **Negosiasi schema v1/v2 dan corrupted snapshot**. [Matriks audit dan acceptance](phase-2-verification.md#2a-10c--negosiasi-schema-v1v2-dan-corrupted-snapshot). Parent 2A-10 dan Phase 2A tetap WIP.
- Proyeksi v1/v2, 406 unsupported dan incompatible sudah ada. Tes baru mereproduksi checksum-valid JSON rusak yang sebelumnya mendapat 500. `MapController::viewer` kini mengembalikan 503 `SNAPSHOT_UNAVAILABLE` untuk JSON invalid atau snapshot yang gagal schema v2, sebelum proyeksi/serialisasi. OpenAPI cameras 503, generated types, dan kontrak teks diperbarui.
- Focused final **2 tes/101 asersi**, regresi **6 tes/205 asersi**, schema **32 tes**, contract dan PHP lint PASS; 0 skip, exit 0. HTTP smoke nyata **PASS** untuk auth, publish/rollback, schema v1/v2, viewer dan cache terkait. Frontend/Electron **NOT RUN**, di luar scope.
- MySQL portable 8.4.11 `127.0.0.1:59866`, datadir `.artifacts/parent-2a03-31858d3f81a64429/data`, DB baru unit dan HTTP terpisah. Unit rollback 0 fixture; HTTP 2 revision, 0 checksum salah/pointer yatim; empat trigger immutable dan FK pointer ada. Shutdown normal exit 0; proses dan listener hilang. Keputusan FO/Power/throttle tetap non-blocking; origin/TLS dan grant map existing prasyarat deployment. Next **Parent Acceptance Gate 2A-10** hanya pada permintaan terpisah.

## Hasil 2A-10b

- Status **VERIFIED** untuk V2 **ETag/304/checksum exact bytes**. [Matriks audit dan acceptance](phase-2-verification.md#2a-10b--etag304checksum-exact-bytes). Parent 2A-10 dan Phase 2A tetap WIP.
- `MapController::viewer` sudah menghitung SHA-256 dari byte respons terpilih, memasukkannya ke ETag dan `X-Content-SHA256`, lalu memberi 304 kosong untuk validator cocok. Gap hanya bukti lintas schema/resource dan perubahan revision. Tes baru mencakup semuanya, termasuk draft tidak mengubah byte/ETag dan rollback mengembalikan byte/ETag lama. Tidak ada fix runtime/API/schema.
- Focused **1 tes/58 asersi**, regresi **4 tes/81 asersi**, schema **32 tes**, contract dan PHP lint PASS; 0 skip, seluruh exit 0. HTTP smoke terpisah **NOT RUN** karena runtime/API tidak berubah; PHPUnit melewati route/middleware/controller dengan MySQL nyata.
- MySQL portable 8.4.11 `127.0.0.1:59865`, datadir `.artifacts/parent-2a03-31858d3f81a64429/data`, DB baru `senkom_2a10b_unit_test` diverifikasi. Fixture rollback: 0 map/user/revision/audit/token; empat trigger immutable dan FK pointer ada. Shutdown normal exit 0; proses dan listener hilang. Laragon MySQL dan DB existing tidak dipakai. Keputusan FO/Power/throttle tetap non-blocking; origin/TLS dan grant map existing prasyarat deployment. Next **2A-10c** hanya pada permintaan terpisah.

## Hasil 2A-10a

- Status **VERIFIED** untuk V2 **Viewer published map, metadata aman, auth scope**. [Matriks audit dan acceptance](phase-2-verification.md#2a-10a--viewer-published-map-metadata-aman-auth-scope). Parent 2A-10 dan Phase 2A tetap WIP.
- Audit menemukan implementasi viewer membaca active revision, metadata publik dibatasi schema saat publish, token mengikat map, dan write ditolak. Gap hanya bukti lifecycle terpadu. Satu tes ditambah; tidak ada fix runtime/API/schema.
- Focused **1 tes/34 asersi**, regresi **5 tes/95 asersi**, schema **32 tes**, contract dan PHP lint PASS; 0 skip, exit 0. HTTP smoke terpisah **NOT RUN** karena runtime/API tidak berubah; PHPUnit melintasi route/middleware/controller dengan MySQL nyata.
- MySQL portable 8.4.11 `127.0.0.1:59864`, datadir `.artifacts/parent-2a03-31858d3f81a64429/data`, DB baru `senkom_2a10a_unit_test` diverifikasi. Fixture rollback: 0 map/user/revision/audit/token; empat trigger immutable dan FK pointer ada. Shutdown normal exit 0; proses hilang. Laragon MySQL dan DB existing tidak dipakai. Keputusan FO/Power/throttle tetap non-blocking; origin/TLS dan grant map existing prasyarat deployment. Next **2A-10b** hanya pada permintaan terpisah.

## Hasil parent acceptance gate 2A-09

- Status **VERIFIED**. Judul parent: **History revision dan rollback publikasi terotorisasi; audit tetap immutable**. [Matriks acceptance](phase-2-verification.md#parent-acceptance-gate-2a-09--history-revision-dan-rollback-publikasi-terotorisasi-audit-tetap-immutable). Child 09a/b dan seluruh kriteria parent PASS; Phase 2A tetap WIP.
- Full backend **137 tes/3.940 asersi**, focused **4 tes/162 asersi**, 0 skip. HTTP smoke nyata diperluas untuk dua revision, history/detail, rollback 428/409, audit tunggal, dan byte viewer kembali ke revision pertama; PASS. Schema **32 tes**, OpenAPI/generated types, PHP lint, ESLint, dan Prettier PASS.
- MySQL portable `127.0.0.1:59863`, DB unit dan HTTP baru terpisah. Unit rollback 0 fixture; HTTP 2 revision dan 1 audit rollback. SQL: empat trigger immutable, FK pointer, 0 pointer yatim/checksum salah; UPDATE langsung revision/audit ditolak `45000`. Shutdown normal, exit 0. Tidak ada fix runtime/API/schema. Keputusan FO/Power/throttle tetap non-blocking; origin/TLS dan grant map existing prasyarat deployment. Next **2A-10a** hanya atas permintaan terpisah.

## Hasil 2A-09b

- Status **VERIFIED** untuk V2 **Rollback terotorisasi + failure injection**. [Matriks audit dan acceptance](phase-2-verification.md#2a-09b--rollback-terotorisasi--failure-injection). Parent 2A-09 dan Phase 2A tetap WIP.
- Audit: route publisher, target revision per map, ETag, transaksi pointer/audit, FK dan trigger immutable sudah ada. Gap hanya bukti injection rollback setelah pointer dan saat audit. Tes baru membuktikan rollback gagal menjaga draft, pointer, revision, audit dan byte viewer; rollback sukses membuat satu audit baru, memakai snapshot lama, dan menjaga draft unpublished.
- Focused final **1 tes/60 asersi**, regresi **7 tes/406 asersi**, schema **32 tes**, contract dan PHP lint PASS; 0 skip. Run awal gagal pada asersi urutan key JSON test dan diperbaiki tanpa perubahan runtime. HTTP smoke terpisah NOT RUN karena runtime/API tidak berubah.
- MySQL portable `127.0.0.1:59862`, DB baru `senkom_2a09b_unit_test`; SQL akhir 0 fixture, empat trigger immutable dan FK pointer terdaftar; shutdown normal exit 0. Keputusan FO/Power/throttle tetap non-blocking; origin/TLS dan grant map existing prasyarat deployment. Next **parent acceptance gate 2A-09** hanya atas permintaan terpisah.

## Hasil 2A-09a

- Status **VERIFIED** untuk V2 **History/list/detail revision dan map scope**. [Matriks audit dan acceptance](phase-2-verification.md#2a-09a--historylistdetail-revision-dan-map-scope). Parent 2A-09 dan Phase 2A tetap WIP.
- Implementasi list/detail, pagination, `AdminAccess:read`, filter map, dan trigger immutable sudah ada. Gap hanya bukti isi history lintas-map, pagination, detail byte-identik setelah publish berikutnya, dan read/denial tanpa mutation. Satu tes terfokus ditambah; tidak ada fix runtime/API/schema.
- Focused **1 tes/59 asersi**, regresi **6 tes/186 asersi**, schema **32 tes**, contract dan PHP lint PASS; 0 skip. HTTP smoke terpisah NOT RUN karena runtime tidak berubah; PHPUnit melewati route/middleware/controller pada MySQL nyata.
- MySQL portable `127.0.0.1:59861`, DB baru `senkom_2a09a_unit_test`; SQL akhir 0 map/user/revision/audit/node/edge setelah rollback dan empat trigger immutable ada. Shutdown normal, exit 0. Keputusan FO/Power/throttle tetap non-blocking; origin/TLS dan grant map existing prasyarat deployment. Next **2A-09b** hanya atas permintaan terpisah.

## Hasil parent acceptance gate 2A-08

- Status **VERIFIED**. Judul parent: **Agregasi validasi draft dan publish snapshot immutable secara atomik**. [Matriks acceptance](phase-2-verification.md#parent-acceptance-gate-2a-08--agregasi-validasi-draft-dan-publish-snapshot-immutable-secara-atomik). Child 08a/b dan seluruh kriteria parent PASS; Phase 2A tetap WIP.
- Full backend **135 tes/3.821 asersi**, 0 skip; HTTP smoke nyata PASS pada DB terpisah; schema **32 tes**, contract generated types, dan PHP lint PASS. Draft invalid/publish tanpa validasi ditolak, role/map scope dijaga, viewer tetap pada snapshot published. Injection setelah pointer dan saat audit rollback seluruh state; publish sah memperbarui revision/viewer.
- MySQL portable 8.4.11 `127.0.0.1:59860`, datadir `.artifacts/parent-2a03-31858d3f81a64429/data`; DB baru unit dan HTTP terpisah. Unit rollback 0 fixture. SQL: empat trigger immutable, FK pointer, 0 pointer yatim/checksum salah; UPDATE langsung audit/revision ditolak `45000`. Shutdown normal, exit 0. Tidak ada fix runtime/API/schema. FO/Power/throttle tetap non-blocking; origin/TLS dan grant map existing prasyarat deployment. Next **2A-09a** hanya atas permintaan terpisah.

## Hasil 2A-08b

- Status **VERIFIED** untuk V2 **Publish snapshot immutable, pointer dan audit atomik**. [Matriks audit dan acceptance](phase-2-verification.md#2a-08b--publish-snapshot-immutable-pointer-dan-audit-atomik). Parent 2A-08 dan Phase 2A tetap WIP.
- Audit: `MapWorkflow::publish` sudah menempatkan revision insert, pointer save, dan audit insert dalam transaksi; trigger DB menjaga revision/audit immutable. Gap hanya bukti failure injection setelah pointer save dan saat audit insert. Tidak ada fix runtime/API/schema.
- Tes baru melempar pada dua titik tersebut; setiap rollback mempertahankan draft/version/status, pointer lama, jumlah revision/audit, snapshot lama, dan byte viewer. Publish berikutnya sukses. Focused **1 tes/37 asersi**, regresi **5 tes/149 asersi**, schema **32 tes**, contract dan PHP lint PASS; 0 skip. HTTP smoke terpisah NOT RUN karena runtime tidak berubah; tes API in-process memakai MySQL nyata.
- MySQL portable 8.4.11 `127.0.0.1:59859`, datadir `.artifacts/parent-2a03-31858d3f81a64429/data`, DB baru `senkom_2a08b_unit_test`; SQL akhir 0 map/user/revision/audit/node/edge; `mysqladmin shutdown` exit 0. Laragon MySQL tidak dipakai. Keputusan FO/Power/throttle tetap non-blocking; origin/TLS dan grant map existing prasyarat deployment. Next **parent acceptance gate 2A-08** hanya atas permintaan terpisah.

## Hasil 2A-08a

- Status **VERIFIED** untuk V2 **Validasi draft domain lengkap**: draft invalid ditolak dengan error aman. [Matriks audit dan acceptance](phase-2-verification.md#2a-08a--validasi-draft-domain-lengkap). Parent 2A-08 dan Phase 2A tetap WIP.
- Audit: `MapRules::inspect(..., true)`, `MapWorkflow::validate`, pemeriksaan ulang pada publish, transaksi, RBAC, dan pemisahan draft/published sudah ada. Gap hanya bukti endpoint untuk kelas invalid domain yang sebelumnya diuji langsung melalui `inspect`; tidak ada fix runtime/API/schema.
- Tes existing diperluas: invalid FO path, Power source, dan layout diagonal disimpan sebagai draft lalu `POST /admin/map/validate` mengembalikan issue aman; publish 409 tanpa mengubah pointer, revision, atau viewer. Metadata private hasil injeksi DB memberi `SCHEMA` tanpa membocorkan nilai pada respons/audit. Focused **15 tes/308 asersi**, regresi **4 tes/238 asersi**, schema **32 tes**, contract dan PHP lint PASS; tanpa skip. HTTP smoke baru tidak diperlukan karena runtime tidak berubah.
- MySQL portable 8.4.11 `127.0.0.1:59858`, datadir `.artifacts/parent-2a03-31858d3f81a64429/data`, DB baru `senkom_2a08a_unit_test`; SQL akhir menunjukkan 0 map/user/node/edge/audit/revision sesudah rollback. Laragon MySQL tidak dipakai. Keputusan terbuka dan prasyarat deployment tidak berubah. Next **2A-08b** hanya atas permintaan terpisah.

## Hasil parent acceptance gate 2A-07

- Status **VERIFIED**: child 07a/b dan seluruh kriteria parent PASS. [Matriks acceptance dan bukti](phase-2-verification.md#parent-acceptance-gate-2a-07--layout-persistence-waypoint-integrity--optimistic-concurrency). Judul parent: **Layout node/edge terpisah; GET/PUT draft dan optimistic concurrency.** Phase 2A tetap WIP.
- Gap parent ditemukan: `GET /admin/map-layouts` tidak mengirim ETag; tes HTTP sebelum fix gagal (`null` vs `"draft:1"`, exit 1). `MapController::layout` kini mengirim ETag dari map yang sama dengan payload. OpenAPI, generated TypeScript dan kontrak teks diperbarui. Smoke dua editor kini mengambil ETag langsung dari GET layout, termasuk refetch/retry.
- Tes parent memperluas negatif ID node/edge, referensi tidak dikenal/lintas-map, tipe/struktur dan waypoint. Save 422/409/428 menjaga draft/version/audit, active revision dan viewer bytes. Waypoint order/properti tetap pada GET dan snapshot published; array node/edge diidentifikasi ID dan zIndex, bukan urutan input.
- Focused PHP **1 tes/140 asersi**; full backend **134 tes/3.713 asersi**, tanpa skip. HTTP smoke, schema **33 tes**, contract check, typecheck, PHP lint, ESLint, Prettier, SQL PK/FK/rollback exit 0. MySQL portable 8.4.11 `127.0.0.1:59857`; DB baru repro, HTTP dan unit terpisah. Unit rollback 0 map/user/node/edge/audit; HTTP dua `map.save_layout`, satu revision. Tidak ada migration/schema DB change; Laragon tidak dipakai.
- Keputusan FO/Power dan throttle tambahan tetap non-blocking; origin/TLS serta grant map existing prasyarat deployment. Next **2A-08a** hanya atas permintaan berikutnya.

## Hasil 2A-07b

- Status **VERIFIED** untuk V2 **Optimistic concurrency dua editor melalui HTTP**: dua cookie/session editor terpisah membaca ETag sama; save A 200, save B stale 409 `DRAFT_CONFLICT`, header hilang 428 `PRECONDITION_REQUIRED`. B refetch lalu save 200; kedua perubahan tetap ada. [Matriks audit dan acceptance](phase-2-verification.md#2a-07b--optimistic-concurrency-dua-editor-melalui-http). Parent 2A-07 dan Phase 2A tetap WIP.
- `MapWorkflow::edit` row lock, exact `If-Match` dan transaksi sudah benar; tidak ada fix runtime. Fixture HTTP menambah editor kedua, smoke memakai cookie/CSRF terpisah. Rejected save tidak menambah version/audit, tidak mengubah draft atau viewer. SQL HTTP: tepat dua `map.save_layout`, satu published revision. Camera/system_admin, auth/CSRF/CORS, viewer dan regresi existing tetap PASS.
- HTTP smoke exit 0; PHPUnit terarah **6 tes/338 asersi**, schema **32 tes**, OpenAPI contract, PHP lint, ESLint, Prettier dan SQL exit 0 tanpa skip. MySQL portable 8.4.11 `127.0.0.1:59856`, DB baru `senkom_2a07b_http_test` dan `senkom_2a07b_unit_test` terpisah; unit rollback 0 map/user/node/edge/audit. Tidak ada schema/API change.
- Keputusan FO/Power, throttle tetap non-blocking; origin/TLS dan grant map existing prasyarat deployment. Next **parent acceptance gate 2A-07** pada permintaan terpisah.

## Hasil 2A-07a

- Status **VERIFIED** untuk V2 **Layout node/edge round-trip dan waypoint**: GET/PUT mempertahankan properti node, edge, waypoint, ukuran layout, dan inventory fisik; ID dan waypoint invalid ditolak tanpa mutation parsial. [Matriks dan bukti](phase-2-verification.md#2a-07a--layout-nodeedge-round-trip-dan-waypoint). Parent 2A-07 dan Phase 2A tetap WIP.
- Audit menemukan endpoint, schema, transaksi, RBAC, audit, dan pemisahan draft/published sudah benar; celah hanya tes round-trip dan negatif spesifik. Tambah satu tes PHP serta dua asersi izin PUT layout. Tidak ada perubahan runtime, schema, OpenAPI, atau kebijakan.
- Focused **1 tes/88 asersi**; regresi terarah **6 tes/338 asersi**; schema **32 tes**, contract check, PHP lint dan SQL rollback exit 0, tanpa skip. MySQL portable 8.4.11 `127.0.0.1:59855`, DB baru `senkom_2a07a_unit_test`; 0 map/user/node/edge/audit setelah rollback. Tidak ada HTTP smoke baru karena runtime tidak berubah; 2A-07b memegang concurrency HTTP dua editor.
- Keputusan FO parent cable, optical port reuse, direct SQL reverse splice/Power subtype, throttle tambahan tetap non-blocking. Origin/TLS dan grant map existing tetap prasyarat deployment. Next **2A-07b** hanya atas permintaan berikutnya.

## Hasil parent acceptance gate 2A-06

- Status **VERIFIED**: seluruh child 06a/b/c/d dan kriteria parent lulus. [Matriks acceptance dan 13 resource](phase-2-verification.md#parent-acceptance-gate-2a-06--inventory-crud-contract-integrity-atomic-rollback--camera-authorization).
- V1 menetapkan Camera management untuk `system_admin`; V2 tidak bertentangan. Tes awal membuktikan editor dapat POST Camera (201, expected 403; exit 1). Middleware existing kini mewajibkan `system_admin` hanya untuk mutation `cameras`; read dan izin resource lain tetap. Tes kamera PASS, termasuk 403 editor/publisher, admin CRUD, audit, map scope, draft dan published viewer utuh.
- Dua resource layout melengkapi 13 resource: Map Node/Edge create/list/detail/PATCH/delete, negatif, pagination, FK, audit dan viewer PASS. PHPUnit lengkap **133 tes/3.569 asersi**, tanpa skip, exit 0. HTTP smoke nyata exit 0: editor Camera POST/PATCH/DELETE 403, admin CRUD, viewer bytes identik. Schema 33 tes, contract check, typecheck, PHP lint, ESLint, Prettier exit 0.
- SQL `information_schema`: FK 13 tabel inventory dan lima tabel dependency `RESTRICT`; indeks unik aktual cocok matriks; unit DB menyisakan 0 map/user/audit setelah rollback. MySQL portable 8.4.11 `127.0.0.1:59854`, datadir `.artifacts/parent-2a03-31858d3f81a64429/data`; DB unit `senkom_2a06_parent_unit_test` dan HTTP `senkom_2a06_parent_http_test` terpisah. Laragon tidak dipakai; migration/schema tidak berubah.
- Keputusan FO parent cable, optical port reuse, direct SQL reverse splice/Power subtype, dan throttle tambahan non-blocking. Origin/TLS serta grant map existing prasyarat deployment. Next **2A-07a** hanya atas permintaan berikutnya.

## Hasil 2A-06d

- Status **VERIFIED** untuk **CRUD FO/logical/Power/corridor + atomic failure**. [Matriks requirement, CRUD, FK dan bukti](phase-2-verification.md#2a-06d--crud-fologicalpowercorridor--atomic-failure). Parent 2A-06 dan Phase 2A tetap **WIP**. Audit dimulai sebelum MySQL testing start 2026-11-09 11:28 WIB; selesai 11:38 WIB.
- Scope tujuh resource: Cable, Fiber Core, Fiber Termination, Fiber Splice, Logical Link, Power Circuit, Route Corridor. Empat tes baru membuktikan lifecycle HTTP Logical Link, matriks negatif dan RBAC/map scope, audit mutation, serta failure injection setelah replacement pada masing-masing resource. GET 404 setelah delete ditambah. Tidak ada perubahan runtime/schema/API/RBAC.
- Focused **7 tes/638 asersi**, regresi terarah **23/1.567**, contract/schema **33 tes**, PHP lint dan SQL FK/unique PASS; exit 0, tanpa skip. MySQL portable 8.4.11 `127.0.0.1:59853`, DB baru `senkom_2a06d_unit_test`, 0 map/user/audit/link sesudah rollback; shutdown normal. HTTP smoke baru tidak dijalankan karena runtime tidak berubah.
- Failing test awal (3/340) berasal dari asumsi delete Logical Link dengan pivot harus 422; API sah menghapus pivot milik link atomik. Direct SQL delete tetap ditolak FK 1451. Assertion dikoreksi; tidak ada bug produk. Blocker kamera parent dan keputusan FO/Power, throttle, origin/TLS, grant map tetap. File berubah: `apps/api/tests/InfrastructureTest.php`, dua dokumen ini. Next **parent gate 2A-06** pada permintaan terpisah.

## Hasil 2A-06c

- Status **VERIFIED** untuk **CRUD site/device/port + referential delete**. [Matriks CRUD, dependency, FK dan bukti](phase-2-verification.md#2a-06c--crud-sitedeviceport--referential-delete). Parent 2A-06 dan Phase 2A tetap **WIP**. Mulai 2026-11-09 11:09 WIB, selesai 11:20 WIB.
- Tiga tes baru membuktikan create/list/detail/PATCH/delete, pagination, audit, validasi negatif, 403 map scope, 422 referential delete, SQL FK/unique, rollback, dan snapshot published tetap byte-identik. Kegagalan awal hanya urutan key objek pada assertion test; dibetulkan dengan perbandingan nilai. Tidak ada bug produk atau perubahan runtime/schema/kontrak/RBAC.
- Focused PHPUnit **3/239** dan regresi **10/621**, tanpa skip, exit 0. Contract check, PHP lint, SQL FK/unique dan rollback fixture PASS. MySQL portable terisolasi `127.0.0.1:59852`, DB baru `senkom_2a06c_unit_test`, 0 map/user/audit setelah rollback; instance dihentikan normal. HTTP smoke baru, migration rollback, frontend/Electron build tidak diperlukan untuk perubahan tes/dokumen.
- Blocker kamera tetap: route editor mutation bertentangan dengan matriks V1 `system_admin`. Keputusan FO/Power, throttle, origin/TLS, dan grant map existing tetap terbuka. File berubah: `apps/api/tests/InfrastructureTest.php` dan dua dokumen ini. Next **2A-06d** hanya pada permintaan terpisah.

## Hasil 2A-06b

- Status **VERIFIED**: `CablePatch` menerima PATCH common-only, FO, dan Power parsial tanpa campuran subtype. [Bukti sebelum/sesudah](phase-2-verification.md#2a-06b--perbaiki-openapi-cablepatch-oneof-dan-generated-types). Parent 2A-06 dan Phase 2A tetap **WIP**.
- Reproduksi awal: Ajv 1 tes gagal (`oneOf` cocok cabang 0 dan 1); TypeScript `TS2578` menunjukkan campuran FO/Power diterima tipe lama. Schema diganti `anyOf` dengan field subtype lawan `false`; generator menghasilkan `?: never`. Create schema dan runtime Laravel tidak berubah.
- Contract/schema 33 tes, TypeScript compile, contract drift, ESLint, Prettier, PHP lint exit 0. PHP PATCH fokus **1/37** dan regresi FO/Power/RBAC/map scope **6/305**, exit 0. MySQL portable terisolasi `127.0.0.1:59851`; rollback unit 0 map/user/audit; instance dihentikan normal. HTTP smoke baru dan full Electron build tidak dijalankan karena runtime tidak berubah.
- Blocker kamera 06a tetap untuk parent: route editor generik dapat mutate kamera, sedangkan V1 menetapkan `system_admin` sebagai pengelola. CRUD resource lain tetap milik 06c/d; keputusan FO/Power, throttle, deployment, dan grant map tetap terbuka. File berubah: `docs/openapi.json`, generated TypeScript, tes kontrak/PHP, `docs/api-contract.md`, dan dua dokumen ini. Next **2A-06c** hanya pada permintaan terpisah.

## Hasil 2A-06a

- Status **VERIFIED** untuk audit V2 **Audit CRUD inventory dan error/pagination envelope**. [Matriks endpoint-resource dan gap](phase-2-verification.md#2a-06a--audit-crud-inventory-dan-errorpagination-envelope). Parent 2A-06 dan Phase 2A tetap **WIP**.
- Ketiga belas resource `InventoryStore` punya enam operasi route dan OpenAPI. Tes baru membuktikan list page 1/2, total, batas `perPage`, dan error 404/422 pada semua resource (**1 tes/157 asersi**). Regresi terarah CRUD/RBAC/cross-map/transaction **6 tes/381 asersi**; HTTP smoke, contract check, PHP lint exit 0.
- Gap nyata: CRUD positif/negatif tiap resource belum lengkap; `CablePatch.oneOf` menolak PATCH common-only yang diterima handler, milik 06b. Route editor generik juga memberi mutation `cameras`, sementara V1 menempatkan kelola kamera pada `system_admin`; policy dan owner tes kamera harus ditetapkan sebelum parent 2A-06 diterima. Tidak mengubah RBAC atau kontrak pada audit ini.
- MySQL portable terisolasi `127.0.0.1:59850`, DB unit dan HTTP baru dipisah; rollback unit 0 map/user/audit, HTTP satu map sintetis. Instance dihentikan normal; Laragon tidak dipakai. File berubah: `apps/api/tests/InfrastructureTest.php` dan dua dokumen ini. Next **2A-06b** hanya pada permintaan terpisah.

## Hasil parent acceptance gate 2A-05

- Status **VERIFIED**: seluruh child 05a/b/c dan semua kriteria parent PASS. [Matriks acceptance](phase-2-verification.md#parent-acceptance-gate-2a-05--authentication-rbac-viewer-token-audit--rate-limiting). Phase 2A tetap **WIP**.
- HTTP dua mode membuktikan cookie/session, login/logout/replay denial, 401/403/419/429, CORS allowed/blocked, Secure cookie attribute, draft/publish/viewer, dan tidak ada password/cookie/CSRF/bearer pada respons 429 atau server log. Atribut Secure bukan bukti HTTPS deployment nyata.
- PHPUnit full **122 tes/2503 asersi** dan focused audit RBAC **1/69**, exit 0. Contract check, Vitest schema **32 tes**, validasi Ajv snapshot HTTP v1/v2, migration up/down/re-up, SQL PK/unique/FK/index, PHP lint, ESLint, Prettier semuanya exit 0. Tes baru pada parent membuktikan editor tidak membaca audit map sendiri dan publisher membaca audit map berizin. Tidak ada fix produk.
- MySQL portable terisolasi `127.0.0.1:59849`; DB unit, HTTP, migration baru dipisah. Rollback unit menyisakan 0 map/user/membership/token/audit; instance dihentikan normal. Laragon tidak dipakai.
- Viewer/admin throttle tambahan tetap keputusan desain non-blocking. Origin/TLS aktual dan grant per-map bagi user existing ialah prasyarat deployment. Empat keputusan FO/Power terdahulu non-blocking. File berubah: `apps/api/tests/InfrastructureTest.php`, `scripts/phase2-smoke.mjs`, dan dua dokumen ini. Next **2A-06a** hanya pada permintaan terpisah.

## Hasil 2A-05c

- Status **VERIFIED** untuk V2 **Viewer token provisioning, expiry/revoke, audit, rate-limit**. Parent 2A-05 dan Phase 2A tetap **WIP**. [Matriks keamanan dan bukti](phase-2-verification.md#2a-05c--viewer-token-provisioning-expiryrevoke-audit-rate-limit).
- CLI existing membuat token acak 64 hex, menyimpan hash SHA-256 dan file baru tanpa overwrite, berlaku 1–24 jam untuk satu map; CLI revoke mengisi `revoked_at`. Viewer hanya melihat published snapshot map token, tidak mendapat admin/write. Tes baru memeriksa CLI, map silang, revocation, audit, dan secret.
- Audit auth existing mencatat login berhasil/ditolak, logout, token create/revoke CLI. Tes baru memeriksa actor, waktu, map, outcome melalui action, dan tidak adanya password/CSRF/bearer pada audit. V1 tidak mewajibkan event tersendiri untuk token invalid/expired/revoked, unauthorized, atau 429; tidak ditambah event baru.
- Limiter login existing: 5 percobaan/60 detik per hash IP, 429 pada percobaan berikutnya, sukses membersihkan counter. HTTP smoke membuktikan 429; tes PHP membuktikan IP kedua bebas dari limit IP pertama. Angka viewer/admin sensitive endpoint belum ditetapkan V1/V2; tidak diberi throttle arbitrer. Jika kelak diwajibkan, putuskan angka dan key lebih dulu.
- PHPUnit dua tes baru **2/68** asersi, focused IP/rate **1/16**, full backend **122/2501**, HTTP smoke, contract check, PHP lint, ESLint, Prettier semuanya exit 0. MySQL portable terisolasi `127.0.0.1:59848`, DB unit dan HTTP terpisah; rollback unit menyisakan 0 map/user/token/audit; instance dihentikan normal. Tidak ada perubahan kode produk, schema, API, FO/Power, RBAC, frontend, atau Electron.
- File berubah: `apps/api/tests/InfrastructureTest.php`, `scripts/phase2-smoke.mjs`, dan dua dokumen gate. Next **parent acceptance gate 2A-05** hanya pada permintaan terpisah.

## Hasil 2A-05b

- Status **VERIFIED** setelah keputusan pengguna: role editor/publisher per map via `user_map_roles`, `system_admin` global, hanya publisher validate, dan 403 sama untuk map di luar scope/ID tidak ada. [Matriks acceptance final](phase-2-verification.md#implementasi-dan-acceptance-final). Parent 2A-05 dan Phase 2A tetap **WIP**.
- Failing test awal: tabel membership tidak ada (SQL 1146, exit 2). Migration additive, `User::permits` map-scoped, dan `AdminAccess` menolak map sebelum controller. CLI `senkom:map-role` grant/revoke. User editor/publisher lama tanpa grant map gagal tertutup sampai diprovisioning eksplisit. Tidak ada perubahan role FO/Power atau viewer token.
- Tes focused **3/95**, full backend **120/2432**, HTTP smoke, migration up/down/re-up disposable, SQL FK/PK/enum, contract check, dan PHP lint semuanya exit 0. PHPUnit rollback menyisakan 0 map/user/membership pada DB unit. DB HTTP terpisah menampung fixture smoke.
- MySQL portable 8.4.11 `127.0.0.1:59847`, datadir dan DB aktual diverifikasi. Laragon tidak dipakai; instance dihentikan normal setelah gate. File berubah: migration, `User.php`, `AdminAccess.php`, `routes/api.php`, `routes/console.php`, `InfrastructureTest.php`, `docs/database.md`, `docs/api-contract.md`, dan dua dokumen gate.
- Empat keputusan FO/Power tetap non-blocking. Viewer token provisioning, audit auth, rate-limit masuk 2A-05c. Next **2A-05c** hanya pada permintaan terpisah.

## Audit awal 2A-05b — terselesaikan

- V2: **RBAC lintas-map, editor/publisher/admin**, dengan 403 untuk viewer write dan scope salah. Role backend existing bekerja, tetapi `users.roles` global; tidak ada membership user-map atau aturan assignment pada V1/V2. `AdminAccess` memeriksa role saja; `mapId` pada controller dapat memilih map existing tanpa pemeriksaan user-map. [Matriks audit dan endpoint](phase-2-verification.md#2a-05b--rbac-lintas-map-editorpublisheradmin-audit-blocked).
- V1 menyebut publisher untuk validate, sedangkan route sekarang mengizinkan editor juga; `system_admin` sekarang mewarisi semua role meski cakupan global tidak dinyatakan. V2 meminta 403 scope salah dan gate meminta tanpa kebocoran keberadaan map; kebijakan untuk map ID tidak ada perlu dipilih.
- PHPUnit baseline role/viewer/map data scope **4 tes/98 asersi**, exit 0; contract check dan SQL schema audit exit 0. Tes ini **tidak** membuktikan user-map authorization. Tidak ada product fix/schema/test baru berdasarkan asumsi.
- MySQL portable testing `127.0.0.1:59847`, DB baru `senkom_2a05b_test`, datadir dan identitas diverifikasi; fixture rollback menyisakan 0 map/user. Instance dihentikan normal; Laragon tidak dipakai.
- Keputusan di atas diterima setelah audit awal; implementasi dan hasil final dicatat pada bagian **Hasil 2A-05b**. Empat keputusan FO/Power tetap non-blocking.

## Hasil 2A-05a

- V2: **Admin session, login/logout, CSRF dan CORS**. Status **VERIFIED**; parent 2A-05 dan Phase 2A tetap **WIP**. [Matriks audit dan acceptance](phase-2-verification.md#2a-05a--admin-session-loginlogout-csrf-dan-cors).
- Existing session file, login/logout rotation, CSRF, 401/419 tetap benar. HTTP failing test mereproduksi ACAO `*` dari default Laravel. `config/cors.php` kini membatasi CORS credentialed ke origin admin eksplisit untuk auth/admin; `.env.example` memakai file session dan Secure cookie; smoke menguji allowed/blocked origin serta preflight pada auth/admin.
- HTTP smoke mode lokal dan mode Secure masing-masing exit 0. PHPUnit fokus dan regresi FO/Power **3 tes/79 asersi**, exit 0; contract check, PHP lint, ESLint, Prettier exit 0. Tidak ada perubahan schema/API atau fix parent 2A-01–04.
- MySQL portable 8.4.11 `127.0.0.1:59846` dan datadir diverifikasi. DB unit dan HTTP disposable dipisah; rollback PHPUnit menyisakan **0 map** pada DB unit. Laragon tidak dipakai; instance portable dihentikan normal.
- Empat keputusan FO/Power terdahulu tetap non-blocking. Origin deployment/TLS nyata deferred; `SameSite=Strict` memerlukan admin/API satu site. RBAC lintas-map masuk 2A-05b; viewer token, audit, rate-limit masuk 2A-05c. File berubah: `config/cors.php`, `apps/api/.env.example`, `scripts/phase2-smoke.mjs`, dan dua dokumen ini. Next **2A-05b** hanya pada permintaan terpisah.

## Hasil parent gate 2A-04

- Status **VERIFIED**: semua child VERIFIED, seluruh kriteria parent PASS, tanpa gap blocking. [Matriks acceptance dan command](phase-2-verification.md#parent-2a-04--acceptance-gate-power-cable-power-circuit-route-corridor).
- Tes gabungan baru membuktikan Power Circuit dan Route Corridor pada fixture dua map tetap terpisah saat lazy/eager/`withCount`; FO tetap anggota corridor, perubahan membership corridor tidak mengubah circuit. Tes Power publish diperkuat untuk active revision, revision count, viewer bytes, dan inventaris setelah draft `POWER_GAP` ditolak.
- PHPUnit penuh pada DB bersih **118 tes/2352 asersi**, exit 0; schema **32 tes**, contract check, HTTP smoke, snapshot Ajv v1/v2, SQL PK/FK/unique, dan PHP lint exit 0. Rerun sementara pada DB yang sudah diisi smoke gagal satu tes karena asumsi tanpa map lain; DB bersih baru lulus tanpa skip. Tidak ada fix produk/schema/API.
- MySQL portable 8.4.11 `127.0.0.1:59845`, datadir `.artifacts/parent-2a03-31858d3f81a64429/data`, dan DB disposable `senkom_2a04_parent_clean_test` diverifikasi sebelum tes. Laragon MySQL tidak dipakai. Fixture PHPUnit rollback; smoke menyisakan map sintetis pada DB terpisah. Instance portable dihentikan setelah gate.
- Keputusan FO terdahulu dan subtype Power direct SQL tetap non-blocking; klasifikasi source `backup` lebih rinci belum ditetapkan V1. File berubah: dua tes API dan dua dokumen ini. Phase 2A tetap **WIP**. Next **2A-05a** hanya pada permintaan terpisah.

## Hasil 2A-04c

- Route Corridor menyimpan membership kabel FO/Power secara eksplisit pada `corridor_cables`. Tidak ada urutan, status, metadata, atau aturan eksklusivitas kabel di kontrak V1. API create/update/delete, referensi lintas map, duplikat, FK komposit, publish/viewer, serta pemisahan edge visual lulus. [Matriks audit](phase-2-verification.md#2a-04c--integritas-route-corridor).
- Bug `RouteCorridor::cables` direproduksi: lazy benar, eager/`withCount` 0 (1 tes/9 asersi, exit 1). Filter `map_id` membaca parent kosong saat eager/count. `MapBelongsToMany` existing memperbaiki lazy/eager/count tanpa kebocoran map (1 tes/20 asersi, exit 0).
- PHPUnit API koridor 1/76 asersi; regresi Infrastructure termasuk FO/Power 73/1485 dan relasi termasuk Power Circuit 41/833, seluruhnya exit 0. Schema TS 32 tes, contract check, SQL FK/index, dan lint exit 0. MySQL testing portable `127.0.0.1:59844` dan datadir diverifikasi; fixture rollback menyisakan 0 map pada `senkom_2a04b_test`; instance dihentikan normal (PID 11384 hilang). Laragon tidak dipakai.
- File berubah: `RouteCorridor.php`, `InfrastructureTest.php`, `MapRelationsTest.php`, `docs/phase-2-verification.md`, dan dokumen ini. Status 2A-04c **VERIFIED**; parent 2A-04 **WIP**. Tiga keputusan FO tetap terbuka. Next **parent gate 2A-04** hanya pada permintaan terpisah.

## Hasil 2A-04b

- Power Circuit source/load terminal, `pln`/`backup`/`ups`, urutan dua kabel, path putus/tujuan salah, referensi lintas map, lifecycle, publikasi, dan pemisahan edge visual lulus. [Matriks audit](phase-2-verification.md#2a-04b--integritas-power-circuit).
- Bug `PowerCircuit::cables` direproduksi: lazy benar, eager/`withCount` salah (1 tes/7 asersi, exit 1). `wherePivot('map_id', $this->map_id)` membaca parent kosong saat eager/count. `MapBelongsToMany` existing memperbaiki lazy/eager/count tanpa kebocoran map (1 tes/16 asersi, exit 0).
- PHPUnit circuit baru 2 tes/89 asersi; regresi `InfrastructureTest.php` + `MapRelationsTest.php` 112/2211, exit 0; schema TS 32 tes, contract check, SQL FK/index, dan lint exit 0. DB testing baru `senkom_2a04b_test` pada MySQL portable `127.0.0.1:59844` diverifikasi lewat proses/SQL, rollback menyisakan 0 map, lalu instance dihentikan normal (PID 17012 hilang). Regresi awal pada `senkom_test` terganggu map smoke sintetis lama; pengujian ulang pada DB bersih lulus. Laragon tidak dipakai.
- File berubah: `PowerCircuit.php`, `InfrastructureTest.php`, `MapRelationsTest.php`, `docs/phase-2-verification.md`, dan dokumen ini. Status 2A-04b **VERIFIED**; parent 2A-04 **WIP**. Gap `RouteCorridor::cables` milik 2A-04c. Keputusan FO sebelumnya tetap terbuka. Next **2A-04c** hanya pada permintaan terpisah.

## Hasil 2A-04a

- Kabel `kind=power` memakai `power_cable_details`; schema/validator menolak atribut FO pada kabel Power dan memerlukan terminal untuk endpoint circuit. API create/update/delete, FK/unique, status inventory/manual, map scope, serta pemisahan edge visual lulus. [Matriks audit](phase-2-verification.md#2a-04a--fondasi-kabel-power-subtype-dan-terminal).
- Probe read-only menemukan relasi tertunda: `PowerCircuit::cables` lazy 1 tetapi eager/withCount 0; `RouteCorridor::cables` lazy 2 tetapi eager/withCount 0. Pemilik perbaikan **2A-04b** dan **2A-04c** sesuai scope V2. DB detail Power tidak mengikat `kind=power`; API/schema menjaga write resmi. Tidak ada fix produk dalam scope 04a.
- PHPUnit Power 1/99 asersi; relasi Power 1/23; FO+Power validation 29/729; relasi penuh 39/797; schema TS 32 tes; contract check, SQL FK/index, dan PHP lint exit 0. MySQL testing `127.0.0.1:59844`, DB `senkom_test`, datadir `.artifacts/parent-2a03-31858d3f81a64429/data` diverifikasi; fixture rollback, satu map smoke sintetis lama tersisa. Laragon tidak dipakai.
- File berubah: `InfrastructureTest.php`, `MapRelationsTest.php`, `docs/phase-2-verification.md`, dan dokumen ini. Status 2A-04a **VERIFIED**; parent 2A-04 **WIP**. Keputusan FO terdahulu tetap terbuka. Next **2A-04b** hanya pada permintaan terpisah.

## Hasil gate parent 2A-03

- Parent **VERIFIED** setelah child 2A-03a/b/c dan seluruh acceptance Ring A/B, urutan/arah core, termination/splice, path putus, core/port conflict, faulty/unknown, map scope, draft/publish/viewer, serta pemisahan fisik-visual lulus. [Matriks parent](phase-2-verification.md#parent-2a-03--fo-ring-ab-acceptance-gate). Tidak ada FAIL/NOT VERIFIED atau fix produk pada gate ini.
- MySQL 8.4.11 baru `127.0.0.1:59844`, DB `senkom_test`, datadir `.artifacts/parent-2a03-31858d3f81a64429/data` diverifikasi sebelum DB dibuat. Migration exit 0; PHPUnit penuh **110 tes/2002 asersi**, tanpa skip, exit 0; fixture rollback menyisakan 0 map. Schema TS 32 tes, contract check, HTTP API smoke, dua snapshot HTTP v1/v2 valid Ajv, SQL unique/FK, dan lint empat file exit 0. Satu map smoke sintetis tersisa; instance dihentikan normal. Laragon tidak dipakai.
- Tiga keputusan parent 2A-02 tetap **non-blocking**: parent cable multi-segment belum diwajibkan V1; cardinality port termination antar-core belum ditetapkan dan berbeda dari `PORT_CONFLICT` logical link; reverse duplicate splice masih mungkin lewat direct SQL walau API/publish menolak. Tindak lanjut sesuai [evaluasi risiko](phase-2-verification.md#keputusan-desain-yang-tetap-terbuka).
- File berubah pada gate ini: `docs/phase-2-verification.md`, dokumen ini; artifact testing/snapshot HTTP baru. Phase 2A tetap WIP. Next **2A-04a** hanya pada permintaan terpisah.

## Hasil 2A-03c

- Dua logical link Ring A/B dapat berbagi kabel fisik lewat core berbeda; core yang sama pada link A/A atau A/B ditolak `CORE_CONFLICT` dan unique DB. `PORT_CONFLICT` menolak endpoint logical link ganda saat publish. Repeat core dalam satu path ditolak schema. [Matriks audit](phase-2-verification.md#2a-03c--konflik-alokasi-dan-status-core-fo).
- Faulty dan unknown tetap tercatat sebagai inventaris bersama termination/splice. Saat dipakai path aktif, validate menghasilkan `CORE_UNAVAILABLE` dan publish 409; revision, viewer payload, dan aset fisik lama aman. Setelah link dilepas, inventaris faulty/unknown dapat dipublikasikan. Core Map B tidak dapat direferensikan Map A; ID core sama antar map tetap punya status alokasi masing-masing. Tidak ada fix produk.
- Tes fokus 4/128 asersi, FO/validation terpilih 30/658 sebelum satu asersi SQL tambahan, relasi link 2/22, dan PHP lint; semua exit 0. MySQL testing `127.0.0.1:59843`, DB `senkom_test`, datadir `.artifacts/parent-2a02-6b1b0c3bbae7498f/data` diverifikasi; fixture rollback, satu map smoke sintetis lama tersisa. Laragon tidak dipakai.
- File berubah: `InfrastructureTest.php`, `docs/phase-2-verification.md`, dan dokumen ini. Status 2A-03c **VERIFIED**, parent 2A-03 **WIP**. Keputusan port reuse antar-core umum, parent cable, dan reverse duplicate splice direct SQL tetap terbuka. Next **parent 2A-03 acceptance/test gate** pada permintaan terpisah.

## Hasil 2A-03b

- V2 menetapkan kontinuitas FO end-to-end dan terminasi sebagai gate 2A-03b; pengujian status core lengkap dari prompt masuk 2A-03c. Path tiga core/dua splice valid dua arah bila port dan urutan dibalik bersama. Sumber/tujuan hilang atau salah port ditolak `PATH_START`/`PATH_END`; splice hilang atau urutan salah ditolak `PATH_GAP`. [Matriks audit](phase-2-verification.md#2a-03b--kontinuitas-fo-end-to-end-dan-terminasi).
- Draft path putus tersimpan untuk koreksi; validate menghasilkan `PATH_GAP`, publish ditolak 409 `VALIDATION_REQUIRED`. Revisi aktif, payload viewer, dan jumlah termination/splice tidak berubah. Tidak ada fix produk atau perubahan schema/API; hanya dua tes baru pada `InfrastructureTest.php`.
- Tes fokus 2/41 asersi, FO/validation terpilih 26/531, relasi logical link 2/22, dan PHP lint; semua exit 0. MySQL testing `127.0.0.1:59843`, DB `senkom_test`, datadir `.artifacts/parent-2a02-6b1b0c3bbae7498f/data` diverifikasi; fixture rollback, satu map smoke sintetis lama tersisa. Laragon tidak dipakai.
- Status 2A-03b **VERIFIED**; parent 2A-03 **WIP**. Keputusan parent cable, port reuse, dan reverse duplicate splice direct SQL tetap terbuka. Next **2A-03c** pada permintaan terpisah.

## Hasil 2A-03a

- Ring A/B memakai `logical_links.route_name` A/B; ordered path memakai pivot core `sequence`, bukan visual edge. Route/edge layer cocok, urutan dan arah valid; path terbalik ditolak. FK komposit, unique code, dan lazy/eager/withCount menjaga map scope. Update route mempertahankan core; FK menjaga delete; core tetap ada setelah link/pivot dihapus. [Matriks audit](phase-2-verification.md#2a-03a--ring-ab-dan-ordered-core-segments).
- Bug relasi `LogicalLink::cores` lintas map direproduksi (1 tes/5 asersi, exit 1), lalu diperbaiki dengan `MapBelongsToMany`. Asersi urutan sempat memakai helper yang menyortir ID; tes diubah memakai urutan koleksi. Tidak ada perubahan schema/API.
- Focused Ring A/B 3 tes/40 asersi; seluruh relasi 38/774; FO/validation terpilih 24/490; semua exit 0. Vitest schema 32 tes, contract check, dan lint PHP 4 file juga exit 0. MySQL testing terisolasi `127.0.0.1:59843`, DB `senkom_test`, datadir `.artifacts/parent-2a02-6b1b0c3bbae7498f/data` diverifikasi; fixture rollback, satu map smoke sintetis lama tersisa. Laragon tidak dipakai.
- File berubah: `LogicalLink.php`, `Relations/MapBelongsToMany.php`, `MapRelationsTest.php`, `InfrastructureTest.php`, dua dokumen ini. Kontinuitas end-to-end mendalam milik 2A-03b; konflik alokasi/status milik 2A-03c. Parent 2A-03 tetap WIP. Keputusan parent cable, port reuse, dan direct-DB duplicate splice tetap terbuka. Next **2A-03b** hanya pada permintaan terpisah.

## Hasil gate parent 2A-02

- Parent **VERIFIED** setelah seluruh child 2A-02a/b/c/d dan acceptance FO terintegrasi lulus. Kabel/subtype, core/kapasitas/unique, termination, splice/closure/ambiguitas, lintas map, faulty policy, lifecycle, relasi lazy/eager, serta pemisahan fisik-visual punya bukti PASS. [Matriks parent](phase-2-verification.md#parent-2a-02--fo-integration-acceptance-gate).
- Tiga isu desain dinilai: parent cable tidak diwajibkan V1 (**non-blocking**); port reuse belum punya aturan eksplisit (**requires decision**, non-blocking saat ini); DB hanya punya PK/FK splice, sehingga SQL langsung menerima reverse duplicate (**non-blocking** untuk jalur write API/service, yang menolak duplicate). Probe SQL rollback bersih; jangan mengklaim DB menolak reverse duplicate.
- Gate awal pada instance testing lama port 59842 gagal 1/101 karena map smoke persisten melanggar asumsi tes fixture DB kosong; bukan regresi FO. Instance baru MySQL 8.4.11 `127.0.0.1:59843`, datadir `.artifacts/parent-2a02-6b1b0c3bbae7498f/data`, DB `senkom_test` dibuat dari kosong setelah verifikasi identitas. PHPUnit penuh **101 tes/1793 assertions**, exit 0, tanpa skip.
- Schema TS 32 tes, contract check, HTTP API smoke, dua snapshot HTTP v1/v2 sesuai schema, dan SQL index/probe lulus; semua exit 0. Fixture PHPUnit rollback (0 map test); satu map smoke sintetis dipertahankan. Instance lama dan baru dihentikan normal; Laragon tidak diakses. Tidak ada perubahan produk/schema/API.
- File berubah: `docs/phase-2-verification.md`, `docs/phase-2-checkpoint.md`; artifact instance baru dan pointer `.artifacts/2a02-parent-current-run.txt`. Phase 2A tetap WIP. Next **2A-03a** hanya pada permintaan terpisah.

## Hasil 2A-02d

- Splice dua core melalui closure valid, site closure tepat satu ujung setiap kabel, duplicate/reverse dan benturan dengan termination, self-splice, serta lintas map VERIFIED. Ambiguitas kabel loop menghasilkan `SPLICE_END`. Side splice disimpulkan dari site closure; schema tidak memiliki kolom side.
- Bug eager load `FiberSplice::fromCore/toCore/closure` direproduksi (1 tes/5 assertions, exit 1). Tiga relasi memakai `MapBelongsTo` existing; tes lalu lulus 1/16, exit 0. Update endpoint valid, delete tanpa menghapus core/kabel, FK restrict, fault inventory, dan pemisahan edge visual terverifikasi.
- PHPUnit splice 4/146, FO + validation 24/502, relasi 36/752; semua exit 0. PHP lint tiga file exit 0. MySQL 8.4.11 portable `127.0.0.1:59842`, DB `senkom_test`, datadir `.artifacts/domain-2a01c-7e4f11c630374eb69ebc2f7eec915488/data` diverifikasi; 0 map test tersisa, instance dihentikan normal. Laragon tidak dipakai.
- File berubah: `FiberSplice.php`, `MapRelationsTest.php`, `InfrastructureTest.php`, dua dokumen ini. [Matriks dan bukti](phase-2-verification.md#2a-02d--integritas-fo-splice-closure-dan-map-scope). Parent 2A-02 tetap WIP sampai gate parent terpisah. Keputusan parent cable, port reuse, dan aturan direct DB untuk duplicate splice tetap terbuka. Next **parent 2A-02 gate**; 2A-03a belum dieksekusi.

## Hasil 2A-02c

- Termination ke core dan port optik, site ujung dan side a/b, FK/unique serta map scope VERIFIED. Dua side pada core yang sama valid; duplikat side, core/port hilang, port nonoptik, site/side salah, dan cross-map ditolak. Port reuse antar-core belum dilarang kontrak; tidak dibuat aturan baru.
- Bug eager load `FiberTermination::core/port` dan `FiberCore::terminations` direproduksi (1 tes/5 assertions, exit 1). Tiga relasi memakai helper komposit 2A-01a; tes reproduksi lalu lulus 1/19, exit 0. Update port, delete term, FK restrict core/port, dan read lazy/eager terverifikasi.
- Termination fisik pada core faulty tetap tersimpan; path aktif faulty tetap ditolak sesuai 2A-02b. Menghapus edge visual tidak menghapus termination. Tidak ada perubahan schema/API/keputusan domain.
- PHPUnit termination 4/134, FO + validation 20/356, relasi 35/736; semua exit 0. PHP lint empat file exit 0. MySQL portable 8.4.11 di `127.0.0.1:59842`, DB `senkom_test`, datadir `.artifacts/domain-2a01c-7e4f11c630374eb69ebc2f7eec915488/data` diverifikasi; fixture rollback, 0 map test tersisa, instance dihentikan normal. Laragon tidak dipakai.
- File berubah: `FiberCore.php`, `FiberTermination.php`, `MapRelationsTest.php`, `InfrastructureTest.php`, dua dokumen ini. [Bukti rinci](phase-2-verification.md#2a-02c--integritas-fo-termination). Parent 2A-02 tetap WIP. Next **2A-02d** hanya pada permintaan terpisah.

## Hasil 2A-02b

- Nomor core 0/-1/13/6913 ditolak sesuai kapasitas; 1/12/6912 valid. Duplikat pada kabel sama ditolak oleh validator dan DB unique; nomor sama pada kabel berbeda valid. Penurunan kapasitas yang membuat core di luar batas ditolak; setelah nomor core diperbaiki, penurunan diterima.
- FK komposit menolak kabel dari map lain; API create/update dan payload `mapId` tidak dapat melewati scope. Relasi cable/core dua map dari 2A-02a tetap lulus. Tidak ada bug produk yang memerlukan fix.
- Keputusan pengguna: tolak alokasi faulty ke jalur aktif, simpan core rusak sebagai inventaris. Schema/DB menyimpan `faulty`; core faulty tanpa alokasi dapat dipublikasi. Core teralokasi yang kemudian menjadi faulty dapat tersimpan pada draft untuk diperbaiki, tetapi validasi publikasi menolak dengan `CORE_UNAVAILABLE`; revisi lama tetap aktif. Gate **VERIFIED**.
- Tes `--filter 'test_fo_'`: 5 tes/138 assertions, exit 0. PHP lint `InfrastructureTest.php`: exit 0. Hanya tes dan dua dokumen berubah. MySQL portable 8.4.11 di `127.0.0.1:59842`, DB `senkom_test`, datadir `.artifacts/domain-2a01c-7e4f11c630374eb69ebc2f7eec915488/data` diverifikasi sebelum tes; Laragon tidak dipakai, fixture rollback (0 map test tersisa), instance dihentikan normal.
- [Bukti rinci](phase-2-verification.md#2a-02b--integritas-nomor-core-kapasitas-dan-status-faulty). `docs/codegen-plan.md` mencatat keputusan. Parent 2A-02 WIP; next **2A-02c** pada permintaan terpisah.

## Hasil 2A-02a

- Audit V2 kabel FO/subtype/segmen/kapasitas VERIFIED. Matriks dan evidence ada di [verifikasi 2A-02a](phase-2-verification.md#2a-02a--audit-kabel-fo-subtype-segmen-kapasitas). Termination/splice hanya dicatat sebagai relasi dasar; gate 2A-02c/d belum dijalankan. Permintaan awal lebih luas daripada V2, sehingga V2 diprioritaskan.
- Root cause: eager load relasi `Cable`/`FiberCore` tidak mengikat pasangan `(map_id,id)`. Tes reproduksi gagal (1/5, exit 1); helper relasi komposit 2A-01a diterapkan ke empat relasi cable/core. FK silang map dan kode kabel ganda ditolak. Relasi site/device/port lama tetap lulus.
- MySQL portable 8.4.11, `127.0.0.1:59842`, datadir `.artifacts/domain-2a01c-7e4f11c630374eb69ebc2f7eec915488/data`, DB `senkom_test` diverifikasi sebelum tes. Laragon tidak digunakan; fixture transaction rollback, 0 map `relation-%` tersisa; instance dihentikan normal tanpa operasi DB destruktif.
- PHPUnit terfokus 14 tes/120 assertions (exit 0); `MapRelationsTest.php` 34/717 (exit 0); PHP lint empat file (exit 0). File produk: `Cable.php`, `FiberCore.php`; tes: `MapRelationsTest.php`, `InfrastructureTest.php`; dua dokumen ini diperbarui.
- Gap desain parent: satu kabel fisik dengan beberapa segmen belum punya parent cable eksplisit. DB tidak memaksa subtype cocok dengan `kind`, tetapi write aplikasi divalidasi schema. Jangan ubah model sebelum keputusan kontrak. Parent 2A-02 tetap WIP. Next **2A-02b** hanya atas permintaan berikutnya.

## Hasil 2A-01c dan gate parent 2A-01

- Child **2A-01c VERIFIED**, parent **2A-01 VERIFIED** setelah gate integrasi,
  bukan hanya karena seluruh child selesai. Migration/model tidak berubah;
  bukti audit/relasi 2A-01a dan migration up/down/re-up 2A-01b tetap berlaku.
- DEMO 8 site/6 device/4 port valid; geography/metadata tidak diisi pada fixture
  asli dan sah karena opsional. Boundary geography, allowlist metadata publik,
  penolakan private/invalid fields dan pemisahan layout dibuktikan dengan tes baru.
- Dua map ber-ID sama terisolasi pada FK, lazy/eager, InventoryStore, Admin API
  dan published viewer. Orphan site-device-port tidak ditemukan. Token viewer
  tetap memakai map sendiri meskipun query mapId meminta map lain.
- Gap ditemukan: respons Admin mengubah metadata kosong menjadi `[]`, sedangkan
  schema meminta `{}`. Fix satu baris pada `MapWorkflow::response` memakai
  `MapRules::json` existing. Schema, migration, model dan endpoint tidak berubah.
- Sesi ini: baseline 30 tes domain/350 assertions dengan 1 gagal; setelah fix
  30/362 lulus. Parent: seluruh 88 tes PHP/1375 assertions tanpa skip, 32 tes
  schema TS, contract check, lint PHP/JS, format smoke script dan HTTP smoke lulus.
  Dua snapshot HTTP aktual v1/v2 juga lulus shared schema. Gate final exit 0.
- File berubah: `apps/api/app/Services/MapWorkflow.php`,
  `apps/api/tests/InfrastructureTest.php`, `scripts/phase2-smoke.mjs`, serta dua
  dokumen checkpoint/verifikasi. Tes existing dipertahankan; tidak ada dependency baru.
- MySQL 8.4.11 baru, loopback port 59842, server PID 21664 saat aktif, DB
  `senkom_test` pada `.artifacts/domain-2a01c-7e4f11c630374eb69ebc2f7eec915488/data`.
  Nama DB sama dengan tes lama, tetapi instance/datadir berbeda dan dibuat dari
  kosong. DB/datadir lama dan Laragon tidak dibuka; metadata lama tidak diubah.
- Fixture PHPUnit rollback bersih (0 map/user/token sebelum smoke). HTTP smoke
  membuat satu map DEMO sintetis pada instance baru. Server sudah dihentikan;
  data/log dipertahankan, file credential sementara smoke telah dihapus harness.
- Bukti lengkap: [verifikasi 2A-01c dan parent](phase-2-verification.md#2a-01c---demo-geography-metadata-dan-isolasi-lintas-map).
  Tidak ada blocker 2A-01. Temuan CablePatch pada 2A-06 dan UAT empat monitor tetap
  terbuka. Tidak ada approval Phase 2B/2C atau eksekusi 2A-02a dalam sesi ini.

## Hasil 2A-01b

- Migration up dari nol tabel, DEMO seed, rollback, dan re-up lulus pada MySQL
  8.4.11 baru. Database `senkom_migration_2a01b_410d16bb3f9a4b19_test`, loopback
  port 51357, datadir `.artifacts/migration-2a01b-d6843345b725448c88042bf2e116b085/data`.
  Executable/proses/socket serta identitas SQL/Laravel testing telah diverifikasi.
- Hasil sesi ini: harness 97 pemeriksaan PASS; 4 tes PHPUnit/125 assertions PASS,
  tanpa skip; lint PHP PASS. Seluruh gate final exit 0. Angka 40 tes/833 assertions
  pada bagian 2A-01a di bawah tetap hasil historis, bukan hasil sesi ini.
- Terbukti: 23 tabel aplikasi + ledger, PK composite, FK map-scoped RESTRICT,
  unique scoped, penolakan referensi hilang/lintas-map, duplicate dan parent delete.
  Seed menghasilkan 8 site/6 device/4 port, berlabel DEMO, tanpa akun/token.
- Seed kedua sengaja ditolak (`Map already exists; seed will not overwrite it.`),
  bukan idempotent. Rollback menghapus seluruh tabel aplikasi/FK/empat trigger;
  hanya ledger kosong tersisa. Re-up memulihkan schema dan trigger identik.
- Pembanding awal terlalu ketat pada counter AUTO_INCREMENT ledger (2 menjadi 3).
  Harness diperbaiki untuk menormalisasi counter ledger saja, lalu seluruh siklus
  diulang pada instance baru. Migration dan source produk tidak diubah.
- File baru: `apps/api/tools/verify-migrations.php`; perubahan lain hanya dua
  dokumen checkpoint/verifikasi. Harness hanya menerima datadir artifact 2A-01b
  baru tanpa user database dan membuat sendiri nama database unik.
- Database existing/Laragon dan `senkom_test` tidak dibuka. Metadata lama
  `.artifacts/phase2-mysql.json` tidak diubah. Kedua instance disposable dihentikan;
  data/log tetap tersedia. Tidak ada DROP DATABASE, migrate:fresh atau db:wipe.
- Bukti lengkap: [verifikasi 2A-01b](phase-2-verification.md#2a-01b---isolated-mysql-migration-rollback-dan-re-up).
  Seed/FK di sini mendukung gate migration V2; geography/isolasi metadata lengkap
  dan acceptance parent masih menunggu 2A-01c. Full frontend/desktop tidak diuji.

## Hasil continuation 2A-01a

- Empat relasi diperbaiki: `Site.devices`, `Device.site`, `Device.ports`,
  `Port.device`. Eager loading sebelumnya memakai parent kosong (`map_id IS NULL`);
  dictionary Eloquent juga hanya memakai ID tunggal. Kini query membatasi pasangan
  map-ID dan matching berjalan per-map, satu query per relasi.
- Perubahan: tiga model tersebut, `app/Models/Relations/MapHasMany.php`,
  `MapBelongsTo.php`, `MapScopedRelation.php` dan `tests/MapRelationsTest.php`
  (semua path relatif `apps/api/`), serta dua dokumen checkpoint/verifikasi.
  Tidak ada perubahan migration, endpoint, serializer, schema atau dependency.
- Bukti sebelum fix: 25 tes regresi baru gagal, exit 1. Setelah fix: 40 tes PHP
  terfokus/833 assertions lulus tanpa skip (33 tes relasi + 7 tes existing),
  3 tes schema lulus, lint PHP lulus, probe 4 lazy + 4 eager lulus; semua exit 0.
- `with()`, `load()`, `loadMissing()`, ID sama lintas-map, parent tanpa child,
  target hilang, map/key hilang, query pasangan tepat, nested loading, `whereHas`,
  builder `withCount`/`withExists` dan jumlah query telah diuji.
- MySQL 8.4.11 portable: proses/port/datadir diverifikasi sebelum koneksi.
  DB `senkom_test`, loopback port 60488, datadir pada `.artifacts/phase2-mysql-.../data`.
  Fixture memakai transaksi; tersisa 0 map fixture. Migration existing test no-op;
  seeder existing berada dalam transaksi rollback. Tidak ada migrate:fresh/down.
- Artifact: `.artifacts/2a01a-continuation/`. Instance uji dihentikan setelah tes;
  datadir dipertahankan. MySQL Laragon tidak diakses. Full build/HTTP/Electron smoke
  tidak diulang karena tidak ada dependency langsung.
- Scope fix adalah pembacaan empat relasi dengan map_id dan ID/FK tersedia.
  Bukan dukungan composite ORM umum; `Collection::loadCount()/loadAggregate()`
  dan mutation helper relasi belum termasuk kontrak ini. Jalur tulis tetap InventoryStore.
- Bukti dan SQL: [continuation 2A-01a](phase-2-verification.md#2a-01a-continuation---fix-relasi-composite-eloquent).
  Audit migration/model/metadata sebelumnya tetap valid; gap eager loading selesai.

## Hasil audit awal 2A-01a (historis, sebelum fix)

- Migration sites/devices/device_ports, model Site/Device/Port, base DraftEntity,
  seeder dan kontrak geography/metadata diaudit. Matriks FK/unique/nullability/
  public-private/layout ada pada [verifikasi 2A-01a](phase-2-verification.md#2a-01a---audit-migration-model-site-device-port-dan-metadata).
- Secara statis PK/FK composite map_id + id dan unique per-map/per-device tersedia.
  Geography Site terpisah dari x/y map_nodes; metadata notes/assetTag bersifat publik.
  Tidak ada field metadata admin-only pada kontrak saat ini.
- Gap terkonfirmasi: eager loading Site.devices, Device.site, Device.ports dan
  Port.device menghasilkan `map_id IS NULL` karena relasi dibuat dari model kosong.
  Probe tanpa DB: 4 lazy PASS, 4 eager FAIL, exit 1. Source belum diubah.
- Tes terfokus `npm test -- tests/map-v2.test.ts`: 3 tes lulus, exit 0.
  PHPUnit DB, migrate/rollback/seed, full build/smoke tidak dijalankan sesi ini.
- Artifact reproduksi: `.artifacts/2a01a-model-audit.php` dan log dengan nama sama;
  `.artifacts/2a01a-schema-tests.log`. Jalankan probe dengan PHP 8.4.26.
- Filter map tidak boleh dihapus sebagai shortcut; perbaikan harus menjaga query
  dan pencocokan hasil composite-key pada eager loading lintas-map.

## Hasil recovery 2A-00

- HTTP 500 sudah direproduksi dan diperbaiki: direktori session/cache belum
  tersedia; server HTTP tidak memakai `LARAVEL_STORAGE_PATH` karena environment
  tidak masuk `$_ENV`/`$_SERVER`. Direktori runtime kini disertakan, PHP smoke
  memakai `variables_order=EGPCS` dan memverifikasi session file terisolasi.
- HTTP nyata lulus: cookie/session, CSRF, login/logout/replay cookie, 401/403/419,
  draft/validate/publish, checksum/ETag, v1/v2 dan stale draft 409.
- Composer strict exit 0; constraint `^2.6.0`, paket Opis tetap 2.6.0.
  Lockfile hanya berubah pada `content-hash`; tidak ada perubahan paket.
- Regresi aktual: lint/typecheck/build, 87 tes TS, 25 tes PHP/312 assertions tanpa
  skip, shared schema respons HTTP, serta empat skenario Electron smoke lulus.
- Temuan terbuka 2A-06: `CablePatch.oneOf` menolak PATCH properti umum tanpa `kind`
  karena cocok dengan dua cabang. Kontrak tidak diubah dalam recovery.

Perintah, bukti dan batas hasil ada di [verifikasi 2A-00](phase-2-verification.md).
Artifact sesi: `.artifacts/batch-2a00/`; instrumentasi diagnostik sementara dilepas.

## Pekerjaan yang sudah ada

- `apps/api/database`: migration MySQL, model relasional dan seeder DEMO; tidak
  memakai database Laragon existing.
- `apps/api/app`: models, middleware auth/CSRF/viewer, controller inventory/revision,
  validator domain, penyimpanan draft, publish/history/rollback dan audit.
- `apps/api/routes`, `apps/api/config`, `apps/api/bootstrap/app.php`: wiring API,
  provisioning CLI dan opt-in `SENKOM_INFRASTRUCTURE_ENABLED`.
- `packages/map-schema/schema`: schema v2 baru dan draft content terpisah; schema v1
  dan fixture Phase 0 dipertahankan.
- `docs/openapi.json`, `packages/shared-types`, `packages/map-schema/src/index.ts`:
  kontrak/tipe baru dan parser v1/v2. Keputusan ini masih perlu audit final 2A.
- `apps/api/tests/InfrastructureTest.php`, `tests/map-v2.test.ts`: pengujian baru.
- `scripts/phase2-api-fixture.php`, `scripts/phase2-smoke.mjs`: HTTP smoke dengan
  data/kredensial sintetis sementara; smoke sudah lulus pada 2A-00.

Editor Web Admin dan integrasi API ke desktop belum dikerjakan. Jangan menganggap
seluruh Phase 2A selesai hanya karena sebagian kode dan unit/integration tests tersedia.

## Riwayat sebelum recovery 2A-00

| Pemeriksaan                                        | Hasil terakhir                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| Baseline sebelum perubahan                         | Lint, typecheck, build, 84 tes TypeScript, 3 tes Laravel lulus      |
| Migration dan seeder MySQL 8.4.11 terisolasi       | Lulus; rollback migration belum diuji                               |
| PHPUnit setelah tambahan backend                   | 25 tes, 312 assertions lulus dengan DB uji aktif                    |
| Vitest setelah tambahan schema                     | 87 tes pada 8 file lulus                                            |
| Typecheck dan build setelah kontrak v2             | Lulus                                                               |
| Lint sebelum penambahan script HTTP smoke terakhir | Lulus; perlu gate ulang pada source final batch                     |
| Composer validate --strict                         | Gagal karena warning constraint exact `opis/json-schema: 2.6.0`     |
| HTTP smoke Phase 2A                                | Gagal: `GET /api/v1/auth/session` mengembalikan 500, diharapkan 200 |
| Electron smoke setelah perubahan Phase 2A          | Belum dijalankan                                                    |
| Phase 2B/2C dan UAT empat monitor                  | Belum dijalankan                                                    |

Tabel ini mempertahankan checkpoint lama, bukan status terakhir. Kegagalan HTTP
dan Composer telah diselesaikan pada 2A-00. Pengujian HTTP nyata tetap wajib;
PHPUnit in-process dengan session array tidak membuktikan session file bekerja.

## Lingkungan uji

- Runtime Node/npm dan PHP/Composer mengikuti README.
- MySQL 8.4.11 portable di `%TEMP%\senkom-mysql-8.4.11\mysql-8.4.11-winx64`.
- Datadir/port instance uji terakhir dicatat di `.artifacts/phase2-mysql.json`.
  Periksa proses dan port sebelum memakai catatan ini; instance belum tentu masih hidup.
- DB khusus `senkom_test`, host loopback. Jangan mengarahkan tes ke DB produksi.
- `SENKOM_TEST_DB_PORT` wajib untuk tes integrasi; opsional
  `SENKOM_TEST_DB_DATABASE`, `SENKOM_TEST_DB_USERNAME`, `SENKOM_TEST_DB_PASSWORD`.
  Tanpa port, tes database ditandai skipped dan bukan bukti gate 2A lulus.
- Artifact HTTP smoke ada di `.artifacts/phase2-run-*`. Kredensial smoke dibuat acak;
  file sementara dihapus setelah dibaca harness. Jangan menyalin nilainya ke laporan.

Reproduksi setelah instance DB terisolasi aktif dan toolchain tepat ada di PATH:

```powershell
php apps/api/vendor/phpunit/phpunit/phpunit -c apps/api/phpunit.xml --colors=never
node scripts/phase2-smoke.mjs --api-only
composer --working-dir apps/api validate --strict
```

## Rencana kelanjutan 2A-01a sebelum fix (historis)

1. Baca matriks 2A-01a dan reproduksi probe SQL; jangan mengulang recovery 2A-00.
2. Tentukan perbaikan relasi composite-key dengan scope terbatas yang menjaga lazy
   dan eager loading serta matching map_id + id. Dokumentasikan keputusan sebelum edit.
3. Tambahkan regresi parent dari dua map dengan ID sama; jangan menghapus filter map.
   Jika perlu DB, verifikasi executable/port/datadir testing sebelum koneksi.
4. Jalankan tes terfokus; simpan checkpoint dan status sesuai bukti. Parent tetap WIP.
5. Setelah 2A-01a VERIFIED, next adalah 2A-01b pada permintaan terpisah. Up/down
   migration DB disposable dan seed/cross-map 2A-01c bukan scope sesi audit ini.

Jangan memulai editor 2B atau desktop integration 2C sebelum seluruh gate 2A lulus.

## Rencana 2A-01b sebelum verifikasi (historis, selesai)

1. Mulai hanya pada permintaan baru; baca definisi 2A-01b dan checkpoint ini.
2. Siapkan database disposable kosong yang berbeda dari `senkom_test`; verifikasi
   executable, proses, port, datadir dan nama database sebelum migrasi.
3. Buktikan migration up/down sesuai scope 2A-01b. Jangan menjalankan down/fresh
   pada database smoke existing. Seed/geography/metadata gate 2A-01c tetap terpisah.
4. Parent 2A-01 tetap WIP sampai 2A-01b dan 2A-01c beserta acceptance parent lulus.

## Rencana 2A-01c sebelum verifikasi (historis, selesai)

1. Mulai pada permintaan baru; baca definisi V2, acceptance parent dan bukti 2A-01a/b.
2. Verifikasi instance testing sebelum koneksi; jangan memakai PID/port artifact
   sebagai bukti server masih aktif. Instance sesi 2A-01b sudah dihentikan.
3. Buktikan DEMO seed, geography, cross-map FK dan isolasi metadata sesuai gate
   2A-01c; gunakan hasil 2A-01b sebagai bukti pendukung tanpa mengklaim gate selesai.
4. Nilai acceptance parent setelah seluruh child VERIFIED. Jangan otomatis
   membuka parent berikutnya atau Phase 2B.

## Langkah pertama berikutnya: 2A-02a

1. Mulai hanya pada permintaan baru; baca definisi V2, checkpoint dan audit WIP
   bagian kabel FO/subtype/segmen/kapasitas. Jangan mengulang seluruh 2A-01.
2. Audit representasi kabel/segmen existing sesuai scope 2A-02a; dokumentasikan
   kebutuhan parent cable bila kontraknya belum jelas. Jangan menarik 2A-02b.
3. Jika membutuhkan DB, verifikasi instance baru atau yang diaktifkan kembali;
   seluruh instance sesi 2A-01b/c kini berhenti. PID/port artifact bukan bukti aktif.
