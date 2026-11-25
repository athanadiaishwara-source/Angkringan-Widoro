# 🏛️ Angkringan Widoro — Company Profile & Wedding Venue Website

> **Tagline Utama**: *"Nguliner Neng Kebon — A Taste of Tradition, A Place for Memories."*  
> **Konsep Visual**: **Javanese Heritage** (Dark Walnut `#593B2C`, Natural Wood `#A4774F`, Warm Cream `#E9DFC9`, Ivory `#F7F3EA`, Olive Green `#68704D`, Charcoal `#29251F`).  
> **Mitra UMKM**: **Angkringan Widoro**, Cantelan, Desa Ketandan, Kec. Klaten Utara, Kab. Klaten, Jawa Tengah (Tepat di Belakang Pabrik Vanili).

Aplikasi web modern, terintegrasi, dan responsif yang berfungsi ganda sebagai:
1. **Profil Digital & Promosi Restoran Kuliner**: Memperkenalkan konsep unik *"Nguliner Neng Kebon"*, bangunan Joglo terbuka, kebon asri, dan hidangan ikonik legendaris seperti **Soto Kerbau Widoro**, aneka nasi bungkus daun, sate angkringan komplit, hingga wedangan rempah tradisional.
2. **Platform Promosi Wedding & Event Venue**: Memperkenalkan Angkringan Widoro sebagai ruang perayaan pernikahan intim (*intimate wedding*), *garden party*, lamaran, maupun *gathering* berkapasitas hingga 600 tamu.
3. **Panel Pengelola CMS Mandiri**: Memungkinkan pemilik usaha untuk mengelola katalog menu, galeri foto, paket pernikahan, ulasan pelanggan, konten website, dan menindaklanjuti pengajuan *inquiry* tamu secara langsung via WhatsApp tanpa perlu mengedit kode program.

---

## 🌟 Fitur Utama & Arsitektur Sistem

**SATU WEBSITE, SATU CODEBASE, SATU DEPLOYMENT, SATU DATABASE TERPADU:**
Baik antarmuka publik pengunjung maupun antarmuka privat admin pengelola berada dalam satu aplikasi utuh yang saling terhubung secara *real-time* ke database bersama.

### A. Antarmuka Publik Pengunjung (Public User Interface)
- **`/` — Beranda (Homepage)**: Hero banner berkonsep tradisi, pengenalan brand, kartu 2 pengalaman utama (*Restoran & Wedding Venue*), preview menu andalan (Soto Kerbau), sorotan venue, cuplikan galeri, testimoni terverifikasi, alamat & jam buka, serta navigasi responsif.
- **`/about` — Tentang Kami**: Kisah berdirinya Angkringan Widoro di Cantelan Klaten, filosofi arsitektur Joglo kayu jati, konsep kebon terbuka, visi, misi, dan nilai keramahtamahan Jawa.
- **`/restaurant` — Restoran & Katalog Menu**: Pengalaman bersantap santai dengan filter kategori dinamis (*Makanan Utama, Camilan & Sate, Hidangan Pembuka, Minuman Tradisional/Kopi, Penutup*), pencarian nama menu instan, label menu ikonik (*Signature*), dan harga transparan.
- **`/wedding-venue` — Wedding & Event Venue**: Promosi venue pernikahan lengkap dengan galeri foto dekorasi, daftar 9 fasilitas venue, rincian kapasitas (hingga 600 tamu), perbandingan paket acara (*Paket Joglo Asri 100 Pax, Paket Kebon Widoro 250 Pax, Paket Ageng Widoro 500 Pax, Paket Gathering 50 Pax*), serta **Formulir Pengajuan Wedding Inquiry** dengan validasi otomatis.
- **`/gallery` — Galeri Foto**: Koleksi potret resolusi tinggi dengan filter kategori (*Interior Joglo, Makanan & Minuman, Suasana Kebun, Pernikahan & Acara, Detail Venue*) dan fitur **Lightbox Viewer** interaktif.
- **`/contact` — Kontak & Lokasi**: Informasi alamat lengkap di belakang Pabrik Vanili Klaten Utara, tabel jam buka operasional, akun Instagram, tombol tautan WhatsApp langsung, peta interaktif Google Maps, dan formulir pertanyaan umum.
- **Floating WhatsApp Button**: Tombol mengambang di pojok kanan bawah pada seluruh halaman untuk memudahkan pengunjung berkonsultasi langsung.

