# 📚 Dokumentasi Progres, Fitur & Revisi - Anugerah Computer

Selamat datang di pusat dokumentasi dan pencatatan progres pengembangan sistem **Anugerah Computer - Enterprise Service & POS System with Hybrid AI**.

Folder `docs/` ini berfungsi sebagai *single source of truth* untuk memantau status pengerjaan, pencatatan fitur yang sudah dan belum selesai, log revisi berkala, serta daftar isu teknis.

---

## 🗂️ Struktur Dokumentasi

| Berkas | Deskripsi |
| :--- | :--- |
| **[`PROGRESS_TRACKER.md`](./PROGRESS_TRACKER.md)** | **Dokumen Utama Status Fitur.** Matriks checklist fitur per modul dengan status (🟢 Selesai, 🟡 Parsial/Revisi, 🔴 Belum), persentase progres, dan target penyelesaian. |
| **[`REVISI_LOG.md`](./REVISI_LOG.md)** | **Buku Catatan Revisi.** Log historis setiap kali ada perbaikan, masukan dari dosen pembimbing/owner, atau modifikasi logika bisnis. |
| **[`DAFTAR_FITUR.md`](./DAFTAR_FITUR.md)** | **Katalog Spesifikasi Fungsional.** Penjelasan rinci fungsi setiap modul sistem, aktor yang terlibat, dan alur kerjanya. |
| **[`CATATAN_TEKNIS_DAN_ISSUES.md`](./CATATAN_TEKNIS_DAN_ISSUES.md)** | **Technical Debt & Bug Tracking.** Catatan error, issue typecheck TypeScript, dependensi microservice, dan panduan lingkungan pengujian. |

---

## 📝 Aturan Pembaruan (Maintenance Guideline)

Setiap kali melakukan pekerjaan coding baru atau revisi:
1. **Perbarui `PROGRESS_TRACKER.md`**: Ubah status fitur dari 🔴 / 🟡 menjadi 🟢 jika fitur tersebut telah selesai dan lolos pengujian.
2. **Catat di `REVISI_LOG.md`**: Tambahkan entri baru pada bagian teratas mencakup: Tanggal, Modul, Perubahan yang dilakukan, dan Dampak/Hasil.
3. **Catat Isu di `CATATAN_TEKNIS_DAN_ISSUES.md`**: Jika menemukan bug atau pekerjaan rumah teknis (*technical debt*), tuliskan agar tidak terlupakan.

