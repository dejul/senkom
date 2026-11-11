# SENKOM Infrastructure Monitoring Center

Phase 1 desktop offline-first, versi aplikasi `0.1.0`. Seluruh data contoh berlabel DEMO.
Sumber kebutuhan: [spesifikasi V1](SENKOM_V1_Technical_Specification.md).
Peta menggunakan SVG/native Electron dan dependency yang sudah ada.
Kontrak API serta schema peta Phase 0 tetap dipertahankan.

Baseline selesai tetap Phase 1. Phase 2A memiliki perubahan WIP yang belum melewati
seluruh gate; baca [checkpoint](docs/phase-2-checkpoint.md) sebelum melanjutkan.
Phase 2-5 kini dibagi menjadi [46 batch code generation](docs/codegen-plan.md),
target 1-3 jam dan batas internal empat jam per sesi. Recovery
[2A-00 VERIFIED](docs/phase-2-verification.md); batch berikutnya **2A-01** pada
permintaan baru. [Matriks WIP](docs/phase-2-wip-audit.md) mencatat gap backend.

## Yang tersedia

Daftar berikut menjelaskan baseline Phase 1/default foundation. Backend Phase 2A
tersedia sebagai WIP opt-in; cakupan aktual dan batasnya tercatat dalam matriks audit.

- Workspace npm, TypeScript strict, ESLint, Prettier, Vitest, PHPUnit, dan CI Windows.
- Electron aman, peta SVG FO/Power dengan pan/zoom/filter/pemilihan detail read-only.
- Deteksi display dinamis, virtual bounds/negative coordinates, reflow DPI, fallback satu monitor.
- Carousel placeholder, fokus kamera sementara, cache DEMO tervalidasi dan error tanpa cache.
- Diagnostik CPU/RAM/GPU/RAF/startup, recovery renderer terbatas dan rotasi log.
- Hotkey admin Ctrl+Alt+D dengan PIN/passphrase lokal, expiry dan rate limit.
- Shell React Web Admin terpisah; belum ada login atau CRUD.
- Laravel dengan `GET /api/v1/health`, envelope JSON, error aman, dan logging JSON harian.
- OpenAPI 3.1, JSON Schema snapshot v1, tipe TypeScript hasil generate, validasi referensi.
- Fixture delapan site sintetis, FO/core/splice/logical link/Power/layout terpisah.

Belum ada integrasi API peta, RBAC backend, database operasional, CCTV live,
installer, updater, autostart, atau deployment. Endpoint viewer dalam
OpenAPI merupakan kontrak rencana dan masih mengembalikan 404 pada API ini.
Audit penuh mencatat 13 advisory moderate pada alat pengembangan; audit dependency
produksi npm dan Composer bersih. Rincian ada dalam laporan verifikasi.

## Toolchain

| Komponen            | Pin                     | Alasan                                                      |
| ------------------- | ----------------------- | ----------------------------------------------------------- |
| Node / npm          | 24.22.2 / 11.19.1       | Node 24 LTS; `.nvmrc`, `.node-version`, engines             |
| Electron            | 45.2.1                  | Versi stabil registry saat foundation dibuat                |
| React / React DOM   | 19.3.1                  | Versi stabil yang sama untuk dua UI                         |
| TypeScript          | 5.9.3                   | Kompatibel dengan peer dependency openapi-typescript 7.13.0 |
| Vite / plugin React | 8.3.5 / 6.2.1           | Build renderer dan Web Admin                                |
| PHP / Composer      | 8.4.26 / 2.11.1         | PHP 8.4 kompatibel Laravel 13 dan PHPUnit 13                |
| Laravel / PHPUnit   | 13.39.0 / 13.4.6        | Backend foundation dan HTTP tests                           |
| MySQL               | 8.4 LTS, target Phase 2 | Belum diinstal, dihubungkan, atau diuji pada Phase 0        |

Versi diperiksa melalui registry npm, Packagist, Node, PHP, dan Composer pada
2026-11-03. Dependency npm langsung dipin; Composer memakai rentang major kompatibel
dengan versi terpasang yang dikunci. Seluruh resolusi disimpan di
`package-lock.json` dan `apps/api/composer.lock`. Jangan gunakan `--ignore-platform-reqs`
atau `--legacy-peer-deps` untuk melewati ketidakcocokan.

## Setup

Gunakan terminal dengan Node/npm dan PHP/Composer sesuai tabel di PATH.
Ekstensi PHP: ctype, curl, dom, fileinfo, filter, hash, mbstring, openssl, pdo_mysql,
session, tokenizer, xml, xmlwriter. Phase 1 tidak membutuhkan database atau APP_KEY.

```powershell
node --version
npm --version
php --version
composer --version
npm ci
composer --working-dir apps/api install --no-interaction --prefer-dist
```

`.env.example` root mendokumentasikan konfigurasi integrasi masa depan;
desktop Phase 1 tidak membacanya dan tidak membuat koneksi API/update.
Untuk konfigurasi API lokal, salin `apps/api/.env.example` ke `apps/api/.env`;
jangan menimpa `.env` yang sudah ada. Saat mulai auth/encryption Phase 2, buat
APP_KEY dengan `php apps/api/artisan key:generate` dan simpan di luar Git.

