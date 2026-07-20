# Anugerah Computer - Enterprise Service & POS System

Aplikasi manajemen servis komputer, Point of Sale (POS), dan layanan pelanggan cerdas yang dirancang khusus untuk toko **Anugerah Computer**. Sistem ini memadukan kemudahan operasional kasir/teknisi dengan kecerdasan buatan (AI) hibrida untuk melayani pelanggan via WhatsApp secara otomatis.

## ✨ Fitur Utama

- **Pusat Kendali Operasional Servis (Kanban)**
  Visualisasi tiket servis pelanggan yang interaktif. Teknisi dan Admin dapat memantau status perangkat dari "Menunggu Dicek" hingga "Selesai Diambil".
- **Bot WhatsApp Cerdas (Hybrid AI)**
  Terintegrasi dengan modul NLP Python (SVM) untuk mendeteksi niat (Intent) pelanggan. Dilengkapi dengan sistem *fallback* ke Large Language Model (Groq API) jika pertanyaan terlalu kompleks.
- **Point of Sale (POS) & Inventaris**
  Manajemen transaksi kasir, stok sparepart, dan perangkat.
- **Dashboard Analitik & Log Webhook**
  Memantau performa keuangan toko serta metrik akurasi dari respons AI terhadap pelanggan secara transparan (sangat berguna untuk analisis data skripsi/akademis).
- **Cetak Tiket & Nota Digital (PDF)**
  Memudahkan pencetakan tanda terima servis untuk pelanggan secara instan.

## 🛠️ Teknologi yang Digunakan

- **Backend:** Laravel 11, PHP 8.2+
- **Frontend:** Inertia.js (React), Tailwind CSS v4, shadcn/ui
- **Database:** MySQL
- **AI / Pihak Ketiga:** API Groq (LLM), Node.js (WhatsApp Web API Gateway)
- **Komunikasi Internal:** REST API berkomunikasi dengan `anugerah-service-nlp` (Microservice Python)

## 🚀 Panduan Instalasi (Development)

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/penoFahmi/anugerah-computer.git
   cd anugerah-computer
   ```

2. **Install Dependensi PHP & Node:**
   ```bash
   composer install
   npm install
   ```

3. **Konfigurasi Environment:**
   Salin file env dan buat kunci aplikasi:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Pastikan untuk mengisi kredensial database (`DB_*`), URL webhook NLP (`NLP_SERVICE_URL=http://localhost:8001`), dan kunci API Groq (`GROQ_API_KEY`) di dalam file `.env`.*

4. **Setup Database (Migrasi & Seeding):**
   ```bash
   php artisan migrate:fresh --seed
   ```

5. **Jalankan Aplikasi:**
   Buka 2 terminal terpisah untuk menjalankan backend dan frontend builder:
   ```bash
   php artisan serve
   ```
   ```bash
   npm run dev
   ```

## 🤖 Integrasi AI (NLP & LLM)
Aplikasi Laravel ini bertindak sebagai *Orchestrator* (Pengatur utama). Ketika pesan WhatsApp masuk:
1. Laravel mengirim pesan ke `anugerah-service-nlp` (Port 8001) untuk diprediksi menggunakan model Machine Learning konvensional (SVM).
2. Jika skor akurasi (Confidence) SVM **>= 75%**, Laravel mengeksekusi niat secara langsung.
3. Jika skor **< 75%**, Laravel akan mengalihkan pemrosesan teks ke LLM Groq (*Fallback*) untuk merangkai jawaban yang lebih dinamis.

---
*Dikembangkan untuk operasional Anugerah Computer & Keperluan Akademis Skripsi.*