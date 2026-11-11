# Rencana database Phase 2

Setup DB/API Phase 2A yang dapat dijalankan ada di [runbook](phase-2a-setup.md).

Target MySQL 8.4 LTS dengan utf8mb4, strict mode, timestamps UTC dan migrasi Laravel.
MariaDB alternatif memerlukan pengujian tersendiri. Tidak ada database, migrasi,
seed DB, atau kredensial aktual dibuat pada Phase 0.

| Kelompok     | Tabel rencana                                           | Invariant utama                                                  |
| ------------ | ------------------------------------------------------- | ---------------------------------------------------------------- |
| Inventaris   | sites, devices, device_ports                            | code unik, device ke site, port ke device                        |
| Kabel fisik  | cables, fiber_cable_details, power_cable_details        | subtype sesuai kind, endpoint FK, panjang nonnegatif             |
| FO           | fiber_cores, fiber_terminations, fiber_splices          | unique(cable_id, core_number), side/port/closure valid           |
| Logical link | logical_links, logical_link_core_segments               | sequence unik per link, kontinuitas/alokasi end-to-end           |
| Power        | power_circuits                                          | source/load terminal, supply type, status source eksplisit       |
| Koridor      | route_corridors, corridor_cables                        | composite unique; shared route tidak disimpulkan dari gambar     |
| Layout       | map_revisions, map_nodes, map_edges                     | draft/published; validasi entity/connection refs sebelum publish |
| Operasi      | cameras, display_profiles, audit_logs, desktop_releases | secret kamera private, audit immutable, channel/version unik     |
| Auth         | users, user_map_roles, scoped tokens                    | policy server-side dan expiry                                    |

Kontrak awal power circuit memiliki `cableIds`; Phase 2 memerlukan relasi berurutan
`power_circuit_cables(circuit_id, cable_id, sequence)` untuk menyimpannya tanpa JSON FK.
Ini memperjelas hubungan rangkaian dengan kabel fisik, bukan status telemetry.

RBAC admin: `users.roles` menjadi batas role global; `system_admin` berlaku untuk
semua map. Editor/publisher memerlukan baris `user_map_roles(user_id,map_id,role)`
untuk setiap map dan role yang diizinkan. PK tiga kolom mencegah duplikat; FK ke
user/map menghapus membership saat induknya dihapus. Tidak ada backfill otomatis:
akun editor/publisher existing harus diberi membership eksplisit melalui
`senkom:map-role {email} {map} {role}` (`--revoke` untuk mencabut).

Publikasi: validasi draft utuh, transaction tulis snapshot immutable + revision + audit,
kemudian pindahkan pointer published secara atomik. Editor mengirim revision/ETag;
konflik tidak boleh menimpa perubahan orang lain. Desktop tidak melihat draft.

FK fisik memakai kebijakan restrict/soft delete sesuai retention yang disepakati;
jangan cascade menghapus histori publikasi atau audit. Polymorphic map references
memerlukan validasi aplikasi dalam transaction. Enkripsi secret kamera server-side,
exclude dari serializer viewer, dan uji canary credential sebelum endpoint dibuka.

Migrasi perlu tes naik/turun di database testing dan backup/restore sebelum produksi.
Fixture JSON Phase 0 bukan seed yang boleh dijalankan terhadap database produksi.
