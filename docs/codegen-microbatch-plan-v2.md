# SENKOM — Code Generation Micro-Batch Plan V2

> **Status:** Rencana usulan pengganti `docs/codegen-plan.md` setelah ditinjau dan diterapkan ke repository. Ini adalah rencana dokumentasi, bukan bukti implementasi atau hasil tes baru.
> **Sumber:** `codegen-plan(2).md`, `phase-2-checkpoint(3).md`, `phase-2-wip-audit(1).md`, `phase-2-verification(1).md`, `phase-2-approval(2).md`, dan SENKOM Technical Specification v1.1.0-draft.

## Keadaan terverifikasi dari dokumen terakhir

- Phase 0 dan 1 selesai secara lokal; UAT empat monitor fisik masih terbuka.
- **2A-00 VERIFIED** (HTTP 500 session dan Composer strict telah diperbaiki); **jangan ulangi**.
- 2A-01 sampai 2A-11 masih **WIP** menurut audit, walaupun banyak kode sudah ada. Status child WIP di bawah berarti **belum diverifikasi secara independen**, bukan berarti belum ada implementasi.
- 2B, 2C, 3, 4, 5 belum dimulai. Phase 3/4/5 tetap membutuhkan persetujuan terpisah.
- Tidak ada akses ke repository lokal atau bukti setelah timestamp dokumen; status di sini berasal dari dokumen yang dilampirkan.

## Aturan eksekusi yang menghemat konteks

1. **Satu micro-batch per prompt**. Jangan mengerjakan sibling atau parent gate otomatis. Baca checkpoint, audit WIP, dan hanya potongan spesifikasi/kontrak yang terkait. Jika butuh konteks lebih luas, buka bagian yang relevan, bukan seluruh repository secara rekursif.
2. Target **25–60 menit** per micro-batch, maksimum perencanaan **90 menit** termasuk test dan handoff. Estimasi tidak menjamin pemakaian kuota. Gunakan reasoning Medium untuk rutin; High untuk debugging/invariants; Extra High hanya bila benar-benar perlu.
3. **Batas pengamanan:** setelah 45 menit evaluasi sisa scope; setelah 60 menit mulai checkpoint jika gate berisiko; paling lambat 90 menit hentikan sesi dengan status akurat. Jangan mengandalkan kemampuan Codex membaca meter kuota 5 jam.
4. **Sebelum edit:** `git status` (atau inventaris aman bila repo belum memiliki commit), baca `docs/phase-2-checkpoint.md`/checkpoint fase, cari file dan tes existing. Jangan mengulang kode yang benar. Repo tercatat belum punya commit/remote; jangan membuat asumsi clean git history.
5. **Test bertingkat:** micro-batch = tes terfokus + lint/typecheck pada modul yang berubah. Jika API/schema berubah, jalankan contract generation/check. Parent gate = seluruh suite dan smoke yang relevan. Jangan menghapus, melonggarkan, atau skip tes untuk memperoleh status VERIFIED.
6. **Database:** hanya MySQL testing yang telah diverifikasi executable/port/datadir-nya; migration down di DB disposable khusus. Jangan menjalankan `migrate:fresh` pada database tidak terverifikasi.
7. **Checkpoint wajib setiap micro-batch:** ID, status, file diubah, tes/exit code, error, hasil dan langkah pertama berikutnya. Catat pada `docs/phase-N-verification.md` dan checkpoint; ubah approval hanya untuk gate yang benar-benar tercapai.
8. **Gate parent:** `2A-01` dianggap VERIFIED setelah 2A-01a/b/c VERIFIED dan acceptance criteria asli terbukti. Aturan yang sama berlaku untuk setiap ID induk. Gate subphase/fase tetap mengikuti dokumen lama.
9. Jika tugas memerlukan sertifikat signing, hardware empat monitor, gateway aktual, atau soak terjadwal, tandai BLOCKED dan pisahkan implementasi yang bisa diuji secara sintetis dari acceptance hardware.
10. **Tidak ada deploy, release, install produksi, pengubahan jaringan atau akses secret** tanpa izin eksplisit. Jangan mengubah desktop menjadi editor; jangan menganggap status manual sebagai telemetry.

