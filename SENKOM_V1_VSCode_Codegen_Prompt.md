# Prompt Code Generation - SENKOM V1 per batch

Lanjutkan repository SENKOM existing di `D:\BSD\Project\Web\www\senkom`.
Jangan membuat project baru. Phase 0 dan Phase 1 selesai; UAT empat monitor belum selesai.

## Target sesi

```text
TARGET_BATCH: 2A-01
MAX_SESSION_MINUTES: 240
```

Ganti `TARGET_BATCH` untuk sesi berikutnya berdasarkan
[rencana batch](docs/codegen-plan.md). Satu sesi hanya mengerjakan satu ID.
Recovery 2A-00 sudah VERIFIED. Default 2A-01 meneruskan WIP database sesuai audit;
bukan mengulang Phase 1 atau menerima seluruh Phase 2A.
Dokumen ini menjadi prompt ketika pengguna meminta eksekusi batch, bukan izin
menjalankan seluruh Phase 2 sampai Phase 5 sekaligus.

## Instruksi kerja

1. Baca `README.md`, `SENKOM_V1_Technical_Specification.md`,
   `docs/codegen-plan.md`, laporan/checklist fase sebelumnya dan checkpoint aktif.
   Untuk Phase 2A, baca `docs/phase-2-checkpoint.md` dan `docs/phase-2-wip-audit.md`.
2. Periksa source, Git worktree, kontrak, schema, migrations dan tes existing.
   Jangan menghapus perubahan pengguna, data existing atau hasil fase sebelumnya.
3. Cocokkan prerequisite dan acceptance `TARGET_BATCH`. Jelaskan scope singkat,
   file yang terdampak dan pemeriksaan yang akan membuktikan selesai.
4. Catat waktu mulai. Target pekerjaan 1-3 jam termasuk tes. Jika scope melebihi
   target, pecah menjadi batch lebih kecil sebelum implementasi.
5. Gunakan native platform, stdlib, komponen dan dependency existing bila cukup.
   Dependency baru hanya jika diperlukan oleh acceptance, dengan versi kompatibel.
6. Implementasikan hanya scope batch. Pertahankan kontrak API, schema versioning,
   validasi input, auth/RBAC, audit dan error handling. Jangan mematikan tes lama.
7. Desktop tetap view-only; Web Admin mengelola data. FO fisik/core/logical link,
   Power dan layout visual tetap terpisah. DEMO selalu diberi label.
8. Jangan simpan secret di source/frontend/log. CCTV tetap placeholder sampai
   Phase 3 disetujui; tidak ada decoder RTSP langsung di Electron. Updater produksi
   tidak diaktifkan tanpa distribusi, pengujian dan persetujuan yang dipersyaratkan.
9. Jalankan lint, typecheck/build dan tes relevan. Pada gate subphase/fase, jalankan
   seluruh suite relevan, clean build dan smoke lintas aplikasi sesuai rencana.
   Perubahan kontrak wajib regenerate tipe dan contract checks.
10. Pada menit 180 hentikan penambahan fitur. Pada menit 210 siapkan checkpoint jika
    belum lulus. Paling lambat menit 240 tutup sesi dengan laporan yang jujur.
11. Perbarui `docs/phase-N-verification.md` dan `docs/phase-N-approval.md` sesuai bukti.
    Jika belum selesai, simpan `docs/phase-N-checkpoint.md` berisi error, reproduksi,
    file WIP dan langkah pertama sesi berikutnya.
12. Berhenti. Jangan menjalankan batch berikutnya otomatis. Persetujuan fitur dalam
    fase yang sudah diberikan tetap berlaku; Phase 3/4/5 memerlukan persetujuan
    fase terpisah. Deploy, publish release, firewall dan update produksi memerlukan
    izin eksplisit sesuai spesifikasi.

## Output akhir

- ID batch dan status: VERIFIED, WIP/INCOMPLETE atau BLOCKED.
- Hasil yang selesai serta file berubah.
- Perintah, exit code, jumlah tes dan artifact verifikasi.
- Kegagalan/risiko tersisa serta prerequisite yang belum tersedia.
- Checkpoint dan langkah berikutnya yang konkret.

Jangan mengklaim UAT hardware, performa produksi, live CCTV, signing, rollback atau
tes lulus tanpa bukti. Batch yang belum lulus dilanjutkan dengan ID yang sama pada
sesi berikutnya; jangan menganggap limit waktu sebagai alasan melewati acceptance.