### B. Antarmuka Pemilik / Admin CMS (Private Owner Interface)
- **`/admin/login` — Login Aman**: Autentikasi email dan kata sandi dengan pengacakan *salt* dan *hashing* PBKDF2 (SHA-512) serta token sesi 7 hari.
- **`/admin/dashboard` — Ringkasan Metrik**: Statistik riil dari database (*Total Menu Aktif, Total Foto Galeri, Total Inquiries, Wedding Inquiries Baru*), daftar pengajuan terbaru, dan tombol aksi cepat.
- **`/admin/inquiries` — Manajemen Pengajuan Masuk**: Tabel pengajuan *inquiry* pernikahan dan umum, filter status (*Baru, Sedang Ditinjau, Ditanggapi, Selesai*), modal rincian pesan, kolom catatan internal pengelola, dan **tombol WhatsApp otomatis** yang langsung membuka obrolan dengan teks sapaan personal berbahasa Indonesia.
- **`/admin/menu` — Kelola Menu (CRUD Lengkap)**: Tambah menu baru, ubah nama/harga/kategori/foto, tandai menu ikonik (*Signature*), ubah status publikasi (*Tayang / Draft*), dan hapus menu.
- **`/admin/gallery` — Kelola Galeri**: Unggah foto baru, tentukan kategori, tambah deskripsi, dan hapus foto.
- **`/admin/wedding-venue` — Kelola Venue & Paket**: Ubah profil dan kapasitas venue, serta kelola paket pernikahan (nama paket, jumlah pax, harga, dan poin-poin fasilitas termasuk).
- **`/admin/testimonials` — Kurasi Testimoni**: Tambah, edit, dan moderasi ulasan pelanggan serta rating bintang.
- **`/admin/website-content` — CMS Konten Teks**: Ubah teks headline beranda, narasi tentang kami, alamat, jam buka operasional, nomor WhatsApp, dan akun Instagram tanpa menyentuh kode.
- **`/admin/settings` — Pengaturan Akun**: Ganti kata sandi admin dan perbarui profil pengelola.

---

## 🗄️ Struktur Database Relasional (SQLite / Cloudflare D1)

Sistem menggunakan database relasional terpadu yang 100% kompatibel antara SQLite lokal dan Cloudflare D1:

1. `admin_users` — Kredensial akun pengelola, password hash & salt, nama, dan role.
2. `website_content` — Penyimpanan key-value untuk teks dinamis beranda, tentang kami, kontak, jam operasional.
3. `menu_categories` — Kategori hidangan (*Makanan Utama, Camilan & Sate, Minuman Tradisional, dll.*).
4. `menu_items` — Katalog hidangan makanan dan minuman beserta harga, status tayang, dan label signature.
5. `venue_info` — Profil venue, kapasitas duduk & berdiri, deskripsi Joglo dan area kebon.
6. `venue_facilities` — Daftar fasilitas penunjang venue (*Mushola, Parkir Luas, Sound System, dll.*).
7. `wedding_packages` — Pilihan paket pernikahan beserta harga, jumlah pax, dan rincian fasilitas termasuk (*JSON*).
8. `gallery_images` — Foto-foto galeri, kategori, caption, dan status tayang.
9. `testimonials` — Ulasan pelanggan terverifikasi beserta bintang rating.
10. `inquiries` — Formulir masuk dari pengunjung (tipe, nama, WhatsApp, tanggal acara, estimasi tamu, status tindak lanjut, catatan internal).
11. `sessions` — Token sesi login admin yang aman dan memiliki masa kedaluwarsa.

---

## 🚀 Panduan Menjalankan Secara Lokal

### Kredensial Login Admin Default
- **URL Login**: `http://localhost:3000/admin/login`
- **Email**: `admin@angkringanwidoro.com`
- **Password**: `adminwidoro123`

### Menjalankan Aplikasi
Aplikasi dibangun menggunakan **Node.js standar murni (Zero External Dependencies)** dengan SQLite bawaan (`node:sqlite`).

```bash
# Masuk ke direktori proyek
cd go-go-UMKM

# Jalankan server
npm start
# atau
node server.js
```

Server akan aktif di `http://localhost:3000`.

### Menjalankan Uji Otomatis (Testing)
Untuk memastikan seluruh file, database, skema, tabel, autentikasi, dan operasi CRUD bekerja 100%:
```bash
node test/run_tests.js
```

---

## ☁️ Panduan Deployment ke Cloudflare

