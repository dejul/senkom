# Operasi foundation

Untuk desktop Phase 1, gunakan [panduan operasi Phase 1](phase-1.md). Bagian berikut
merupakan baseline foundation; cache/display/diagnostics kini diimplementasikan
sesuai panduan baru, sedangkan autostart, supervisor OS dan backend masih tertunda.

Phase 0 digunakan untuk pengembangan saja. Desktop/admin menampilkan DEMO dan tidak
melakukan sinkronisasi. Tutup window desktop secara normal; tidak ada autostart,
task scheduler, service, firewall rule, atau perubahan OS yang dipasang.

## Diagnosis lokal

- Build gagal: cocokkan `node --version`, `npm --version`, `php --version`, `composer --version`
  dengan README; jalankan install dari lockfile dan gate yang gagal.
- Contract drift: edit OpenAPI/schema sumber, `npm run contracts:generate`, review dan test.
- Desktop kosong: jalankan `npm run dev` dari terminal; periksa event JSON startup-failed
  atau renderer-stopped. Jangan memuat website eksternal untuk memperbaiki renderer.
- API: `GET /api/v1/health` harus 200; map/admin 404 memang belum diimplementasikan.
  Log JSON harian ada di `apps/api/storage/logs`, retention 14 hari, tanpa exception text.
- Smoke gagal: perlu sesi desktop Windows yang dapat membuat Electron window;
  `.artifacts/*.png` berisi capture uji, bukan bukti hardware acceptance.

## Phase 2C-01a: provisi origin API desktop

Operator Windows menaruh `api-origin.json` di `%APPDATA%\SENKOM` (Electron `userData`) sebelum menjalankan desktop. Isi hanya origin HTTPS tepercaya, misalnya `{"origin":"https://api.example.test"}`. Jangan masukkan token, username, password, path, query, atau fragment. Batasi akses berkas dengan izin akun operator OS; restart desktop setelah mengganti berkas.

Main process membaca berkas maksimal 2 KiB dan menolak field tambahan atau origin invalid; berkas absen berarti API belum dikonfigurasi. Log hanya mencatat `api-origin-ready` atau `api-origin-rejected`, tanpa nilai origin. Guard request main process menerima path pada origin tersebut saja, memakai `redirect: 'error'`, dan menolak respons dari origin lain. Renderer/IPC tidak menerima konfigurasi. Token viewer dijelaskan di bawah; fetch published, timeout request, dan batas ukuran respons masuk 2C-02a; cache dan sinkronisasi menyusul pada batch masing-masing.

## Phase 2C-01b: provisi token viewer desktop

