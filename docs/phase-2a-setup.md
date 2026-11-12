# Phase 2A — DB/API setup dan provisioning

Runbook ini memakai MySQL 8.4 dan PHP 8.4.1+; `composer.lock` saat ini diuji
dengan PHP 8.4.26. Node/npm mengikuti `package.json` (24.22.2/11.19.1).
PHP default 8.3 pada mesin pengembangan tidak memenuhi dependency Composer.
Gunakan executable PHP 8.4 secara eksplisit atau letakkan di awal `PATH`.

## Clean source dan dependency

Dari root salinan source yang tidak memuat `node_modules`, `apps/api/vendor`,
atau `.env`:

```powershell
node --version
npm --version
php --version
composer --version
npm ci
composer --working-dir apps/api install --no-interaction --prefer-dist
```

Gunakan source dari checkout yang dipercaya. Repo lokal historis belum punya
commit; salinan source tanpa dependency juga dapat dipakai untuk uji setup.
Jangan menyalin `.env` atau token dari source lain.

## Database dan konfigurasi API

Buat database kosong pada MySQL 8.4 yang memang dialokasikan untuk lingkungan
ini. Sebelum membuatnya, cek host, port, dan datadir server dengan
`SELECT @@version, @@port, @@datadir;`. Untuk tes, pakai nama baru berakhiran
`_test` pada instance disposable; jangan pakai database Laragon atau produksi.
Contoh setelah identitas instance testing terverifikasi:

```sql
CREATE DATABASE senkom_clean_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs;
```

Salin `apps/api/.env.example` ke `apps/api/.env` bila file tujuan belum ada.
Isi `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` sesuai
instance. Set `SENKOM_INFRASTRUCTURE_ENABLED=true` dan `SENKOM_MAP_ID=main`.
Untuk DB tes set `APP_ENV=testing`; untuk pengembangan lokal set `APP_ENV=local`.
Simpan `.env` di luar Git. Setelah mengisi konfigurasi:

```powershell
php apps/api/artisan key:generate
php apps/api/artisan migrate --force
php apps/api/artisan migrate:status
```

`APP_KEY` wajib untuk session dan enkripsi secret kamera. Jalankan migration
sekali pada DB kosong; migration berikutnya bersifat inkremental. Jangan
menjalankan `migrate:fresh` atau rollback pada DB berisi data. Database kosong
tidak membuat user, map, atau viewer token otomatis.

## Pilih data awal

Untuk map kosong yang akan diisi operator:

```powershell
php apps/api/artisan senkom:map main --name="Infrastructure"
```

Untuk data sintetis hanya di DB `local` atau `testing`, jalankan sebagai
alternatif pada DB kosong (jangan jalankan `senkom:map main` lebih dulu):

```powershell
php apps/api/artisan db:seed --class='Database\Seeders\DemoSeeder' --force
```

`DemoSeeder` membaca `tests/fixtures/demo-map.v1.json`, memvalidasi lalu
mengisi map `SENKOM_MAP_ID`. Seeder menolak map yang sudah ada dan lingkungan
selain `local`/`testing`; data DEMO bukan data produksi.

## Provisioning akses

```powershell
php apps/api/artisan senkom:user admin@example.invalid --roles=system_admin
php apps/api/artisan senkom:user editor@example.invalid --roles=infrastructure_editor,publisher
php apps/api/artisan senkom:map-role editor@example.invalid main infrastructure_editor
php apps/api/artisan senkom:map-role editor@example.invalid main publisher
php apps/api/artisan senkom:viewer-token display-1 --map=main --hours=24 --output='C:\secure\viewer-token.txt'
```

`senkom:user` meminta password 12–128 karakter melalui prompt tersembunyi;
perintah tidak menimpa user existing. `system_admin` punya akses global.
Editor/publisher perlu grant eksplisit per map; tanpa grant, akses ditolak.
Token viewer hanya punya scope map yang dipilih, berlaku 1–24 jam, dan hanya
ditulis ke file baru. Batasi ACL file di Windows, pindahkan token melalui
saluran aman, lalu hapus file provisioning. Database menyimpan hash token.
Untuk revoke, cari ID token pada DB yang berwenang, lalu jalankan
`php apps/api/artisan senkom:revoke-viewer <id>`.

## Jalankan dan periksa

Isi `SENKOM_ADMIN_ORIGINS` dengan origin Web Admin yang diizinkan. Cookie
session memakai `SESSION_SECURE_COOKIE=true` untuk HTTPS; pada HTTP localhost
khusus pengembangan, set `false`. Origin/TLS deployment tetap keputusan
terbuka. Jalankan `php apps/api/artisan serve --host=127.0.0.1 --port=8000`.
`GET /api/v1/health` hanya memeriksa proses API; `migrate:status` dan tes DB
memeriksa koneksi/schema.

Pada instance DB testing disposable yang identitasnya sudah diverifikasi,
gunakan DB tes berbeda untuk PHPUnit dan HTTP smoke:

```powershell
$env:SENKOM_TEST_DB_PORT='<port-terverifikasi>'
$env:SENKOM_TEST_DB_DATABASE='senkom_unit_test'
php apps/api/vendor/phpunit/phpunit/phpunit -c apps/api/phpunit.xml --no-progress
node scripts/contracts.mjs --check
$env:SENKOM_TEST_DB_DATABASE='senkom_http_test'
$env:SENKOM_PHP_BINARY=(Get-Command php).Source
node scripts/phase2-smoke.mjs --api-only
```

`phase2-smoke.mjs` membuat fixture dan menjalankan migration pada DB HTTP
terpilih. Jangan arahkan ke DB yang perlu dipertahankan. Setelah tes, cek
jumlah fixture, pointer/revision, dan trigger immutable; hentikan MySQL
disposable secara normal. Gate regresi penuh 2A-11b tetap terpisah.

## Windows GitHub Actions disposable MySQL

`.github/workflows/ci.yml` berjalan di `windows-latest` dengan PHP 8.4.26,
Composer 2.11.1, dan Node dari `.nvmrc`. `scripts/ci-mysql.ps1 -Action start`
mengunduh ZIP resmi MySQL 8.4.11 dari
`https://cdn.mysql.com/Downloads/MySQL-8.4/mysql-8.4.11-winx64.zip`, memeriksa
SHA-256 `A492371D687D2BAB088B0062581144A0044B8964BAEFDF4FAA579292B423D25C`,
lalu membuat datadir baru di `.artifacts/ci-mysql/data`. Script menolak datadir
existing, hanya membuka loopback pada port kosong, dan membuktikan executable,
versi, port, serta datadir lewat SQL sebelum membuat database.

Database `senkom_ci_setup_test`, `senkom_ci_unit_test`, dan
`senkom_ci_http_test` terpisah. User `senkom_ci` mendapat password acak per
runner dan akses hanya ke tiga database itu. Secret masuk `GITHUB_ENV` dan
dimask di log GitHub Actions; tidak ada credential produksi atau Laragon.
`Migration and DEMO seed` menguji migrasi serta `DemoSeeder` pada DB setup.
PHPUnit memakai DB unit dengan `--fail-on-skipped` dan ringkasan 0 skip wajib.
`phase2-smoke.mjs --api-only` memigrasi DB HTTP, membuat fixture DEMO, menunggu
server Laravel sehat, menguji respons HTTP/kontrak, lalu menghentikan server.
Step `Stop disposable MySQL` memakai `if: always()` untuk shutdown normal dan
menghapus hanya direktori disposable yang ditandai milik script.