## Aturan dependensi dan status

- Kerjakan urutan micro-batch dalam parent; parent berikutnya hanya dimulai setelah parent sebelumnya VERIFIED, kecuali dependency eksplisit pada source of truth membolehkan paralel.
- `VERIFIED` berarti gate terbukti oleh tes yang benar-benar dijalankan; `WIP` artinya pekerjaan existing belum lengkap/belum diverifikasi; `INCOMPLETE` berarti sesi berhenti; `BLOCKED` berarti prasyarat eksternal belum ada.
- Status `BLOCKED` pada future hardware/signing adalah **risiko prasyarat yang diproyeksikan**, bukan hasil uji gagal. Sesuaikan ketika prasyarat tersedia.
- `2A-11b` membuka 2B, `2B-09b` membuka 2C, `2C-05b` menutup Phase 2. Phase 3, 4, 5 memerlukan approval terpisah.

## Daftar micro-batch dan gate yang harus dibuktikan

### Phase 2A — Database dan API

| Micro-batch | Pekerjaan tunggal                                           | Status awal* | Bukti minimal / exit gate                                                           |
| ----------- | ----------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------- |
| `2A-00`     | Recovery WIP, HTTP 500, Composer                            | VERIFIED     | Bukti historis dalam laporan 2A-00; tidak diulang                                   |
| `2A-01a`    | Audit migration/model site-device-port dan metadata         | WIP          | Matriks FK, unique, public/private field; tanpa perubahan besar                     |
| `2A-01b`    | Migrate dari database kosong + rollback disposable          | WIP          | Up/down lulus; tidak menyentuh senkom_test yang digunakan smoke                     |
| `2A-01c`    | DEMO seed, geography, cross-map FK dan isolasi metadata     | WIP          | Tes positif/negatif; parent 2A-01 gate                                              |
| `2A-02a`    | Audit kabel FO, subtype, segmen dan kapasitas               | WIP          | Kapasitas/identitas/endpoint; catat kebutuhan parent cable bila kontrak belum jelas |
| `2A-02b`    | Core numbering, unique, status, batas kapasitas             | WIP          | Duplicate/out-of-range/faulty core ditolak                                          |
| `2A-02c`    | Terminasi ke port dan aturan end-side                       | WIP          | Salah port/site/end-side ditolak                                                    |
| `2A-02d`    | Splice, closure, ambiguity dan lintas-site                  | WIP          | Splice ambigu, collision, invalid closure ditolak                                   |
| `2A-03a`    | Logical link Ring A/B dan ordered segments                  | WIP          | Sequence/path valid dan arah konsisten                                              |
| `2A-03b`    | Kontinuitas FO end-to-end dan terminasi                     | WIP          | Path putus/salah ujung ditolak                                                      |
| `2A-03c`    | Konflik alokasi, status core, konflik port                  | WIP          | Tidak ada alokasi palsu; faulty/unknown diuji                                       |
| `2A-04a`    | Power cable, subtype dan terminal                           | WIP          | Power vs FO terpisah; jenis port benar                                              |
| `2A-04b`    | Circuit source/load, main/backup, urutan kabel              | WIP          | Path terputus/UPS/source/load salah ditolak                                         |
| `2A-04c`    | Corridor dan keanggotaan kabel eksplisit                    | WIP          | Shared corridor tidak disimpulkan dari layout                                       |
| `2A-05a`    | Admin session, login/logout, CSRF dan CORS                  | WIP          | HTTP cookie/401/419/origin dan Secure cookie diuji                                  |
| `2A-05b`    | RBAC lintas-map, editor/publisher/admin                     | WIP          | 403 untuk write viewer dan scope salah                                              |
| `2A-05c`    | Viewer token provisioning, expiry/revoke, audit, rate-limit | WIP          | CLI + HTTP; secret tak bocor; 429 diuji                                             |
| `2A-06a`    | Audit CRUD inventory dan error/pagination envelope          | WIP          | Matriks endpoint-resource, gap nyata teridentifikasi                                |
| `2A-06b`    | Perbaiki OpenAPI CablePatch oneOf dan generated types       | WIP          | PATCH common-only valid tanpa ambiguitas; contract tests                            |
| `2A-06c`    | CRUD site/device/port + referential delete                  | WIP          | Positif/negatif, FK, audit, pagination                                              |
| `2A-06d`    | CRUD FO/logical/Power/corridor + atomic failure             | WIP          | Setiap resource dan rollback transaksi teruji                                       |
| `2A-07a`    | Layout node/edge round-trip dan waypoint                    | WIP          | GET/PUT mempertahankan properti; ID valid                                           |
| `2A-07b`    | Optimistic concurrency dua editor melalui HTTP              | WIP          | If-Match, 409/428; tanpa lost update                                                |
| `2A-08a`    | Validasi draft domain lengkap                               | WIP          | Draft invalid ditolak dengan error aman                                             |
| `2A-08b`    | Publish snapshot immutable, pointer dan audit atomik        | WIP          | Failure injection pada commit/audit; pointer lama aman                              |
| `2A-09a`    | History/list/detail revision dan map scope                  | WIP          | Immutable dan authorization lintas-map                                              |
| `2A-09b`    | Rollback terotorisasi + failure injection                   | WIP          | Pointer atomik; snapshot/audit tidak diubah                                         |
| `2A-10a`    | Viewer published map, metadata aman, auth scope             | WIP          | Viewer tidak melihat draft/secret/write                                             |
| `2A-10b`    | ETag/304/checksum exact bytes                               | WIP          | 200/304 dan hash payload benar                                                      |
| `2A-10c`    | Negosiasi schema v1/v2 dan corrupted snapshot               | WIP          | 406/compatibility dan failure aman                                                  |
| `2A-11a`    | Dokumentasi DB/API, provisioning dan clean setup            | WIP          | Runbook + clean checkout/test DB reproducible                                       |
| `2A-11b`    | Gate 2A: full backend/contract/HTTP/Electron regression     | WIP          | Semua child 2A VERIFIED; laporan dan approval 2A                                    |

