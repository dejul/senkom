# Rencana acceptance parent batch SENKOM

Tanggal: 2026-11-04. Dokumen ini mempertahankan scope dan acceptance criteria
**parent batch** Phase 2-5. [Micro-Batch Plan V2](codegen-microbatch-plan-v2.md)
menjadi **source of truth urutan eksekusi micro-batch** sesuai instruksi penyelarasan
pengguna; label usulan pada V2 merupakan riwayat penyusunan dokumen.
[Spesifikasi teknis](../SENKOM_V1_Technical_Specification.md) tetap mengatur kebutuhan
fungsional dan keamanan V1. Tidak ada scope fitur yang dikurangi.

Kolom child di bawah menautkan setiap parent ke daftar ID V2 tanpa menyalin
deliverable child. Hasil hitung ID aktual: **46 parent**, termasuk recovery 2A-00,
serta **106 child** pada 45 parent tersisa. Baris recovery pada daftar V2 bukan child
baru: total baris eksekusi V2 adalah 107 termasuk recovery historis.

## Status dan langkah berikutnya

- Phase 0 selesai; Phase 1 selesai lokal. UAT empat monitor fisik masih terbuka.
- **2A-00 VERIFIED**, tidak diulang. Parent 2A-01 sampai 2A-11 tetap **WIP**;
  keberadaan kode dan tes recovery tidak otomatis menerima gate parent.
- **Next executable micro-batch: 2A-01a**, hanya pada permintaan eksekusi baru.
  Gunakan [checkpoint](phase-2-checkpoint.md) dan [audit WIP](phase-2-wip-audit.md)
  sebagai bukti status, lalu pilih child sesuai V2.
- Phase 2B/2C belum dimulai. Phase 3-5 belum dimulai dan memerlukan approval fase
  terpisah. Status BLOCKED prospektif pada V2 menandai prasyarat, bukan hasil tes.

## Batas satu sesi micro-batch

**Satu micro-batch per prompt**, termasuk ketika child tersebut merupakan integration
gate. Target **25-60 menit**, batas perencanaan **90 menit** termasuk inspeksi,
implementasi, debugging, waktu tunggu, tes dan handoff. Estimasi tidak menjamin
pemakaian kuota; jangan mengasumsikan Codex dapat membaca persentase usage quota.

| Waktu     | Aturan                                                                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Awal sesi | Baca checkpoint aktif, definisi child, acceptance parent dan bagian spesifikasi/kontrak yang relevan. Periksa file serta tes existing. |
| Menit 45  | Evaluasi sisa scope dan bukti yang belum tersedia. Jangan menarik pekerjaan sibling.                                                   |
| Menit 60  | Siapkan checkpoint bila berisiko tidak selesai; fokus hasil dan gate terfokus.                                                         |
| Menit 90  | Hentikan sesi, simpan status aktual dan handoff. Jika belum lulus, INCOMPLETE; sesi berikutnya melanjutkan ID yang sama.               |

Jika scope tidak muat dalam 90 menit, catat kebutuhan pemecahan sebelum coding;
jangan memperkecil acceptance atau memberi status selesai demi batas waktu.
Hardware/signing dan soak panjang dipisahkan dari sesi coding; jangan menunggu
semalaman. Proses uji diberi timeout. Tes yang belum dijalankan dicatat NOT RUN,
bukan lulus; tes yang terputus dicatat INCOMPLETE.

## Gate, dependency dan checkpoint

1. Ikuti urutan child dalam parent menurut V2. Parent berikutnya hanya dimulai
   setelah parent sebelumnya VERIFIED; jangan mengerjakan sibling atau parent
   berikutnya otomatis. Gate parent hanya dieksekusi pada child yang memang
   ditugaskan untuk integrasi/penutupan, bukan ditambahkan setelah child lain.
2. **Micro-batch gate:** scope kecil selesai, tes positif/negatif terfokus dan
   lint/typecheck modul terdampak lulus, perubahan terdokumentasi, checkpoint tersimpan.
   Full regression tidak wajib setiap child kecuali perubahan/dependency lintas modul
   memerlukannya. Tes keamanan, schema validation dan contract checks terdampak
   tetap wajib; perubahan kontrak diikuti regenerate tipe.
