# Checkpoint Phase 3

## 3-02b postmerge closure checkpoint (2026-11-24)

Status: **WIP — AWAITING CLOSURE MERGE**. PR [#74](https://github.com/dejul/senkom/pull/74) MERGED manual oleh `dejul` pada 2026-11-24 05:55:35 UTC (12:55:35 WIB). Head `51f1dec6937f3084cd26de73967234bd151690ed`; merge SHA `331ebf1e0317a1bce2ad2f13d84c589716d418ed`, ancestor `origin/main` (exit 0). [CI postmerge](https://github.com/dejul/senkom/actions/runs/45336700413), event `push` pada exact merge SHA: 16/16 mandatory PASS, 0 skipped, Composer audit PASS. Review teknis 3-02b PASS; acceptance, actual RBAC matrix, dan batas keamanan ada pada [verifikasi](phase-3-verification.md#3-02b--admin-source-management-2026-11-24). Local Composer audit `--no-cache` timed out (`curl error 28`); local cached audit PASS bukan online evidence. Documentation closure PR awaits manual merge and its postmerge CI. Parent 3-02 WIP; 3-02c NOT STARTED. Tidak ada akses CCTV operasional, gateway provisioning, atau playback.

## 3-02a postmerge closure (2026-11-24)

PR [#72](https://github.com/dejul/senkom/pull/72) MERGED manual pada 2026-11-24 04:35:04 UTC (11:35:04 WIB), head `c016e07015942a710e82e7bf8f7cc4d75f89ceff`, merge SHA `43b10bc00836c8f35d570f494b2eb35c31216aff`. SHA merge adalah ancestor `origin/main` (exit 0). [CI postmerge `45327404103`](https://github.com/dejul/senkom/actions/runs/45327404103) event `push` pada exact merge SHA: 16/16 mandatory PASS, 0 skipped. Tinjauan teknis keamanan PASS; detail di [verifikasi](phase-3-verification.md#3-02a--private-cctv-source-storage-encryption--map-isolation-2026-11-24). Dokumentasi closure ini memerlukan PR dan CI tersendiri sebelum status 3-02a final di `main`. Parent 3-02 WIP; 3-02b READY — NOT STARTED; 3-02c NOT STARTED. CCTV operasional belum diakses.

## Latest 3-02a checkpoint (2026-11-24)

Status: **WIP** on `feature/phase-3`, implementation commit `47d7e0406477d4f4e9258808ef0c505f9c4759d7`, based on `origin/main` / Parent 3-01 merge `a3337e5952badb884d8b44c97fa28278aa738f52`. User explicitly requested only micro-batch 3-02a. Backend storage uses `camera_sources` with Laravel encrypted `source_uri`, composite `(map_id,camera_id)` FK to `cameras`, one source per camera/map, and no HTTP retrieval endpoint. Public snapshot/viewer canaries PASS locally. Details and commands: [verification](phase-3-verification.md#3-02a--private-cctv-source-storage-encryption--map-isolation-2026-11-24).

Local evidence: disposable MySQL 8.4.11 migration lifecycle 109 checks PASS; focused source tests 5 tests / 68 assertions PASS; full PHPUnit 147 tests / 4,225 assertions / 0 skipped PASS. Node 24.22.2/npm 11.19.1 lint, frontend tests, build, Electron smoke, policy tests, and audits PASS. Initial implementation-head PR CI [`45325825194`](https://github.com/dejul/senkom/actions/runs/45325825194) on `428bd4ae1012494c4f2376337234a8e3f9c038f4` passed 16/16 mandatory checks, zero skipped. This checkpoint change requires fresh exact-head CI; manual security review, merge, and postmerge CI remain open. Parent 3-02 remains WIP; 3-02b/3-02c NOT STARTED. No production DB, camera, network, service, or firewall used.

## Latest 3-01b finalization (2026-11-23)

Status: **3-01b VERIFIED; Parent 3-01 VERIFIED — CLOSED** after PR #70 and exact-SHA CI. PR CI `45161863658`; postmerge CI `45163520055`; both 16/16 mandatory PASS, zero skipped. Closure evidence and parent gate: [verification](phase-3-verification.md#parent-3-01-closure-2026-11-24). Harness: [`scripts/phase3-gateway-browser-e2e.mjs`](../scripts/phase3-gateway-browser-e2e.mjs), command `npm run test:gateway:e2e`. Invalid HLS path remains explicit HTTP 500 WARN. 3-02a status changed to WIP in latest checkpoint above.

## 3-01b runtime recovery update (2026-11-23)

Status: **WIP**. Docker Desktop 4.100.0 / Engine 29.9.3, MediaMTX 1.21.4, FFmpeg 6.1.1, Chrome 157.0.8103.79, and task-local Playwright 1.56.1 are available. WebRTC/HLS each decoded 1280×720 H.264 at 25 FPS and rendered frames; negative checks covered source/gateway stop/restart, unavailable stream, MPEG-4 Visual rejection, unavailable HLS, and browser close. All gateway ports were verified loopback-only and cleanup left no containers, publisher, or listeners. Full results: [verification](phase-3-verification.md#3-01b-runtime-recovery-2026-11-23).

3-01b remains **WIP**: invalid HLS path is explicitly rejected but returns HTTP 500; mandatory CI has not run and browser harness/evidence remains task-local. Parent 3-01 remains WIP; 3-02a NOT STARTED. No commit/PR.

## Latest 3-01b preflight (2026-11-23)

BLOCKED sebelum first launch: owner recovery request menyatakan tier gratis berlaku dan authorized acceptance bila terms cocok; agreement belum diterima karena `node_repl` computer-use tool tidak tersedia, sementara skill melarang UI automation fallback. Docker CLI gagal menjangkau kedua named pipe; container/volume/network inventory **NOT RUN**. Listener gateway ports tidak ditemukan. Ubuntu WSL tetap satu-satunya distro. Tidak ada stream/container dijalankan. Lihat [verification](phase-3-verification.md#latest-3-01b-preflight-2026-11-23). Lanjut setelah acceptance resmi selesai dan Docker Engine tersedia.

## Current 3-01b state (2026-11-23)

Status: **BLOCKED** pada Docker Desktop first launch. Docker Desktop 4.100.0 per-user terpasang exit 0; installer, Docker CLI 29.9.3, Compose 5.7.1, dan FFmpeg 6.1.1 `libx264`/RTSP tervalidasi. Docker Engine belum jalan karena subscription agreement belum diterima dan license eligibility belum dikonfirmasi. Chrome/Edge tersedia; Playwright dan test harness belum dibuat. Semua stream/playback/failure/cleanup check **NOT RUN**. Rincian/hash di [verification](phase-3-verification.md#current-3-01b-recovery-status-2026-11-23). Bagian recovery berikutnya mencatat keadaan sebelum installer berhasil.

## 3-01b — recovery host Windows (2026-11-23)

Status: **BLOCKED**; runtime dan test automation belum dimulai. Recovery request mengotorisasi host Windows ini sebagai lab. Windows 11 Home Single Language build 26300 x64, WSL 2.6.3.0/kernel 6.6.87.2, Ubuntu WSL2, hypervisor aktif, RAM 21 GB. Docker Desktop 4.100.0 installer resmi diverifikasi (SHA-256 dan signer Docker Inc.), tetapi instalasi per-user berhenti: ruang C: 3,139 MiB, minimum installer 3,281 MiB. Percobaan install custom D: tetap gagal pada pemeriksaan C:. Tidak ada app, feature, service, reboot, WSL distro, atau Docker data yang diubah.

FFmpeg Gyan 9.1 download lambat; dihentikan. Paket FFmpeg npm terverifikasi menyediakan `libx264` dan RTSP, tetapi binary build 2018 dan tidak dipakai untuk test. Chrome 157/Edge 158 tersedia; Playwright belum dipasang. Runtime MediaMTX, source, playback, failure matrix, dan cleanup **NOT RUN**. Docker Desktop terms belum diterima; project owner perlu memastikan personal/small-business eligibility atau subscription aktif. [Matriks](phase-3-verification.md#3-01b--recovery-preflight-windows-lab-2026-11-23).

Lanjut setelah ruang C: mencukupi, licensing Docker Desktop valid, dan FFmpeg modern dengan `libx264`/RTSP tersedia. Parent 3-01 tetap WIP; 3-02a NOT STARTED. Tidak ada commit/push saat gate BLOCKED.

## 3-01b — synthetic stream dan browser playback (2026-11-23)

Status: **BLOCKED**; implementasi dan runtime test belum dimulai. Branch `feature/phase-3`; baseline `origin/main` dan HEAD `b45b44b82c620c431bd0e6ef72c1796e2235ec7f`; tree bersih sebelum catatan ini. PR #68/#69 MERGED; CI postmerge `45138640928` pada SHA final PASS 16/16 mandatory, 0 skip. Phase 3 lab development disetujui, namun approval tidak mengidentifikasi host ini sebagai lab yang diotorisasi untuk instalasi.

Docker/Compose dan FFmpeg/ffprobe tidak tersedia; ZIP FFmpeg parsial yang tertinggal di `.artifacts/phase3-gateway/` gagal verifikasi integritas dan tidak dipakai. Chrome 157.0.8103.79 dan Edge 158.0.4370.33 tersedia; browser automation belum tersedia/terverifikasi. MediaMTX 1.21.4 dan konfigurasi loopback 3-01a tersedia, tetapi container, stream H.264, WebRTC/HLS, playback, negative tests, dan cleanup **NOT RUN**. Lihat [matriks verifikasi](phase-3-verification.md#3-01b--preflight-terblokir-2026-11-23).

Tidak ada source, database, migration, firewall, service, kamera produksi, atau secret operasional yang diubah. Tidak ada commit/push karena gate BLOCKED. Parent 3-01 tetap WIP dan 3-02a belum dimulai. Prasyarat lanjut: host lab yang diotorisasi menyediakan Docker Engine, FFmpeg ber-encoder `libx264`, serta browser automation; kemudian jalankan ulang 3-01b dari stream sintetis hingga playback browser nyata dan failure matrix.

## 3-01a — media gateway selection dan konfigurasi lab (2026-11-23)

Status: **VERIFIED**. Branch `feature/phase-3-01a` dari `origin/main` `dd498933257b3a48ec2185d8d56038fdae8021c3`; working tree awal bersih. PR #68 MERGED pada `f20f5bb88210c3cffb5bdd9248dec3f8a9eed998`; head `961fc4af6c047da8606cef3c352230a7995d35ef` ancestor `origin/main`. [CI PR `45131572484`](https://github.com/dejul/senkom/actions/runs/45131572484) exact head dan [CI postmerge `45133582969`](https://github.com/dejul/senkom/actions/runs/45133582969) exact merge SHA PASS 16/16 mandatory, 0 skip. Phase 2 CLOSED; final CI `45126428722` PASS 16/16 mandatory, 0 skip. [Approval lab](phase-3-approval.md) eksplisit; Parent 3-01 WIP, 3-01b NOT STARTED.

MediaMTX 1.21.4 dipilih, image Docker Hub dipin ke digest. `infrastructure/media-gateway/compose.yaml` dan `mediamtx.yml` menyiapkan satu path `lab` dengan RTSP/TCP input, WebRTC/HLS output, port host loopback saja, dan admin API/MoQ/protokol lain nonaktif. [README lab](../infrastructure/media-gateway/README.md) memuat setup, batas jaringan/codec, fixture sintetis 3-01b, serta cleanup. Desktop dan API tidak diubah.

Lokal: checksum arsip MediaMTX resmi PASS; startup konfigurasi MediaMTX pada port TCP loopback 18554/18888/18889 PASS, transport invalid ditolak exit 1. Docker Compose standalone v5.8.0 `config --quiet` PASS exit 0; port invalid ditolak exit 1; policy port/volume/path/admin PASS. `npm run lint`, `npm run typecheck`, dan `npm run build` exit 0. Docker Engine, Compose runtime, FFmpeg dan playback browser **NOT RUN** karena tool/sumber lab belum tersedia; runtime lab BLOCKED sampai tersedia. Tidak ada benchmark atau klaim hardware. [Matriks](phase-3-verification.md#3-01a--media-gateway-selection-dan-konfigurasi-lab).
