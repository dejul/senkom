# Verifikasi Phase 0

Tanggal: 2026-11-03 (Asia/Jakarta). Lingkungan: Windows, Node 24.22.2,
npm 11.19.1, PHP 8.4.26, Composer 2.11.1. Pengujian menggunakan data sintetis saja.

| Gate                                              | Hasil                                                                                        |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| ESLint + Prettier + generated contract drift      | Lulus                                                                                        |
| TypeScript strict, termasuk Electron main/preload | Lulus                                                                                        |
| Vitest                                            | 49 tests lulus pada 3 file                                                                   |
| Build Electron main + renderer dan Web Admin      | Lulus                                                                                        |
| PHP syntax lint                                   | Lulus                                                                                        |
| PHPUnit Laravel                                   | 3 tests, 7 assertions lulus                                                                  |
| Composer validate --strict                        | Lulus                                                                                        |
| Composer audit                                    | Tidak ada advisory                                                                           |
| npm audit --omit=dev                              | 0 vulnerabilities                                                                            |
| npm audit seluruh dependency                      | 13 moderate, alat pengembangan; lihat catatan                                                |
| Electron smoke                                    | Launch, sandbox, context isolation, tanpa Node global, satu bridge, CSP network denial lulus |
| Web Admin smoke                                   | Render desktop/mobile 390 CSS px; tanpa horizontal overflow                                  |
| Pemeriksaan secret pada source                    | Tidak ditemukan RTSP URL, private key, atau VITE secret/token/password                       |
| CI remote                                         | Workflow disiapkan; belum dijalankan di hosting                                              |

Screenshot `.artifacts/desktop.png`, `.artifacts/admin.png`, dan
`.artifacts/admin-mobile.png` dihasilkan oleh smoke test dan diperiksa secara visual.
Artifacts/build outputs tidak dimasukkan ke Git.

## Instalasi bersih dan HTTP

Source yang tidak diabaikan Git disalin ke direktori sementara baru, tanpa
node_modules, vendor, dist, cache, .env atau .git. `npm ci` dan `composer install`
menggunakan lockfile yang sama. Lint, contract drift, 49 tes TypeScript, typecheck,
dua build UI dan 3 tes Laravel semuanya lulus kembali dari salinan ini.

`php artisan serve` diuji pada loopback port sementara; `/api/v1/health`
mengembalikan HTTP 200 dan envelope sesuai kontrak. Server uji kemudian dihentikan.
Tidak ada koneksi database atau layanan produksi yang digunakan.

## Catatan dependency

`GHSA-g3hv-75wg-m249`: potensi denial of service akibat globparts amplification di
`minimatch <11.0.1`. npm menghitung 13 paket terdampak langsung/transitif pada ESLint,
typescript-eslint dan openapi-typescript/Redocly. Dependensi ini dipakai untuk build/lint
dan tidak dikirim sebagai kode renderer atau dijalankan API produksi.

Audit penuh tetap exit 1. Jangan memakai glob/spec tidak tepercaya pada toolchain.
`npm audit fix --force` mengusulkan downgrade mayor ESLint/generator; override global
ke minimatch 11 juga tidak kompatibel dengan API callable minimatch 5 milik Redocly.
Pertahankan lockfile sampai upgrade upstream yang kompatibel tersedia, kemudian
jalankan ulang lint, contract generation dan audit. Temuan ini belum dianggap selesai.

## Acceptance V1 yang belum lulus

AC-01/02/05/11: multi-display, kanvas peta, cache/offline dan fallback belum diterapkan.
AC-03/06: otorisasi viewer 403 dan publikasi atomik masih Phase 2.
AC-04: tidak ada stream atau benchmark kamera.
AC-07/08/12: policy baru berupa kontrak; update/signing/rollback belum diuji.
AC-09: autostart/reboot belum diterapkan.
AC-10: schema menolak field kamera tambahan, tetapi endpoint viewer dan gateway
belum ada; keamanan alur kredensial penuh tetap perlu tes Phase 2/3.

Foundation tidak mengklaim acceptance V1 operasional. Tidak ada deploy, release,
firewall change, pemasangan update produksi, atau akses data infrastruktur nyata.