Pada mesin pengembangan ini PHP default masih 8.3.13. PHP 8.4.26 tersedia di
`C:\laragon\bin\php\php-8.4.26-Win32-vs17-x64`. Verifikasi PATH sebelum menjalankan API.
Node 24 dan Composer 2.11.1 untuk verifikasi awal diunduh ke direktori sementara
`senkom-phase0-tools-24.22.2`, dengan pemeriksaan SHA-256; instalasi global tidak diubah.

## Jalankan

Setup DB/API Phase 2A, migration, data awal, provisioning, dan verifikasi DB
testing: [runbook Phase 2A](docs/phase-2a-setup.md).

```powershell
npm run dev
npm run dev:admin
npm run dev:api
```

Jalankan tiap perintah di terminal terpisah. Desktop membangun aset lokal lalu
membuka window frameless sesuai display terdeteksi; hanya susunan persegi panjang
kontinu yang dibentangkan. Konfigurasi tidak valid memakai satu monitor utama.
Web Admin: `http://127.0.0.1:5174`. API: `http://127.0.0.1:8000/api/v1/health`.
`health` hanya membuktikan proses Laravel hidup, bukan koneksi DB/media gateway.

`npm run dev:cache` menguji startup cache-only tanpa memasok fixture. Jalankan
`npm run dev` sekali dahulu untuk membuat cache DEMO. Tanpa cache valid, muncul
layar kegagalan yang jelas. Backend masih belum terhubung pada kedua mode.

`npm run admin:configure` membuat verifier PIN/passphrase di profil pengguna Windows
melalui prompt terminal tanpa echo. Jalankan sekali, lalu restart aplikasi.
Ctrl+Alt+D atau tombol Diagnostics meminta PIN sebelum diagnostics/keluar.
Tanpa provisioning, diagnostics terkunci tetapi Alt+F4 tetap tersedia agar prototipe
tidak mengunci operator. Jangan kirim PIN lewat chat, argv, VITE env atau repository.
Rincian config lokal dan pemulihan ada di [panduan Phase 1](docs/phase-1.md).

## Pemeriksaan dan build

```powershell
npm run contracts:generate
npm run lint
npm run typecheck
npm test
npm run build
npm run check:api
npm run smoke:desktop
```

`npm run check` menggabungkan lint, kontrak, unit tests, typecheck, build, dan API
checks. `smoke:desktop` membutuhkan sesi desktop Windows; membuka lalu menutup
window uji tersembunyi, memeriksa sandbox/bridge/CSP, peta/carousel/admin/recovery,
restart cache, cache korup/kosong dan layout Web Admin 1280/390 px.
Screenshot disimpan dalam `.artifacts/` yang diabaikan Git.

Hasil build: `apps/desktop/dist/main`, `apps/desktop/dist/renderer`, dan
`apps/admin-web/dist`. Ini bukan installer. Perubahan kontrak wajib diikuti generate,
review hasil tipe, dan tests; CI menolak tipe hasil generate yang tertinggal.

```powershell
npm audit
composer --working-dir apps/api audit
composer --working-dir apps/api validate --strict
```

CI menjalankan gate serupa pada Windows, tanpa publish atau deploy. CI remote
baru dapat dibuktikan setelah repository didorong ke hosting dan workflow berjalan.

## Struktur

```text
apps/desktop/          Electron main/preload, map/carousel/diagnostics, build
apps/admin-web/        Shell React admin, konfigurasi Vite
apps/api/              Laravel minimal, config, health route, PHPUnit
packages/shared-types/ Tipe API hasil generate dan kontrak IPC lokal
packages/map-schema/   JSON Schema v1 dan validator referensi
tests/fixtures/        Dataset DEMO dan penjelasan batasnya
tests/                 Uji kontrak, peta, kebijakan update, keamanan desktop
scripts/               Generate/check kontrak dan smoke Electron
infrastructure/        Rencana gateway dan updater; belum deployment config
docs/                  Arsitektur, kontrak, database, operasi, release, checklist
.github/workflows/     CI fondasi Windows
```

Repository Git SENKOM diinisialisasi dalam folder ini, tanpa commit/remote.
Repository induk dan proyek lain tidak diubah.

## Batas dan keputusan berikutnya

Validator Phase 0 memeriksa struktur, ID, referensi, jenis koneksi, core capacity,
terminasi dasar, dan batas koordinat. Ia belum membuktikan kontinuitas seluruh path,
alokasi eksklusif end-to-end, atau kelayakan listrik. Validasi publication Phase 2
harus menambahkan aturan itu sebelum data produksi diterima.

Deteksi display nyata, cache offline dan diagnostik GPU diuji pada PC pengembangan.
Belum ada uji empat monitor fisik/mixed DPI, RTX 3060 target, delapan stream, performa
100 site/300 edge, outage API nyata, signed update, atau rollback. Target tersebut
tetap acceptance V1 yang belum dipenuhi. Schema awal dapat diperinci melalui
perubahan versioned dan contract tests; jangan mengubah schemaVersion 1 secara breaking.

Lihat [hasil Phase 1](docs/phase-1-verification.md), [hasil Phase 0](docs/phase-0-verification.md),
[arsitektur](docs/architecture.md), [kontrak](docs/api-contract.md), dan
[checklist Phase 1](docs/phase-1-approval.md). Phase 2 telah disetujui, dengan
[checklist Phase 2](docs/phase-2-approval.md); eksekusi berikutnya mengikuti satu
batch per sesi dalam [prompt code generation](SENKOM_V1_VSCode_Codegen_Prompt.md).
