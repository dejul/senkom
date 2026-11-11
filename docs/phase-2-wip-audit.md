# Audit WIP Phase 2A - Batch 2A-00

Tanggal: 2026-11-04 (Asia/Jakarta). Audit recovery **VERIFIED**; keseluruhan
Phase 2A tetap **WIP**. Gate batch 2A-01 sampai 2A-11 belum diterima.
Tidak ada implementasi editor 2B atau sinkronisasi desktop 2C dalam sesi ini.

## Sumber dan file yang diperiksa

- `README.md`, spesifikasi teknis V1, `docs/codegen-plan.md`, checkpoint/checklist
  Phase 2, laporan Phase 1, `docs/database.md`, `docs/api-contract.md` dan
  `docs/architecture.md`.
- `apps/api/database/migrations/2026_11_04_000001_create_infrastructure.php`,
  `apps/api/database/seeders/DemoSeeder.php`, seluruh model di `apps/api/app/Models`.
- `apps/api/app/Services/{InventoryStore,MapRules,MapWorkflow}.php`,
  `apps/api/app/Http/Controllers/{AuthController,MapController}.php`, middleware
  `InfrastructureAccess`, `AdminAccess`, `ViewerAccess`, `AdminCsrf`.
- `apps/api/bootstrap/app.php`, routes API/CLI, konfigurasi app/database/session/
  cache/logging/senkom, Composer dan `apps/api/phpunit.xml`.
- `docs/openapi.json` (43 path, 86 schema), shared types/generated types,
  parser peta, schema published v1/v2 dan content v2.
- `apps/api/tests/{FoundationTest,InfrastructureTest}.php`,
  `tests/map-v2.test.ts`, harness HTTP dan Electron existing.

Git worktree seluruhnya untracked sejak foundation, tanpa commit/remote.
Salinan sebelum perubahan disimpan di `.artifacts/batch-2a00/before/`.
Tidak ada reset, destructive migration, atau penggantian implementasi existing.

## Matriks implementasi

Semua bukti pada tabel berasal dari source yang diperiksa dan pengujian aktual
2A-00. WIP berarti tersedia sebagian implementasi/bukti, tetapi seluruh acceptance
batch belum terbukti. Hasil audit bukan izin menjalankan batch berikutnya otomatis.
Nama tes merujuk `InfrastructureTest.php` kecuali dinyatakan lain.

| Batch | Existing Implementation                                                                                          | Verification                                                                                                                                             | Remaining Work                                                                                                                                                                           | Status |
| ----- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 2A-01 | Migration users/maps/sites/devices/ports, geography/metadata, composite FK, models dan DEMO seeder.              | `test_schema_seed_models_and_computed_allocation`, integrity test dan migrate no-op pada DB existing lulus.                                              | Uji migrate dari DB kosong dan rollback pada DB disposable; lengkapi bukti unique/FK lintas map serta isolasi metadata. Down migration belum dijalankan.                                 | WIP    |
| 2A-02 | `cables`, fiber details/cores/terminations/splices; kapasitas, endpoint dan benturan ujung diperiksa `MapRules`. | Kasus wrong termination, splice conflict, reference dan duplicate identity lulus.                                                                        | Uji kapasitas/nomor core ganda, closure lintas site dan splice ambigu secara khusus. Audit representasi satu kabel fisik dengan beberapa segmen: belum ada relasi kabel induk eksplisit. | WIP    |
| 2A-03 | Logical links Ring A/B, ordered core segments, unique allocation DB dan status turunan.                          | Alokasi konflik, alokasi setelah link dihapus, broken optical path, unique allocation DB lulus.                                                          | Lengkapi kasus core faulty/unknown, arah path, terminasi awal/akhir salah dan konflik port.                                                                                              | WIP    |
| 2A-04 | Power details/circuits, ordered cable membership, terminal source/load dan corridor membership.                  | Fixture valid dan wrong power source ditolak; seluruh resource dapat dibaca/PUT existing row.                                                            | Kasus path Power putus/berurutan, UPS/main/backup, terminal salah dan pemisahan koridor FO/Power perlu tes khusus.                                                                       | WIP    |
| 2A-05 | Session admin, CSRF wajib, RBAC, hashed viewer token dengan expiry/revoke; CLI provisioning dan audit auth.      | PHPUnit role/CSRF/rate limit/expiry/revoke; HTTP nyata session file, login/logout, invalid password, 401/403/419 dan replay cookie setelah logout lulus. | Uji HTTP rate limit, TLS/Secure cookie dan origin deployment; lengkapi pengujian provisioning CLI serta scope antar-map. Kebijakan CORS admin perlu ditetapkan sebelum integrasi UI.     | WIP    |
| 2A-06 | REST resource handlers generik, pagination, validasi draft, transactional replace dan audit.                     | Site create/read/update/delete, referential delete rejection, GET/PUT setiap resource dan rollback transaksi lulus.                                      | CRUD positif/negatif tiap resource belum lengkap. Selesaikan ambiguitas `CablePatch` yang terkonfirmasi pada audit kontrak.                                                              | WIP    |
| 2A-07 | Node/edge terpisah, GET/PUT draft/layout, version/If-Match dan row lock.                                         | Stale If-Match 409, missing If-Match 428, ID/node/coordinate validation dan penyimpanan perubahan lulus.                                                 | Uji round-trip seluruh properti layout/waypoint serta dua editor melalui HTTP; dokumentasikan kontrak ETag endpoint layout.                                                              | WIP    |
| 2A-08 | Draft/validated lifecycle, validasi ulang saat publish, snapshot immutable, pointer dan audit dalam transaksi.   | Publish tanpa validate ditolak; draft tidak muncul di viewer; failure injection mengembalikan pointer/revision lama.                                     | Lengkapi pengujian invalid draft melalui endpoint validate/publish dan failure injection audit/commit; tutup coverage domain dari batch sebelumnya sebelum menerima gate.                | WIP    |
| 2A-09 | Revision list/detail, rollback pointer dengan If-Match, immutable DB triggers dan audit.                         | History, rollback ke snapshot lama, penolakan update/delete revision/audit lulus.                                                                        | Uji rollback tanpa role, revision milik map lain, revision hilang serta kegagalan transaksi rollback secara khusus.                                                                      | WIP    |
| 2A-10 | Published API, schema v2 eksplisit, proyeksi v1, SHA-256 respons, ETag/304 dan viewer bearer scope.              | HTTP 200/304, checksum byte, v1/v2 shared schema; PHPUnit 406 schema tak dikenal/tidak representable dan viewer write/draft denial lulus.                | Uji token antar-map, snapshot tersimpan korup dan seluruh detail viewer; tetapkan batas kompatibilitas v1 dan dokumentasi checksum/envelope.                                             | WIP    |
| 2A-11 | OpenAPI/shared types dan sebagian setup/test tooling tersedia.                                                   | Lint/typecheck/build, 87 tes TS, 25 tes PHP, HTTP/Electron smoke dan Composer strict lulus pada 2A-00.                                                   | Gate 2A-01 sampai 2A-10 belum lengkap; runbook database/API masih foundation; clean-checkout reproducibility belum dibuktikan untuk Phase 2.                                             | WIP    |

