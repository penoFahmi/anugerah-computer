# 📝 Catatan Riwayat Revisi & Pengerjaan (Changelog)

Dokumen ini mencatat setiap perubahan, perbaikan bug, penyesuaian logika bisnis, dan instruksi revisi (baik dari evaluasi mandiri maupun masukan dosen pembimbing/stakeholder).

---

### [2026-11-14] - Implementasi Alur Pembatalan Fleksibel & Pengembalian Dana (Refund DP) Kasir
- **Kategori**: Alur Bisnis Servis & Integritas Keuangan Kasir
- **Kebutuhan Bisnis (Konteks Toko Pontianak)**:
  - Pembatalan servis memiliki alur fleksibel: kadang gratis (bebas biaya Rp 0), kadang dikenakan biaya pengecekan/analisa teknisi (*checking fee*).
  - Jika pelanggan pernah membayar Uang Muka (DP), pengembalian dana harus fleksibel:
    1. **Kembalikan DP Penuh (100% Refund)**: Kasir mengembalikan seluruh DP ke pelanggan.
    2. **Potong Biaya Cek, Sisa Dibalikkan (Refund Sebagian)**: DP dipotong biaya cek, selisihnya dikembalikan ke pelanggan.
    3. **DP Hangus / Tanpa Refund (Refund Rp 0)**: DP hangus atau dianggap biaya pengecekan, kasir tidak mengeluarkan uang.
    4. **Biaya Cek Melebihi DP**: Pelanggan membayar sisa kekurangan biaya cek kepada kasir.
  - Kasir membutuhkan instruksi fisik yang jelas dan mencolok di antarmuka agar tidak bingung apakah harus mengeluarkan uang kas dari laci (*Kas Keluar / Refund*) atau menerima uang dari pelanggan (*Kas Masuk / Biaya Cek*).
- **Perubahan yang Dilakukan**:
  1. **Backend Validation (`app/Http/Requests/UpdateServiceOrderRequest.php`)**:
     - Menambahkan aturan validasi `'refund_amount' => ['nullable', 'numeric', 'min:0']`.
     - Mengecualikan validasi batas DP (`down_payment <= maxCost`) untuk status `CANCELLED` dan `RETURNED` agar tidak memblokir pembatalan servis yang biaya akhirnya Rp 0.
     - Memperluas matriks transisi status (`after()` hook) agar pegawai/teknisi dapat membatalkan servis dari semua status aktif (`WAITING_CHECKING`, `WAITING_APPROVAL`, `APPROVED`, `IN_PROGRESS`, `COMPLETED`), memproses pengembalian unit (`RETURNED`), serta melakukan *rollback* status jika terjadi salah klik.
  2. **Logika Pembukuan Kas Idempoten (`ServiceOrderController::syncServiceFinancials`)**:
     - Menambahkan parameter `refundAmount`.
     - Jika status `RETURNED` atau `CANCELLED`:
       - **Kas Keluar (Refund)**: Jika `refundAmount > 0`, sistem mencatat/memperbarui transaksi bertipe `EXPENSE` dengan kategori `TransactionCategory::REFUND`.
       - **Kas Masuk (Checking Fee)**: Jika ada biaya cek yang melebihi DP (`finalCost - downPayment > 0`), sistem mencatat transaksi bertipe `INCOME` dengan kategori `TransactionCategory::CHECKING_FEE`.
       - Mencegah *double-counting*: Nilai DP yang ditahan toko tidak dicatat ulang sebagai checking fee karena uang fisiknya sudah tercatat di kas masuk saat pendaftaran awal.
       - Otomatis menghapus transaksi pelunasan `FINAL_SERVICE`.
     - **Rollback Bersih**: Jika status diubah kembali ke status aktif (`in_progress`, `completed`, dll.), semua transaksi `REFUND`, `CHECKING_FEE`, dan garansi otomatis dihapus bersih.
  3. **Data Eager-Loading (`ServiceOrderController.php`)**:
     - Memuat relasi `transactions` pada `index()` dan `show()` untuk mengekstrak `refund_amount` tanpa kueri tambahan (N+1 safe).
  4. **Antarmuka Modal Proses Servis (`service-process-modal.tsx`)**:
     - Menambahkan state `refund_amount`.
     - Merombak total tampilan untuk status `cancelled` menjadi **Panel Penyelesaian Batal & Pengembalian Unit**:
       - Ringkasan DP yang pernah dibayar.
       - Input fleksibel Biaya Pengecekan (default Rp 0 / Bebas Biaya).
       - Tombol jalan pintas 1-klik kebijakan toko: *Refund Full (100%)*, *Potong Biaya Cek*, *DP Hangus (Rp 0)*.
       - Input manual nominal refund.
       - **Kartu Petunjuk Aksi Kasir**: Menampilkan instruksi visual besar berlatar belakang warna mencolok:
         - 🟥 **KAS KELUAR (Refund)**: "Kembalikan uang fisik ke pelanggan: Rp X"
         - 🟩 **KAS MASUK (Biaya Cek)**: "Terima pembayaran dari pelanggan: Rp X"
         - 🟦 **BEBAS BIAYA (Rp 0)**: "Tidak ada pertukaran uang kas"
       - Pilihan metode bayar kasir (Tunai, Transfer, QRIS).
       - Input catatan teknisi / alasan pembatalan.
       - Tombol aksi: "Kembalikan & WA", dropdown "Kembalikan (Tanpa WA)", dan "Lanjut Servis (Buka Kembali)".
     - Menambahkan menu **Opsi Koreksi / Rollback** pada status `taken` dan `returned` agar pegawai dapat membatalkan kesalahan klik status tanpa hambatan.
  5. **Formulir Edit Lengkap (`service-detail-form.tsx`)**:
     - Menambahkan input "Pengembalian Dana (Refund DP)" yang otomatis muncul saat status diubah ke `cancelled` atau `returned`.
     - Mengubah label `final_cost` menjadi "Biaya Pengecekan" ketika berada pada status batal.
