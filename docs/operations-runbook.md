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

## SOP yang masih harus dibangun

Main process menyimpan cache/config di `app.getPath('userData')`, menggunakan atomic
write, revision/fetched_at/checksum, validasi sebelum restore, serta DPAPI/OS secret
store untuk token jika disimpan. First-run API gagal tanpa cache menampilkan error;
jangan menggantinya dengan demo tersembunyi. Cache lama diberi OFFLINE/STALE dan waktu.

Autostart berjalan setelah login akun Senkom, bukan service Session 0. Supervisor
perlu batas retry/backoff dan diagnosis crash loop. Uji display sleep/reconnect,
mixed DPI, reboot dan power loss di PC aktual. Logging desktop dengan rotation,
backup DB, disaster restore, alerting dan SLA ditentukan sebelum Phase 5.