### Phase 2B — Web Admin visual editor

| Micro-batch | Pekerjaan tunggal                                   | Status awal* | Bukti minimal / exit gate                                |
| ----------- | --------------------------------------------------- | ------------ | -------------------------------------------------------- |
| `2B-01a`    | Typed API client, session/CSRF dan error mapping    | NOT STARTED  | Login/logout nyata; tidak ada token admin localStorage   |
| `2B-01b`    | Shell sidebar/canvas/properties + role states       | NOT STARTED  | Unauthorized/403 dan navigasi diuji                      |
| `2B-02a`    | Read-only canvas SVG, fit/zoom/pan/grid             | NOT STARTED  | Snapshot published/draft sesuai role; viewport responsif |
| `2B-02b`    | Layer, search/select, label/symbol, keyboard        | NOT STARTED  | Aksesibilitas dan kontrol fokus diuji                    |
| `2B-03a`    | Create/select/move site node, snap-to-grid          | NOT STARTED  | Drag tunggal commit sekali, bukan setiap pointermove     |
| `2B-03b`    | Edit properties, delete confirm, undo/redo node     | NOT STARTED  | Undo/redo pointer+keyboard dan dirty state               |
| `2B-04a`    | Create edge, orthogonal route dan endpoint binding  | NOT STARTED  | Edge mengikuti node tanpa mengubah konektivitas fisik    |
| `2B-04b`    | Waypoint editing, edge delete, undo/redo            | NOT STARTED  | Cancel/undo memulihkan visual                            |
| `2B-05a`    | Form devices/ports dan referential validation       | NOT STARTED  | API IDs dan error relasi tampil                          |
| `2B-05b`    | Form FO cable/core/termination/splice               | NOT STARTED  | Tidak menyimpulkan splice dari persilangan               |
| `2B-05c`    | Form logical Ring A/B + alokasi                     | NOT STARTED  | Konflik path/core terlihat jelas                         |
| `2B-06a`    | Form Power source/load/main/backup                  | NOT STARTED  | Validasi terminal dan supply type                        |
| `2B-06b`    | Form corridor/shared-route                          | NOT STARTED  | Tidak otomatis mengubah sirkuit dari layout              |
| `2B-07a`    | Save draft, dirty state, request failure            | NOT STARTED  | Draft tetap lokal jika save gagal                        |
| `2B-07b`    | Validate/publish dan error detail                   | NOT STARTED  | Role gate dan invalid draft                              |
| `2B-07c`    | Concurrent editing, 409 conflict recovery           | NOT STARTED  | Tidak membuang perubahan lokal                           |
| `2B-08a`    | Published preview/history                           | NOT STARTED  | Preview immutable terpisah dari draft                    |
| `2B-08b`    | Rollback UI confirmation dan role                   | NOT STARTED  | Audit dan akses role teruji                              |
| `2B-09a`    | E2E editor→draft→validate→publish dengan API nyata  | NOT STARTED  | Flow lengkap dan negative tests                          |
| `2B-09b`    | Gate 2B: UI regression, responsive screenshots, SOP | NOT STARTED  | Full UI/backend/contract tests dan approval              |