- **Dampak**: Alur pembatalan servis toko di Pontianak terlayani secara 100% fleksibel, kasir memiliki panduan visual fisik yang presisi tanpa risiko salah hitung kas, dan pembukuan uang masuk/keluar di sistem sinkron sempurna dengan laci kasir riil.

---

### [2026-11-14] - Audit & Perbaikan Menyeluruh Alur Servis & Pembukuan Kas Masuk
- **Kategori**: Alur Bisnis Servis & Integritas Keuangan
- **Masalah yang Ditemukan (Root Causes)**:
  1. **Uang Muka (DP) Tidak Pernah Masuk Buku Kas**: Saat penerimaan servis di awal (`store`), nilai DP tersimpan di data servis tetapi `Transaction` kas masuk tidak dibuat sama sekali. Uang fisik ada di laci, tapi laporan kas harian 0.
  2. **Pelunasan Menghitung Biaya Penuh (Double Count DP)**: Saat status diubah ke `taken`, sistem mencatat transaksi sebesar `final_cost` penuh, padahal pelanggan hanya membayar sisa tagihan (`final_cost - down_payment`).
  3. **Duplikasi Transaksi Akibat Salah Klik Status**: Jika pegawai salah klik status menjadi `taken`, transaksi dicatat. Saat diedit kembali ke status belum diambil (`completed`/`in_progress`), transaksi tidak dihapus. Ketika unit benar-benar diambil nanti, transaksi dibuat ulang (tercatat 2x lipat/fiktif).
  4. **Edit Nominal Tidak Memperbarui Transaksi**: Jika unit sudah berstatus `taken` lalu nominal biaya diperbaiki, transaksi lama tidak diperbarui sehingga buku kas tidak cocok dengan nota.
  5. **Crash Fatal pada Servis Batal (`RETURNED`)**: Pemanggilan `TransactionCategory::OTHER_INCOME` memicu fatal error karena enum tersebut belum dideklarasikan di `TransactionCategory.php`.
  6. **Metode Pembayaran Hilang di Modal**: Di `service-process-modal.tsx`, pilihan metode bayar (Tunai/Transfer/QRIS) tidak diteruskan ke payload request sehingga selalu jatuh ke default 'cash'.
