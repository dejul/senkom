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

Main process membaca berkas maksimal 2 KiB dan menolak field tambahan atau origin invalid; berkas absen berarti API belum dikonfigurasi. Log hanya mencatat `api-origin-ready` atau `api-origin-rejected`, tanpa nilai origin. Guard request main process menerima path pada origin tersebut saja, memakai `redirect: 'error'`, dan menolak respons dari origin lain. Renderer/IPC tidak menerima konfigurasi. Token viewer dijelaskan di bawah; fetch otomatis, timeout/batas respons, snapshot, dan sync masuk batch berikutnya.

## Phase 2C-01b: provisi token viewer desktop

Backend menerbitkan token viewer scoped melalui `senkom:viewer-token` ke berkas baru yang ACL-nya terbatas (lihat [setup API](phase-2a-setup.md#provisioning-akses)). Salin isi **64 karakter hex tanpa newline** ke `%APPDATA%\SENKOM\viewer-token.pending` memakai akun Windows yang menjalankan desktop; batasi ACL. Simpan file sumber terlindung sampai log `viewer-token-ready`, lalu hapus sumber provisioning. Jangan tempel token ke command line, environment variable, tiket, screenshot, atau repository.

Saat startup, main process Windows hanya menerima token valid jika Electron `safeStorage` menyediakan enkripsi OS. Main mengenkripsi dan memverifikasi hasil sebelum mengganti `viewer-token.protected.json` secara atomik; file staging plaintext dihapus juga saat validasi atau enkripsi gagal. Jika OS menolak penghapusan, log `viewer-token-rejected`: operator harus menghapus staging dengan hak akses yang benar. Log hanya mencatat `viewer-token-ready` atau `viewer-token-rejected`; renderer/IPC tidak menerima token. Jika impor gagal, token encrypted lama dipertahankan; perbaiki OS encryption/ACL atau terbitkan token baru, lalu ulangi. Token backend berlaku 1–24 jam dan bisa dicabut; ulangi provisi untuk rotasi. Batch ini belum melakukan HTTP fetch, refresh, cache, atau sinkronisasi.

## SOP yang masih harus dibangun

Main process menyimpan cache/config di `app.getPath('userData')`, menggunakan atomic
write, revision/fetched_at/checksum, validasi sebelum restore, serta DPAPI/OS secret
store untuk token jika disimpan. First-run API gagal tanpa cache menampilkan error;
jangan menggantinya dengan demo tersembunyi. Cache lama diberi OFFLINE/STALE dan waktu.

Autostart berjalan setelah login akun Senkom, bukan service Session 0. Supervisor
perlu batas retry/backoff dan diagnosis crash loop. Uji display sleep/reconnect,
mixed DPI, reboot dan power loss di PC aktual. Logging desktop dengan rotation,
backup DB, disaster restore, alerting dan SLA ditentukan sebelum Phase 5.
