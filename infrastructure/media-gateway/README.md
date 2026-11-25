# Media gateway lab — 3-01a

**Terpilih:** MediaMTX 1.21.4, image `bluenviron/mediamtx:1.21.4` dipin ke digest pada `compose.yaml` (Docker Hub, 2026-11-23). MediaMTX menerima RTSP/TCP dan menyediakan WebRTC serta HLS dari satu server; image resmi dan konfigurasi YAML sederhana cukup untuk satu path lab tanpa transcoder fixture H.264. go2rtc dipertimbangkan, tetapi tidak memberi kebutuhan tambahan yang terbukti untuk scope ini. Pemilihan belum membuktikan playback atau kapasitas.

| Kriteria                    | Keputusan lab                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Transport dan codec         | RTSP/TCP masuk; WebRTC rendah latensi dan HLS fallback keluar. H.264 fixture direncanakan; H.265 perlu uji dukungan client. |
| Autentikasi dan RTSP privat | External HTTP authorization ke Laravel; publisher sintetis dan Viewer playback memakai izin terpisah pada path lab statis.  |
| Docker dan maintenance      | Image resmi versi 1.21.4 dengan digest tetap; file Compose/YAML tidak memerlukan secret atau perubahan service produksi.    |
| Resource                    | Tanpa transcode untuk H.264 lab; CPU/RAM, bandwidth, latensi dan jumlah decoder belum diukur. Tidak ada klaim kapasitas.    |

## Batas lab

`compose.yaml` hanya mempublikasikan port host `127.0.0.1`: RTSP/TCP `8554` untuk publisher sintetis, HLS/HTTP `8888`, WebRTC signaling/HTTP `8889`, dan WebRTC ICE/UDP `8189`. Container memakai network Compose terpisah. Tidak ada admin API, metrics, pprof, recording, atau RTMP/SRT. Path `lab` dan `lab-b` statis, khusus fixture sintetis. MediaMTX meminta external HTTP authorization untuk setiap operasi; Laravel mengizinkan publish hanya dengan credential publisher terpisah dan read hanya dengan token playback terikat path/protokol. Endpoint callback menggunakan `host.docker.internal:8000`, cocok hanya saat API lab berjalan di host pada port 8000. Jangan jalankan file YAML langsung pada host atau sambungkan container lain ke network lab. Gateway tetap loopback-only.

RTSP kamera/NVR aktual dan credential tetap di server/gateway privat, bukan Git, metadata viewer, renderer, browser bundle, log, atau snapshot. Tidak ada dynamic source provisioning; konfigurasi hanya membaca publisher sintetis pada path statis, sehingga source URI tersimpan tidak pernah diberikan ke gateway. SSRF/network egress controls tetap wajib sebelum provisioning sumber operasional. Active-session revocation juga wajib sebelum produksi: server/gateway harus dapat menghentikan koneksi terdampak saat Viewer token dicabut, map grant dihapus, atau source dinonaktifkan/dihapus; client cleanup saja tidak cukup. 3-06a mengevaluasi rancangan, penempatan, dan acceptance criteria tanpa menganggap dukungan MediaMTX sebelum diverifikasi. Tidak ada decoder RTSP di Electron. Jangan membuka binding loopback menjadi `0.0.0.0` untuk mengatasi koneksi: deployment remote memerlukan origin tepercaya, autentikasi, TLS untuk signaling/HLS, ICE UDP/TCP/NAT yang dapat dijangkau, dan CORS origin spesifik. WebRTC media terenkripsi; signaling lab ini HTTP loopback. HLS lab HTTP loopback, variant MediaMTX default `lowLatency`; WebRTC diprioritaskan untuk latensi rendah. CORS origins lab eksplisit: `senkom://app`, `http://127.0.0.1:5173`, serta `http://127.0.0.1:8889` untuk browser harness.

