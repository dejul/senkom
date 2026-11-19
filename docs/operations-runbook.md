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

## SOP yang masih harus dibangun

Main process menyimpan cache/config di `app.getPath('userData')`, menggunakan atomic
write, revision/fetched_at/checksum, validasi sebelum restore, serta DPAPI/OS secret
store untuk token jika disimpan. First-run API gagal tanpa cache menampilkan error;
jangan menggantinya dengan demo tersembunyi. Cache lama diberi OFFLINE/STALE dan waktu.

Autostart berjalan setelah login akun Senkom, bukan service Session 0. Supervisor
perlu batas retry/backoff dan diagnosis crash loop. Uji display sleep/reconnect,
mixed DPI, reboot dan power loss di PC aktual. Logging desktop dengan rotation,
backup DB, disaster restore, alerting dan SLA ditentukan sebelum Phase 5.
