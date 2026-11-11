# SENKOM Infrastructure Monitoring Center — Technical Specification V1

**Document ID:** SENKOM-SRS-TDS-001  
**Version:** 1.1.0-draft  
**Date:** 2026-11-04  
**Status:** Baseline for code generation; unresolved decisions are marked `TBD`  
**Language:** Indonesian (technical identifiers in English)

## 1. Tujuan dokumen

Dokumen ini menjadi sumber kebenaran awal (*source of truth*) untuk code generation menggunakan Visual Studio Code dan AI coding assistant. Implementasi harus mengikuti acceptance criteria dan tidak menganggap contoh topologi atau angka kamera sebagai data aktual.

### 1.1 Tujuan produk

SENKOM adalah sistem monitoring infrastruktur yang menampilkan **satu peta skematik besar FO + Power** dan **strip/carousel live CCTV di bagian bawah** pada **empat monitor besar** yang terhubung ke **satu PC Windows dalam mode Extend Display**. Desktop bersifat **view-only**. Pengelolaan site, perangkat, kabel, jalur, CCTV, dan layout dilakukan melalui **Web Admin terpisah**. Desktop harus mendukung distribusi update **patch, minor, dan major** secara aman.

### 1.2 Prinsip desain

1. Peta utama mengambil prioritas visual, bergaya *schematic transit map* (seperti peta KRL), bukan peta geografis berskala.
2. FO dan Power berada dalam **satu model peta**, tetapi data jaringan dan jenis koneksinya tetap terpisah.
3. CCTV selalu berada di bagian bawah peta pada layout default; operator dapat memilih kamera untuk melihat detail tanpa mengedit konfigurasi.
4. Ketersediaan layanan monitoring lebih penting daripada instalasi update seketika.
5. Seluruh konten dan kredensial yang disuplai server diperlakukan sebagai data tidak tepercaya.
6. Data infrastruktur tidak dikunci ke koordinat visual; model fisik/logis terpisah dari layout skematik.

## 2. Ruang lingkup

### 2.1 Wajib pada V1 (MUST)

- Desktop Windows berbasis Electron + React + TypeScript, *view-only* dan *kiosk-like*.
- Satu kanvas peta gabungan FO dan Power yang dapat dibentangkan pada empat monitor Extend Display.
- Layout default: header ~5%, peta ~75%, CCTV strip ~17%, status ~3%; persentase dapat dikonfigurasi dan responsif.
- Site, kabel, jalur, splice/terminasi, serta informasi FO/Power dari backend; data demo hanya untuk pengembangan.
- Pan, zoom, filter lapisan, pemilihan node/edge, panel detail non-editable.
- Carousel CCTV live dengan sumber RTSP melalui media gateway yang menyediakan format browser-compatible (WebRTC atau HLS).
- Deteksi kegagalan feed per kamera, retry dengan backoff, dan tidak mengganggu feed lain.
- Web Admin terpisah untuk CRUD infrastruktur, konfigurasi peta, kamera, dan publikasi revisi peta.
- Laravel REST API + MySQL/MariaDB; autentikasi, otorisasi berbasis role, validasi input.
- Penyimpanan snapshot peta terakhir yang valid pada desktop dan indikator **STALE/OFFLINE** saat API gagal.
- Auto-update desktop melalui kanal stable/testing, pemeriksaan versi, download background, validasi, dan instalasi terjadwal/disetujui admin.
- Installer Windows dan pipeline build/release dengan artefak versi, hash, manifest, dan release notes.
- Logging, penanganan error, pengujian otomatis dasar, serta dokumentasi instalasi/operasi.

### 2.2 Tidak termasuk V1 (SHOULD LATER)

- Monitoring SNMP real-time, alarm otomatis dari router/UPS, NMS integration.
- Analisis dampak gangguan otomatis dan rekomendasi rerouting.
- Perekaman CCTV atau video analytics; aplikasi hanya memutar live feed.
- Mobile app, multi-tenant, GIS georeferencing, editor di desktop.
- Otomasi failover FO/Power atau kendali fisik perangkat.

### 2.3 Asumsi dan TBD

- Susunan fisik monitor: `TBD` (1×4, 2×2, atau susunan lain).
- Resolusi, orientasi, scaling DPI dan GPU PC: `TBD`; **jangan hard-code 7680×1080**.
- Akses internet/intranet PC Senkom dan lokasi update server: `TBD`.
- Jumlah kamera, codec, RTSP URLs, hak akses NVR, bandwidth: `TBD`.
- Mekanisme status aktif perangkat: V1 menampilkan status inventaris/manual kecuali integrasi monitoring disepakati.
- Jumlah site dan topologi aktual: `TBD`; gunakan fixtures demo berlabel jelas.
- Identitas perusahaan, logo, jam operasional maintenance, dan SLA: `TBD`.

## 3. Pengguna dan hak akses