- **Solusi & Perubahan yang Dilakukan**:
  1. **Enum `TransactionCategory`**: Menambahkan enum `CHECKING_FEE` ('biaya_pengecekan') dan `OTHER_INCOME` ('pendapatan_lain').
  2. **Pencatatan DP Otomatis di Pendaftaran Awal (`store`)**: Jika ada DP saat registrasi servis, sistem langsung mencatat transaksi `DP_SERVICE`. Formulir frontdesk juga dilengkapi pilihan metode bayar DP (Tunai, Transfer, QRIS).
  3. **Mekanisme `syncServiceFinancials` (Idempoten & Reversible)**:
     - **DP Sinkron**: Otomatis memperbarui atau membuat transaksi DP jika ada perubahan DP saat perbaikan.
     - **Pelunasan Presisi**: Saat `taken`, transaksi `FINAL_SERVICE` yang dicatat HANYA sisa tagihan riil (`max(0, final_cost - down_payment)`).
     - **Rollback Otomatis saat Salah Klik**: Jika status diubah mundur dari `taken`/`returned` ke status aktif, transaksi pelunasan/checking fee **otomatis dihapus**, garansi yang terlanjur terbit **otomatis dihapus**, status penyerah unit di-reset, dan lokasi unit dikembalikan menjadi di toko (`is_unit_left_at_store = true`).
     - **Sinkronisasi Edit Nominal**: Jika biaya akhir diedit saat unit sudah berstatus `taken`, nominal transaksi yang ada langsung diperbarui (tidak membuat transaksi baru).
  4. **Pencegahan Duplikasi Garansi**: Garansi menggunakan pengecekan `updateOrCreate` pada record yang sudah ada.
  5. **Payload Frontend**: Memperbaiki `service-process-modal.tsx` agar meneruskan `payment_method` dengan benar.
- **Dampak**: Pembukuan kas toko 100% presisi, tidak ada lagi selisih uang masuk di kasir, dan pegawai bebas mengedit/memperbaiki salah klik tanpa merusak laporan keuangan.

---

### [2026-11-09] - Pembaruan Dashboard: Filter Arus Kas & Eliminasi Widget Tidak Perlu
- **Kategori**: Dashboard & Visualisasi Keuangan
- **Perubahan yang Dilakukan**:
  1. **Eliminasi Widget Sesuai Arahan**:
     - Menghapus widget **Stok Menipis** (`LowStockWidget`) dan **Servisan Terbaru** (`RecentServicesWidget`) dari tampilan dashboard utama (`resources/js/pages/dashboard.tsx`).
     - Mengeliminasi kueri database `$lowStockSpareparts` dan `$recentServices` pada `app/Http/Controllers/DashboardController.php` untuk efisiensi beban kerja server.
  2. **Implementasi Filter Arus Kas Multi-Periode**:
     - Menambahkan filter periode `period`: `today` (Hari Ini), `week` (7 Hari / Minggu Ini), `month` (Bulan Ini), dan `year` (Tahun Ini) pada `DashboardController.php`.
     - Keempat kartu KPI utama (Total Pemasukan, Total Pengeluaran, Arus Kas Bersih / Laba, dan Servis Berjalan) kini dinamis dan responsif mengikuti rentang periode yang dipilih.
  3. **Penyempurnaan Grafik Arus Kas (`FinanceTrendChart`)**:
     - Menyediakan tombol pemilih periode interaktif di bagian atas dashboard dan header kartu grafik.
     - Agregasi data grafik otomatis menyesuaikan rentang waktu:
       - **Hari Ini**: Distribusi per jam operasional toko (08:00 - 21:00).
       - **Minggu Ini**: Distribusi 7 hari terakhir (hari & tanggal).
       - **Bulan Ini**: Distribusi harian sepanjang bulan berjalan (tanggal 1 s/d akhir bulan).
       - **Tahun Ini**: Distribusi 12 bulan (Januari - Desember).
     - Tooltip moneter interaktif berformat Rupiah (`Rp X.XXX.XXX`).
- **Dampak**: Tampilan dashboard lebih rapi, terfokus pada kesehatan arus kas toko, dan memudahkan owner menganalisis performa finansial secara cepat.

---

### [2026-11-09] - Audit Sistem & Inisialisasi Dokumentasi Terpusat
- **Kategori**: Dokumentasi, Routing & Bug Fix
- **Perubahan yang Dilakukan**:
  1. **Dokumentasi Terpusat**: Membentuk folder `docs/` berisi panduan master progress tracker, daftar spesifikasi fitur, catatan teknis, dan log revisi ini.
  2. **Perbaikan Case-Sensitive Middleware (`bootstrap/app.php`)**:
     - *Masalah*: Import middleware `use App\Http\Middleware\Checkuserisactive;` berpotensi memicu error *Class Not Found* pada server Linux karena perbedaan huruf besar-kecil.
     - *Solusi*: Diperbaiki menjadi `use App\Http\Middleware\CheckUserIsActive;`.
  3. **Penyelarasan Rute Garansi (`resources/js/pages/garansi/list.tsx`)**:
     - *Masalah*: Terdapat sisa pemanggilan rute `/warranties` saat melakukan reset filter dan breadcrumb, padahal rute resmi sistem adalah `/garansi`.
     - *Solusi*: Mengubah seluruh pemanggilan rute ke `/garansi`.
  4. **Pencegahan Runtime Crash pada Toast (`resources/js/pages/garansi/list.tsx`)**:
     - Menambahkan validasi keberadaan fungsi tipe toast sebelum dieksekusi agar tidak terjadi TypeError saat flash message kosong atau tidak berformat baku.
