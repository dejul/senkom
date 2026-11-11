# Update infrastructure (rencana Phase 4)

Tidak ada update feed aktif pada Phase 0. Origin `.invalid` di `.env.example`
adalah dokumentasi, tidak diakses aplikasi.

Gunakan NSIS/electron-builder dan electron-updater private HTTPS provider setelah
versi dependency, code signing, hosting dan approval dipilih. Stable/testing harus
terpisah dan install-on-maintenance/admin tidak boleh mengaktifkan auto install
on quit. Major update memiliki gate approval tambahan.

Detail metadata, rollback dan verifikasi: `docs/release-runbook.md`. Publikasi data
peta tidak menggunakan jalur binary release.