Website ini dirancang khusus agar dapat dideploy ke **Cloudflare Pages** dengan database serverless **Cloudflare D1** dan edge functions **Cloudflare Pages Functions**.

### Langkah 1: Pasang Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### Langkah 2: Buat Database Cloudflare D1
```bash
wrangler d1 create angkringan-widoro-db
```
Catat `database_id` yang dihasilkan, lalu masukkan ke dalam berkas `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "angkringan-widoro-db"
database_id = "ISI_DENGAN_DATABASE_ID_ANDA"
```

### Langkah 3: Eksekusi Skema & Seeding Awal ke Cloudflare D1
```bash
# Jalankan skema tabel ke D1
wrangler d1 execute angkringan-widoro-db --file=./schema.sql

# Masukkan data awal Angkringan Widoro
wrangler d1 execute angkringan-widoro-db --command="
INSERT INTO admin_users (email, password_hash, salt, name, role) 
VALUES ('admin@angkringanwidoro.com', 'a3f8c...hash...', 'salt...', 'Pengelola Widoro', 'owner');
"
```

### Langkah 4: Hubungkan ke GitHub & Cloudflare Pages
1. Buka dashboard Cloudflare: [dash.cloudflare.com](https://dash.cloudflare.com)
2. Masuk ke menu **Workers & Pages** &rarr; **Create Application** &rarr; Tab **Pages** &rarr; **Connect to Git**.
3. Pilih repository `athanadiaishwara-source/go-go-UMKM`.
4. Pengaturan Build:
   - **Framework preset**: `None`
   - **Build command**: `npm run build` *(opsional)*
   - **Build output directory**: `public`
5. Pada menu **Settings** &rarr; **Functions** &rarr; **D1 Database Bindings**:
   - Variable name: `DB`
   - D1 database: `angkringan-widoro-db`
6. Klik **Save and Deploy**.

### Langkah 5: Hubungkan Custom Domain
1. Di dashboard Cloudflare Pages, buka tab **Custom domains**.
2. Masukkan domain yang diinginkan (misal: `www.angkringanwidoro.com`).
3. Cloudflare akan secara otomatis mengonfigurasi DNS dan menyediakan sertifikat SSL gratis.

---

## 📂 Struktur Direktori Proyek

```
go-go-UMKM/
├── 17 November/             # Dokumen hasil riset mitra (dipertahankan utuh)
├── bin/
│   └── node                 # Wrapper node runner ramah environment
├── data/
│   ├── database.sqlite      # Basis data lokal SQLite terpadu
│   └── seed.js              # Script inisialisasi data otentik Angkringan Widoro
├── functions/               # Cloudflare Pages Functions
│   └── api/
│       └── [[path]].js      # Edge REST API handler untuk Cloudflare D1
├── public/                  # Aset statis & berkas klien
│   ├── admin/
│   │   └── index.html       # Antarmuka Admin CMS (/admin/*)
│   ├── css/
│   │   ├── variables.css    # Palet warna Javanese Heritage & tipografi
│   │   ├── public.css       # Desain antarmuka pengunjung publik
│   │   └── admin.css        # Desain dashboard pengelola CMS
│   ├── images/
│   │   ├── logo.svg         # Logo vektor Joglo Angkringan Widoro
│   │   └── batik-pattern.svg# Motif latar belakang batik kawung halus
│   ├── js/
│   │   ├── api.js           # Shared client API & utilitas format Rupiah/Tanggal
│   │   ├── public.js        # Routing publik, filter menu, galeri lightbox, formulir
│   │   └── admin.js         # Routing admin, login sesi, CRUD menu, galeri, inquiries
│   └── index.html           # Antarmuka Pengunjung Publik (/, /about, dll)
├── test/
│   └── run_tests.js         # Pengujian integrasi otomatis menyeluruh
├── package.json             # Konfigurasi proyek & perintah script
├── schema.sql               # Skema tabel database (SQLite & Cloudflare D1)
├── server.js                # Server universal Node.js Full-Stack (Zero Dependency)
├── wrangler.toml            # Konfigurasi deployment Cloudflare Pages & D1
└── README.md                # Dokumentasi lengkap proyek
```

---

Dibuat dengan ❤️ dan dedikasi untuk pelestarian warisan budaya dan kemajuan UMKM kuliner Indonesia: **Angkringan Widoro — Nguliner Neng Kebon, Cantelan, Klaten**.