- **Dampak**: Navigasi halaman garansi stabil dan aplikasi siap dijalankan di lingkungan Linux production tanpa masalah case-sensitivity.

---

### [2026-11-07] - Integrasi Metrik Skripsi & Penyempurnaan AI Pipeline
- **Kategori**: Fitur Inti (Skripsi), Log Sistem & Chatbot
- **Perubahan yang Dilakukan**:
  1. **Halaman Log Sistem & Analitik Skripsi (`/logs`)**:
     - Menambahkan kalkulasi metrik kuantitatif evaluasi skripsi:
       - Rata-rata Skor Keyakinan (*Average Confidence Score*) FastText SVM.
       - Estimasi Penghematan Token LLM (*Token Savings*) berkat penanganan mandiri oleh NLP lokal.
       - Tingkat Otonomi Sistem (*Autonomy Rate*) = % percakapan yang selesai tanpa intervensi manusia.
     - Visualisasi distribusi intent masuk (*inbound*) dan resolver (*nlp_model*, *llm_model*, *system*, *human*).
  2. **Pipeline Hybrid AI Cerdas (`ChatbotPipeline` & `IntentHandler`)**:
     - Integrasi FastText NLP Microservice (Python) dengan ambang batas keyakinan ($\ge 0.75$).
     - Mekanisme *fallback* ke Groq LLM (`IntentAnalyzer`) untuk mengklasifikasikan intent kritis (*setuju*, *batal*, *lainnya*).
     - Agen AI Generatif (`CustomerService`) dengan panduan respons singkat (maksimal 2-3 kalimat) dan larangan halusinasi harga.
     - Penyediaan 2 tools internal bagi LLM: `CheckServiceStatus` dan `SearchServiceHistory`.
  3. **Mekanisme Anti-Echo Loop pada Webhook WhatsApp**:
     - Mencegah pesan *outbound* yang dikirimkan bot atau sistem diproses ulang sebagai pesan *inbound* baru jika diterima kembali dalam rentang waktu 15 detik.
  4. **Live Chat Global Widget (`GlobalChatWidget`)**:
     - Menambahkan widget obrolan di pojok antarmuka admin/staf untuk membaca histori chat WhatsApp pelanggan dan membalas secara langsung dari web.

---

### [2026-11-06] - Modul Kasir Retail (POS) & Pembelian Unit Bekas (Trade-In)
- **Kategori**: Modul Transaksi & Keuangan
- **Perubahan yang Dilakukan**:
  1. **Kasir POS (`/sales/pos`)**:
     - Pembangunan antarmuka kasir cepat untuk suku cadang dan produk fisik (laptop).
     - Eksekusi transaksi atomik via `DB::transaction`: mencatat `PosTransaction`, `PosTransactionItem`, memotong stok fisik gudang, dan otomatis membukukan kas masuk di tabel `transactions`.
     - Dukungan struk kasir termal langsung setelah pembayaran sukses.
  2. **Tukar Tambah / Pembelian Bekas (`/sales/trade-in`)**:
     - Formulir pembelian laptop bekas dari pelanggan dengan pencatatan spesifikasi, nomor seri, dan catatan kondisi.
     - Auto-generate kode `TRD-YYYYMMDD-XXXX` dan pencatatan kas keluar toko.

---

### [2026-11-05] - Modul Inti Servis, Papan Kanban, dan Cetak Dokumen PDF
- **Kategori**: Modul Operasional Toko
- **Perubahan yang Dilakukan**:
  1. **Manajemen Tiket Servis (`/services`) & Kanban Board (`/kanban`)**:
     - Alur lengkap status servis: *Menunggu Pengecekan* ➔ *Tunggu Konfirmasi WA* ➔ *Sedang Dikerjakan* ➔ *Selesai* ➔ *Diambil/Dikembalikan*.
  2. **Cetak Dokumen PDF**:
     - Nota digital tiket servis baru dan nota lunas menggunakan kertas kasir termal ukuran 80mm berbasis `barryvdh/laravel-dompdf`.
  3. **Otomatisasi Garansi**:
     - Pembuatan record `warranties` secara otomatis saat unit servis selesai dikerjakan atau diserahkan ke pelanggan.