| Role | Platform | Hak akses |
|---|---|---|
| `senkom_viewer` | Desktop | GET published map, site/cable details, CCTV playback metadata, status, versi; tidak boleh write |
| `infrastructure_editor` | Web Admin | CRUD draft sites, devices, cables, cores, power, map layout; tidak otomatis publish |
| `publisher` | Web Admin | Validasi dan publish revisi peta; audit |
| `system_admin` | Web Admin | Kelola user, kamera, release policy, konfigurasi sistem |

Semua pembatasan berlaku **di backend**, bukan sekadar menyembunyikan tombol. Akun viewer tidak boleh mendapat hak POST/PUT/PATCH/DELETE untuk data operasional. Endpoint yang diperlukan untuk heartbeat perangkat harus dipisahkan dari hak modifikasi infrastruktur.

## 4. Arsitektur sistem

```text
+-----------------------+       +-------------------------------------+
| Web Admin             | HTTPS | Laravel REST API + Auth + RBAC      |
| React + TypeScript    |<----->| Map publication + audit + config    |
+-----------------------+       +------------------+------------------+
                                                   |
                                            MySQL/MariaDB
                                                   |
+--------------------------------------+           |
| Windows Senkom PC (Electron)         |<----------+
| Main Process: display/update/cache   | HTTPS API (read only)
| Renderer: React schematic + CCTV     |
| 1 window spans rectangular displays  |<---- WebRTC/HLS ----+
+--------------------------------------+                     |
                                                          Media Gateway
                                                             ^ RTSP
                                                       IP Cameras / NVR

Private HTTPS Update Server --> signed release/manifest --> Electron updater
```

### 4.1 Monorepo yang disarankan

```text
senkom/
  apps/
    desktop/           # Electron main/preload + React renderer
    admin-web/         # React + TypeScript
    api/               # Laravel REST API
  packages/
    shared-types/      # API contracts, schemas, domain enums
    map-schema/        # versioned published map format
  infrastructure/
    media-gateway/     # templates, no credentials in repository
    updater/           # release metadata, deployment examples
  docs/
    architecture.md
    api-contract.md
    database.md
    release-runbook.md
    operations-runbook.md
  tests/
    fixtures/
  .env.example
  README.md
```

Tidak harus memakai monorepo tooling kompleks pada V1. Pastikan lockfile, versi Node, PHP, dan toolchain dipin serta terdokumentasi.

## 5. Desktop Windows

### 5.1 Teknologi

- Electron + React + TypeScript + Vite.
- Electron `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` jika kompatibel; preload expose API minimal bertipe.
- Content Security Policy ketat; tidak memuat konten remote arbitrer atau `eval`.
- IPC hanya channel yang di-allowlist, validasi payload dan sender.
- Data lokal tersimpan di folder aplikasi pengguna Windows, bukan dalam instalasi read-only.
- Gunakan satu instance utama aplikasi, hindari multiple launch.

### 5.2 Penempatan empat monitor

- `screen.getAllDisplays()` mengumpulkan `id`, `bounds`, `workArea`, `scaleFactor`, `rotation`.
- Hitung *bounding rectangle* gabungan monitor yang dipilih, termasuk koordinat negatif.
- Buat `BrowserWindow` **frameless** dengan bounds gabungan; jangan mengandalkan `setFullScreen(true)` untuk multi-monitor.
- **Validasi bentuk monitor**: bila area display tidak membentuk persegi panjang kontinu, akan ada area window yang tidak terlihat atau celah. Tampilkan peringatan pada diagnostics dan gunakan fallback *per-display windows* jika perlu.
- Periksa perubahan display (`display-added`, `display-removed`, `display-metrics-changed`); reflow dengan debounce.
- DPI campuran, taskbar, display sleep, dan perubahan urutan monitor harus diuji; penyimpanan mapping menggunakan fingerprint gabungan yang tidak bergantung hanya pada display ID.
- Default *kiosk-like* bukan kiosk OS permanen: sediakan hotkey admin terproteksi untuk keluar/diagnostik.

### 5.3 Layout

```text
+--------------------------------------------------------------------------+
| HEADER: SENKOM | jam | versi | API | CCTV gateway | last sync            |
+--------------------------------------------------------------------------+
|                                                                          |
|                    FO + POWER SCHEMATIC NETWORK MAP                      |
|           Node / routes / labels / legend / read-only details            |
|                                                                          |
+--------------------------------------------------------------------------+
| CCTV [CAM 01 LIVE] [CAM 02 LIVE] [CAM 03 LIVE] ... [CAM N LIVE] [< >]     |
+--------------------------------------------------------------------------+
| STATUS: offline/stale | event messages | build version                   |
+--------------------------------------------------------------------------+
```

