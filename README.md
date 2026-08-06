# Anugerah Computer - Enterprise Service & POS System 

Aplikasi terintegrasi untuk manajemen toko komputer (Point of Sale), pusat layanan servis (Services), dan layanan pelanggan cerdas berbasis AI. Sistem ini bertindak sebagai **Orchestrator** yang menghubungkan operasional toko dengan layanan WhatsApp otomatis menggunakan teknologi Hybrid AI (NLP + LLM).

---

## 🏛️ Arsitektur & Alur Sistem (System Flow)

Sistem ini mengadopsi arsitektur terdistribusi berbasis *Microservices*, dengan **Laravel (PHP)** sebagai *Core Orchestrator* yang menjembatani beberapa layanan:

1.  **Core Application (Laravel + React/Inertia):** Menangani UI/UX, database, logika bisnis, manajemen inventaris, dan POS.
2.  **WhatsApp API Gateway (Node.js/Baileys):** Meneruskan pesan masuk dari WhatsApp pelanggan ke Webhook Laravel (`/api/message`).
3.  **NLP Microservice (Python - anugerah-service-nlp):** Layanan klasifikasi teks menggunakan algoritma *Support Vector Machine* (SVM) untuk mendeteksi *Intent* (Niat) dari pesan pelanggan.
4.  **LLM Fallback (Groq API):** Jika *confidence score* dari klasifikasi NLP rendah (< 75%), sistem akan menyerahkan percakapan kepada LLM (Groq) via `CustomerService` agent untuk menyusun jawaban dinamis.

**Alur Pesan Masuk (Inbound Message Flow):**
1. `Pelanggan (WhatsApp)` ➡️ `WA Gateway (Node.js)` 
2. Gateway meneruskan *payload* ke `Webhook Laravel` (`WhatsappWebhookController`).
3. Laravel memfilter *Echo Loop* (Pesan sendiri) dan menaruh *payload* ke dalam antrean (`ProcessInboundWaMessage`).
4. Antrean diproses di *background*: memanggil `IntentAnalyzer` (kirim HTTP Request ke layanan Python NLP).
5. Keputusan Berbasis Skor NLP:
   - **Tinggi (>=75%)**: Laravel langsung mengeksekusi aksi khusus (contoh: mengambil data dari database terkait status servis) dan membalas via gateway.
   - **Rendah (<75%)**: Teks dilempar ke `CustomerService` (Groq LLM) agar bisa dijawab natural layaknya manusia.

---

## Modul Utama (Core Features)

1.  **Pusat Servis (Service & Kanban Board):**
    - Manajemen tiket servis dengan antarmuka Kanban drag-and-drop (Menunggu Dicek, Proses, Selesai, Diambil).
    - Cetak nota digital / tiket servis berformat PDF.
    - Integrasi penggantian sparepart langsung ke dalam tiket servis.
2.  **Point of Sale (POS) & Penjualan:**
    - Modul kasir untuk penjualan produk fisik dan suku cadang.
    - Fitur *Trade-In* (Tukar Tambah) dan Pemesanan Online dari pelanggan.
3.  **Manajemen Inventaris (Inventory):**
    - Pemantauan stok produk reguler dan suku cadang (spareparts).
    - Proses pencatatan pengadaan barang (Procurement).
4.  **Keuangan (Finance) & CRM:**
    - Laporan Arus Kas (Cashflow) dan Laba Rugi (Profit/Loss).
    - Manajemen master data pelanggan.
5.  **Bot WhatsApp Cerdas (Hybrid AI):**
    - Membalas otomatis pertanyaan pelanggan seputar status servis, ketersediaan barang, dan info toko.
    - Mendukung intervensi manual (Admin via HP), dimana webhook mendeteksi *outbound message* dan menghentikan AI sementara.

---

## Stack Teknologi

- **Backend:** Laravel 13, PHP 8.3
- **Frontend:** React 19, Inertia.js v3, Tailwind CSS v4, shadcn/ui
- **Database:** MySQL / SQLite
- **Komunikasi Real-Time:** Laravel Reverb (WebSockets)
- **AI Integrasi:** API Groq (LLM), HTTP Client ke Python API (SVM NLP)
- **Testing:** Pest PHP v4

---

## Panduan Instalasi (Development)

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/penoFahmi/anugerah-computer.git
   cd anugerah-computer
   ```

2. **Install Dependensi:**
   ```bash
   composer install
   npm install
   ```

3. **Konfigurasi Environment:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Penting: Buka file `.env` dan atur kredensial Database, `NLP_SERVICE_URL`, `GROQ_API_KEY`, dan `WA_GATEWAY_TOKEN` agar sistem berjalan penuh.*

4. **Setup Database (Migrasi & Seeding):**
   ```bash
   php artisan migrate:fresh --seed
   ```

5. **Jalankan Aplikasi:**
   Dibutuhkan beberapa terminal untuk menjalankan service secara paralel:

   - **Terminal 1** (Backend Server): `php artisan serve`
   - **Terminal 2** (Frontend Bundler): `npm run dev`
   - **Terminal 3** (WebSockets): `php artisan reverb:start`
   - **Terminal 4** (Background Queue): `php artisan queue:work`

   *(Alternatif: Gunakan perintah `composer run dev` jika script concurrently telah disiapkan).*

---
*Dikembangkan untuk operasional Anugerah Computer & Keperluan Akademis Skripsi.*