# Persetujuan dan checklist Phase 1

Phase 1 disetujui pengguna pada 2026-11-03 melalui instruksi Hardware Baseline.
Persetujuan mencakup pengembangan dan verifikasi lokal, bukan deployment atau Phase 2.

- [x] Foundation, toolchain pin dan kontrak awal Phase 0 diterima.
- [x] Scope desktop offline-first disetujui: peta DEMO, pan/zoom/filter/details, cache dan carousel placeholder.
- [x] Baseline PC deployment dicatat: Windows 11 Pro Build 26300, i7-12700F, 16 GB RAM, RTX 3060 12 GB, DX12/WDDM 3.2.
- [x] Target empat Extend Display; runtime tidak hardcode resolusi, posisi atau ukuran piksel monitor.
- [x] Fallback satu monitor untuk susunan tidak valid mengikuti persetujuan terbaru.
- [x] Fixture Phase 0 tetap sintetis dan label DEMO selalu tersedia.
- [x] Desktop view-only; backend/Web Admin operasional tidak ditambahkan.
- [x] Hotkey Ctrl+Alt+D memakai PIN lokal, rate limit dan expiry; provisioning via terminal.
- [x] Diagnostik CPU/RAM/GPU/RAF/startup/failure/display-change ditambahkan.
- [x] Tes geometri mock, cache, UI, security dan tes Phase 0 dipertahankan.
- [x] Lint, typecheck, build, 84 tes TypeScript dan 3 tes Laravel lulus lokal.
- [x] Smoke membuktikan peta/carousel, read-only, display detection/reflow, admin dan renderer recovery.
- [x] Startup cache-only, cache korup dan cache kosong diuji.
- [ ] Konfirmasi susunan, resolusi, DPI, orientasi dan bezel empat monitor aktual.
- [ ] UAT fisik pada PC Senkom RTX 3060, termasuk mixed DPI/reconnect/sleep/taskbar.
- [x] Phase 2 disetujui terpisah melalui prompt pengguna pada 2026-11-04; pengerjaan mengikuti batch kecil.

Hotkey/PIN merupakan keputusan implementasi sementara karena kebijakan admin belum
dirinci. Ini bukan persetujuan backend auth atau OS kiosk permanen. Lihat
[operasi Phase 1](phase-1.md) dan [hasil verifikasi](phase-1-verification.md).

## TBD sebelum fase berikutnya

- Sumber data fisik FO/core/Power yang sah dan penanggung jawab validasi.
- Backend/DB hosting, authentication, assignment role, CORS/CSRF dan TLS.
- Kebijakan admin lokal final, identitas visual dan batas interaksi operator.
- Kamera, codec, substream, bandwidth, latensi dan gateway (Phase 3).
- Origin stable/testing, signing, release approver, maintenance timezone/window,
  backup/retention/SLA dan emergency patch (Phase 4).

Belum ada izin deploy, publish release, perubahan firewall atau update produksi.
Persetujuan Phase 2 tercatat di [checklist berikutnya](phase-2-approval.md), dengan
[rencana batch](codegen-plan.md). Hardware acceptance empat monitor tetap terbuka.
