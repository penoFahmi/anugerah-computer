# 📋 Spesifikasi Fungsional & Daftar Fitur Sistem

Dokumen ini menjelaskan detail fitur fungsional sistem **Anugerah Computer**, aktor yang berinteraksi, dan alur kerja (*business workflow*) tiap modul.

---

## 👥 1. Hak Akses & Peran Pengguna (Roles & Permissions)

Sistem menggunakan kontrol akses berbasis peran (*Role-Based Access Control* - RBAC) menggunakan paket **Spatie Laravel-Permission**:

| Peran (Role) | Tanggung Jawab & Akses Menu |
| :--- | :--- |
| **Administrator (Owner)** | Akses menyeluruh ke seluruh sistem: Keuangan (Cashflow & Laba Rugi), Manajemen Pegawai, Konfigurasi WhatsApp, Log Sistem & Analisis AI, Tempat Sampah (*Trash*), Pengaturan Toko, dan Moderasi Testimoni. |
| **Teknisi (Technician)** | Akses operasional servis: Dashboard Ringkasan, Antrean Servis, Papan Operasi Kanban, Klaim Garansi, Katalog Produk, dan Data Sparepart. |
| **Pegawai (Cashier/Staff)** | Akses penjualan & front-desk: Kasir POS, Pembelian Bekas (Trade-In), Pesanan Daring, Penerimaan Tiket Servis Baru, Katalog Inventaris, dan Database Pelanggan. |
| **Pelanggan Publik (Guest)** | Akses portal publik: Landing Page Toko, Katalog Laptop Ready, Formulir Kirim Testimoni, dan Floating AI Chatbot via Web atau WhatsApp. |

---

## 🏛️ 2. Rincian Modul & Alur Bisnis

### A. Modul Layanan Servis & Reparasi
1. **Penerimaan Unit (Check-in):**
   - Kasir/staf menginput data pelanggan (nama, nomor HP, alamat) dan perangkat (tipe, merk, model, kelengkapan, keluhan/gejala).
   - Sistem otomatis membuat atau menghubungkan record `Customer` dan `Device` melalui nomor telepon.
   - Sistem mencetak **Nota Tiket Servis** (format PDF termal 80mm).
2. **Pengecekan Teknisi & Penawaran:**
   - Unit masuk ke tab **Antrean Baru** (*waiting_checking*).
   - Setelah diperiksa, teknisi mengisi catatan estimasi perbaikan dan biaya.
   - Staf memicu tombol **"Kirim Penawaran WhatsApp"** untuk meminta persetujuan pelanggan. Status berubah ke **Menunggu Persetujuan** (*waiting_approval*).
3. **Pengerjaan & Pemasangan Sparepart:**
   - Jika pelanggan setuju (bisa dideteksi otomatis oleh AI WA atau diubah manual oleh admin), status berubah ke **Dikerjakan** (*in_progress*).
   - Teknisi dapat menautkan sparepart yang digunakan (`attachSparepart`), yang otomatis memotong kuantitas stok di gudang.
4. **Penyelesaian & Penyerahan Unit:**
   - Teknisi menandai unit **Selesai** (*completed*).
   - Saat pembayaran lunas dan unit diserahkan ke pelanggan (*taken*):
     - Sistem otomatis menerbitkan kartu **Garansi** (`warranties`) sesuai masa hari yang ditentukan.
     - Sistem memicu job `SendFinalReceiptPdf` untuk membuat **Nota Lunas PDF** dan mengirimkannya otomatis ke WhatsApp pelanggan.

---

### B. Modul Klaim & Manajemen Garansi
1. **Daftar Garansi (`/garansi`):**
   - Menampilkan daftar garansi lengkap dengan indikator sisa hari aktif, tanggal kadaluwarsa, dan identitas unit/pelanggan.
2. **Klaim Garansi:**
   - Jika unit kembali bermasalah dalam masa garansi, staf menekan tombol **"Klaim Garansi"**.
   - Sistem otomatis membuka tiket servis baru berstatus *waiting_checking* dengan biaya awal Rp 0 dan tertaut ke ID garansi awal.
3. **Pembatalan (*Void*):**
   - Jika unit terkena air, segel koyak, atau rusak akibat kelalaian pelanggan, admin dapat mengubah status garansi menjadi `void`.

