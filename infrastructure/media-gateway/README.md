# Media gateway (rencana Phase 3)

Kandidat awal: MediaMTX, versi dipilih setelah implementation spike. Belum ada
gateway/container/service yang diinstal atau dijalankan pada Phase 0.

RTSP camera/NVR private masuk gateway; renderer menerima WebRTC low-latency atau
HLS fallback dengan sesi pendek per stream. Simpan alamat dan secret sumber hanya
di secret store server/gateway. Tidak ada source URL atau credential placeholder
yang dapat tidak sengaja dipakai untuk menghubungi kamera.

Spike wajib mencakup codec H.264/H.265, substream/main stream, TLS/auth, expiry token,
unauthorized/offline/reconnect, backoff+jitter, visible-feed limits dan benchmark
minimal delapan substream pada GPU target. Muted autoplay, isolated player errors,
pause/focus/playlist dan decoder cleanup diperlukan sebelum AC-04 diterima.