Backend menerbitkan token viewer scoped melalui `senkom:viewer-token` ke berkas baru yang ACL-nya terbatas (lihat [setup API](phase-2a-setup.md#provisioning-akses)). Salin isi **64 karakter hex tanpa newline** ke `%APPDATA%\SENKOM\viewer-token.pending` memakai akun Windows yang menjalankan desktop; batasi ACL. Simpan file sumber terlindung sampai log `viewer-token-ready`, lalu hapus sumber provisioning. Jangan tempel token ke command line, environment variable, tiket, screenshot, atau repository.

Saat startup, main process Windows hanya menerima token valid jika Electron `safeStorage` menyediakan enkripsi OS. Main mengenkripsi dan memverifikasi hasil sebelum mengganti `viewer-token.protected.json` secara atomik; file staging plaintext dihapus juga saat validasi atau enkripsi gagal. Jika OS menolak penghapusan, log `viewer-token-rejected`: operator harus menghapus staging dengan hak akses yang benar. Log hanya mencatat `viewer-token-ready` atau `viewer-token-rejected`; renderer/IPC tidak menerima token. Jika impor gagal, token encrypted lama dipertahankan; perbaiki OS encryption/ACL atau terbitkan token baru, lalu ulangi. Token backend berlaku 1–24 jam dan bisa dicabut; ulangi provisi untuk rotasi. Batch ini belum melakukan HTTP fetch, refresh, cache, atau sinkronisasi.

## Keputusan realignment Phase 2C (2026-11-19)

Pengguna menyetujui Option B untuk konflik rencana: parent 2C-01 hanya menutup provisi dan isolasi keamanan origin/token. Timeout request dan batas ukuran body respons adalah kewajiban 2C-02a karena fetch published baru dimulai di sana. Setiap request HTTP yang berlaku harus memiliki timeout hingga, abort/kegagalan aman, tanpa melemahkan pemeriksaan origin/redirect. Body respons harus dibatasi saat stream dibaca; `Content-Length` yang hilang atau palsu tidak boleh melewati batas atau menyebabkan pertumbuhan memori tanpa batas. Seluruh jalur respons fetch published harus memakai kedua kontrol. Fetch HTTP published atau sinkronisasi tidak boleh dikirim sebelum keduanya diimplementasi dan diverifikasi. Pada akhir 2C-01 kedua kontrol belum tersedia; batas file konfigurasi/token di atas bukan batas respons HTTP. Implementasi helper 2C-02a dijelaskan di bawah.

## Phase 2C-02a: request published yang dibatasi

Helper Electron main `fetchPublishedMap` memakai GET viewer map schema v2 pada origin HTTPS operator dengan token viewer dan `If-None-Match` bila ada ETag. Default timeout 10 detik berlaku sampai body selesai; request dan pembaca stream dibatalkan saat timeout atau caller membatalkan. Body dibatasi 8 MiB saat dibaca; `Content-Length` hilang atau menyesatkan tidak melewati batas, dan stream berlebih dibatalkan. Error hanya kode generik tanpa token, URL, atau body. Kedua nilai adalah default konservatif untuk batch ini, bukan konfigurasi operator. Helper belum dipanggil saat startup; tidak ada fetch/sinkronisasi otomatis, cache, atau perubahan renderer. Checksum/schema validation milik 2C-02b. Jangan aktifkan fetch published sebelum gate 2C-02a merge dan CI postmerge PASS serta validasi 2C-02b yang relevan.

## Phase 2C-02b: validasi respons published

Setelah respons 200 dibaca dengan batas 2C-02a, Electron main mencocokkan SHA-256 byte body dengan `X-Content-SHA256` dan `ETag` `"sha256:<hash>"`. Envelope JSON harus berisi tepat `data` dan `meta`; metadata harus API v1/schema v2; `data` lulus schema published v2 termasuk referensi. Nilai yang hilang, tidak cocok, atau schema tak dikenal ditolak dengan error generik. Respons 304 tidak memiliki body untuk divalidasi; pengikatan 304 dengan revisi cache dilakukan pada 2C-03a. Helper belum dijalankan otomatis. Jangan aktifkan sinkronisasi sebelum gate 2C-02b merge dan CI postmerge PASS.

PR #48 merge `f532c0c21d56151011d87a7fb07faca245c81273` dan CI postmerge `44484587079` PASS 16/16, 0 skip: 2C-02b VERIFIED. Helper tetap belum dipanggil otomatis; parent 2C-02 masih menunggu gate terpisah.

Parent 2C-02 kemudian VERIFIED/CLOSED melalui PR #49 merge `355ce33271685cf436be4cbe778b0d0b728dab7f` dan CI postmerge `44486785441` PASS 16/16, 0 skip. Helper tetap belum dipanggil otomatis; 2C-03a cache restore/write belum dimulai.

## Phase 2C-03a: cache published v2

Helper Electron main `savePublishedCache` menulis `published-map-cache.v2.json` di direktori `userData` dengan `atomicJson`. Isi hanya snapshot published v2, revisi, `fetchedAt`, ETag dari GET tervalidasi, dan SHA-256 lokal atas serialisasi snapshot; token viewer tidak disimpan. Sebelum tulis dan saat restore, schema v2 dan referensi divalidasi. Cache korup, versi tak cocok, checksum/revisi/ETag salah, atau file >16 MiB ditolak; kandidat >8 MiB ditolak. `matchesPublishedCache304` menerima 304 hanya jika cache valid, ETag sama, dan checksum header cocok. Berkas absen menghasilkan status tanpa snapshot, bukan fallback DEMO. Tulis gagal atau kandidat invalid mempertahankan berkas lama. Helper belum dipanggil saat startup; 2C-03b menghubungkan restore/hot swap, sedangkan scheduler milik 2C-04.

PR #51 merge `5f221249cf7b8d5320d49efa208dba975d1409c7` dan CI postmerge `44530790514` PASS 16/16, 0 skip: 2C-03a VERIFIED. Helper masih belum dipanggil saat startup; 2C-03b belum dimulai.

## Phase 2C-03b: refresh manual published map

Saat origin HTTPS dan token viewer terprovisi, viewer memulihkan cache published v2 valid saat startup. Tanpa cache valid, peta produksi kosong dengan pesan; DEMO hanya berjalan tanpa konteks published. Tombol `Perbarui peta` mengirim permintaan read-only ke Electron main. Main mengambil token dari Windows safeStorage, memanggil GET published yang dibatasi 10 detik dan 8 MiB, serta memeriksa checksum, ETag, API/schema v2. Respons 200 disimpan atomik sebelum snapshot baru tampil; 304 diterima hanya jika ETag/checksum cocok dengan cache valid. Kegagalan membiarkan peta lama terlihat. Tidak ada refresh berkala; scheduler/backoff/status koneksi milik 2C-04. PR #52 merge `b8929b3e324399d33492d0c453614434300724b4` dan CI postmerge `44534985286` PASS 16/16, 0 skip menutup prasyarat 2C-03a.

PR #53 merge `5c278f6425b432f90d367cde7a9d92c65e2d895d` dan CI postmerge `44542722465` PASS 16/16, 0 skip menutup 2C-03b. Gate Parent 2C-03 menguji refresh manual 200/304/401, cache atomik, dan peta lama saat gagal; parent tetap WIP sampai gate PR merge serta CI postmerge PASS. Jangan mulai scheduler 2C-04 pada gate ini.

PR gate #54 merge `a6878e1a8723e6bf9cc900423fe59841cf4c76d5` dan CI postmerge `44649328499` PASS 16/16, 0 skip. Acceptance parent terbukti; status formal VERIFIED/CLOSED berlaku setelah PR closure dokumentasi merge dan CI postmerge PASS. Scheduler 2C-04 tetap di luar closure ini.

PR closure #55 merge `53638954f633adda9698a9b3dafb383c46d611ef` dan CI postmerge `44681521170` PASS 16/16, 0 skip: Parent 2C-03 VERIFIED/CLOSED.

PR #56 merge manual `58c24fdaaac19229aba096c8a352f1b4e251828f`. CI postmerge `44688783846` attempt 1 gagal pada Electron smoke (`UnknownVizError`); attempt 2 PASS 16/16 mandatory, 0 skip pada exact merge SHA. 2C-04a VERIFIED. Kegagalan pertama dicatat sebagai observasi stabilitas CI yang penyebab pastinya belum terkonfirmasi; lihat verifikasi Phase 2. Parent 2C-04 WIP dan 2C-04b belum dimulai.

## Phase 2C-04a: scheduler published

Saat origin HTTPS terprovisi, Electron main menjadwalkan GET published melalui jalur refresh tervalidasi. Cadence dasar 5 menit dengan jitter ±20%; kegagalan berturut memakai backoff 10, 20, lalu 30 menit sebelum jitter (maksimal 36 menit aktual). Timer baru dipasang setelah request selesai; refresh manual memakai lock yang sama. Respons 200 valid disimpan atomik sebelum revisi baru dikirim ke renderer, sedangkan 304/same revision tidak memicu swap. Gagal atau token tidak tersedia mempertahankan peta lama. Timer dihentikan saat window ditutup. Indikator OFFLINE/STALE/last-sync dan reconnect UI milik 2C-04b.

## Phase 2C-04b: status koneksi published

PR gate Parent 2C-04 #60 merge manual `cccbc7a308c01821623296bad5a9bea17dc24209`; CI postmerge `44712007958` PASS 16/16 mandatory, 0 skip. Acceptance parent PASS; status formal VERIFIED/CLOSED menunggu PR closure dokumentasi merge dan CI postmerge PASS. 2C-05 belum dimulai.

PR closure #59 merge manual `544bf3fb8032108387cc98cd1c494aaffd0ac33c`; CI postmerge `44708132041` PASS 16/16 mandatory, 0 skip. Acceptance lokal Parent 2C-04 membuktikan scheduler no-overlap/backoff, recovery 200/304/401, last-valid-map, status dan last-sync, serta isolasi token/renderer. Parent tetap WIP sampai PR gate merge dan CI postmerge PASS; 2C-05 belum dimulai.

PR #58 merge manual `bcc4f4aeca4dbc01298b586f399eba948d9f8dca`; CI postmerge `44706195556` PASS 16/16 mandatory, 0 skip. 2C-04b VERIFIED; Parent 2C-04 WIP sampai gate terpisah.

`PUBLISHED / OFFLINE` berarti belum ada peta published valid; `PUBLISHED / OFFLINE / STALE` berarti peta cache tetap tampil tanpa sync jaringan sukses dalam proses ini atau setelah request gagal. `PUBLISHED / ONLINE` berarti GET published terakhir berhasil, termasuk 304 dengan cache valid. Footer menunjukkan `SYNC TERAKHIR` dalam WIB; waktu ini hanya untuk proses berjalan dan tidak berubah saat gagal. Tombol `Perbarui peta` atau retry scheduler 2C-04a memulihkan ONLINE setelah API/token pulih. Token kedaluwarsa menahan peta lama; rotasi token tetap melalui jalur operator yang sudah ada. Waktu penyimpanan snapshot ditampilkan terpisah sebagai `DATA TERAKHIR`.

## SOP yang masih harus dibangun

Main process menyimpan cache/config di `app.getPath('userData')`, menggunakan atomic
write, revision/fetched_at/checksum, validasi sebelum restore, serta DPAPI/OS secret
store untuk token jika disimpan. First-run API gagal tanpa cache menampilkan error;
jangan menggantinya dengan demo tersembunyi. Cache lama diberi OFFLINE/STALE dan waktu.

Autostart berjalan setelah login akun Senkom, bukan service Session 0. Supervisor
perlu batas retry/backoff dan diagnosis crash loop. Uji display sleep/reconnect,
mixed DPI, reboot dan power loss di PC aktual. Logging desktop dengan rotation,
backup DB, disaster restore, alerting dan SLA ditentukan sebelum Phase 5.
