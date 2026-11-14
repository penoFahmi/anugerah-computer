# 📊 Progress Tracker & Status Fitur

*Terakhir Diperbarui: 14 November 2026*  
*Status Keseluruhan Proyek: **~90% Selesai***

---

## 📌 Indikator Status
- 🟢 **Selesai (Done)**: Fitur telah selesai diimplementasikan (frontend + backend) dan siap digunakan.
- 🟡 **Parsial / Dalam Pengerjaan (In Progress)**: UI atau backend sudah ada sebagian, namun alur proses belum 100% tuntas.
- 🔴 **Belum Dikerjakan (To-Do)**: Fitur direncanakan tetapi belum diimplementasikan.

---

## 1. 🔧 Modul Layanan Servis & Kanban
| ID | Fitur | Status | Catatan Teknis / Detail |
| :---: | :--- | :---: | :--- |
| SRV-01 | Pendaftaran Tiket Servis Baru | 🟢 Selesai | Auto-create Pelanggan & Perangkat (*firstOrCreate*), no nota `SRV-YYYYMMDD-XXX`, pencatatan otomatis kas masuk DP ke buku kas. |
| SRV-02 | Daftar Antrean & Filter Servis (`/services`) | 🟢 Selesai | Filter status, teknisi, pencarian nota/pelanggan/perangkat, paginasi dinamis. |
| SRV-03 | Papan Operasi Kanban (`/kanban`) | 🟢 Selesai | Drag-and-drop antar kolom status, integrasi WebSocket/event broadcast. |
| SRV-04 | Pasang & Copot Sparepart di Servisan | 🟢 Selesai | Integrasi `attachSparepart` (potong stok) dan `detachSparepart` (kembalikan stok fisik). |
| SRV-05 | Cetak Nota Penerimaan & Lunas (PDF) | 🟢 Selesai | Template Blade `DomPDF` ukuran kertas termal 80mm (`226.77 x 600 pt`). |
| SRV-06 | Pemicu Penawaran Estimasi via WhatsApp | 🟢 Selesai | Tombol kirim penawaran estimasi langsung via `WaGateway::sendMessage`. |
| SRV-07 | Ekspor & Impor Servis via Excel | 🟢 Selesai | Template CSV dan ekspor/impor massal format `.xlsx`. |
| SRV-08 | Pengiriman Otomatis Struk PDF Lunas ke WA | 🟢 Selesai | Job antrean `SendFinalReceiptPdf` menyimpan ke storage publik lalu kirim link dokumen via WA. |
| SRV-09 | Integritas Kas & Rollback Idempoten | 🟢 Selesai | Logika `syncServiceFinancials`: pelunasan hanya mencatat sisa tagihan (`final - DP`), auto-rollback kas masuk fiktif dan garansi saat salah klik status mundur dari `taken`/`returned`. |
| SRV-10 | Pembatalan Fleksibel & Refund DP Kasir | 🟢 Selesai | Pembatalan gratis/berbayar, opsi refund DP (full, potong cek, hangus), petunjuk visual fisik kasir (Kas Keluar vs Kas Masuk), dan rollback bebas bug. |

---

## 2. 🛡️ Modul Garansi (Warranty)
| ID | Fitur | Status | Catatan Teknis / Detail |
| :---: | :--- | :---: | :--- |
| WRN-01 | Penerbitan Kartu Garansi Otomatis | 🟢 Selesai | Terbit otomatis saat servis ditandai `completed` / `taken` dengan masa aktif yang ditentukan. |
| WRN-02 | Monitoring Status Garansi (`/garansi`) | 🟢 Selesai | Status: *Aktif*, *Klaim*, *Kedaluwarsa*, *Hangus (Void)*. |
| WRN-03 | Klaim Garansi (`/garansi/{id}/claim`) | 🟢 Selesai | Membuat servis baru berbiaya Rp 0 yang mereferensikan kartu garansi asal. |
| WRN-04 | Pembatalan Garansi (*Void*) | 🟢 Selesai | Aksi pembatalan jika segel rusak atau human error pengguna. |

---

## 3. 🛒 Modul Penjualan & Kasir (POS)
| ID | Fitur | Status | Catatan Teknis / Detail |
| :---: | :--- | :---: | :--- |
| POS-01 | Antarmuka Kasir Retail (`/sales/pos`) | 🟢 Selesai | Cari produk/sparepart, keranjang belanja, hitung diskon, uang bayar & kembalian. |
| POS-02 | Pemrosesan Transaksi Atomik POS | 🟢 Selesai | `DB::transaction`: nomor faktur `INV-`, potong stok sparepart, update laptop `sold`, catat kas masuk. |
| POS-03 | Cetak Struk Belanja Kasir | 🟢 Selesai | Data struk dipancarkan via flash session untuk preview & cetak struk kasir. |
| POS-04 | Pembelian Laptop Bekas / Trade-In (`/sales/trade-in`) | 🟢 Selesai | Catat unit bekas dari pelanggan, no faktur `TRD-`, catat pengeluaran kas (`TransactionCategory::TRADE_IN`). |
| POS-05 | Antrean Pesanan Daring (`/sales/online`) | 🟡 Parsial | Tampilan tabel antrean booking ada, **namun** tombol aksi konfirmasi/batal oleh admin belum tersedia. |
| POS-06 | Formulir Booking Online dari Katalog Publik | 🔴 Belum | Belum ada form/modal "Pesan / Booking Unit" di halaman katalog (`/katalog`) untuk pelanggan. |

