# Media gateway lab — 3-01a

**Terpilih:** MediaMTX 1.21.4, image `bluenviron/mediamtx:1.21.4` dipin ke digest pada `compose.yaml` (Docker Hub, 2026-11-23). MediaMTX menerima RTSP/TCP dan menyediakan WebRTC serta HLS dari satu server; image resmi dan konfigurasi YAML sederhana cukup untuk satu path lab tanpa transcoder fixture H.264. go2rtc dipertimbangkan, tetapi tidak memberi kebutuhan tambahan yang terbukti untuk scope ini. Pemilihan belum membuktikan playback atau kapasitas.

| Kriteria                    | Keputusan lab                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Transport dan codec         | RTSP/TCP masuk; WebRTC rendah latensi dan HLS fallback keluar. H.264 fixture direncanakan; H.265 perlu uji dukungan client. |
| Autentikasi dan RTSP privat | Publish/read anonim hanya pada port host loopback dan path `lab`; sesi scoped/short-lived menunggu 3-02c.                   |
| Docker dan maintenance      | Image resmi versi 1.21.4 dengan digest tetap; file Compose/YAML tidak memerlukan secret atau perubahan service produksi.    |
| Resource                    | Tanpa transcode untuk H.264 lab; CPU/RAM, bandwidth, latensi dan jumlah decoder belum diukur. Tidak ada klaim kapasitas.    |

## Batas lab

`compose.yaml` hanya mempublikasikan port host `127.0.0.1`: RTSP/TCP `8554` untuk publisher sintetis, HLS/HTTP `8888`, WebRTC signaling/HTTP `8889`, dan WebRTC ICE/UDP `8189`. Container memakai network Compose terpisah. Tidak ada admin API, metrics, pprof, recording, atau RTMP/SRT. Hanya path `lab` yang diizinkan. MediaMTX menerima publish/read anonim **hanya dalam batas lab loopback ini**; jangan jalankan file YAML langsung pada host atau sambungkan container lain ke network lab. Tidak ada variabel environment atau secret yang diperlukan; seluruh konfigurasi lab ada di dua file ini. Konfigurasi ini tidak cocok untuk PC lain atau produksi.

RTSP kamera/NVR aktual dan credential tetap di server/gateway privat, bukan Git, metadata viewer, renderer, browser bundle, log, atau snapshot. Playback session scoped/short-lived dan integrasi desktop milik 3-02c/3-03. Tidak ada decoder RTSP di Electron. Jangan membuka binding loopback menjadi `0.0.0.0` untuk mengatasi koneksi: desain remote memerlukan origin tepercaya, autentikasi, TLS untuk signaling/HLS, ICE UDP/TCP/NAT yang dapat dijangkau, dan CORS origin spesifik. WebRTC media terenkripsi; signaling lab ini HTTP loopback. HLS lab HTTP loopback, variant MediaMTX default `lowLatency`; WebRTC diprioritaskan untuk latensi rendah. Pembatasan CORS saat ini hanya mengizinkan origin halaman gateway pada loopback.

Gateway dapat menerima H.264/H.265 dari RTSP, tetapi playback browser/Electron bergantung pada codec client. Fixture 3-01b direncanakan H.264 `yuv420p`, 1280×720, 15 FPS; tidak ada transcode pada konfigurasi ini. H.265 dan jumlah stream simultan harus diuji tersendiri. Versi dan digest diperiksa terhadap release resmi MediaMTX v1.21.4 serta Docker Hub tag 1.21.4.

## Setup lab (Docker Engine diperlukan)

Dari direktori ini:

```powershell
docker compose config --quiet
docker compose up -d
docker compose ps
```

Docker Engine dan port loopback harus tersedia. Tidak ada `.env` atau kredensial operasional. `docker compose down` menghentikan gateway dan menghapus network Compose lab; tidak ada volume data persisten. Jangan jalankan pada host produksi. Docker Compose/runtime **NOT RUN** pada host pengembangan 3-01a karena `docker` tidak tersedia.

## Fixture sintetis untuk 3-01b (rencana, belum dijalankan)

Pada host lab yang sama, FFmpeg dengan encoder `libx264` dapat menerbitkan satu test pattern tanpa kamera atau kredensial:

```powershell
ffmpeg -re -f lavfi -i testsrc=size=1280x720:rate=15 -c:v libx264 -pix_fmt yuv420p -preset ultrafast -tune zerolatency -g 30 -f rtsp -rtsp_transport tcp rtsp://127.0.0.1:8554/lab
```

Butuh FFmpeg, CPU untuk encoding, Docker Engine, dan port `8554/8888/8889` TCP serta `8189` UDP yang bebas pada loopback. Hentikan publisher dengan `Ctrl+C`, lalu `docker compose down` di direktori ini. 3-01b harus membuktikan playback browser nyata via WebRTC/HLS, bukan menganggap command ini bukti playback.

## Pemeriksaan dan diagnosis

- `docker compose config --quiet` memeriksa Compose; `docker compose ps` dan log gateway memeriksa startup setelah Docker tersedia. Jangan cetak URL/secret kamera aktual ke log atau tiket.
- Jika publisher gagal, cek port loopback, Docker Engine, dan path persis `lab`. RTSP hanya TCP; UDP/multicast RTSP sengaja mati.
- Jika WebRTC gagal, cek candidate `127.0.0.1` dan UDP `8189`; candidate ini hanya untuk browser pada host yang sama. Untuk klien lain diperlukan rancangan ICE/NAT/TLS/auth baru.
- Jika HLS gagal, cek origin, CORS dan dukungan H.264 player. HLS mungkin memerlukan player JS pada Electron; itu bukan bagian 3-01a.

Parent 3-01 tetap WIP sampai 3-01b membuktikan satu stream lab di browser dan gate parent lulus. Benchmark GPU/codec/bandwidth serta UAT hardware tetap belum dijalankan.
