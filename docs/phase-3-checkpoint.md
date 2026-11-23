# Checkpoint Phase 3

## 3-01a — media gateway selection dan konfigurasi lab (2026-11-23)

Status: **WIP** sampai PR merge dan CI postmerge exact SHA PASS. Branch `feature/phase-3-01a` dari `origin/main` `dd498933257b3a48ec2185d8d56038fdae8021c3`; working tree awal bersih. Phase 2 CLOSED, CI final `45126428722` PASS 16/16 mandatory, 0 skip. [Approval lab](phase-3-approval.md) eksplisit; Parent 3-01 WIP, 3-01b NOT STARTED.

MediaMTX 1.21.4 dipilih, image Docker Hub dipin ke digest. `infrastructure/media-gateway/compose.yaml` dan `mediamtx.yml` menyiapkan satu path `lab` dengan RTSP/TCP input, WebRTC/HLS output, port host loopback saja, dan admin API/MoQ/protokol lain nonaktif. [README lab](../infrastructure/media-gateway/README.md) memuat setup, batas jaringan/codec, fixture sintetis 3-01b, serta cleanup. Desktop dan API tidak diubah.

Lokal: checksum arsip MediaMTX resmi PASS; startup konfigurasi MediaMTX pada port TCP loopback 18554/18888/18889 PASS, transport invalid ditolak exit 1. Docker Compose standalone v5.8.0 `config --quiet` PASS exit 0; port invalid ditolak exit 1; policy port/volume/path/admin PASS. `npm run lint`, `npm run typecheck`, dan `npm run build` exit 0. Docker Engine, Compose runtime, FFmpeg dan playback browser **NOT RUN** karena tool/sumber lab belum tersedia; runtime lab BLOCKED sampai tersedia. Tidak ada benchmark atau klaim hardware. [Matriks](phase-3-verification.md#3-01a--media-gateway-selection-dan-konfigurasi-lab).
