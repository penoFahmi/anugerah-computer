# Panduan Lengkap Deploy ke Lingkungan Produksi (PC Windows dengan Cloudflare Tunnels)

Panduan ini berisi langkah-langkah untuk memigrasikan sistem AI *Microservices* ini dari lingkungan *Localhost* menuju Lingkungan Produksi (*Production*) yang bisa diakses via internet, dengan tetap menjaga keamanan peladen lokal (*Localhost/Intranet*).

---

## TAHAP 1: Konfigurasi Laravel (.env) & Kepercayaan Proksi
Masalah yang sering terjadi saat *deploy* menggunakan proksi (seperti Cloudflare Tunnels) adalah HTTPS tidak terdeteksi oleh Laravel, sehingga menyebabkan CORS *Error* dan *Login Stuck*.

**1. Buka file `.env` dan sesuaikan URL Aplikasi Anda:**
```env
APP_URL=https://domain-anda.com

# Pengaturan Sesi & Keamanan Domain (Wajib agar tidak Login Stuck)
SESSION_DOMAIN=.domain-anda.com
SANCTUM_STATEFUL_DOMAINS=domain-anda.com
```

**2. Percayai Proksi Bawaan (Laravel 11+):**
Di dalam *file* `bootstrap/app.php`, fitur *Trust Proxies* sudah ditambahkan (`$middleware->trustProxies(at: '*');`). Anda tidak perlu melakukan perubahan apa pun lagi pada *file* ini karena sudah aman untuk pengembangan (*Local*) maupun produksi (*Deploy*).

**3. Bersihkan Cache Sistem:**
Setiap mengubah `.env`, jalankan perintah berikut di Terminal:
```bash
php artisan optimize:clear
```

---

## TAHAP 2: Konfigurasi Cloudflare Tunnels (Zero Trust)
Keunggulan arsitektur ini adalah **Mesin NLP Python dan Gateway WhatsApp (Baileys) TIDAK PERLU diekspos ke publik.** Keduanya cukup berjalan di `localhost` agar terlindungi dari retasan luar. 
Yang wajib dibuka jalurnya ke publik hanyalah **Laravel (Port 80/HTTPS)** dan **Soket Reverb (Port 8080/WSS)**.

**Langkah Konfigurasi Soket Reverb di Cloudflare:**
1. Masuk ke dasbor *Cloudflare Zero Trust* $\rightarrow$ *Networks* $\rightarrow$ *Tunnels*.
2. Klik *Tunnel* Anda, lalu pilih **Configure**.
3. Masuk ke *tab* **Public Hostname**. (Jangan buat Tunnel baru, cukup tambah hostname di Tunnel yang sama).
4. Klik **Add a Public Hostname**:
   - Subdomain: `ws` (menjadi `ws.domain-anda.com`)
   - Service Type: `HTTP`
   - URL: `localhost:8080`
5. Simpan pengaturan.

**Sesuaikan kembali `.env` Laravel untuk Broadcaster Reverb:**
```env
REVERB_HOST="ws.domain-anda.com"
REVERB_PORT=443
REVERB_SCHEME=https

VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```
Jalankan `npm run build` sekali lagi agar antarmuka (*frontend*) React.js memuat domain soket yang baru.

---

## TAHAP 3: Konfigurasi *Auto-Run Background* (PM2)
Agar keempat peladen *Microservices* menyala otomatis secara sembunyi-sembunyi di latar belakang (*background*) saat PC dihidupkan (meskipun tanpa membuka jendela CMD), gunakan alat bantu **PM2** dari Node.js.

**1. Instalasi PM2 (Jalankan terminal sebagai Administrator):**
```bash
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
```

**2. Jalankan Proses Peladen (Satu Per Satu):**
Buka terminal dan masuk ke folder proyek masing-masing, lalu daftarkan ke PM2:

*A. Menjalankan Laravel Reverb (Soket Realtime):*
```bash
cd c:\laragon\www\anugerah-computer
pm2 start "php artisan reverb:start" --name "reverb-socket"
```

*B. Menjalankan Laravel Queue (Pekerja Latar Belakang):*
```bash
cd c:\laragon\www\anugerah-computer
pm2 start "php artisan queue:listen" --name "laravel-queue"
```

*C. Menjalankan Mesin NLP AI (Python):*
```bash
cd c:\laragon\www\anugerah-service-nlp
pm2 start "uvicorn main:app --port 8001" --name "nlp-python"
```

*D. Menjalankan Gateway WhatsApp (Baileys):*
```bash
cd c:\laragon\www\anugerah-baileys
pm2 start "npm start" --name "wa-gateway"
```

**3. Kunci Pengaturan agar Permanen (Wajib):**
```bash
pm2 save
```

### Panduan Manajemen PM2 Harian
Karena CMD disembunyikan, gunakan perintah ini di terminal apa saja untuk memantau server:
- `pm2 list` (Melihat status online/offline setiap peladen)
- `pm2 logs` (Melihat aktivitas/log error secara *real-time*)
- `pm2 stop all` (Mematikan seluruh peladen)

---

## TAHAP 4: Konfigurasi Remote Akses (SSH via Tailscale)
Untuk memudahkan *maintenance* atau pembaruan kode tanpa harus datang ke toko (atau membuka Monitor PC Toko), Anda bisa meremote PC Toko dari laptop menggunakan SSH dan VSCode.

**1. Instalasi Jaringan Gaib (Tailscale)**
- Unduh dan instal Tailscale di **PC Toko** dan **Laptop Anda**.
- Login menggunakan akun Google yang **sama persis** di kedua perangkat.
- Catat **IP Tailscale** PC Toko (contoh: `100.73.108.111`).
- Cek *Username Windows* PC Toko (Buka CMD di PC Toko, ketik `whoami`).

**2. Instalasi OpenSSH Server di PC Toko (Wajib)**
Buka **PowerShell** di PC Toko dengan mode **Run as Administrator**, lalu *copy-paste* perintah berikut secara berurutan:
```powershell
# 1. Menginstal Pelayan SSH bawaan Windows
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# 2. Menyalakan Pelayan SSH dan membuatnya otomatis menyala saat PC hidup
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'

# 3. Membuka pintu Firewall untuk Port 22 (SSH)
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

**3. Meremote Kodingan Menggunakan VSCode (Di Laptop Anda)**
- Buka VSCode di **Laptop Anda**.
- Pergi ke menu *Extensions* dan instal ekstensi bernama **Remote - SSH** (buatan Microsoft).
- Tekan tombol **F1**, lalu cari dan pilih `Remote-SSH: Connect to Host...`
- Pilih **+ Add New SSH Host...**
- Ketik perintah koneksi: `ssh UsernamePCToko@IPTailscalePCToko` (Contoh: `ssh kasir@100.73.108.111`).
- Pilih Sistem Operasi: **Windows**.
- Masukkan *password* PC Toko jika diminta.
- Setelah terhubung, klik menu *Explorer* di VSCode $\rightarrow$ *Open Folder* $\rightarrow$ arahkan ke direktori `C:\laragon\www\anugerah-computer` milik PC Toko.

🎉 *Selesai! Sekarang Anda bisa mengedit file (seperti .env) atau menjalankan Terminal/CMD PC Toko langsung dari VSCode di laptop Anda, kapan pun dan dari mana pun!*