---

## 4. 📦 Modul Inventaris & Stok
| ID | Fitur | Status | Catatan Teknis / Detail |
| :---: | :--- | :---: | :--- |
| INV-01 | Katalog Unit Laptop/PC (`/inventory/products`) | 🟢 Selesai | CRUD laptop, upload foto, status (*ready*, *booked*, *sold*), spesifikasi (RAM, storage, dll). |
| INV-02 | Manajemen Sparepart (`/inventory/spareparts`) | 🟢 Selesai | CRUD suku cadang, penomoran SKU, kategori, harga jual/beli, stok gudang. |
| INV-03 | Peringatan Stok Menipis (*Low Stock Alert*) | 🟢 Selesai | Deteksi otomatis sparepart dengan stok $\le 5$ di menu inventory (dieliminasi dari dashboard agar terfokus ke arus kas). |
| INV-04 | Pengadaan Barang / Procurement (`/inventory/procurement`) | 🟢 Selesai | Form restock barang dari supplier dan integrasi beban pengeluaran kas toko. |

---

## 5. 💵 Modul Keuangan (Finance) & Arus Kas
| ID | Fitur | Status | Catatan Teknis / Detail |
| :---: | :--- | :---: | :--- |
| FIN-01 | Buku Kas Harian (`/finance/cashflow`) | 🟢 Selesai | Daftar pemasukan & pengeluaran, ringkasan harian, filter tanggal & tipe transaksi. |
| FIN-02 | Laporan Laba Rugi Bulanan (`/finance/profit-loss`) | 🟢 Selesai | Agregasi pemasukan, pengeluaran, dan net profit per bulan dalam tahun berjalan. |
| FIN-03 | Grafik Tren Arus Kas Multi-Periode | 🟢 Selesai | Grafik interaktif pada dashboard dengan filter: Hari Ini (per jam), Minggu Ini (7 hari), Bulan Ini (harian), dan Tahun Ini (12 bulan). |
| FIN-04 | KPI Finansial Dinamis Dashboard | 🟢 Selesai | Total Pemasukan, Pengeluaran, dan Laba Bersih yang otomatis menyesuaikan periode filter yang dipilih. |
| FIN-05 | Eliminasi Widget Redundan di Dashboard | 🟢 Selesai | Menghilangkan widget 'Stok Menipis' dan 'Servisan Terbaru' dari dashboard untuk efisiensi beban server dan fokus pada finansial. |

---

## 6. 👥 Modul Pelanggan (CRM)
| ID | Fitur | Status | Catatan Teknis / Detail |
| :---: | :--- | :---: | :--- |
| CRM-01 | Daftar Pelanggan & Analitik Kunjungan (`/customers`) | 🟢 Selesai | Menampilkan nama, kontak HP, alamat, total frekuensi servis, dan tanggal servis terakhir. |
| CRM-02 | Hapus Data Pelanggan (*Soft Delete*) | 🟢 Selesai | Soft delete aman terintegrasi dengan proteksi relasi data servis. |
| CRM-03 | Formulir Edit Manual Data Pelanggan | 🔴 Belum | Belum ada modal untuk edit nama, no telepon, atau alamat pelanggan langsung dari menu CRM. |

---

## 7. 🤖 Modul WhatsApp Bot & Hybrid AI (Inti Skripsi)
| ID | Fitur | Status | Catatan Teknis / Detail |
| :---: | :--- | :---: | :--- |
| WAI-01 | Webhook Listener WhatsApp (`/api/message`) | 🟢 Selesai | Otentikasi token `X-Token`, filter *Echo Cancellation*, dan dispatch ke Queue. |
| WAI-02 | Integrasi Microservice Python NLP (FastText SVM) | 🟢 Selesai | Panggilan HTTP ke endpoint klasifikasi intent lokal dengan skor keyakinan (*confidence score*). |
| WAI-03 | Evaluasi Ambang Batas NLP ($\ge 0.75$) | 🟢 Selesai | Jika skor tinggi, langsung eksekusi respon sistem/database tanpa membuang token LLM. |
| WAI-04 | Fallback Intent Analyzer LLM (Groq API) | 🟢 Selesai | Jika skor NLP $< 0.75$, LLM Groq menganalisis intent kritis (*setuju*, *batal*, *lainnya*). |
| WAI-05 | Agen AI Generatif (`CustomerService`) | 🟢 Selesai | Menjawab pertanyaan umum pelanggan dengan SOP santai, ringkas, dan anti-halusinasi harga. |
| WAI-06 | Tool AI: `CheckServiceStatus` | 🟢 Selesai | Mengekstrak nomor nota dari chat untuk mengecek status unit langsung ke MySQL. |
| WAI-07 | Tool AI: `SearchServiceHistory` | 🟢 Selesai | Mencari referensi harga/keluhan historis untuk menjawab estimasi biaya servis. |
| WAI-08 | Mekanisme Human Handoff | 🟢 Selesai | Menyerahkan percakapan ke admin toko dan memicu notifikasi jika bot tidak mampu menjawab. |
| WAI-09 | Floating Chatbot Web Publik (`/api/chatbot/ask`) | 🟢 Selesai | Widget obrolan mengambang di landing page publik dan katalog laptop. |
| WAI-10 | Widget Live Chat Admin (`GlobalChatWidget`) | 🟢 Selesai | Admin/staf dapat membaca chat masuk dan membalas manual via antarmuka web. |
| WAI-11 | AI Copilot Analisis Bisnis Toko | 🟢 Selesai | Menghasilkan ringkasan kesehatan finansial & servis toko di dashboard (di-cache 6 jam). |
| WAI-12 | Monitoring & Metrik Evaluasi Skripsi (`/logs`) | 🟢 Selesai | Menghitung rata-rata skor keyakinan SVM, penghematan token LLM, dan tingkat otonomi bot. |