### Phase 2C — Desktop API synchronization

| Micro-batch | Pekerjaan tunggal                              | Status awal* | Bukti minimal / exit gate                   |
| ----------- | ---------------------------------------------- | ------------ | ------------------------------------------- |
| `2C-01a`    | Main-process API origin provisioning/allowlist | NOT STARTED  | HTTPS, redirect/origin invalid ditolak      |
| `2C-01b`    | Viewer token OS-protection, IPC/log redaction  | NOT STARTED  | Token tak mencapai renderer                 |
| `2C-02a`    | HTTP published fetch + ETag/304 + guard        | NOT STARTED  | Timeout/abort/size/304 teruji               |
| `2C-02b`    | Checksum/schema compatibility validation       | NOT STARTED  | Hash mismatch dan unknown schema ditolak    |
| `2C-03a`    | Cache restore dan atomic disk write            | NOT STARTED  | Corrupt/write fail mempertahankan last good |
| `2C-03b`    | Hot swap revision dan schema-compatible render | NOT STARTED  | Peta tidak blank; view-only tetap           |
| `2C-04a`    | Scheduler sync no-overlap, backoff/jitter      | NOT STARTED  | Tidak membuat request storm                 |
| `2C-04b`    | Offline/STALE/last-sync dan reconnect          | NOT STARTED  | API outage/recovery; carousel tetap         |
| `2C-05a`    | E2E publish→desktop dan failure matrix         | NOT STARTED  | Snapshot lama sampai publish; swap atomik   |
| `2C-05b`    | Gate Phase 2 full regression + docs            | NOT STARTED  | 2A/2B/2C gates, Electron smoke, approval    |

### Kriteria wajib 2C-02a — realignment Option B disetujui 2026-11-19

Parent 2C-01 mencakup provisi dan isolasi keamanan origin/token, bukan timeout atau batas respons HTTP. Konflik dengan scope parent lama diselesaikan melalui revisi `docs/codegen-plan.md`: fetch published belum ada pada 2C-01; kedua kontrol berlaku sebelum fetch pertama pada 2C-02a. Parent 2C-01 harus VERIFIED berdasarkan kriteria revisi sebelum 2C-02a dimulai.

- **Request timeout:** setiap request HTTP yang berlaku memiliki batas waktu hingga; request menggantung tidak menunggu tanpa akhir; kegagalan timeout ditangani aman; pembatalan/abort diuji; timeout tidak boleh mematikan validasi origin, redirect, atau keamanan lain.
- **Batas ukuran respons:** setiap body HTTP memiliki batas byte hingga; respons berlebih ditolak; pembacaan stream dibatasi saat membaca, termasuk saat `Content-Length` hilang atau menyesatkan; satu respons tidak boleh menyebabkan pertumbuhan memori tanpa batas; kegagalan diuji.
- Kontrol berlaku untuk seluruh jalur fetch published yang disetujui dan tidak dapat dilewati dengan penanganan respons alternatif. Fetch HTTP published atau sinkronisasi tidak boleh dikirim sampai kedua kontrol diimplementasi dan diverifikasi. Keduanya wajib, bukan opsional.

### Phase 3 — CCTV media gateway

