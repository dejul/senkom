# Checkpoint Phase 3

## Latest 3-01b finalization (2026-11-23)

Status: **WIP pending PR/CI**. Persisted opt-in browser harness: [`scripts/phase3-gateway-browser-e2e.mjs`](../scripts/phase3-gateway-browser-e2e.mjs), command `npm run test:gateway:e2e`. Node/npm exact repository versions; WebRTC/HLS and full failure matrix rerun, JSON evidence at ignored `.artifacts/phase3-gateway-evidence.json`. Loopback-only gateway, source/browser/container cleanup passed. Invalid HLS path is controlled HTTP 500 on MediaMTX 1.21.4 and remains explicit WARN, not contract PASS. Regression/audit evidence: [verification](phase-3-verification.md#3-01b-persisted-harness-finalization-2026-11-23). PR/CI/postmerge CI pending. Parent 3-01 WIP; 3-02a NOT STARTED.

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