---

## 8. 👨‍💼 Modul Staf, Role & Hak Akses
| ID | Fitur | Status | Catatan Teknis / Detail |
| :---: | :--- | :---: | :--- |
| USR-01 | Manajemen Staf / Pegawai (`/pegawai`) | 🟢 Selesai | Tambah pegawai baru, update profil, Spatie Roles (*administrator*, *teknisi*, *pegawai*). |
| USR-02 | Reset Kata Sandi Staf | 🟢 Selesai | Kembalikan password ke default (`password`). |
| USR-03 | Toggle Status Aktif Pegawai | 🟢 Selesai | Menonaktifkan staf yang cuti/keluar tanpa menghapus akunnya. |
| USR-04 | Proteksi Tindakan Mandiri | 🟢 Selesai | Administrator dicegah menghapus atau menonaktifkan akunnya sendiri. |

---

## 9. 🗑️ Modul Tempat Sampah & Arsip Data (`/sampah`)
| ID | Fitur | Status | Catatan Teknis / Detail |
| :---: | :--- | :---: | :--- |
| TSH-01 | Pengarsipan Data Terhapus (*Recycle Bin*) | 🟢 Selesai | Menampung soft deletes dari Staf (User), Pelanggan (Customer), dan Nota Servis. |
| TSH-02 | Aksi Pulihkan Data (*Restore*) | 🟢 Selesai | Mengembalikan record yang terhapus ke tabel asalnya. |
| TSH-03 | Hapus Permanen (*Force Delete*) | 🟢 Selesai | Menghapus tuntas data dari database. |
| TSH-04 | Dukungan Produk & Sparepart di Tempat Sampah | 🟡 Parsial | Model `Product` & `SparePart` sudah soft-delete, namun belum dimasukkan ke filter `/sampah`. |

---

## 10. 🌐 Pengaturan Toko, Landing Page & Testimoni
| ID | Fitur | Status | Catatan Teknis / Detail |
| :---: | :--- | :---: | :--- |
| SET-01 | Konfigurasi Informasi Toko (`/settings/store`) | 🟢 Selesai | Nama toko, kontak WA/sosmed, jam operasional, alamat, maps embed, dan upload logo toko. |
| SET-02 | Banner Slider Hero Landing Page | 🟢 Selesai | Upload multiple gambar slider dengan penyimpanan di disk public. |
| SET-03 | Manajemen Testimoni Publik (`/testimonials`) | 🟢 Selesai | Moderasi ulasan dari publik: setujui (*approved*), tolak (*rejected*), atau hapus (*destroy*). |
| SET-04 | Formulir Kirim Ulasan Publik | 🟢 Selesai | Form rating bintang dan komentar langsung dari landing page (`/`). |
| SET-05 | Katalog Publik (`/katalog`) | 🟢 Selesai | Daftar laptop ready, detail spesifikasi, filter pencarian, dan tombol kontak WhatsApp toko. |
| SET-06 | Konfigurasi WhatsApp Baileys (`/config/wa`) | 🟢 Selesai | QR Code scanner status koneksi server Node.js dan tombol logout sesi. |

---

## 11. 🧪 Pengujian & Kualitas Kode (QA)
| ID | Aspek Pengujian | Status | Catatan Teknis / Detail |
| :---: | :--- | :---: | :--- |
| TST-01 | Build Frontend Produksi (`npm run build`) | 🟢 Lolos | Vite/Rolldown berhasil build 100% tanpa kegagalan fatal. |
| TST-02 | Strict Type Checking (`tsc --noEmit`) | 🟡 75 Warning | Perlu penyesuaian tipe `PageProps` Inertia dan export interface. |
| TST-03 | Automated Feature Tests (`php artisan test`) | 🔴 Belum | Perlu penambahan suite pengujian khusus alur Servis, POS, Garansi, dan Webhook AI. |
| TST-04 | Demo Seeder Komprehensif | 🔴 Belum | Perlu seeder sampel data operasional untuk presentasi/sidang skripsi. |