- Peta mengisi ruang maksimum tanpa label terpotong di bezel monitor; **bezel-safe zones** dapat dikonfigurasi.
- Carousel berisi thumbnail video live, bukan screenshot statis; jumlah simultan dibatasi berdasarkan GPU/bandwidth.
- Navigasi carousel manual dan otomatis; interval, jumlah feed terlihat, serta pause on interaction dapat diatur oleh admin.
- Mode kamera fokus boleh berupa overlay sementara, lalu kembali ke layout peta utama.
- Operator tidak dapat memindahkan node, menambah edge, mengubah kamera, atau menyimpan layout.
- Keyboard/mouse harus bisa dioperasikan meskipun desktop ditampilkan pada monitor sangat besar.

### 5.4 Cache dan offline

- Cache **snapshot peta yang telah dipublikasikan dan lolos validasi** beserta `revision`, `fetched_at`, `checksum`.
- Saat API tidak tersedia: tampilkan peta terakhir, label `OFFLINE / DATA TERAKHIR ...`, jangan tampilkan status jaringan seolah real-time.
- Cache tidak boleh menyimpan kredensial RTSP atau token jangka panjang dalam teks biasa.
- Setelah reconnect, fetch dan validasi revisi terbaru, lalu swap atomik agar peta tidak setengah terbarui.
- Jika tidak ada cache pada startup pertama dan API gagal: tampilkan layar kegagalan yang informatif, bukan topologi demo yang tampak nyata.

## 6. Model peta dan aturan visual

### 6.1 Jenis node

`site`, `router`, `switch`, `otb`, `odf`, `splice_closure`, `power_panel`, `ups`, `source`, `junction`.

### 6.2 Jenis edge

- `fiber_cable_segment`: segmen fisik FO dan jumlah core.
- `fiber_core_connection`: sambungan core individual, tidak selalu divisualisasikan pada zoom awal.
- `logical_link`: jalur Ring A/B atau konektivitas antarrouter yang memakai core tertentu.
- `power_cable_segment`: kabel Power fisik.
- `power_circuit`: hubungan sumber-ke-beban (PLN/UPS/backup).

**Larangan:** persilangan dua garis tidak berarti terhubung. Node junction/splice/terminasi eksplisit diperlukan. Kabel Power yang berdekatan dengan FO tidak otomatis dianggap berbagi conduit/tray; relasi *shared route* disimpan secara eksplisit.

### 6.3 Visual

| Layer | Default | Line style |
|---|---|---|
| FO Ring A | Biru | Solid |
| FO Ring B | Kuning/amber | Solid |
| Power main | Merah | Dashed |
| Power backup | Hijau | Dotted |
| Inactive | Abu-abu | Desaturated/dashed + status label |

- Garis orthogonal dengan rounded corners opsional; routing manual dari admin dapat override auto-routing.
- Warna adalah identitas layer, bukan satu-satunya penanda status.
- Zoom levels: overview menampilkan site/rute; medium menampilkan panjang kabel/label; detail menampilkan perangkat/port/core.
- Tampilkan legenda dan filter layer; jangan menggambar semua detail core pada overview.
- Gunakan SVG/React Flow custom edges, dengan rendering dan hit testing diuji pada ukuran data nyata.

### 6.4 Skema snapshot publikasi (contoh minimal)

```json
{
  "schemaVersion": 1,
  "revision": "map-2026-11-03-001",
  "publishedAt": "2026-11-03T07:00:00Z",
  "layout": { "width": 4000, "height": 1400, "nodes": [], "edges": [] },
  "layers": ["fo_ring_a", "fo_ring_b", "power_main", "power_backup"],
  "sites": [],
  "cables": [],
  "routes": [],
  "cameras": []
}
```

Skema final harus didefinisikan dengan JSON Schema/Zod dan versioning; jangan menggunakan JSON contoh sebagai kontrak final tanpa validasi.

## 7. Database (konseptual)

Semua tabel utama memiliki primary key, timestamps, dan foreign key yang relevan. Gunakan migrasi Laravel, bukan edit manual skema produksi.