3. **Parent gate:** seluruh child VERIFIED, scope/acceptance asli pada tabel di bawah
   terpenuhi, seluruh suite integrasi dan smoke relevan lulus. Child terakhir saja
   tidak cukup untuk menerima parent bila sibling/gate belum lulus. Pada child
   penutup, prasyarat adalah semua child sebelumnya; setelah pengujiannya lulus,
   catat child dan parent sesuai bukti, tanpa dependency terhadap dirinya sendiri.
4. **Phase/subphase gate:** seluruh parent/subphase selesai; full regression relevan,
   lint/typecheck, build semua aplikasi, smoke lintas aplikasi, dokumentasi dan
   approval lengkap. Kegagalan kritis menahan gate berikutnya. Hardware/signing
   tidak boleh dianggap lulus dari mock, dan clean-checkout build tetap harus dibuktikan.
5. Gate 2A-11 dengan child penutup **2A-11b** membuka 2B; gate 2B-09 dengan
   **2B-09b** membuka 2C; gate 2C-05 dengan **2C-05b** menutup Phase 2.
   Gate Phase 3 adalah **3-06 / 3-06b**; Phase 4 **4-07 / 4-07b**;
   Phase 5/V1 **5-07 / 5-07c**. Approval menuju Phase 3/4/5 tetap terpisah.
6. Pertahankan kontrak, tes Phase 0/1, WIP yang benar, perubahan pengguna dan data
   existing. Schema tidak kompatibel memerlukan versioning dan bukti kompatibilitas.
   DB hanya instance testing dengan executable/port/datadir terverifikasi;
   migration down hanya pada DB disposable, bukan senkom_test berisi hasil smoke.
7. Desktop tetap view-only; Web Admin mengelola data. FO fisik/core/logical link,
   Power dan layout terpisah; DEMO berlabel, bukan telemetry produksi. CCTV
   placeholder sampai fase gateway disetujui; tidak ada decoder RTSP di Electron.
   Secrets tidak masuk source/frontend/log. Deploy, publish release, akses secret
   operasional, perubahan jaringan/firewall dan instalasi produksi memerlukan izin
   eksplisit; updater produksi tidak diaktifkan sebelum gate distribusi/pengujian.
8. Simpan checkpoint **setiap micro-batch**, termasuk yang VERIFIED, dan laporan
   pada docs/phase-N-verification.md dengan judul ID child. Approval hanya diperbarui
   untuk gate yang benar-benar tercapai. Setelah laporan, berhenti.

Status resmi: NOT STARTED, WIP, INCOMPLETE, VERIFIED, BLOCKED. VERIFIED membutuhkan
bukti tes aktual. BLOCKED berarti prerequisite eksternal belum tersedia; jangan
mengarang hasil. Child kondisional seperti 5-03c/5-06b tidak memaksa optimasi/fix
tanpa masalah terukur: dokumentasikan hasil evaluasi dan bukti bila tidak perlu edit.

Checkpoint minimum: ID child dan parent, waktu mulai/selesai, status, scope selesai,
file berubah, keputusan kontrak/configuration, perintah/exit code/jumlah tes/artifact,
error dan reproduksi, prerequisite eksternal, serta langkah pertama sesi berikutnya.

## Catatan penyelarasan dan keputusan terbuka

- Prompt root masih memuat aturan parent/240 menit dan membaca seluruh spesifikasi;
  README/checkpoint/audit masih menyebut next pada level parent 2A-01. File tersebut
  di luar izin edit tugas ini. Untuk eksekusi, gunakan V2 dan Section 15-16 terbaru:
  next child **2A-01a**, maksimal 90 menit. Jangan menjalankan prompt lama tanpa
  penyesuaian eksplisit. Penyelarasan file-file tersebut memerlukan tugas terpisah.
