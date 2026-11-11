# Checkpoint Phase 2

Tanggal: 2026-11-11. Status: **Phase 2A WIP; 2A-00 VERIFIED; 2A-01a/b/c dan parent 2A-01 VERIFIED; 2A-02a/b/c/d dan parent 2A-02 VERIFIED; 2A-03a/b/c dan parent 2A-03 VERIFIED; 2A-04a/b/c dan parent 2A-04 VERIFIED; 2A-05a/b/c dan parent 2A-05 VERIFIED; 2A-06a/b/c/d dan parent 2A-06 VERIFIED; 2A-07a/b dan parent 2A-07 VERIFIED; 2A-08a/b dan parent 2A-08 VERIFIED; 2A-09a/b dan parent 2A-09 VERIFIED; 2A-10a/b/c dan parent 2A-10 VERIFIED; 2A-11a/b dan parent 2A-11 VERIFIED**.
Baseline produk yang selesai tetap Phase 1. Recovery tidak berarti seluruh Phase 2A
diterima. Status WIP pada [audit historis](phase-2-wip-audit.md) kini digantikan
bukti gate parent 2A-01 sampai 2A-11; gate akhir Phase 2A tetap terbuka.

Next executable: **persetujuan eksplisit initial commit dan push**, lalu literal clean checkout; CI Windows tetap blocker terpisah. Phase 2A tetap WIP.
Ikuti [Micro-Batch Plan V2](codegen-microbatch-plan-v2.md). Phase 2B/2C belum dimulai.

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