| Micro-batch | Pekerjaan tunggal                             | Status awal* | Bukti minimal / exit gate                 |
| ----------- | --------------------------------------------- | ------------ | ----------------------------------------- |
| `3-01a`     | Gateway selection and lab config (no secrets) | NOT STARTED  | Version/codec/transport documented        |
| `3-01b`     | One synthetic stream via WebRTC/HLS           | NOT STARTED  | Actual browser playback; not RTSP direct  |
| `3-02a`     | Private camera source storage + secret canary | NOT STARTED  | Viewer metadata contains no RTSP secret   |
| `3-02b`     | Admin camera form + RBAC                      | NOT STARTED  | Write role and validation                 |
| `3-02c`     | Scoped short-lived playback session           | NOT STARTED  | Expiry/origin/unauthorized tested         |
| `3-03a`     | Single player happy path + loading/live       | NOT STARTED  | Muted autoplay in Electron                |
| `3-03b`     | Player cleanup/error/unsupported codec        | NOT STARTED  | Unmount cancels session/decoder           |
| `3-04a`     | Carousel visible-only stream lifecycle        | NOT STARTED  | Hidden feeds release resources            |
| `3-04b`     | Focused view/pause/restore                    | NOT STARTED  | Return to prior carousel position         |
| `3-04c`     | Per-camera retry/backoff/isolation            | NOT STARTED  | One stream failure not global             |
| `3-05a`     | Lab metrics harness + stream-count sweep      | NOT STARTED  | CPU/RAM/GPU/bandwidth/codec recorded      |
| `3-05b`     | Target PC benchmark and capacity decision     | BLOCKED      | Requires target hardware, actual evidence |
| `3-06a`     | Gateway outage/reconnect/expiry regression    | NOT STARTED  | Failure matrix passes                     |
| `3-06b`     | Gate Phase 3 runbook and acceptance           | NOT STARTED  | No unmeasured hardware claim              |

### Phase 4 — Windows installer and controlled update

| Micro-batch | Pekerjaan tunggal                             | Status awal* | Bukti minimal / exit gate                            |
| ----------- | --------------------------------------------- | ------------ | ---------------------------------------------------- |
| `4-01a`     | NSIS packaging/version metadata               | NOT STARTED  | Installer built in lab                               |
| `4-01b`     | Install/uninstall and userData preservation   | NOT STARTED  | Preload/assets/config/cache remain correct           |
| `4-02a`     | Signing prerequisites/CI secret handling      | BLOCKED      | Certificate and secret store needed for real signing |
| `4-02b`     | Signed/invalid package verification           | BLOCKED      | Real signature tests when certificate available      |
| `4-03a`     | Stable/testing release feed in lab            | NOT STARTED  | No auto channel switching                            |
| `4-03b`     | Manifest compatibility/version policy         | NOT STARTED  | Incompatible/invalid metadata rejected               |
| `4-04a`     | Main-process update check/status              | NOT STARTED  | No install triggered                                 |
| `4-04b`     | Download retry/resume and integrity           | NOT STARTED  | Interrupted/corrupt rejected                         |
| `4-05a`     | Maintenance window and admin install gate     | NOT STARTED  | Ordinary quit does not install                       |
| `4-05b`     | Backup and patch/minor install rehearsal      | NOT STARTED  | Cache/config preserved and restart authorized        |
| `4-06a`     | Major approval + API/schema compatibility     | NOT STARTED  | Major blocked without explicit approval              |
| `4-06b`     | Manual rollback previous signed stable        | BLOCKED      | Needs signed previous installer and lab VM           |
| `4-06c`     | Startup failure/downgrade recovery tests      | NOT STARTED  | No data loss, unsafe downgrade denied                |
| `4-07a`     | Release CI/testing channel and failure matrix | NOT STARTED  | No production publish                                |
| `4-07b`     | Gate Phase 4 SOP/signing/install/rollback     | NOT STARTED  | Signed evidence and approval                         |

### Phase 5 — Hardening and acceptance