## Temuan kontrak dan dokumentasi

1. `docs/openapi.json`, schema `CablePatch`: kedua cabang `oneOf` mengizinkan
   properti umum tanpa mewajibkan `kind`. Ajv membuktikan `{ "lengthM": 10 }`
   cocok dengan cabang 0 dan 1 sehingga ditolak; `{ "kind": "fiber", "lengthM": 10 }`
   diterima. Controller PATCH menggabungkan payload dengan objek existing, sehingga
   kontrak parsial ini perlu diselaraskan pada 2A-06 beserta regenerate tipe dan tes.
   Source kontrak tidak diubah pada recovery ini. Bukti: `schema-audit.log`.
2. `docs/database.md`, `docs/api-contract.md`, `docs/architecture.md` dan beberapa
   bagian README masih mendeskripsikan foundation. Status backend sebenarnya:
   implementation WIP tersedia tetapi opt-in `SENKOM_INFRASTRUCTURE_ENABLED`.
   Default tetap health-only; FoundationTest tetap menguji 404 endpoint operasional.
   Dokumentasi operasional lengkap tetap gate 2A-11, bukan klaim siap produksi.
3. Spesifikasi lama menyebut GPU TBD dan fallback per-display. Instruksi hardware
   Phase 1 dan implementasi yang sudah diterima memakai RTX 3060 sebagai target
   serta fallback satu monitor. Baseline ini dipertahankan; hardware dev berbeda.

Generated contract check membuktikan tipe sesuai OpenAPI, bukan kebenaran seluruh
perilaku endpoint. Tes hijau pada recovery tidak menutup temuan `CablePatch` atau
coverage yang tercatat dalam matriks.

## Perubahan recovery dan batas

- Direktori session/file cache disertakan melalui `.gitignore` agar tersedia pada
  checkout. Harness HTTP mengaktifkan PHP `variables_order=EGPCS` untuk storage
  terisolasi, memakai global Node eksplisit, timeout health dan regresi auth nyata.
- Composer constraint menjadi `^2.6.0`; versi Opis tetap 2.6.0. Seluruh paket dan
  metadata lock tetap sama; hanya `content-hash` berubah.
- Exception handler sempat diberi diagnostik tipe/file/baris dan boolean path,
  tanpa message/stack/request/secret. Instrumentasi sementara sudah dilepas;
  byte file bootstrap dan kedua file tes PHP cocok dengan salinan sebelum sesi.
- Tidak ada perubahan API/schema, migrations/models/services/controllers,
  UI desktop/admin, fixture Phase 0, live CCTV atau updater.

Hasil perintah, akar HTTP 500 dan artifact ada di
[laporan verifikasi](phase-2-verification.md). Berikutnya **2A-01** hanya setelah
permintaan baru; awali dari [checkpoint](phase-2-checkpoint.md).
