# Persetujuan dan checklist Phase 2

Pengguna menyetujui Phase 2A, 2B dan 2C melalui lampiran Phase 2 Code Generation
pada 2026-11-04. Pengguna kemudian meminta pemecahan scope agar setiap sesi selesai
sebelum limit lima jam. Persetujuan fitur tetap berlaku; eksekusi memakai satu batch
per sesi menurut [rencana batch](codegen-plan.md), dengan batas internal empat jam.

Status: **Phase 2A WIP, belum diterima; recovery 2A-00 VERIFIED**.
Batch berikutnya **2A-01** menunggu permintaan baru. Baca
[checkpoint](phase-2-checkpoint.md) dan [matriks WIP](phase-2-wip-audit.md).
Phase 2B/2C belum dimulai.

- [x] Repository, spesifikasi, kontrak dan laporan Phase 0/1 diperiksa.
- [x] Baseline lokal: lint, typecheck, build, 84 tes TypeScript dan 3 tes Laravel lulus.
- [x] 2A-00: WIP diaudit, akar HTTP 500 diperbaiki, HTTP smoke dan Composer strict lulus.
- [x] Regresi 2A-00: lint/typecheck/build, 87 tes TS, 25 tes PHP/312 assertions tanpa skip dan Electron smoke lulus; lihat [verifikasi](phase-2-verification.md).
- [ ] Tutup gap per batch pada matriks WIP, termasuk kontrak `CablePatch` (2A-06).
- [ ] Phase 2A: database, API, authorization, draft/validate/publish, history/rollback.
- [ ] Gate 2A-11: seluruh batch 2A, pengujian MySQL/HTTP/kontrak dan laporan selesai.
- [ ] Phase 2B: editor visual, undo/redo, concurrency dan workflow publikasi.
- [ ] Gate 2B-09: seluruh batch 2B, pengujian UI/API dan laporan selesai.
- [ ] Phase 2C: sinkronisasi published map, cache atomik, offline dan penolakan payload.
- [ ] Gate 2C-05: seluruh batch 2C, regresi Phase 0/1, Electron smoke dan dokumentasi akhir selesai.
- [ ] UAT empat monitor fisik pada PC Senkom RTX 3060.
- [ ] Persetujuan terpisah sebelum Phase 3.

## Keputusan implementasi WIP yang perlu diverifikasi

- Schema snapshot v1 dan tes lama tetap tersedia. Metadata/layout baru serta PDU/other
  memakai schema v2; negosiasi eksplisit mencegah payload baru masuk client v1 diam-diam.
- Endpoint operasional diaktifkan melalui konfigurasi setelah database/auth disiapkan.
  Mode foundation tetap 404, sehingga kontrak/test Phase 0 tetap dapat dijalankan.
- MySQL 8.4.11 portable dipakai untuk tes dengan datadir dan port loopback terisolasi.
  Database Laragon tidak diubah. Deployment database tetap memerlukan konfigurasi sendiri.
- Laravel session cookie + CSRF untuk Web Admin; token viewer terbatas untuk desktop.
  Tidak ada token admin pada desktop atau browser localStorage.
- Snapshot published immutable; pointer aktif dipindahkan dalam transaksi beserta audit.
  Perubahan draft memakai If-Match agar penyimpanan tidak menimpa editor lain.
- JSON Schema yang sama dipakai Ajv dan Opis JSON Schema 2.6.0; validator PHP baru
  diperlukan karena Laravel tidak menyediakan validator JSON Schema 2020-12 bawaan.

Tidak termasuk: CCTV live, telemetry perangkat, updater, deployment dan Phase 3.
