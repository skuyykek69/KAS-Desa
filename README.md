# 🏛️ Aplikasi Kas Desa & Transparansi Keuangan Publik

Sistem informasi manajemen kas desa dan organisasi berbasis web yang dirancang untuk transparansi akuntabilitas keuangan secara *real-time*. Memungkinkan warga menyetor iuran mandiri, publik memantau mutasi kas, serta bendahara mengelola validasi dan pengeluaran secara aman.

---

## 🚀 Fitur Utama & Pembagian Hak Akses

Aplikasi ini dibagi menjadi 3 hak akses utama sesuai dengan alur kerja organisasi:

### 1. Warga / Publik (Tanpa Login)
* **Dashboard Transparansi:** Pemantauan total saldo kas aktif, akumulasi pemasukan, dan pengeluaran per periode.
* **Riwayat Transaksi Sah:** Melihat daftar transaksi yang telah disetujui (*approved*) lengkap dengan filter periode bulan dan kolom pencarian.
* **Audit Bukti Transaksi:** Mengakses foto kuitansi/bukti transfer *m-banking* untuk transparansi publik.

### 2. Kontributor / Warga Penyetor
* **Form Setor Iuran Mandiri:** Pengisian data setoran (kategori iuran, tanggal transfer, nominal, nama & RT/RW).
* **Unggah Bukti Transfer:** Melampirkan foto resi transfer yang disimpan di Supabase Storage.
* **Status Awal *Pending*:** Data setoran tidak langsung memotong/menambah kas sebelum diverifikasi pengurus.

### 3. Bendahara / Admin (Otorisasi PIN)
* **Panel Kontrol Terkunci:** Keamanan akses menggunakan verifikasi PIN 6-digit.
* **Verifikasi Mutasi (Approval):** Menyetujui (*approve*) atau menolak (*reject*) antrean setoran *pending*.
* **Pencatatan Pengeluaran Kas:** Form khusus belanja desa (dengan nota fisik) yang secara otomatis memotong saldo aktif (*auto-approved*).
* **Manajemen & Penghapusan Data:** Audit total dan penghapusan catatan transaksi jika terjadi kesalahan input.

---

## 🛠️ Stack Teknologi

* **Frontend Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool & Bundler:** [Vite 5](https://vitejs.dev/)
* **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL Database & Object Storage)
* **Styling:** Custom CSS (Neo-Minimalist FinTech & Responsive Layout)
* **Deployment:** [Vercel](https://vercel.com/)

---

## 📁 Struktur Direktori Proyek

```text
kas-desa/
├── public/                 # Berkas statis
├── src/
│   ├── App.tsx             # Komponen utama, Navigasi Responsive & Auth PIN Admin
│   ├── PublicDashboard.tsx # Dasbor Laporan Keuangan Publik & Filter
│   ├── TransactionForm.tsx # Form Unggah Setoran Warga (Status Pending)
│   ├── AdminApprovalPanel.tsx # Panel Otorisasi, Approval, & Input Belanja
│   ├── main.tsx            # Entry point aplikasi React
│   └── index.css           # Sistem Desain Global & Utilities
├── .gitignore              # Konfigurasi pengabaian Git
├── index.html              # Template HTML utama
├── package.json            # Manifest pustaka & skrip build
├── tsconfig.json           # Konfigurasi Kompilator TypeScript
└── vite.config.ts          # Konfigurasi Bundler Vite
```

---

## 🗄️ Skema Database & Storage (Supabase)

### Tabel `transactions`

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key (`gen_random_uuid()`) |
| `created_at` | `timestamp` | Waktu buat record |
| `transaction_date` | `date` | Tanggal nyata transaksi dilakukan |
| `type` | `text` | `'masuk'` atau `'keluar'` |
| `amount` | `numeric` | Nominal uang (Rp) |
| `category` | `text` | Kategori (misal: 'Iuran Warga Bulanan', 'Operasional') |
| `contributor_name` | `text` | Nama warga / donatur (null jika pengeluaran) |
| `description` | `text` | Deskripsi keperluan (null jika pemasukan) |
| `proof_url` | `text` | URL foto nota/bukti transfer di Supabase Storage |
| `status` | `text` | `'pending'` atau `'approved'` |

### Storage Bucket
* **Nama Bucket:** `receipts` (diatur ke mode **Public**)

---

## ⚡ Panduan Instalasi Lokal

### 1. Prasyarat
* Node.js versi 18.x atau lebih baru.
* Akun Supabase aktif.

### 2. Langkah-Langkah

1. **Kloning Repositori:**
   ```bash
   git clone https://github.com/USERNAME/KAS-Desa.git
   cd KAS-Desa
   ```

2. **Instal Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Buat file `.env` di root direktori proyek:
   ```env
   VITE_SUPABASE_URL=https://ID_PROYEK_ANDA.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Jalankan Server Pengembang:**
   ```bash
   npm run dev
   ```
   Akses aplikasi di browser pada alamat `http://localhost:5173`.

---

## 🌐 Panduan Deployment ke Vercel

1. Push repositori ini ke **GitHub**.
2. Buat proyek baru di dasbor **Vercel** dan lakukan import dari repositori tersebut.
3. Di pengaturan proyek Vercel, masukkan **Environment Variables**:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
4. Tekan **Deploy**.

---

## 📄 Lisensi

Proyek ini dibuat untuk tujuan keterbukaan informasi publik dan akuntabilitas organisasi desa. Bebas digunakan dan dikembangkan kembali.