- **Keputusan pengguna 2026-11-05 untuk 2A-02b:** frasa V2 "faulty core ditolak"
  berarti menolak alokasi core faulty ke jalur aktif sambil tetap menyimpannya
  sebagai inventaris. Draft boleh menyimpan perubahan kondisi untuk diperbaiki;
  validasi/publikasi menolak path faulty/unknown. Parent 2A-03 tetap mewajibkan
  penolakan alokasi faulty/unknown.
- Gap audit tetap terbuka: rollback migration, representasi parent kabel/segmen FO,
  CablePatch.oneOf, auth scope, concurrency draft, failure injection publish dan
  negosiasi schema. Status WIP tidak berubah karena pembaruan dokumentasi.

## Phase 2A: database dan API

Urutan normal mengikuti ID. **2A-00 VERIFIED** menurut
[laporan recovery](phase-2-verification.md). Batch 2A-01 sampai 2A-11 masih WIP;
gunakan matriks audit agar kode yang benar tidak dibuat ulang.

| Parent | Child micro-batch V2                                                                | Scope dan hasil                                                                                                                  | Gate wajib                                                                                                      |
| ------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 2A-00  | VERIFIED; historis tanpa child                                                      | Audit WIP, petakan file/tes ke batch, tangani kegagalan HTTP smoke dan Composer yang sudah diketahui. Tidak menambah fitur baru. | Baseline tersimpan; kegagalan diketahui punya reproduksi dan perbaikan teruji sebelum melanjutkan implementasi. |
| 2A-01  | [2A-01a, 2A-01b, 2A-01c](codegen-microbatch-plan-v2.md#parent-gate-mapping)         | Kontrak administratif serta migration/model site, device, port, geography/metadata terpisah dari koordinat kanvas.               | MySQL terisolasi: migrate/rollback, FK, unique, seed DEMO dan pemisahan metadata publik.                        |
| 2A-02  | [2A-02a, 2A-02b, 2A-02c, 2A-02d](codegen-microbatch-plan-v2.md#parent-gate-mapping) | Kabel/segmen FO, core individual, terminasi dan splice. Tidak membuat logical allocation otomatis dari gambar.                   | Kapasitas core, nomor ganda, salah endpoint, splice ambigu dan referensi lintas site ditolak.                   |
| 2A-03  | [2A-03a, 2A-03b, 2A-03c](codegen-microbatch-plan-v2.md#parent-gate-mapping)         | Logical link Ring A/B dan path core berurutan; status alokasi dihitung dari relasi valid.                                        | Konflik alokasi, path terputus, core faulty/unknown dan terminasi tidak cocok ditolak.                          |
| 2A-04  | [2A-04a, 2A-04b, 2A-04c](codegen-microbatch-plan-v2.md#parent-gate-mapping)         | Kabel/sirkuit Power, source/load, main/backup, koridor dan keanggotaan kabel eksplisit.                                          | Jenis terminal, kontinuitas path, relasi sumber/beban dan pemisahan FO/Power diuji.                             |
| 2A-05  | [2A-05a, 2A-05b, 2A-05c](codegen-microbatch-plan-v2.md#parent-gate-mapping)         | Auth Web Admin, CSRF, RBAC, viewer token terbatas, expiry/revoke dan audit auth.                                                 | HTTP nyata: cookie/session, login/logout, rate limit, 401/403/419, tidak ada secret bocor.                      |
| 2A-06  | [2A-06a, 2A-06b, 2A-06c, 2A-06d](codegen-microbatch-plan-v2.md#parent-gate-mapping) | REST CRUD administratif memakai model/validator yang sudah lulus; pagination, audit dan error envelope.                          | Setiap resource diuji; referential delete ditolak, transaksi gagal tidak meninggalkan perubahan parsial.        |
| 2A-07  | [2A-07a, 2A-07b](codegen-microbatch-plan-v2.md#parent-gate-mapping)                 | Layout node/edge terpisah; GET/PUT draft dan optimistic concurrency.                                                             | Save/reload sama; ID/waypoint valid; stale If-Match menimbulkan konflik tanpa overwrite.                        |
| 2A-08  | [2A-08a, 2A-08b](codegen-microbatch-plan-v2.md#parent-gate-mapping)                 | Agregasi validasi draft dan publish snapshot immutable secara atomik.                                                            | Draft tidak terlihat viewer; publish tanpa validasi ditolak; failure injection menjaga pointer lama.            |
| 2A-09  | [2A-09a, 2A-09b](codegen-microbatch-plan-v2.md#parent-gate-mapping)                 | History revision dan rollback publikasi terotorisasi; audit tetap immutable.                                                     | Revision lama dapat dibaca; rollback tidak mengubah snapshot; role dan map scope diuji.                         |
| 2A-10  | [2A-10a, 2A-10b, 2A-10c](codegen-microbatch-plan-v2.md#parent-gate-mapping)         | Published Map API, metadata yang diizinkan, checksum/ETag dan negosiasi schema.                                                  | 200/304, hash byte respons, schema lama/baru, viewer tidak bisa write atau membaca draft.                       |
| 2A-11  | [2A-11a, 2A-11b](codegen-microbatch-plan-v2.md#parent-gate-mapping)                 | Gate 2A: rapikan dokumentasi setup/migration/seeding, OpenAPI/shared types, bukti seluruh backend.                               | Seluruh tes backend/kontrak, HTTP smoke, lint/typecheck/build lulus; laporan 2A tersedia.                       |

Batch 2A-05 mencakup migration/model pengguna dan token yang belum tersedia.
CRUD hanya dibuka setelah auth dan validator terkait lulus.
**Phase 2B tidak dimulai sebelum 2A-11 VERIFIED.**

## Phase 2B: Web Admin visual editor

Gunakan React dan komponen yang sudah ada. Library editor baru hanya ditambahkan
jika kebutuhan yang diuji tidak cukup ditangani oleh native SVG atau dependency existing.

| Parent | Child micro-batch V2                                                        | Scope dan hasil                                                                                 | Gate wajib                                                                                             |
| ------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 2B-01  | [2B-01a, 2B-01b](codegen-microbatch-plan-v2.md#parent-gate-mapping)         | Login/logout, typed API client, error states dan kerangka sidebar/canvas/properties.            | CSRF/session nyata, role UI, unauthorized state; tanpa token admin di localStorage.                    |
| 2B-02  | [2B-02a, 2B-02b](codegen-microbatch-plan-v2.md#parent-gate-mapping)         | Canvas read-only awal: zoom/pan/fit, grid, layer, search/select, label dan simbol.              | Snapshot API tampil benar, viewport responsif, keyboard dapat mengakses kontrol.                       |
| 2B-03  | [2B-03a, 2B-03b](codegen-microbatch-plan-v2.md#parent-gate-mapping)         | Tambah/pindah node, snap-to-grid, edit properti site, delete dengan konfirmasi, undo/redo node. | Pointer dan keyboard; satu drag menjadi satu aksi undo; tidak menulis DB tiap pointer move.            |
| 2B-04  | [2B-04a, 2B-04b](codegen-microbatch-plan-v2.md#parent-gate-mapping)         | Tambah koneksi, routing orthogonal, edit waypoint, select/delete edge dan undo/redo edge.       | Endpoint mengikuti node; waypoint tidak mengubah kabel/core; operasi batal dapat dipulihkan.           |
| 2B-05  | [2B-05a, 2B-05b, 2B-05c](codegen-microbatch-plan-v2.md#parent-gate-mapping) | Form perangkat/port dan properti FO: kabel, core, terminasi, splice, logical link.              | Referensi memakai ID API; error alokasi tampil; gambar bukan sumber konektivitas fisik.                |
| 2B-06  | [2B-06a, 2B-06b](codegen-microbatch-plan-v2.md#parent-gate-mapping)         | Form properti Power dan koridor; main/backup, source/load dan penggunaan jalur bersama.         | Validasi relasi Power tampil; perubahan visual tidak mengubah sirkuit.                                 |
| 2B-07  | [2B-07a, 2B-07b, 2B-07c](codegen-microbatch-plan-v2.md#parent-gate-mapping) | Save Draft, Validate, Publish dan konflik concurrent editing.                                   | Dirty state, kegagalan simpan, error validasi dan 409 tidak membuang perubahan lokal.                  |
| 2B-08  | [2B-08a, 2B-08b](codegen-microbatch-plan-v2.md#parent-gate-mapping)         | Preview published, history dan kontrol rollback sesuai role.                                    | Preview memakai revision immutable; rollback terkonfirmasi dan tercatat; draft tetap terpisah.         |
| 2B-09  | [2B-09a, 2B-09b](codegen-microbatch-plan-v2.md#parent-gate-mapping)         | Gate 2B: tes alur editor sampai publish menggunakan API nyata dan dokumentasi operator.         | Seluruh UI/kontrak/backend regression lulus; screenshot desktop/narrow diperiksa; laporan 2B tersedia. |

**Phase 2C tidak dimulai sebelum 2B-09 VERIFIED.**

## Phase 2C: sinkronisasi desktop

| Parent | Child micro-batch V2                                                | Scope dan hasil                                                                                                                  | Gate wajib                                                                                                                                         |
| ------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2C-01  | [2C-01a, 2C-01b](codegen-microbatch-plan-v2.md#parent-gate-mapping) | Provisi origin HTTPS dan token viewer pada main process; proteksi Windows safeStorage/OS, isolasi renderer/IPC, dan rotasi aman. | Origin invalid, path lintas-origin, dan redirect ditolak; token tidak masuk renderer/IPC/log; startup, fallback, dan multi-monitor tetap berjalan. |
| 2C-02  | [2C-02a, 2C-02b](codegen-microbatch-plan-v2.md#parent-gate-mapping) | GET published snapshot, schema/checksum/ETag, version compatibility; timeout request dan batas ukuran respons wajib pada 2C-02a. | 200/304, checksum mismatch, schema tak dikenal, unauthorized, timeout/abort, dan respons berlebih diuji.                                           |
| 2C-03  | [2C-03a, 2C-03b](codegen-microbatch-plan-v2.md#parent-gate-mapping) | Restore cache, write atomik, swap revision tanpa restart; render schema kompatibel termasuk label/simbol.                        | Invalid data/write failure mempertahankan peta lama; first-run unavailable tidak berubah menjadi DEMO produksi.                                    |
| 2C-04  | [2C-04a, 2C-04b](codegen-microbatch-plan-v2.md#parent-gate-mapping) | Sinkronisasi berkala tanpa overlap, backoff, offline/last-sync dan recovery koneksi.                                             | API putus/pulih, revisi baru, token kedaluwarsa; carousel dan interaksi peta tetap berjalan.                                                       |
| 2C-05  | [2C-05a, 2C-05b](codegen-microbatch-plan-v2.md#parent-gate-mapping) | Gate Phase 2: integrasi editor-publish-desktop, seluruh regresi dan laporan akhir.                                               | Lint, typecheck, build, seluruh tes, Electron smoke; view-only, placeholder dan mock multi-monitor tetap lulus.                                    |

Realignment Option B disetujui pengguna pada 2026-11-19: timeout request dan batas ukuran respons dipindahkan dari acceptance 2C-01 ke 2C-02a karena fetch HTTP published baru dimulai pada 2C-02a. Keduanya tetap wajib, bukan penghapusan kontrol. Parent 2C-01 harus VERIFIED berdasarkan kriteria revisi sebelum 2C-02a dimulai. Fetch HTTP published atau sinkronisasi tidak boleh dikirim tanpa kedua kontrol yang sudah diimplementasi dan diverifikasi.

Phase 2 selesai hanya setelah 2A-11, 2B-09 dan 2C-05 VERIFIED. Perbarui
`docs/phase-2-verification.md` dan `docs/phase-2-approval.md`, lalu berhenti sebelum Phase 3.

## Phase 3: CCTV melalui media gateway

Prerequisite: Phase 2 diterima, Phase 3 disetujui, sumber stream lab dan akses gateway
tersedia. Streaming sintetis dilabeli; kredensial kamera aktual tidak dimasukkan ke repo.

| Parent | Child micro-batch V2                                                     | Scope dan hasil                                                                                                                                            | Gate wajib                                                                                                    |
| ------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 3-01   | [3-01a, 3-01b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Pilih/provisi gateway lab, dokumentasikan versi, codec dan format browser yang didukung.                                                                   | Satu stream lab tersedia melalui WebRTC/HLS; tidak ada decoder RTSP di Electron.                              |
| 3-02   | [3-02a, 3-02b, 3-02c](codegen-microbatch-plan-v2.md#parent-gate-mapping) | Penyimpanan sumber kamera privat, form admin dan sesi playback scoped/short-lived.                                                                         | RBAC, expiry, origin, secret canary; metadata viewer tidak memuat kredensial RTSP.                            |
| 3-03   | [3-03a, 3-03b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Satu player gateway pada komponen kamera, state loading/live/error dan cleanup.                                                                            | Autoplay muted, cancel/unmount, invalid session dan stream unsupported diuji.                                 |
| 3-04   | [3-04a, 3-04b, 3-04c](codegen-microbatch-plan-v2.md#parent-gate-mapping) | Integrasi carousel/focused view; hanya tile terlihat memakai sesi/decoder, retry/backoff per kamera.                                                       | Pause/focus/restore; satu feed gagal tidak mengganggu feed lain atau peta.                                    |
| 3-05   | [3-05a, 3-05b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Benchmark lab dan PC target: CPU/RAM/GPU/codec/bandwidth serta variasi jumlah stream.                                                                      | Kapasitas dari pengukuran, bukan VRAM saja; jika hardware tidak tersedia, gate hardware tetap BLOCKED.        |
| 3-06   | [3-06a, 3-06b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Gate Phase 3: reconnect/expiry/outage regression, runbook gateway dan hasil benchmark. 3-06a mengevaluasi desain dan penempatan active-session revocation. | Tes lintas aplikasi lulus; cakupan stream sintetis vs aktual dijelaskan; persetujuan menuju Phase 4 terpisah. |

## Phase 4: installer dan update terkontrol

Prerequisite: Phase 3 diterima dan Phase 4 disetujui. Installer/install/rollback diuji
pada VM atau PC testing yang disepakati. Produksi tidak menjadi lingkungan eksperimen.

| Parent | Child micro-batch V2                                                     | Scope dan hasil                                                                             | Gate wajib                                                                                                                 |
| ------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 4-01   | [4-01a, 4-01b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Packaging Windows/NSIS dan version metadata; pisahkan installation directory dari userData. | Install/uninstall lab, aset/preload tersedia, cache/config tidak terhapus.                                                 |
| 4-02   | [4-02a, 4-02b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Signing dan verifikasi paket/publisher dengan secret store yang disetujui.                  | Signature valid/invalid, hash mismatch; tanpa sertifikat tersedia, signing tetap BLOCKED.                                  |
| 4-03   | [4-03a, 4-03b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Feed stable/testing dan metadata rilis pada server lab; policy kompatibilitas API/schema.   | Channel tidak berpindah otomatis; metadata salah/tidak kompatibel ditolak.                                                 |
| 4-04   | [4-04a, 4-04b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Check/download update pada main process, validasi dan status download.                      | Interrupted download, resume/retry terukur, paket korup ditolak; download tidak memicu install.                            |
| 4-05   | [4-05a, 4-05b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Controlled installation patch/minor, maintenance/admin gate, backup sebelum restart.        | Quit biasa tidak menginstal; major tetap ditolak tanpa approval eksplisit; peta tetap tersedia sampai install sah.         |
| 4-06   | [4-06a, 4-06b, 4-06c](codegen-microbatch-plan-v2.md#parent-gate-mapping) | Major compatibility/approval dan rollback manual ke installer signed sebelumnya.            | Backup/restore kompatibel, startup failure recovery, penolakan downgrade tidak aman; tanpa kehilangan cache/config.        |
| 4-07   | [4-07a, 4-07b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Gate Phase 4: release CI/testing channel, failure matrix dan SOP instalasi/rollback.        | Bukti patch/minor/major/signing/rollback lengkap. Publish release atau instalasi produksi tetap memerlukan izin eksplisit. |

## Phase 5: hardening dan acceptance

Prerequisite: fase sebelumnya diterima, Phase 5 disetujui dan jadwal/operator
pengujian perangkat tersedia. Telemetry SNMP/NMS dan kontrol perangkat tetap di luar V1.

| Parent | Child micro-batch V2                                                     | Scope dan hasil                                                                                             | Gate wajib                                                                                                     |
| ------ | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 5-01   | [5-01a, 5-01b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Rapikan logging/retention/health/recovery dan audit keamanan konfigurasi berdasarkan implementasi existing. | Tidak ada secret di log; crash loop, file penuh dan permission failure ditangani.                              |
| 5-02   | [5-02a, 5-02b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Windows autostart dan supervisor terukur di mesin testing; prosedur disable/uninstall.                      | Reboot/login/crash recovery; hotkey admin tetap tersedia; bukan kiosk OS permanen.                             |
| 5-03   | [5-03a, 5-03b, 5-03c](codegen-microbatch-plan-v2.md#parent-gate-mapping) | Benchmark rendering 100 site/300 edge dan startup pada PC target bersama beban CCTV yang terukur.           | Angka CPU/RAM/GPU/FPS/startup dicatat beserta dataset dan kondisi; optimasi hanya untuk bottleneck terbukti.   |
| 5-04   | [5-04a, 5-04b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | UAT empat display: susunan, DPI, bezel, koordinat negatif, reconnect, sleep dan taskbar.                    | Bukti hardware aktual; fallback/restore lulus; resolusi tidak di-hardcode.                                     |
| 5-05   | [5-05a, 5-05b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Siapkan protokol soak test, pengumpulan metrik dan prosedur outage/power-loss/restore di lab.               | Harness/prosedur teruji singkat; pengujian lama dijalankan sesuai jadwal operator, belum diklaim selesai.      |
| 5-06   | [5-06a, 5-06b](codegen-microbatch-plan-v2.md#parent-gate-mapping)        | Analisis hasil soak dan jalankan/verifikasi recovery terjadwal setelah bukti tersedia.                      | Semua durasi/skenario yang disepakati punya hasil; bukti yang belum tersedia tetap BLOCKED.                    |
| 5-07   | [5-07a, 5-07b, 5-07c](codegen-microbatch-plan-v2.md#parent-gate-mapping) | Gate V1: regression/security/release evidence, SOP backup/restore, handover dan checklist deployment.       | Acceptance V1 ditinjau satu per satu; risiko terbuka tercatat; deployment hanya setelah persetujuan eksplisit. |

Tes soak yang melampaui batas 90 menit merupakan pekerjaan eksternal lintas sesi.
5-05 selesai berarti protokol/harness siap, bukan soak lulus. 5-06 baru dimulai
setelah hasil tersedia. Jangan membiarkan satu sesi code generation menunggu semalaman.

## Prompt eksekusi per micro-batch

Gunakan format pada [V2](codegen-microbatch-plan-v2.md#format-prompt-codex-yang-hemat-konteks).
Contoh permintaan berikutnya:

```text
Jalankan hanya micro-batch 2A-01a sesuai docs/codegen-microbatch-plan-v2.md.
Baca status checkpoint aktif, definisi 2A-01a, acceptance parent 2A-01
pada docs/codegen-plan.md, serta spesifikasi/kontrak yang relevan.
Audit WIP existing; jangan membuat ulang implementasi yang benar.
Target 25-60 menit, batas 90 menit termasuk tes terfokus dan laporan.
Simpan checkpoint; jika belum lulus, INCOMPLETE dan lanjutkan ID yang sama.
Jangan menjalankan sibling atau parent berikutnya otomatis.
```

Ganti ID hanya setelah prerequisite V2 dan gate parent terkait terpenuhi.
Awal Phase 3/4/5 tetap memerlukan approval terpisah dan prerequisite eksternal.