Gateway dapat menerima H.264/H.265 dari RTSP, tetapi playback browser/Electron bergantung pada codec client. Fixture 3-01b memakai H.264 `yuv420p`, 1280×720, 25 FPS, tanpa audio; tidak ada transcode pada konfigurasi ini. Browser lab membuktikan WebRTC dan HLS decode/render. MPEG-4 Visual tidak didukung pada WebRTC; H.265 berhasil pada host ini. Jumlah stream simultan belum diuji. Versi dan digest diperiksa terhadap release resmi MediaMTX v1.21.4 serta Docker Hub tag 1.21.4. Lihat [hasil runtime 3-01b](../../docs/phase-3-verification.md#3-01b-persisted-harness-finalization-2026-11-23).

## Setup lab (Docker Engine diperlukan)

Dari direktori ini:

```powershell
docker compose config --quiet
docker compose up -d
docker compose ps
```

Docker Engine, API lab di port 8000, dan port loopback harus tersedia sebelum gateway menerima auth callback. Set `SENKOM_GATEWAY_PUBLISH_PASSWORD` hanya pada proses API lokal; jangan commit ke `.env.example` atau mencetak nilainya. `SENKOM_GATEWAY_CALLBACK_URL` dapat mengganti callback untuk lab lokal. `docker compose down` menghentikan gateway dan menghapus network Compose lab; tidak ada volume data persisten. Jangan jalankan pada host produksi.

## Fixture sintetis untuk 3-01b

Publisher sintetis kini memakai credential terpisah dan hanya boleh menulis ke path statis `lab`/`lab-b`. Harness menjalankan fixture tanpa kamera atau URI operasional. Butuh FFmpeg `libx264`, CPU untuk encoding, Docker Engine, API lab, token Viewer sintetis yang berwenang, serta port `8554/8888/8889` TCP dan `8189` UDP yang bebas pada loopback.

## Browser E2E playback terotorisasi 3-02c

Harness opt-in berada di `scripts/phase3-gateway-browser-e2e.mjs`; Playwright dipin ke `1.56.1`. Jalankan dari root repo dengan Node `24.22.2` dan npm `11.19.1`. Set path executable, tanpa instalasi browser:

```powershell
$env:FFMPEG_PATH = 'D:\tools\ffmpeg.exe'
$env:DOCKER_PATH = 'C:\Program Files\Docker\Docker\resources\bin\docker.exe' # only if docker is not on PATH
$env:COMPOSE_PATH = 'D:\tools\docker-compose.exe' # only if docker compose plugin is unavailable
$env:BROWSER_CHANNEL = 'chrome' # or 'msedge'
$env:SENKOM_GATEWAY_VIEWER_TOKEN = '<synthetic-local-viewer-token>'
$env:SENKOM_GATEWAY_PUBLISH_PASSWORD = '<synthetic-local-publisher-secret>'
npm run test:gateway:e2e
```

Jalankan API pada origin `SENKOM_GATEWAY_API_ORIGIN` (default `http://127.0.0.1:8000`) dengan Viewer sintetis yang punya grant map, kamera published/enabled, dan source enabled untuk kamera `demo-camera-01` serta `demo-camera-04`. Set `SENKOM_GATEWAY_MAP_ID` bila fixture memakai map selain `main`. Publisher password harus cocok dengan env API. `FFMPEG_PATH`, token Viewer, dan secret publisher wajib; nilainya hanya untuk lab sintetis dan tidak boleh masuk log, evidence, issue, atau Git. `DOCKER_PATH`, `COMPOSE_PATH`, `BROWSER_CHANNEL`, API origin, map/camera IDs, dan `BROWSER_EXECUTABLE` opsional. Pastikan port 8000 bebas sebelum API lab dimulai, cek `Get-NetTCPConnection -LocalPort 8000 -State Listen` menunjuk proses API milik lab, lalu hentikan proses itu setelah uji. Pada Windows, penghentian parent `artisan serve` saja dapat meninggalkan worker `php -S`; jalankan satu server PHP langsung di schema disposable dan verifikasi listener setelah cleanup.

Harness meminta sesi dari Laravel tanpa menyimpan token di evidence; header Authorization dibatasi ke origin gateway loopback. Harness menguji no-auth, token tampered, salah kamera, publish denial, playback WebRTC/HLS, HLS manifest/variant/segment, expiry untuk playlist dan segment, perilaku koneksi WebRTC aktif setelah expiry, publisher stop/restart, codec unsupported, gateway stop/restart, dan cleanup. Readiness menunggu HTTP HLS/WebRTC sekaligus. MediaMTX 1.21.4 mengalihkan URL HLS tanpa `cookieCheck=1`; harness memakai URL kanonis dan menolak redirect agar auth header tidak diteruskan lintas path.

E2E lokal terbaru: 15 PASS, 1 WARN, zero mandatory skip. Publisher pulih setelah transisi codec; callback publisher yang benar tetap 204, kredensial salah dan token Viewer untuk publish ditolak 401. Path HLS tak terdaftar ditolak MediaMTX 1.21.4 dengan HTTP 500 tanpa media atau secret; tetap WARN. WebRTC/HLS merender 1280×720, gateway restart memulihkan playback, dan cleanup menghentikan container/network milik project `senkom-gateway-lab`. Evidence summary berada di ignored `.artifacts/phase3-gateway-evidence.json`, tidak otomatis dijalankan oleh `npm test` atau CI.
MediaMTX 1.21.4 meminta callback Laravel pada setiap operasi. Authorization terikat `read`, protokol, path, Viewer, map, kamera, source enabled, snapshot published, issuer/audience dan expiry. Token yang sama dapat direplay untuk beberapa request HLS/WebRTC hingga expiry; token bukan one-time. Callback menolak request playlist/segmen dan WHEP baru setelah expiry serta perubahan state yang membuat kamera tidak eligible. Callback tidak memutus koneksi WebRTC yang sudah established; koneksi dapat berlanjut melampaui TTL sampai client/gateway memutusnya.

## Pemeriksaan dan diagnosis

- `docker compose config --quiet` memeriksa Compose; `docker compose ps` dan log gateway memeriksa startup setelah Docker tersedia. Jangan cetak URL/secret kamera aktual ke log atau tiket.
- Jika publisher gagal, cek port loopback, Docker Engine, dan path persis `lab`. RTSP hanya TCP; UDP/multicast RTSP sengaja mati.
- Jika WebRTC gagal, cek candidate `127.0.0.1` dan UDP `8189`; candidate ini hanya untuk browser pada host yang sama. Untuk klien lain diperlukan rancangan ICE/NAT/TLS/auth baru.
- Jika HLS gagal, cek origin, CORS dan dukungan H.264 player. HLS mungkin memerlukan player JS pada Electron; itu bukan bagian 3-01a.

Parent 3-01 tetap WIP sampai 3-01b terintegrasi melalui PR dan postmerge CI. Benchmark GPU/codec/bandwidth serta UAT hardware tetap belum dijalankan.