---

### C. Modul Kasir (Point of Sale) & Trade-In
1. **Kasir POS (`/sales/pos`):**
   - Mendukung multi-item keranjang belanja untuk aksesoris/sparepart dan laptop fisik.
   - Input diskon dan perhitungan otomatis nominal kembalian.
   - Eksekusi transaksi atomik:
     - Mengurangi stok fisik sparepart.
     - Mengubah status unit laptop menjadi `sold`.
     - Membukukan penerimaan kas ke tabel buku besar (`transactions`).
     - Menghasilkan ringkasan data nota faktur untuk dicetak.
2. **Tukar Tambah / Pembelian Bekas (`/sales/trade-in`):**
   - Mencatat unit laptop second yang dibeli dari masyarakat umum.
   - Mengisi spesifikasi dan catatan kondisi fisik/fungsi.
   - Mencatat pengeluaran kas toko (`TransactionCategory::TRADE_IN`).

---

### D. Modul Inventaris & Stok
1. **Produk Fisik (`/inventory/products`):**
   - Manajemen unit laptop/PC yang siap dipajang di etalase toko dan web katalog.
   - Informasi detail: Prosesor, RAM, Penyimpanan (SSD/HDD), Kartu Grafis, Kondisi (Baru/Bekas), Harga Modal, dan Harga Jual.
2. **Sparepart & Komponen (`/inventory/spareparts`):**
   - Manajemen stok baut, keyboard, LCD, baterai, pasta prosesor, charger, dll.
   - Peringatan stok kritis (*low stock*) jika sisa stok $\le 5$ unit.
3. **Pengadaan Barang / Procurement (`/inventory/procurement`):**
   - Formulir pembelian stok baru dari supplier beserta pencatatan pengeluaran kas operasional.

---

### E. Modul Keuangan (Finance)
1. **Arus Kas Harian (`/finance/cashflow`):**
   - Rekap transaksi harian dari seluruh sumber (POS Kasir, Servis Lunas, Pembelian Trade-In, dan Procurement).
2. **Laporan Laba Rugi (`/finance/profit-loss`):**
   - Kalkulasi pendapatan kotor (*gross income*), total pengeluaran operasional (*expenses*), dan laba bersih per bulan sepanjang tahun.

---

### F. Modul WhatsApp Bot & Hybrid AI (Arsitektur Riset Skripsi)
1. **Jalur Pesan Masuk (Inbound Flow):**
   - `Pelanggan WA` ➔ `Node.js Baileys Gateway` ➔ `Webhook Laravel (/api/message)`.
   - Webhook memvalidasi `X-Token`, menyaring *Echo Loop* (pesan keluar sistem), dan melempar *job* ke antrean `ProcessInboundWaMessage`.
2. **Klasifikasi Cerdas (FastText NLP SVM):**
   - Job antrean memanggil API Python microservice.
   - Jika *confidence score* $\ge 0.75$, intent dieksekusi langsung oleh backend (misal: cek status servis ke DB, template info toko).
3. **Fallback Groq LLM (`IntentAnalyzer`):**
   - Jika skor NLP $< 0.75$, pesan diarahkan ke Groq LLM untuk mengevaluasi apakah pesan merupakan konfirmasi servis (*setuju*, *batal*, atau *lainnya*).
4. **Agen AI Generatif (`CustomerService`):**
   - Jika intent adalah percakapan umum (*lainnya*), pesan dijawab oleh Groq LLM dengan gaya ramah, ringkas (maks 2-3 kalimat), dan memanfaatkan tools `CheckServiceStatus` atau `SearchServiceHistory`.
5. **Human Handoff:**
   - Jika terjadi error pada LLM atau pelanggan meminta berbicara dengan manusia, sistem otomatis mengalihkan status chat ke admin, memicu broadcast event Reverb, dan mengirim notifikasi internal.
6. **Log Sistem & Analitik Skripsi (`/logs`):**
   - Dasbor pemantauan chat log yang menghitung:
     - Rata-rata Skor Keyakinan SVM.
     - Estimasi Penghematan Token LLM.
     - Persentase Tingkat Otonomi Bot tanpa campur tangan staf.