| Table | Fields penting | Catatan |
|---|---|---|
| `sites` | id, code, name, type, description, status | Identitas lokasi |
| `devices` | id, site_id, code, type, model, status | Router/OTB/UPS dll |
| `device_ports` | id, device_id, port_name, port_type, status | SFP, fiber, terminal |
| `cables` | id, code, kind, from_site_id, to_site_id, length_m, status | FO atau Power |
| `fiber_cable_details` | cable_id, total_cores, fiber_type | Atribut FO |
| `fiber_cores` | id, cable_id, core_number, status | Unique(cable_id, core_number) |
| `fiber_terminations` | id, fiber_core_id, port_id, end_side | Hubungan core-ke-port |
| `fiber_splices` | id, from_fiber_core_id, to_fiber_core_id, closure_device_id | Sambungan |
| `logical_links` | id, code, from_port_id, to_port_id, route_name | Link Ring A/B |
| `logical_link_core_segments` | logical_link_id, fiber_core_id, sequence | Path end-to-end |
| `power_cable_details` | cable_id, conductor_count, cross_section_mm2, voltage_v | Atribut Power |
| `power_circuits` | id, code, source_port_id, destination_port_id, supply_type | PLN/UPS/backup |
| `route_corridors` | id, code, name | Koridor fisik bersama |
| `corridor_cables` | corridor_id, cable_id | Relasi kabel dengan koridor |
| `map_revisions` | id, version, status, published_at, published_by | Draft/published |
| `map_nodes` | revision_id, entity_type, entity_id, x, y, style_json | Posisi visual |
| `map_edges` | revision_id, connection_type, connection_id, points_json, style_json | Waypoints |
| `cameras` | id, code, site_id, name, gateway_stream_key, enabled | Jangan expose RTSP credential |
| `display_profiles` | id, name, layout_json, camera_playlist_json | Layout video wall |
| `audit_logs` | id, actor_id, action, entity, entity_id, before_json, after_json | Jejak perubahan |
| `desktop_releases` | id, version, channel, min_api_version, manifest_url, mandatory, published_at | Metadata update |

Aturan domain:

- `total_cores` tidak berarti jumlah core yang tersedia end-to-end.
- Core hanya dianggap available jika alokasi dan sambungan pada semua segmen relevan mengizinkan.
- SFP BiDi dapat memakai satu fiber strand per link, tetapi tidak boleh mengasumsikan seluruh ring hanya memakai dua core pada setiap segmen tanpa data topologi aktual.
- Status Power harus dibedakan antara data inventaris/manual dan telemetry aktual.
- Draft map tidak pernah ditampilkan di Senkom sebelum publish.

## 8. REST API (v1)

Base path: `/api/v1`. Seluruh respons memakai envelope konsisten `{ "data": ..., "meta": ... }` atau `{ "error": {"code":...,"message":...} }`.

