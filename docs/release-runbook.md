# Rencana release dan rollback

Status: desain Phase 0. Tidak ada updater terpasang, installer, signing key, update
server, atau release yang dipublikasikan. Prosedur ini belum diuji end-to-end.

## Dua jalur perubahan

- Data peta: backend publish revision/schema/checksum baru; main fetch, validasi,
  tulis cache atomik, lalu swap renderer. Tidak menjalankan installer atau restart.
- Binary aplikasi: SemVer patch/minor/major; electron-builder NSIS dan electron-updater
  dipilih pada Phase 4 dengan versi aktif saat implementasi, bukan dipasang prematur.

Stable dan testing memakai origin/path terpisah pada private HTTPS provider.
Channel tidak boleh beralih otomatis; hanya konfigurasi admin terpercaya.
Metadata perlu version, channel, sha512, signature/provider metadata, release notes,
minimum API, supported map schema dan publishedAt. Kebijakan aplikasi di OpenAPI
bukan pengganti manifest native updater.

## Gate instalasi yang wajib diterapkan Phase 4

1. Periksa policy/schema/API dan channel saat startup serta interval terkonfigurasi.
2. Download hanya ketika kebijakan jaringan mengizinkan. Verifikasi hash dan trusted
   Windows publisher signature sebelum status ready. Kredensial signing hanya CI secrets.
3. Set `autoInstallOnAppQuit = false`. Jangan memanggil `quitAndInstall` dari event
   update-downloaded atau quit biasa. Menutup aplikasi bukan approval update.
4. Instal hanya setelah maintenance gate atau approval admin sah; major tetap
   memerlukan approval eksplisit, backup dan compatibility check meski dalam maintenance.
5. Snapshot/config dan status update disimpan sebelum restart. Jangan menghapus cache
   karena minimum version policy; tampilkan UPDATE REQUIRED sesuai kebijakan keamanan.
6. Health check setelah install: startup, kompatibilitas API/schema, peta, playback.
   Catat event/version/reason/timestamp tanpa URL token atau secret.

## Rollback manual yang harus dibuktikan

Simpan installer previous stable yang signed beserta hash, release notes dan backup
config/snapshot kompatibel di luar installation directory. Jika startup gagal,
hentikan aplikasi melalui prosedur admin, jalankan installer stable sebelumnya,
restore hanya backup yang kompatibel, lalu ulangi health check. Jangan downgrade
database atau menimpa userData tanpa review format dan backup.

`electron-updater` tidak menyediakan rollback otomatis yang boleh diasumsikan.
Uji patch, minor, major rejection, signature/hash failure, network failure, restart
dan pemulihan sebelum rilis produksi. Release approval, lokasi server, maintenance
timezone/window, retention artifacts dan emergency security patch masih TBD.
