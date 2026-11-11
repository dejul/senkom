# Phase 1: desktop offline-first

Persetujuan pengguna pada 2026-11-03 mencakup Phase 1 saja. Kontrak REST, JSON Schema
v1, fixture dan seluruh tes Phase 0 dipertahankan. Web Admin tetap satu-satunya
antarmuka pengelolaan data infrastruktur pada Phase 2. Desktop hanya mengubah state
tampilan sementara; tidak mempunyai IPC CRUD/publish, HTTP write atau editor.

## Baseline deployment yang disetujui

| Komponen           | Baseline pengguna                                |
| ------------------ | ------------------------------------------------ |
| OS                 | Windows 11 Pro 64-bit, Build 26300               |
| CPU                | Intel Core i7-12700F, 20 logical processors      |
| RAM                | 16 GB                                            |
| GPU                | NVIDIA GeForce RTX 3060, 12 GB VRAM              |
| Graphics           | DirectX 12, WDDM 3.2                             |
| Display            | 4 monitor, Extend Display                        |
| Belum dikonfirmasi | Resolusi, susunan, orientasi, scaling DPI, bezel |

Baseline ini bukan hasil deteksi mesin pengembangan. Resolusi monitor tidak
dikunci di aplikasi; angka dalam tes adalah fixture mock. Tidak ada batas decoder
atau jumlah live CCTV yang ditetapkan berdasarkan GPU tersebut.

## Display dan layout

`screen.getAllDisplays()` menyediakan id, bounds, workArea, scaleFactor dan rotation.
Semua display dipilih otomatis. Bounds dihitung dalam DIP, termasuk x/y negatif.
Setiap pasangan diperiksa terhadap overlap; luas gabungan harus memenuhi bounding
rectangle tanpa celah. Susunan 1x4, 2x2, vertikal dan tiling berbeda ukuran didukung.

Window frameless memakai bounds gabungan, bukan `setFullScreen(true)`. `thickFrame`
dan shadow Windows dimatikan agar non-client border tidak memperbesar bounds pada
scaling DPI. Pada konfigurasi tidak valid, hanya workArea monitor utama yang dipakai;
jika primary hilang, gunakan display valid pertama. Fallback satu monitor mengikuti
instruksi pengguna terbaru dan menggantikan rencana fallback per-display Phase 0.

Added/removed/metrics-changed memicu reflow dengan debounce 300 ms. Fingerprint
memakai label, ukuran, posisi relatif, skala dan rotasi, tanpa bergantung pada ID OS
atau urutan enumerasi. Fingerprint/configuration change dicatat ke log persisten.
Belum ada UI pemilihan atau penyimpanan mapping subset monitor; seluruh display
selalu dideteksi ulang. Mixed DPI diberi warning sampai lulus uji hardware.

Default pembagian tinggi 5/75/17/3 dengan minimum ruang kontrol pada layar kecil.
Peta tetap dominan. SVG memakai koordinat layout snapshot, bukan piksel monitor.
Filter lapisan, drag pan, wheel/button zoom, keyboard panah/plus/minus/Home,
site/edge selection dan details semuanya read-only. Label site digeser secara visual
ke safe zone display tanpa mengubah koordinat entitas. Garis dan koridor tidak
disimpulkan dari kedekatan/persilangan. Site 05-08 tetap tanpa koneksi sesuai fixture.

## CCTV

`CameraTile` hanya menggambar placeholder metadata, tanpa video, decoder, URL media
atau koneksi jaringan. Dua kamera fixture yang nonaktif tetap terlihat, berlabel
DEMO/PLACEHOLDER/NONAKTIF. Pagination otomatis/manual mengikuti ruang strip; pause
saat hover, keyboard focus, fokus kamera, document hidden atau tombol jeda.
Menutup fokus mengembalikan halaman carousel sebelumnya.

Pada Phase 3, ganti isi `CameraTile` dengan player sesi gateway WebRTC/HLS yang
terautorisasi. Jangan expose RTSP atau secret sumber. Jumlah tile layout bukan batas
decoder; kapasitas stream baru ditetapkan setelah benchmark codec/bandwidth/GPU.

## Cache dan berkas lokal

Direktori runtime: `%APPDATA%\SENKOM` (Electron userData), bukan folder instalasi.

- `demo-map-cache.v1.json`: snapshot published DEMO, revision, savedAt, checksum SHA-256.
- `admin-auth.json`: salt acak dan verifier scrypt; tidak menyimpan PIN plaintext.
- `view-profile.json`: optional konfigurasi tampilan yang diprovisi lokal.
- `logs/desktop.jsonl`, `.1`, `.2`: structured log dengan rotasi 5 MiB per file.

