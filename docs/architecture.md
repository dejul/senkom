# Arsitektur dan batas Phase 0

Catatan ini mempertahankan keputusan foundation. Implementasi desktop sudah mencapai
Phase 1; rincian terbaru ada di [phase-1.md](phase-1.md). Kontrak REST/schema tetap,
bridge viewer ditambahkan terpisah, dan fallback terbaru memakai satu monitor utama
sesuai instruksi pengguna. Updater/API operasional tetap belum aktif.

## Pemahaman spesifikasi

MUST V1: desktop Electron view-only pada satu PC Windows, empat Extend Display,
satu peta FO+Power, carousel CCTV live di bawah, API Laravel + MySQL, Web Admin
terpisah, RBAC server-side, publikasi revisi, cache tervalidasi, update bertanda tangan,
logging, pengujian, dan SOP. Persentase layout 5/75/17/3 adalah default V1 yang
belum diterapkan di shell fondasi.

SHOULD LATER: SNMP/NMS, alarm/analisis dampak, recording/analytics CCTV, mobile,
multi-tenant, GIS, editor desktop, kendali perangkat dan failover fisik.

TBD: monitor/DPI/bezel, GPU/codec/bandwidth, data aktual, jaringan/TLS, identitas
perusahaan, server update, maintenance, SLA, dan mekanisme persetujuan admin.
Tidak ada TBD yang memblokir build foundation; semua integrasi operasional ditunda.

## Keputusan

1. npm workspaces tanpa orchestrator tambahan. Laravel memiliki Composer lock terpisah.
2. Shell desktop membaca aset build melalui origin lokal `senkom://app/`.
   Preload sandbox hanya expose `getInfo()`. Main memeriksa webContents, main frame,
   URL persis, dan jumlah argumen; tidak ada IPC umum, filesystem API, atau write API.
3. CSP memblokir semua koneksi renderer. Navigasi, window baru, webview, download,
   dan permission ditolak. Phase 1/3 harus menambah allowlist spesifik hanya jika diperlukan.
4. Custom protocol hanya melayani index dan nama aset build; decode/path containment
   menolak traversal. Single-instance lock berlaku. Main tidak menerima URL dari server.
5. Source of truth kontrak API adalah `docs/openapi.json`; snapshot merujuk JSON Schema
   2020-12 di `packages/map-schema/schema/published-map.v1.json`. Tipe API dihasilkan,
   bukan ditulis ulang di frontend. Kontrak IPC lokal bukan model API duplikat.
6. Renderer tidak menerima kredensial, endpoint RTSP, management IP, atau token API.
   Metadata kamera publik hanya ID/nama/site/enabled. Token playback scoped/short-lived
   kelak diterbitkan server; secret permanen tetap backend/gateway/OS secret store.
7. Status inventaris/manual dibedakan dari telemetry. Persilangan garis dan kedekatan
   kabel tidak menghasilkan konektivitas; route corridor harus eksplisit.
8. Laravel tanpa model, migrasi, seed DB, auth, queue, atau CRUD dulu. Database baru
   diperkenalkan Phase 2 beserta migrasi/FK/transaction dan integration tests.
9. Phase 3 / 3-02a stores private CCTV source configuration separately from public
   `Camera` metadata. `camera_sources.source_uri` uses Laravel encryption at rest,
   and its composite map/camera relationship preserves map isolation. The internal
   store has no HTTP retrieval route; snapshots and viewer serializers stay unchanged.
   APP_KEY must be protected and backed up: rotating it makes existing ciphertext
   unreadable unless the operator performs a separately approved re-encryption.
   Before gateway provisioning, enforce approved camera CIDR/host and port allowlists,
   validate resolved addresses at connection time against rebinding, deny loopback,
   link-local, multicast and metadata-service ranges, and restrict gateway egress.

## Alur tanggung jawab fase berikutnya

- Backend: RBAC, validasi fisik dan relasi, draft/publish atomik, audit, kamera private.
- Main desktop: HTTPS viewer client, validasi snapshot, atomic cache swap dalam userData,
  OS-backed token protection, display manager, log rotation, update policy.
- Renderer: peta/pemilihan non-editable, indikator stale/offline, playback terbatas.
- Media gateway: RTSP private menuju WebRTC/HLS; tidak menyalin secret ke snapshot.
- Release service: stable/testing terpisah; artifacts signed, maintenance install gate.

Fase 1 memerlukan union bounds yang menerima koordinat negatif, pengecekan cakupan
rectangular, fallback per-display, debounce perubahan display, fingerprint mapping,
mixed DPI, bezel-safe zones, serta hotkey diagnostik/keluar yang terlindungi.
Shell Phase 0 masih window standar; ukuran 1280 x 800 bukan asumsi video wall.

## Risiko dan bukti yang dibutuhkan

| Risiko                                         | Bukti yang diperlukan                                           | Fase |
| ---------------------------------------------- | --------------------------------------------------------------- | ---- |
| Empat display, negative coordinates, mixed DPI | Unit geometry dan uji perangkat fisik                           | 1, 5 |
| Payload peta tidak dipercaya                   | JSON Schema, relasi, batas ukuran HTTP, publish validation      | 0, 2 |
| Cache korup/outage                             | Atomic write/swap, checksum, failure injection, first-run error | 1, 2 |
| Core tersedia palsu                            | Path, termination, splice, allocation constraints               | 2    |
| H.265/GPU decoder/bandwidth                    | Gateway spike dan benchmark >=8 substream                       | 3    |
| Update menghentikan monitoring                 | Signed testing releases dan maintenance/approval gate           | 4    |
| Rollback kehilangan data                       | Reinstall previous stable + restore compatible snapshot         | 4    |

Target startup <=15 detik, offline <=30 detik, 100 site/300 edge dan delapan stream
belum dinyatakan lulus. CI foundation tidak menggantikan hardware acceptance.
