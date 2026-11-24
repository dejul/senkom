# Kontrak awal API v1

`openapi.json` adalah kontrak utama OpenAPI 3.1. Tipe pada
`packages/shared-types/api.generated.d.ts` dihasilkan dengan openapi-typescript.
JSON Schema snapshot dipakai langsung Ajv; tidak ada salinan schema untuk frontend.

Endpoint yang berjalan sekarang: `GET /api/v1/health`, public process liveness.
Berhasil: `{ "data": { "status": "ok", "phase": 0 }, "meta": { "apiVersion": "1", "schemaVersion": 1 } }`.
Error memakai `{ "error": { "code": "HTTP_404", "message": "Resource not found." } }`.
Respons tidak menyertakan exception text, stack trace, request, atau secret.

OpenAPI awal mencakup map, camera metadata, version policy, model domain, dan roles.
Endpoint rencana ditandai `x-implementation-phase`; bukan jaminan implementasi.
Daftar endpoint V1 lengkap tetap mengikuti spesifikasi bagian 8. Sebelum Phase 2,
perluas OpenAPI untuk bootstrap/site/cable/health viewer, admin CRUD, pagination,
draft validation/publication, optimistic concurrency, dan audit.
Playback-session POST dibakukan Phase 3 setelah gateway/auth dipilih.

Micro-batch 3-02a adds private source persistence only through internal
`CameraSourceStore` operations. It adds no HTTP endpoint or OpenAPI field. RTSP URLs
and credentials remain encrypted at rest and excluded from model JSON/arrays,
published snapshots, viewer API payloads, and Desktop-compatible cache data. Admin
source forms/RBAC remain 3-02b; playback sessions remain 3-02c.

Micro-batch 3-02b adds `/admin/cameras/{id}/source?mapId=<map>` under existing Admin cookie/CSRF. GET returns only `mapId`, `cameraId`, `configured`, `enabled`, `sourceType`, `updatedAt`; editor/publisher may read on granted maps. POST creates, PUT explicitly replaces URI, PATCH changes only `enabled`, and DELETE removes source without deleting camera; mutations require `system_admin`. POST/PUT accept a write-only `sourceUri` and never return it, its host, credentials, or ciphertext. PUT requires a new nonempty URI; PATCH omits URI and preserves ciphertext. Empty or masked replacement is rejected. Missing/out-of-scope maps return 403 before camera lookup; missing cameras/sources on allowed maps return 404. Source changes apply privately without draft publish; viewer and snapshot schemas remain unchanged. Gateway connection and playback sessions remain 3-02c or later.

## Otorisasi rencana

| Role                  | Hak operasional                                | Batas                                      |
| --------------------- | ---------------------------------------------- | ------------------------------------------ |
| senkom_viewer         | GET published data dan sesi playback sementara | Tidak dapat CRUD infrastruktur             |
| infrastructure_editor | CRUD draft dan layout                          | Tidak otomatis publish                     |
| publisher             | Validate/publish dan audit publikasi           | Bukan pengelola user/release               |
| system_admin          | User, kamera, display/release policy           | Persetujuan release terpisah dari operator |

Matriks ini belum berupa middleware. Phase 2 wajib membuktikan viewer mendapat 403
untuk POST/PUT/PATCH/DELETE operasional, bukan hanya menyembunyikan tombol.
POST playback-session adalah sesi terbatas, bukan hak write data infrastruktur.
Desktop token viewer berada di main; renderer hanya menerima data publik.
Admin cookie auth memerlukan CSRF dan CORS origin allowlist; belum dibuka pada Phase 0.
Admin `system_admin` berlaku global. `infrastructure_editor` dapat membaca dan
menulis draft hanya pada map yang memiliki membership role tersebut; `publisher`
dapat membaca, memvalidasi, publish/rollback, dan membaca audit hanya pada map
yang memiliki membership `publisher`. User dengan kedua role dapat memperoleh
role berbeda pada map berbeda. Role global `users.roles` tetap menjadi batas atas.
Map di luar scope dan ID map yang tidak ada sama-sama menghasilkan 403 `FORBIDDEN`
tanpa detail keberadaan map; resource ID yang tidak ada pada map yang diizinkan
menghasilkan 404. Viewer bearer hanya membaca snapshot map token dan write 403.
Camera GET mengikuti izin baca map; POST/PUT/PATCH/DELETE Camera hanya untuk
`system_admin` pada map yang ada. Editor dan publisher mendapat 403 `FORBIDDEN`
tanpa perubahan draft, audit, atau snapshot viewer.
`GET /admin/map-layouts` mengembalikan ETag draft saat ini. `PUT /admin/map-layouts`
memerlukan nilai itu pada `If-Match`; nilai lama menghasilkan 409 `DRAFT_CONFLICT`,
header hilang menghasilkan 428 `PRECONDITION_REQUIRED`, tanpa mutation atau audit.

`PATCH /admin/cables/{id}` memakai `CablePatch.anyOf`: field umum boleh dikirim
sendiri tanpa `kind`; field FO dan Power boleh parsial tetapi tidak boleh dicampur.
`kind` bila dikirim harus cocok dengan field subtype pada payload. Server
menggabungkan patch dengan kabel tersimpan, lalu memvalidasi kabel lengkap;
perubahan subtype yang tidak konsisten tetap ditolak.

## Snapshot

- `schemaVersion: 1`, revision opaque, timestamp RFC3339, `status: published`.
- `dataOrigin: demo` membutuhkan `demoLabel` berawalan DEMO.
- ID entitas berbeda dari layout node ID. Node mereferensikan site/device.
- Cable adalah union fiber/power. Core, termination, splice, logical path, circuit,
  corridor dan visual edge disimpan terpisah. Core segment list bersifat berurutan.
- Edge core connection mereferensikan splice atau termination secara eksplisit.
- `additionalProperties: false` menolak field tak dikenal, termasuk secret tambahan.
- Validator tidak mengubah input dan tidak memasukkan nilai payload ke pesan error.
- API harus membatasi ukuran respons/request sebelum parsing; array maxima schema
  adalah batas struktur sementara, bukan hasil benchmark produksi.

Perubahan schema yang ditolak client lama dianggap breaking meski menambah field
(schema memakai closed objects). Gunakan versi schema baru atau negosiasi eksplisit;
dukung stable lama selama jendela migrasi. Viewer mengembalikan 406 jika schema
diminta tidak didukung atau revisi aktif tidak dapat diproyeksikan ke v1;
client mempertahankan cache kompatibel terakhir. Snapshot published yang gagal
checksum, parse JSON, atau validasi schema v2 menghasilkan 503
`SNAPSHOT_UNAVAILABLE`, tanpa payload peta atau ETag. ETag/If-None-Match untuk revisi peta,
304 tanpa body; draft tidak pernah menjadi respons viewer. Implementasi atomic
publication dan checksum cache masuk fase berikutnya.