Cache dibatasi 16 MiB sebelum parsing, lalu diperiksa envelope/schema/relasi/revision/
checksum. Write memakai file sementara unik, flush dan rename atomik pada direktori
yang sama. Cache bukan penyimpanan token. Checksum mendeteksi korupsi, bukan signature
atau bukti autentisitas server; Phase 1 hanya menerima `dataOrigin: demo`.

`npm run dev`: gunakan cache valid, atau fixture DEMO eksplisit bila cache belum
ada/ditolak. Status sumber dan warning ditampilkan. `npm run dev:cache`: tidak
memasok fixture; cache invalid/kosong menghasilkan error, bukan peta pengganti.
Restore menampilkan OFFLINE / CACHE DEMO dan DATA TERAKHIR. API fetch, reconnect,
ETag dan atomic swap dari server masuk Phase 2; tidak ada klaim uji outage API nyata.

Profil optional berikut tidak mengubah data peta atau kamera. Tidak ada editor profil
di desktop; Web Admin kelak menerbitkannya. Field tambahan/nilai tidak valid ditolak
dengan log dan default aman. Restart diperlukan setelah provisioning profil.

```json
{
  "rows": { "header": 5, "map": 75, "cctv": 17, "status": 3 },
  "bezelSafeDip": 16,
  "carouselIntervalMs": 10000,
  "carouselSlots": 4
}
```

Rows harus berjumlah 100 dan map minimal 50; interval 3-60 detik, safe margin 0-100 DIP,
slots 1-12. Batas slots ini guard layout sementara, bukan kapasitas CCTV hardware.

## Admin dan keamanan

Asumsi nonblocking: Ctrl+Alt+D membuka prompt PIN/passphrase lokal. Provisioning
melalui `npm run admin:configure` di terminal Windows, input tersembunyi 8-64 karakter
ASCII. Gunakan passphrase panjang. Script menolak menimpa verifier yang sudah ada.
Jika perlu reset, administrator OS harus menghentikan aplikasi, memindahkan verifier
lama ke backup terlindungi, lalu menjalankan provisioning lagi; tidak ada reset IPC.

Verifikasi scrypt dan timing-safe comparison terjadi di main process, maksimal lima
percobaan per menit, satu derivation concurrent, sesi satu menit. Diagnostics/quit
memerlukan sesi yang valid; menutup dialog/crash mengunci sesi kembali dan membatalkan
verifikasi PIN yang masih berjalan. PIN hanya
sementara di input/IPC dan tidak dicatat ke log atau repository. Ini kontrol lokal
prototipe, bukan pengganti Windows account/ACL atau autentikasi backend Phase 2.

Tanpa verifier, diagnostics tetap terkunci dan Alt+F4 dapat menutup prototipe. Setelah
provisioning, close biasa meminta prompt admin. OS shutdown/Task Manager tidak dicegah;
aplikasi bukan OS kiosk lock. Belum ada installer/autostart atau pengaturan Windows.

Bridge lama `window.senkom.getInfo()` tetap kompatibel dengan foundation Phase 0.
`window.senkomViewer` berisi bootstrap/status/frame sample/admin prompt/unlock/
diagnostics/lock/quit yang eksplisit. Semua invoke memvalidasi sender/main frame,
origin dan jumlah argumen; sample telemetry dan PIN dibatasi. Tidak ada generic invoke,
filesystem API, IPC cache write atau CRUD. CSP tetap memblokir jaringan renderer,
inline scripts/eval, embedding dan form navigation; sandbox/context isolation aktif.

## Arti pengukuran

- CPU aplikasi: jumlah percentCPUUsage proses Electron, bukan utilisasi CPU seluruh PC.
- RAM aplikasi: jumlah working set proses dalam MiB, dapat menghitung shared pages lebih dari sekali.
- Memori sistem: free/total dari Electron; bukan pembuktian baseline RAM deployment.
- RAF FPS: cadence requestAnimationFrame pada viewport, bukan jumlah redraw SVG atau benchmark live video.
- Startup: umur main process sampai renderer melaporkan paint peta pertama; fallback ke entry timing bila OS tidak menyediakan creation time.
- GPU: daftar adapter dan feature status; tidak mengklaim GPU load/VRAM usage/decoder capacity.

Sampling CPU/RAM lima detik; renderer melaporkan RAF setiap lima detik, stale setelah
sepuluh detik. Log performance tiap 30 detik; startup, snapshot, auth result, renderer
failure dan display changes langsung dicatat tanpa raw payload/PIN/URL/token.
Renderer boleh reload sekali dalam 60 detik; kegagalan berulang menghentikan proses
dengan exit 1 untuk mencegah crash loop. Supervisor OS tetap Phase 5.

Update patch/minor/major, stable/testing, verifikasi paket, maintenance/admin install
dan rollback tetap mengikuti `release-runbook.md`. Updater nonaktif; perubahan
snapshot tidak menjalankan binary update. Phase 2 menunggu persetujuan baru.