| Micro-batch | Pekerjaan tunggal                            | Status awal* | Bukti minimal / exit gate                |
| ----------- | -------------------------------------------- | ------------ | ---------------------------------------- |
| `5-01a`     | Structured log rotation/retention/redaction  | NOT STARTED  | No secrets in logs                       |
| `5-01b`     | Health/recovery/crash-loop/disk/permission   | NOT STARTED  | Negative failure tests                   |
| `5-02a`     | Windows autostart lab setup and disable      | NOT STARTED  | After-login, not Session 0               |
| `5-02b`     | Supervisor restart/reboot/hotkey recovery    | NOT STARTED  | Crash loop limited; uninstall possible   |
| `5-03a`     | Benchmark dataset and repeatable harness     | NOT STARTED  | 100 sites/300 edges baseline             |
| `5-03b`     | Target PC FPS/startup/GPU with CCTV          | BLOCKED      | Hardware and stream test evidence        |
| `5-03c`     | Measured bottleneck optimization and recheck | NOT STARTED  | Only if measurement warrants             |
| `5-04a`     | Four-monitor geometry/DPI/bezel UAT          | BLOCKED      | Physical PC + operator required          |
| `5-04b`     | Reconnect/sleep/taskbar/fallback UAT         | BLOCKED      | Physical PC + operator required          |
| `5-05a`     | Soak protocol/harness/metrics collection     | NOT STARTED  | Short dry-run passes                     |
| `5-05b`     | Outage/power-loss/recovery drill plan        | NOT STARTED  | Safe lab procedure and operator approval |
| `5-06a`     | Collect and classify scheduled soak evidence | BLOCKED      | Requires completed external soak run     |
| `5-06b`     | Fix and reverify reproducible soak failures  | NOT STARTED  | Only from measured failures              |
| `5-07a`     | Security/regression/release evidence review  | NOT STARTED  | All AC and unresolved risks mapped       |
| `5-07b`     | Backup/restore SOP and operator handover     | NOT STARTED  | Dry-run and clear rollback steps         |
| `5-07c`     | Gate V1 acceptance/deployment checklist      | NOT STARTED  | Explicit acceptance; no automatic deploy |

*Status awal di atas adalah **status perencanaan**, bukan hasil eksekusi setiap micro-batch. Untuk 2A, validasi WIP terhadap kode dan matriks audit sebelum mengubahnya.

## Parent-gate mapping