### 8.1 Desktop read-only

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/viewer/bootstrap` | Konfigurasi, fitur, profil tampilan |
| GET | `/viewer/map` | Snapshot peta published + revision/ETag |
| GET | `/viewer/sites/{id}` | Detail site dan perangkat |
| GET | `/viewer/cables/{id}` | Detail kabel/core atau Power |
| GET | `/viewer/cameras` | Metadata playback, bukan RTSP password |
| POST | `/viewer/cameras/{id}/playback-session` | Membuat sesi playback terbatas; **bukan** edit konfigurasi |
| GET | `/viewer/health` | Health backend/gateway dari perspektif layanan |
| GET | `/viewer/version-policy` | Versi minimum, kebijakan maintenance |

`POST playback-session` merupakan operasi sesi sementara dan tidak memberikan izin CRUD data infrastruktur; bila kebijakan keamanan mewajibkan GET-only, gunakan gateway session yang diterbitkan server melalui mekanisme alternatif. Token playback berumur pendek dan scoped per stream.

### 8.2 Admin

- CRUD `/admin/sites`, `/admin/devices`, `/admin/ports`, `/admin/cables`, `/admin/fiber-cores`, `/admin/fiber-splices`, `/admin/power-circuits`, `/admin/cameras`.
- `GET/PUT /admin/map/draft` untuk editing; `POST /admin/map/validate` dan `POST /admin/map/publish` untuk publikasi.
- `GET /admin/audit-logs`, `GET/PUT /admin/display-profiles`.
- Gunakan pagination, optimistic concurrency (`revision`/ETag), validasi relasi, dan audit untuk perubahan.

### 8.3 API contracts

- Tulis OpenAPI 3.1 sebagai kontrak utama.
- Gunakan tipe TypeScript yang dihasilkan dari kontrak, bukan definisi manual yang terduplikasi.
- Gunakan `schemaVersion` pada payload peta dan negosiasi kompatibilitas desktop/API.
- Jangan bocorkan IP management, RTSP credentials, atau konfigurasi rahasia ke viewer jika tidak diperlukan.

## 9. CCTV streaming

### 9.1 Pipeline

`RTSP Camera/NVR -> Media Gateway -> WebRTC (preferred low latency) / HLS (fallback) -> Electron Renderer`.

- Browser/Electron tidak mendukung RTSP langsung sebagai video URL biasa.
- Gateway dapat memakai MediaMTX atau solusi lain yang diuji; pilih satu pada implementation spike.
- Gunakan substream kamera untuk carousel, main stream untuk focused view bila tersedia.
- Tetapkan batas jumlah decoder simultan berdasarkan benchmark PC dan GPU.
- Player per kamera mengelola state `connecting`, `live`, `reconnecting`, `offline`, `unauthorized`.
- Retry exponential backoff dengan jitter; tidak membuat loop request agresif.
- Autoplay muted; tidak memutar audio semua kamera bersamaan.
- Media URLs/token tidak ditulis ke log dan tidak dikirim ke renderer lebih lama dari perlu.
- Semua koneksi gateway terenkripsi jika melintasi jaringan yang tidak tepercaya; atur segmentasi jaringan kamera.

### 9.2 Carousel

- Playlist dikonfigurasi admin; default auto-advance, manual prev/next, pause on focus.
- Tidak otomatis memulai semua stream kamera yang tidak terlihat.
- Kamera offline menampilkan tile status; tidak menghilangkan posisi kamera secara diam-diam.
- Jika kamera fokus ditutup, kembali ke posisi carousel sebelumnya.

## 10. Update dan release management

### 10.1 Versioning

SemVer `MAJOR.MINOR.PATCH`, contoh `1.0.0`, `1.0.1`, `1.1.0`, `2.0.0`.

- Patch: bugfix/security compatible.
- Minor: fitur backward-compatible.
- Major: perubahan tidak kompatibel dan memerlukan review migration/rollout.

### 10.2 Teknologi dan distribusi

- `electron-builder` untuk installer NSIS Windows.
- `electron-updater` untuk cek versi dan download paket dari **private HTTPS update endpoint** yang mendukung manifest/metadata sesuai provider.
- Code signing Windows untuk installer dan update; kredensial signing hanya di CI secret store.
- Stable dan testing release channels, rollout terkontrol; jangan mengganti versi stable dengan testing secara tidak sengaja.
- Metadata release berisi version, channel, sha512/hash, signature sesuai updater, release notes, min API version, publish timestamp.
- Update server dapat intranet atau internet; lokasi final `TBD`.

### 10.3 Kebijakan instalasi

1. Desktop cek update saat startup dan berkala (interval configurable, contoh 6 jam).
2. Download background hanya jika jaringan dan kebijakan mengizinkan.
3. Verifikasi signature/hash sebelum siap instal.
4. **Jangan** restart otomatis saat pemantauan aktif. Instal hanya pada maintenance window atau setelah persetujuan admin.
5. Simpan snapshot map/config dan status update sebelum restart.
6. Setelah instal, lakukan health check: startup, API schema compatibility, map renderer, playback initialization.
7. Jika gagal, tampilkan status dan gunakan **prosedur rollback teruji** (installer previous stable + restore config). `electron-updater` bukan mekanisme rollback otomatis.
8. Major update memerlukan persetujuan eksplisit, backup, compatibility check, dan runbook.

### 10.4 Kompatibilitas

- API wajib mendukung desktop versi stable yang sedang terpasang selama jendela migrasi yang ditetapkan.
- Gunakan additive changes dahulu; deprecation period sebelum breaking changes.
- Jika backend mengharuskan versi desktop baru, jangan mematikan peta cache tanpa alasan keamanan yang kritis; tampilkan banner `UPDATE REQUIRED`.
- Pisahkan **data updates** (publish map tanpa reinstall) dari **binary updates** (installer baru).

### 10.5 Operasional

- Autostart setelah login Windows ke akun Senkom, bukan service interaktif Session 0.
- Jika aplikasi crash, restart melalui mekanisme supervisor/task scheduler yang terukur; cegah crash loop.
- Catat update attempt, downloaded, installed, failed, previous/current version, reason, timestamp.
- Jangan mengirim update tanpa backup dan verifikasi di mesin testing.

## 11. Keamanan

- HTTPS/TLS untuk API dan update; gunakan sertifikat tepercaya.
- Desktop hanya mendapatkan token viewer scoped/short-lived; gunakan Windows DPAPI atau penyimpanan rahasia OS bila perlu menyimpan token.
- Laravel Sanctum/token atau mekanisme auth yang disepakati; RBAC server-side dan rate limiting.
- CORS dibatasi; CSRF pada admin web berbasis cookie; CSP pada desktop.
- Tidak pernah mengirim RTSP username/password asli ke desktop renderer.
- Audit semua CRUD dan publish; akses update/release dipisahkan dari operator.
- Update artifacts ditandatangani, diverifikasi, dan diunduh dari origin tepercaya.
- Jangan simpan `.env`, secret, token, sertifikat signing, dan password kamera di repository.
- Lakukan dependency scanning dan backup database terjadwal.

## 12. Non-functional requirements

Target awal berikut **usulan**, harus disesuaikan setelah benchmark hardware:

| Area | Target awal / pengujian |
|---|---|
| Startup | Tampilan peta cache muncul ≤ 15 detik pada PC target (setelah login, tanpa menunggu jaringan) |
| Map | Pan/zoom responsif pada dataset uji minimal 100 site dan 300 edge |
| CCTV | Minimal 8 substream simultan diuji; jumlah final mengikuti benchmark GPU/codec |
| Recovery | Satu stream putus tidak merusak stream lain atau peta |
| API outage | Cache tetap tampil, indikator offline muncul ≤ 30 detik setelah deteksi kegagalan |
| Update | Download tidak mengganggu renderer; restart hanya saat disetujui/maintenance |
| Display | Uji empat monitor, termasuk perubahan DPI/urutan/reconnect |
| Logging | Structured logs dengan rotation, tidak mencatat secret |

Target performa tidak dijamin sebelum spesifikasi PC dan jaringan diketahui.

## 13. Acceptance criteria (Given / When / Then)

**AC-01 Multi-display:** Given 4 monitor Extend Display yang membentuk bidang persegi panjang, when aplikasi startup, then satu window borderless menutupi gabungan area monitor sesuai konfigurasi, dan layout map/CCTV tidak terpotong oleh perubahan resolusi.

**AC-02 Main map:** Given published map valid, when desktop online, then peta FO + Power gabungan ditampilkan dan peta mengisi area terbesar layar.

**AC-03 View only:** Given token `senkom_viewer`, when operator menggunakan UI atau mencoba endpoint write, then UI tidak menyediakan editing dan backend menolak mutasi infrastruktur dengan 403.

**AC-04 CCTV:** Given stream gateway tersedia, when carousel menampilkan kamera, then tile live dimainkan, kamera yang offline ditandai, dan feed lain tetap berjalan.

**AC-05 Offline:** Given peta pernah disinkronkan, when API terputus, then snapshot terakhir tetap tampil dengan indikator stale/offline yang jelas.

**AC-06 Publish:** Given editor mengubah draft, when belum publish, then desktop tetap menggunakan revisi lama; setelah publish dan sync, desktop menampilkan revisi baru secara atomik.

**AC-07 Patch update:** Given versi 1.0.0 dan patch 1.0.1 stable tersedia, when update dicek, then download dapat berlangsung di background dan instalasi menunggu maintenance.

**AC-08 Major update:** Given versi major baru, when rilis diterbitkan, then desktop tidak melakukan instalasi tanpa approval dan compatibility checks.

**AC-09 Restart:** Given PC restart dan login akun Senkom, when autostart berjalan, then konfigurasi monitor, peta cache, dan carousel dipulihkan.

**AC-10 Security:** Given RTSP credentials tersimpan server-side, when viewer meminta daftar kamera, then respons tidak mengandung username/password RTSP.

**AC-11 Display fallback:** Given display arrangement tidak persegi panjang atau monitor terlepas, when layout terdeteksi tidak valid, then aplikasi memberikan diagnostik dan fallback yang aman, bukan blank tanpa pesan.

**AC-12 Release rollback:** Given update menyebabkan kegagalan startup, when operator mengikuti runbook, then versi stabil sebelumnya dapat dipasang ulang tanpa kehilangan snapshot/config yang kompatibel.

## 14. Testing strategy

- Unit: schema validation, geometry union/bounds, role policies, update state machine, carousel logic.
- Integration: Laravel API + database migrations, publish atomicity, auth, viewer 403 write, playback session.
- Contract: OpenAPI vs TypeScript client dan snapshot `schemaVersion`.
- Desktop E2E: Electron launch, offline cache, fullscreen bounds, hotkey admin, renderer recovery.
- Media: simulasi stream offline, reconnect, timeout, codec unsupported, gateway restart.
- Release: signed installer, patch/minor/major update di testing channel, downgrade recovery manual.
- Hardware acceptance: 4 monitor sebenarnya, mixed DPI test, GPU load, CPU/RAM, stream count, reboot, power outage.

## 15. Tahapan implementasi untuk code generation

Phase 0 selesai; Phase 1 selesai secara lokal dalam batas laporan verifikasi.
UAT empat monitor fisik masih terbuka. Phase 2-5 mengikuti **satu micro-batch per
prompt**, bukan satu parent besar atau seluruh fase per sesi.

[Micro-Batch Plan V2](docs/codegen-microbatch-plan-v2.md) menjadi **source of truth
urutan eksekusi**. [Parent-batch acceptance plan](docs/codegen-plan.md) mempertahankan
scope, acceptance criteria, dependency dan gate asli serta tautan parent ke child.
Pemecahan eksekusi tidak mengubah kebutuhan fungsional/keamanan pada Section 1-14
atau pertanyaan deployment pada Section 17.

| Phase/subphase | Parent | Urutan dan gate |
|---|---|---|
| Phase 0 | Selesai | Foundation, toolchain, kontrak dan fixture DEMO; pertahankan tes. |
| Phase 1 | Selesai lokal | Desktop offline-first, multi-display mock, peta/carousel placeholder, cache dan diagnostics; UAT hardware terbuka. |
| Phase 2A | 2A-00 sampai 2A-11 | Database, auth/RBAC, inventory, draft/validate/publish, history/rollback dan published API. Child V2; 2A-11b menutup gate parent 2A-11. |
| Phase 2B | 2B-01 sampai 2B-09 | Editor React, node/edge/waypoint, properti FO/Power, undo/redo, concurrency dan publikasi. Child V2; 2B-09b menutup gate 2B-09. |
| Phase 2C | 2C-01 sampai 2C-05 | Viewer client, schema/checksum, cache/swap, sync/offline. Child V2; 2C-05b menutup gate 2C-05 dan Phase 2. |
| Phase 3 | 3-01 sampai 3-06 | Gateway, playback session, player/carousel, recovery dan benchmark. Child V2; 3-06b menutup gate 3-06. |
| Phase 4 | 4-01 sampai 4-07 | Installer/signing, stable/testing, download/verification, controlled install, major/rollback. Child V2; 4-07b menutup gate 4-07. |
| Phase 5 | 5-01 sampai 5-07 | Hardening, autostart, performance, UAT display, soak/recovery, SOP/handover. Child V2; 5-07c menutup gate 5-07/V1. |

**2A-00 VERIFIED**, tidak diulang. Parent 2A-01 sampai 2A-11 tetap WIP menurut
[audit](docs/phase-2-wip-audit.md); 2B/2C dan Phase 3-5 belum dimulai.
**Next executable micro-batch: 2A-01a**. Baca status pada
[checkpoint](docs/phase-2-checkpoint.md), lalu pilih child V2; rujukan next 2A-01
pada checkpoint lama berarti parent, bukan izin mengerjakan seluruh parent.

Setiap parent tersisa memiliki child V2; recovery historis 2A-00 dikecualikan.
Hitungan aktual: 46 parent termasuk recovery, 106 child pada 45 parent tersisa.
Ikuti urutan child dan dependency antarparent. Phase 2B menunggu gate 2A-11
VERIFIED, Phase 2C menunggu 2B-09 VERIFIED. Selesainya child penutup saja tidak
membuka fase berikutnya jika sibling atau gate parent masih belum lulus.
Phase 3/4/5 memerlukan penerimaan fase sebelumnya dan approval fase terpisah.

### 15.1 Execution budget

- Target **25-60 menit per micro-batch**, batas perencanaan **90 menit**, mencakup
  inspeksi, implementasi, debugging, download/waktu tunggu, tes dan laporan.
- Menit **45**: evaluasi sisa pekerjaan dan bukti; jangan menarik scope sibling.
- Menit **60**: siapkan checkpoint bila berisiko tidak selesai.
- Menit **90**: hentikan sesi, simpan status aktual dan handoff. Jika gate belum
  lulus, gunakan INCOMPLETE dan lanjutkan ID yang sama pada sesi berikutnya.
- Jangan mengasumsikan Codex dapat membaca persentase usage quota. Estimasi waktu
  tidak menjamin kuota; jangan mengganti gate atau melonggarkan tes untuk mengejarnya.
- Jika scope tidak muat dalam batas perencanaan, catat kebutuhan pemecahan sebelum
  coding. Jangan menjalankan parent besar atau membuat roadmap pengganti diam-diam.
- Soak panjang dilakukan lintas sesi: setup dan analisis bukti menjadi child berbeda.
  Hardware/signing yang belum tersedia diberi BLOCKED; mock bukan bukti hardware.

### 15.2 Definition of Done

**Micro-batch gate:** scope kecil selesai; tes positif/negatif terfokus serta
lint/typecheck modul terdampak lulus; perubahan terdokumentasi dan checkpoint
tersimpan. Jalankan tes keamanan, schema validation dan contract checks yang
terdampak; regenerate tipe bila kontrak berubah. Full regression hanya bila
integration gate atau dampak perubahan memerlukannya, bukan setiap micro-batch.

**Parent batch gate:** seluruh child VERIFIED; scope dan acceptance asli pada
parent-batch plan terpenuhi; seluruh suite integrasi dan smoke relevan lulus.
Pada child penutup, semua child sebelumnya harus lulus terlebih dahulu; bukti
child penutup menyelesaikan gate tanpa dependency siklis terhadap dirinya sendiri.
Kode existing atau tes recovery saja tidak mengubah parent WIP menjadi VERIFIED.

**Phase/subphase gate:** seluruh parent/subphase selesai; full regression relevan,
lint/typecheck, build semua aplikasi, smoke lintas aplikasi, dokumentasi dan approval
lengkap. Reproducible build dari clean checkout tetap wajib sebelum gate fase
diterima. Prasyarat hardware/signing tidak dianggap lulus tanpa bukti aktual.

Semua level mempertahankan kontrak dan tes Phase 0/1. Tidak ada hardcoded secrets,
token admin di desktop atau RTSP password di renderer; DEMO tidak menyamar sebagai
data produksi. README/runbook sesuai hasil aktual. Laporan mencatat ID child/parent,
waktu, file berubah, perintah/exit code/jumlah tes/artifact, error/reproduksi,
risiko/prasyarat dan langkah berikutnya. Simpan checkpoint setiap child, termasuk
VERIFIED, serta perbarui docs/phase-N-verification.md; approval hanya untuk gate
yang benar-benar tercapai. Tes NOT RUN atau INCOMPLETE tidak boleh disebut lulus.

## 16. Instruksi wajib untuk AI coding assistant

1. Baca status dan next step pada checkpoint fase aktif.
2. Baca definisi micro-batch yang diminta pada [V2](docs/codegen-microbatch-plan-v2.md).
3. Baca acceptance criteria dan dependency parent pada [parent plan](docs/codegen-plan.md).
4. Baca hanya bagian spesifikasi dan kontrak yang relevan dengan perubahan.
5. Periksa file implementasi dan tes existing sebelum mengubahnya; periksa worktree
   atau inventaris aman bila belum ada commit. Jangan membuat ulang WIP yang benar.
6. Perluas inspeksi hanya bila dependency atau perubahan lintas modul memerlukannya.
   Tidak ada kewajiban membaca seluruh repository/dokumentasi pada setiap sesi.
7. Jalankan **satu micro-batch per prompt**. Jangan menjalankan sibling, parent gate
   yang tidak diminta, parent berikutnya atau seluruh fase otomatis. Phase 0/1 dan
   recovery 2A-00 tidak diulang; next 2A-01a menunggu permintaan eksekusi.
8. Sebelum edit, jelaskan singkat scope, dependency/asumsi, file terdampak dan
   acceptance yang diuji. Bila TBD/konflik memblokir atau memerlukan perubahan
   acceptance/arsitektur, catat dan minta keputusan pengguna; jangan mengganti diam-diam.
   Keputusan tidak memblokir boleh memakai konfigurasi fleksibel dengan asumsi tercatat.
9. Ikuti batas 25-60/90 menit pada Section 15.1. Simpan checkpoint setiap child dan
   berhenti setelah laporan. VERIFIED wajib memiliki bukti; jangan mengubah
   acceptance criteria untuk menghemat token atau mengklaim tes lulus tanpa menjalankannya.
10. Gunakan tes bertingkat pada Section 15.2. Jangan menjalankan full regression
    setiap child kecuali integration gate/dampak perubahan menuntutnya. Jangan
    melewati tes keamanan, schema validation, contract checks atau tes lama terdampak.
11. Perubahan API/map schema harus versioned sesuai kompatibilitas; periksa desktop
    stable, regenerate shared types dan jalankan contract checks. Sertakan tes,
    migrasi, tipe, validasi, logging, error states dan dokumentasi sesuai modul berubah.
12. Pisahkan FO fisik, core, logical ring, Power dan layout visual. Desktop tetap
    view-only, tanpa write/edit infrastruktur melalui UI maupun IPC tersembunyi.
13. Jangan mengklaim RTSP live untuk placeholder atau status manual sebagai telemetry.
    Tidak ada decoder RTSP langsung di Electron; batas fitur dan gate CCTV tetap.
14. Jangan gunakan API/library deprecated; periksa kompatibilitas versi sebelum
    memasang dependency. Pertahankan kode/data existing dan tes Phase 0/1.
15. Jangan memasukkan kredensial, IP privat nyata atau site produksi ke seed/DEMO;
    secrets tidak boleh masuk source/frontend/log. Jangan mengakses secret operasional
    tanpa izin eksplisit. DB testing diverifikasi executable/port/datadir sebelum
    digunakan; migration down hanya pada DB disposable khusus.
16. Jangan deploy, publish release, mengubah jaringan/firewall atau memasang update
    produksi tanpa persetujuan eksplisit. Updater produksi tetap menunggu distribusi
    dan pengujian siap. Approval Phase 3/4/5 tetap terpisah.
17. Pertahankan acceptance/security requirements Section 1-14 dan 17. Konflik
    dokumentasi di luar scope dicatat pada parent plan; V2 mengatur urutan eksekusi,
    bukan menggantikan kebutuhan domain atau mengizinkan perubahan arsitektur.

## 17. Pertanyaan terbuka sebelum deployment produksi

1. Susunan 4 monitor (1×4 / 2×2), resolusi masing-masing, skala DPI, dan bezel.
2. Spesifikasi PC Senkom: CPU, GPU, VRAM, RAM, OS build, NIC, jumlah output video.
3. Akses PC ke API/media gateway/update server (internet/intranet/VPN).
4. Jumlah kamera, codec H.264/H.265, bitrate, substream, kredensial NVR, latensi yang dapat diterima.
5. Data site, FO/core, power circuit, dan hubungan yang benar secara fisik.
6. Lokasi backend, kebijakan backup, sertifikat TLS, dan penanggung jawab release approval.
7. Apakah operator boleh mengubah mode kamera sementara atau semua tampilan dikunci oleh admin.
8. Jadwal maintenance window, target uptime, serta mekanisme emergency security patch.

---

**Status baseline:** Spesifikasi ini cukup untuk memulai code generation bertahap dan membuat prototype desktop tanpa data produksi. Penerapan pada ruang Senkom memerlukan penyelesaian TBD dan pengujian hardware nyata.
