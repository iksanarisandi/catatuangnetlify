# CatatUang

Aplikasi web sederhana untuk mencatat pemasukan dan pengeluaran, dengan data tersimpan di Supabase.

## Fitur

- Register & login (email/password)
- Tambah transaksi pemasukan/pengeluaran
- Ringkasan saldo bulanan
- Filter transaksi per bulan
- Hapus transaksi

## Stack

- HTML + Vanilla JavaScript (ES modules)
- Tailwind CSS & Font Awesome (CDN)
- Supabase (Auth + PostgreSQL + RLS)

## Setup Lokal

### 1. Buat project Supabase

1. Buat akun di [supabase.com](https://supabase.com)
2. Buat project baru
3. Buka **SQL Editor** → jalankan isi file [`supabase/migrations/20250618000000_create_transactions.sql`](supabase/migrations/20250618000000_create_transactions.sql)

### 2. Konfigurasi Auth

Di Supabase Dashboard → **Authentication → Providers → Email**:
- Pastikan Email provider aktif
- Untuk development, nonaktifkan **Confirm email** agar bisa langsung login setelah daftar

Di **Authentication → URL Configuration**:
- Site URL: `http://localhost:3000` (atau URL dev Anda)

### 3. Konfigurasi aplikasi

Salin kredensial Supabase ke config:

```bash
cp config.example.js js/config.js
```

Edit `js/config.js` — isi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` dari Supabase Dashboard → **Settings → API**.

### 4. Jalankan

Karena app memakai ES modules, buka via local server (bukan `file://`):

```bash
npx serve .
```

Buka `http://localhost:3000` di browser.

## Deploy ke Netlify

1. Push repo ke GitHub
2. Netlify → **Add new site → Import repository**
3. Build settings (otomatis dari `netlify.toml`):
   - Build command: `node scripts/generate-config.js`
   - Publish directory: `.`
4. Set **Environment variables** di Netlify:
   - `SUPABASE_URL` — Project URL dari Supabase
   - `SUPABASE_ANON_KEY` — anon/public key dari Supabase
5. Di Supabase → **Authentication → URL Configuration**:
   - Site URL: `https://your-app.netlify.app`
6. Deploy

## Struktur Project

```
├── index.html          # SPA (login, register, dashboard)
├── css/style.css       # Animasi & utilitas
├── js/
│   ├── app.js          # Entry point
│   ├── auth.js         # Login, register, logout
│   ├── transactions.js # CRUD transaksi
│   ├── ui.js           # Render DOM
│   ├── supabase.js     # Supabase client
│   └── config.js       # Kredensial (gitignored)
├── scripts/generate-config.js  # Build step Netlify
├── supabase/migrations/        # SQL schema
└── netlify.toml
```

## Keamanan

- Hanya **anon key** yang dipakai di frontend
- Jangan commit `js/config.js` ke git
- Row Level Security (RLS) memastikan setiap user hanya akses data sendiri
