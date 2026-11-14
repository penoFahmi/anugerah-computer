# 🛠️ Catatan Teknis, Lingkungan & Daftar Isu (Technical Issues)

Dokumen ini memuat catatan teknis arsitektur, konfigurasi lingkungan (*environment*), standar penomoran data, serta daftar pekerjaan rumah teknis (*technical debt* / bug tracker).

---

## 💻 1. Kebutuhan Lingkungan & Layanan Pendukung

Untuk menjalankan sistem secara utuh (*end-to-end*), dibutuhkan 4 proses/layanan yang berjalan berdampingan:

1. **Aplikasi Inti Laravel (Backend PHP 8.3):**
   ```bash
   php artisan serve
   ```
2. **Frontend Bundler (Vite + React 19):**
   ```bash
   npm run dev
   ```
3. **Pekerja Antrean Latar Belakang (Queue Worker):**
   ```bash
   php artisan queue:work
   ```
   *Wajib aktif untuk memproses webhook WhatsApp (`ProcessInboundWaMessage`) dan pembuatan struk PDF lunas (`SendFinalReceiptPdf`).*
4. **WebSocket Server (Laravel Reverb):**
   ```bash
   php artisan reverb:start
   ```
   *Wajib aktif untuk pembaruan instan Live Chat Widget, Papan Kanban, dan Notifikasi Staf.*
5. **Microservice Eksternal:**
   - **WhatsApp Gateway (Node.js Baileys):** Meneruskan pesan masuk ke `POST /api/message`.
   - **NLP FastText SVM Microservice (Python):** Menerima HTTP POST teks pesan dan mengembalikan label `intent` beserta nilai `confidence`.
   - **Groq Cloud API Key:** Kredensial LLM Groq (`GROQ_API_KEY`) untuk agen `CustomerService` dan `IntentAnalyzer`.

---

## 🏷️ 2. Standar Penomoran Dokumen Sistem

| Entitas | Format Kode | Contoh | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Nota Tiket Servis** | `SRV-YYYYMMDD-XXX` | `SRV-20261109-001` | Urutan 3 digit per tanggal |
| **Faktur Kasir POS** | `INV-YYYYMMDD-[RANDOM5]` | `INV-20261109-AB3X9` | Karakter alfanumerik acak 5 digit |
| **Pembelian Bekas / Trade-In** | `TRD-YYYYMMDD-XXXX` | `TRD-20261109-0001` | Urutan 4 digit per tanggal |
| **Kartu Garansi** | `WRN-YYYYMMDD-[RANDOM5]` | `WRN-20261109-7KZ91` | Karakter alfanumerik acak 5 digit |

---

## ⚠️ 3. Daftar Isu & Pekerjaan Rumah Teknis (Technical Debt)

### [PRIORITAS TINGGI]
1. **Penyempurnaan Alur Booking Daring (`/sales/online`)**:
   - *Kondisi saat ini*: Tabel antrean di admin sudah siap, namun belum ada tombol/modal pesan unit di halaman katalog publik (`/katalog`), dan tabel admin belum memiliki tombol aksi setujui (*confirm*) atau batalkan (*cancel*).
   - *Tindakan*: Tambahkan aksi `store`, `update`, dan `cancel` pada `OnlineBookingController` beserta modal di frontend.
2. **Formulir Edit Pelanggan di CRM (`/customers`)**:
   - *Kondisi saat ini*: Staf hanya bisa melihat dan menghapus pelanggan. Jika pelanggan berganti nomor telepon atau salah eja nama, belum bisa diedit dari menu CRM.
   - *Tindakan*: Tambahkan aksi `update` di `CustomerController` dan tombol Edit di tabel CRM.

### [PRIORITAS SEDANG]
3. **Penyelarasan Tipe Data TypeScript (`tsc --noEmit`)**:
   - *Kondisi saat ini*: `npm run build` sukses 100%, namun pemeriksaan `tsc --noEmit` melaporkan 75 peringatan tipe.
   - *Penyebab*: Tipe `PageProps` Inertia belum memiliki index signature `[key: string]: any`, konflik nama tipe `Customer` di `types/index.ts`, dan tipe transisi `framer-motion`.
   - *Tindakan*: Rapikan deklarasi interface agar `tsc` benar-benar bersih tanpa error.
4. **Penyediaan Demo Seeder (Sampel Data)**:
   - *Kondisi saat ini*: Data operasional di database lokal masih 0.
   - *Tindakan*: Buat seeder komprehensif berisi sampel 10-15 data servis dengan berbagai status, riwayat chat log, beberapa transaksi kasir, dan katalog laptop agar siap didemokan.

### [PRIORITAS RENDAH]
5. **Ekstensi `pdo_sqlite` untuk Unit Testing**:
   - *Kondisi saat ini*: `php artisan test` gagal dengan error `could not find driver (Connection: sqlite)`.
   - *Tindakan*: Pasang ekstensi `php-sqlite3` pada lingkungan PHP Linux atau atur `phpunit.xml` menggunakan database testing MySQL terpisah.
6. **Ekspansi Filter Tempat Sampah (`/sampah`)**:
   - *Kondisi saat ini*: `Product` dan `SparePart` sudah menggunakan trait `SoftDeletes`, namun belum diikutkan dalam paginasi `TrashController`.
   - *Tindakan*: Tambahkan tab/filter untuk memulihkan produk atau sparepart yang terhapus secara tidak sengaja.