| Parent gate | Children wajib                         | Kondisi tambahan                                          |
| ----------- | -------------------------------------- | --------------------------------------------------------- |
| `2A-01`     | `2A-01a`, `2A-01b`, `2A-01c`           | Acceptance criteria dan test gate parent asli tetap wajib |
| `2A-02`     | `2A-02a`, `2A-02b`, `2A-02c`, `2A-02d` | Acceptance criteria dan test gate parent asli tetap wajib |
| `2A-03`     | `2A-03a`, `2A-03b`, `2A-03c`           | Acceptance criteria dan test gate parent asli tetap wajib |
| `2A-04`     | `2A-04a`, `2A-04b`, `2A-04c`           | Acceptance criteria dan test gate parent asli tetap wajib |
| `2A-05`     | `2A-05a`, `2A-05b`, `2A-05c`           | Acceptance criteria dan test gate parent asli tetap wajib |
| `2A-06`     | `2A-06a`, `2A-06b`, `2A-06c`, `2A-06d` | Acceptance criteria dan test gate parent asli tetap wajib |
| `2A-07`     | `2A-07a`, `2A-07b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `2A-08`     | `2A-08a`, `2A-08b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `2A-09`     | `2A-09a`, `2A-09b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `2A-10`     | `2A-10a`, `2A-10b`, `2A-10c`           | Acceptance criteria dan test gate parent asli tetap wajib |
| `2A-11`     | `2A-11a`, `2A-11b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `2B-01`     | `2B-01a`, `2B-01b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `2B-02`     | `2B-02a`, `2B-02b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `2B-03`     | `2B-03a`, `2B-03b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `2B-04`     | `2B-04a`, `2B-04b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `2B-05`     | `2B-05a`, `2B-05b`, `2B-05c`           | Acceptance criteria dan test gate parent asli tetap wajib |
| `2B-06`     | `2B-06a`, `2B-06b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `2B-07`     | `2B-07a`, `2B-07b`, `2B-07c`           | Acceptance criteria dan test gate parent asli tetap wajib |
| `2B-08`     | `2B-08a`, `2B-08b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `2B-09`     | `2B-09a`, `2B-09b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `2C-01`     | `2C-01a`, `2C-01b`                     | Acceptance parent revisi Option B wajib                   |
| `2C-02`     | `2C-02a`, `2C-02b`                     | Timeout dan batas respons wajib pada 2C-02a               |
| `2C-03`     | `2C-03a`, `2C-03b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `2C-04`     | `2C-04a`, `2C-04b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `2C-05`     | `2C-05a`, `2C-05b`                     | Acceptance criteria dan test gate parent asli tetap wajib |
| `3-01`      | `3-01a`, `3-01b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `3-02`      | `3-02a`, `3-02b`, `3-02c`              | Acceptance criteria dan test gate parent asli tetap wajib |
| `3-03`      | `3-03a`, `3-03b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `3-04`      | `3-04a`, `3-04b`, `3-04c`              | Acceptance criteria dan test gate parent asli tetap wajib |
| `3-05`      | `3-05a`, `3-05b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `3-06`      | `3-06a`, `3-06b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `4-01`      | `4-01a`, `4-01b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `4-02`      | `4-02a`, `4-02b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `4-03`      | `4-03a`, `4-03b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `4-04`      | `4-04a`, `4-04b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `4-05`      | `4-05a`, `4-05b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `4-06`      | `4-06a`, `4-06b`, `4-06c`              | Acceptance criteria dan test gate parent asli tetap wajib |
| `4-07`      | `4-07a`, `4-07b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `5-01`      | `5-01a`, `5-01b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `5-02`      | `5-02a`, `5-02b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `5-03`      | `5-03a`, `5-03b`, `5-03c`              | Acceptance criteria dan test gate parent asli tetap wajib |
| `5-04`      | `5-04a`, `5-04b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `5-05`      | `5-05a`, `5-05b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `5-06`      | `5-06a`, `5-06b`                       | Acceptance criteria dan test gate parent asli tetap wajib |
| `5-07`      | `5-07a`, `5-07b`, `5-07c`              | Acceptance criteria dan test gate parent asli tetap wajib |

## Format prompt Codex yang hemat konteks

```text
SENKOM — Jalankan HANYA micro-batch <ID> sesuai docs/codegen-microbatch-plan-v2.md.
Baca docs/phase-2-checkpoint.md (atau checkpoint fase terkait), audit WIP dan
bagian spesifikasi/kontrak yang langsung terkait dengan <ID>. Jangan membaca
seluruh dokumentasi/repository bila tidak diperlukan.
Sebelum edit, inventaris implementasi dan tes yang sudah ada; jangan buat ulang.
Kerjakan hanya satu deliverable dan tes positif/negatif terfokus.
Jangan melakukan full-suite kecuali ini parent/fase gate atau perubahan menuntutnya.
Catat file berubah, perintah, exit code, tes, risiko, dan next step di checkpoint.
Target 25–60 menit, hard stop perencanaan 90 menit. Jika belum lulus, INCOMPLETE.
Jangan lanjut micro-batch berikutnya otomatis.
```

## Catatan sinkronisasi dokumen

1. Setelah disetujui, simpan dokumen ini sebagai `docs/codegen-microbatch-plan-v2.md` di repository. Perbarui `docs/codegen-plan.md` menjadi indeks parent→child atau jadikan dokumen ini source of truth tunggal; jangan menyimpan dua roadmap yang saling bertentangan.
2. Revisi bagian 15–16 spesifikasi: ganti perintah “baca seluruh dokumen” menjadi “baca checkpoint dan bagian source of truth yang relevan; eskalasi bila kontrak lintas modul berubah”. Pertahankan semua acceptance criteria dan security rules.
3. `docs/phase-2-checkpoint.md` tetap menyebut **2A-00 VERIFIED**; next **2A-01a**, bukan mengulang 2A-00 atau langsung menganggap 2A-01 VERIFIED.
4. WIP gap penting dari audit: migration rollback, parent FO segment representation, `CablePatch.oneOf`, auth scope, draft concurrency, publish failure injection, schema negotiation. Jangan hilangkan.
5. UAT fisik, sertifikat signing dan long-running soak tidak boleh ditandai VERIFIED hanya berdasarkan mock atau unit test.
