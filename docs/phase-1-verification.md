# Verifikasi Phase 1

Tanggal: 2026-11-03 sampai 2026-11-04 (Asia/Jakarta). Scope: desktop offline-first dengan data DEMO
Phase 0. Tidak ada deployment, stream CCTV, koneksi backend peta atau update produksi.

Toolchain: Node 24.22.2, npm 11.19.1, Electron 45.2.1, PHP 8.4.26 dan Composer 2.11.1.
Runtime portable digunakan melalui PATH sesi terminal; instalasi global tidak diubah.

## Hasil gate lokal

| Pemeriksaan                                        | Hasil                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| ESLint, Prettier, generated contract drift         | Lulus                                                            |
| TypeScript strict, termasuk main/preload           | Lulus                                                            |
| Vitest                                             | 84 tes lulus pada 7 file; 49 tes Phase 0 tetap dipertahankan     |
| Build Electron main/preload/renderer dan Web Admin | Lulus                                                            |
| PHP syntax lint                                    | Lulus                                                            |
| PHPUnit Laravel                                    | 3 tes, 7 assertions lulus                                        |
| API route list                                     | Tetap satu route health; endpoint rencana tidak diaktifkan       |
| Electron smoke                                     | Empat startup: DEMO, cache-only, cache korup, cache kosong lulus |
| UI desktop dan Web Admin                           | Viewport 1280 x 800 dan 390 x 844; tidak ada horizontal overflow |
| CI remote                                          | Workflow diperbarui; belum dijalankan di hosting                 |

Perintah: `npm run lint`, `npm test`, `npm run build` (termasuk typecheck),
`npm run check:api`, dan `npm run smoke:desktop`. Pada terminal verifikasi,
check API dipanggil melalui `php <portable-composer.phar> --working-dir apps/api check`
dengan PHP 8.4.26 pada PATH; target Composer sama.

Ukuran viewport pada tabel adalah target uji. Windows DPI 125% dapat membulatkan
390 DIP menjadi 391 CSS px. Smoke menunggu ukuran SVG sesuai viewport dan paint
selesai sebelum capture, dengan toleransi pembulatan dua CSS px.

## Cakupan bukti

- Geometry mock: empat monitor horizontal, 2x2, vertikal, tiling berbeda ukuran,
  koordinat negatif, gap, overlap, hole, susunan L, duplicate ID, display hilang,
  perubahan resolusi/rotasi/DPI dan fingerprint yang tidak bergantung pada ID OS.
- Desktop: deteksi melalui Electron screen dibandingkan dengan hasil bridge,
  bounds window dibandingkan dengan rencana display, reflow melalui event metrics.
  Event DPI pada smoke disimulasikan; tidak mengubah pengaturan Windows.
- Peta: delapan site, empat edge, pemilihan site/kabel, detail perangkat/core,
  filter lapisan, zoom, pan keyboard, Fit dan resize viewport. Kontrol desktop
  tidak menyediakan CRUD; snapshot sebelum/sesudah interaksi tetap identik.
- CCTV: placeholder nonaktif tetap tampil, paging otomatis/manual, fokus kamera,
  pause selama fokus, kembali ke carousel. Tidak ada video, iframe atau decoder RTSP.
- Cache: write/read/restart, checksum/envelope/schema/referensi/revision, file
  korup/kosong dan kegagalan penyimpanan. Cache-only menampilkan kegagalan eksplisit
  tanpa membuat topologi pengganti. Ini bukan pengujian outage API nyata.
- Keamanan: sandbox/context isolation, Node globals tidak tersedia, bridge terbatas,
  CSP menolak jaringan, diagnostics/quit ditolak sebelum unlock, telemetry invalid
  ditolak, PIN/rate limit/expiry diuji. Lock membatalkan verifikasi PIN yang masih
  berjalan; tes regresi dibuktikan gagal sebelum perbaikan, lalu lulus.
- Pemulihan: smoke memaksa satu renderer crash dan membuktikan reload, peta pulih,
  failure counter serta log display-change/renderer-stopped. Log tidak memuat PIN uji.
- Diagnostics: CPU, working set, RAM sistem, GPU feature/adapter, RAF dan startup
  dapat dibaca; unit test memeriksa validasi sample dan rotasi log.

Smoke memakai userData terisolasi di `.artifacts/phase1-run-*`, verifier acak dan
profil carousel satu slot dengan interval tiga detik. Profil/verifier pengguna
tidak diubah. Jendela uji disembunyikan; background throttling dimatikan hanya
oleh harness. Penolakan IPC yang sengaja diuji mencetak `Admin authorization required`
dan `Invalid frame sample`; telemetry terlambat saat shutdown uji juga dapat memicu
`IPC request rejected`. Keberhasilan ditentukan assertions dan exit code 0.

Screenshot tersimpan di `.artifacts/desktop.png`, `.artifacts/phase1-narrow.png`,
`.artifacts/phase1-corrupt.png`, `.artifacts/phase1-empty.png`, `.artifacts/admin.png`
dan `.artifacts/admin-mobile.png`. Diagnostics mesin uji tersimpan di
`.artifacts/phase1-diagnostics.json`. Pemeriksaan visual mengonfirmasi peta dominan,
label site terbaca setelah resize, CCTV di bawah dan error cache yang jelas.
Artifacts dan build output diabaikan Git.

## Hardware yang benar-benar diuji

Mesin pengembangan mendeteksi **satu display**, bounds 1536 x 864 DIP, workArea
1536 x 816 DIP, scale 1.25 dan rotasi 0. Angka ini hasil deteksi lokal, bukan
konfigurasi atau konstanta aplikasi. Adapter yang dilaporkan: Intel UHD Graphics,
NVIDIA RTX 3050 6GB Laptop GPU dan Microsoft Basic Render Driver. Ini **bukan**
PC deployment RTX 3060 yang disetujui pengguna.

Pengukuran startup/RAM/CPU/RAF dari smoke membuktikan instrumentasi tersedia.
Jendela tersembunyi dan forced crash memengaruhi angka; hasil ini bukan benchmark
rendering, GPU atau kapasitas CCTV. RAF mengukur cadence callback, bukan jumlah
redraw SVG. Tidak ada jumlah maksimum live CCTV yang ditetapkan dari GPU.

## Batas acceptance

Masih terbuka: UAT empat monitor fisik pada PC target, susunan/resolusi/DPI/bezel,
mixed DPI, reconnect, sleep, taskbar, pengujian rendering 100 site/300 edge dan
pengukuran performa jangka panjang. Unit test mock tidak menggantikan uji hardware.

Kontrak API/JSON Schema dan fixture Phase 0 dipertahankan. Backend CRUD/RBAC/publish
dan sinkronisasi desktop tetap Phase 2; media gateway/live CCTV Phase 3;
installer/signing/stable-testing/controlled installation/rollback Phase 4.
Kesiapan policy update tetap tercakup tes Phase 0 dan [runbook release](release-runbook.md),
tetapi distribusi serta rollback belum diuji dan updater tetap nonaktif.

Audit dependency Phase 0 mencatat 13 advisory moderate pada alat pengembangan;
tidak ada dependency eksternal baru pada Phase 1. Rincian dan batas audit tersedia
di [laporan Phase 0](phase-0-verification.md). Temuan belum dinyatakan selesai.

Implementasi dan verifikasi lokal Phase 1 selesai dalam batas tersebut.
Hardware acceptance mengikuti [checklist](phase-1-approval.md); Phase 2 membutuhkan
persetujuan terpisah.
