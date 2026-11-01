# Aplikasi Kas Desa & Transparansi Keuangan (Semi-Otomatis)

Aplikasi pencatatan kas desa, RT, atau organisasi berbasis web modern yang transparan, aman, dan 100% gratis untuk di-*deploy*. Dilengkapi dengan sistem validasi bukti transfer/nota oleh bendahara dan dasbor publik untuk warga.

## 🚀 Fitur Utama
* **Dashboard Publik:** Transparansi saldo kas aktif, akumulasi pemasukan, pengeluaran, serta riwayat transaksi sah yang dapat diakses oleh seluruh warga.
* **Setoran Mandiri (Semi-Otomatis):** Warga dapat mencatat setoran iuran dan mengunggah foto bukti transfer langsung dari perangkat seluler.
* **Panel Approval Bendahara:** Memvalidasi (*approve/reject*) mutasi masuk agar data dan saldo kas akurat serta terhindar dari klaim palsu.
* **Cloud Storage (Supabase):** Penyimpanan aman untuk foto nota belanja dan bukti transfer.

## 🛠️ Tech Stack
* **Frontend:** React, TypeScript, Vite
* **Database & Storage:** Supabase (PostgreSQL & Supabase Storage)
* **Hosting / Deployment:** Vercel

---

## 📦 Panduan Deployment ke Vercel

Ikuti langkah-langkah berikut untuk mempublikasikan aplikasi ini secara gratis ke Vercel:

### 1. Persiapan Repositori GitHub
Pastikan seluruh kode proyek Anda sudah di-*push* ke dalam repositori GitHub pribadi atau organisasi Anda.

### 2. Konfigurasi Database Supabase
1. Buat proyek baru di [Supabase](https://supabase.com/).
2. Buat tabel bernama `transactions` dengan struktur kolom SQL berikut:
   ```sql
   create table transactions (
     id uuid default gen_random_uuid() primary key,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     type text check (type in ('masuk', 'keluar')) not null,
     amount numeric not null,
     contributor_name text,
     description text,
     proof_url text not null,
     status text check (status in ('pending', 'approved')) default 'pending' not null
   );
