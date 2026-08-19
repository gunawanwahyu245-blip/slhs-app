# Aplikasi Data SLHS SPPG — versi multi-petugas

Versi ini bisa dipakai bersama oleh beberapa petugas: semua orang yang login
dengan password yang sama akan melihat dan mengubah **data yang sama**,
tersimpan di database (bukan lagi di browser masing-masing).

## Struktur proyek

```
slhs-sppg-app/
├── public/index.html   ← aplikasi (form, tabel, sertifikat, dashboard)
├── api/login.js        ← cek password bersama, buat sesi login
├── api/logout.js       ← hapus sesi login
├── api/session.js      ← cek status login saat halaman dibuka
├── api/data.js         ← baca/tulis data bersama (records & pengaturan)
├── lib/auth.js         ← helper token sesi (JWT) & cookie
├── lib/supabase.js     ← koneksi ke database Supabase
├── schema.sql          ← perintah SQL untuk membuat tabel di Supabase
├── .env.example        ← contoh variabel environment yang dibutuhkan
└── vercel.json
```

## Cara kerja login

Ini **satu password bersama** untuk semua petugas (bukan akun per-orang).
Saat login, petugas boleh mengisi nama (opsional) — nama ini hanya dipakai
untuk catatan "terakhir diubah oleh siapa", bukan untuk otentikasi.

Jika ke depannya Anda butuh akun terpisah per petugas (misalnya supaya bisa
tahu siapa mengubah data apa dengan lebih pasti, atau bisa menonaktifkan
akun orang tertentu), itu perubahan yang bisa dibangun menyusul — beri tahu
saya kapan saja.

---

## Langkah Deploy

### 1. Buat project Supabase (database, gratis)

1. Buka https://supabase.com → **Start your project** → daftar/login.
2. **New Project** → beri nama (misal `slhs-sppg`), buat password database
   (simpan baik-baik, ini beda dari `SHARED_PASSWORD` aplikasi), pilih region
   terdekat (Singapore biasanya paling dekat & cepat dari Indonesia).
3. Tunggu project selesai dibuat (~1-2 menit).
4. Buka menu **SQL Editor** → **New query** → salin-tempel isi file
   `schema.sql` dari proyek ini → klik **Run**. Ini membuat tabel `kv_store`
   tempat data aplikasi disimpan.
5. Buka **Project Settings** (ikon gerigi) → **API**. Catat dua nilai ini:
   - **Project URL** → untuk `SUPABASE_URL`
   - **service_role key** (di bagian "Project API keys", bukan yang
     `anon public`) → untuk `SUPABASE_SERVICE_ROLE_KEY`

   ⚠️ **service_role key ini sangat sensitif** — jangan pernah ditaruh di
   kode frontend atau dibagikan. Di proyek ini dia hanya dipakai di
   `lib/supabase.js`, yang berjalan di server (aman).

### 2. Siapkan akun Vercel (hosting, gratis)

1. Buka https://vercel.com → daftar/login (bisa pakai akun GitHub).
2. Cara termudah: unggah folder proyek ini ke repository **GitHub** baru
   (bisa privat), lalu di Vercel klik **Add New → Project → Import** dari
   repo tersebut.
   - Alternatif tanpa GitHub: install Vercel CLI (`npm i -g vercel`), lalu
     dari dalam folder proyek jalankan `vercel` dan ikuti instruksinya.

### 3. Atur Environment Variables di Vercel

Di Vercel: **Project → Settings → Environment Variables**, tambahkan empat
variabel ini (nilainya isi sendiri, lihat `.env.example`):

| Nama | Isi |
|---|---|
| `SHARED_PASSWORD` | Password yang akan dipakai semua petugas untuk login |
| `SESSION_SECRET` | String acak panjang, contoh cara buat: `openssl rand -base64 48` (atau boleh ketik sendiri string panjang & acak) |
| `SUPABASE_URL` | Dari langkah 1.5 |
| `SUPABASE_SERVICE_ROLE_KEY` | Dari langkah 1.5 |

Setelah menambahkan, klik **Deploy** (atau **Redeploy** jika sudah pernah
deploy sebelumnya) supaya variabel-variabel ini terpakai.

### 4. Selesai — uji coba

Buka URL yang diberikan Vercel (misalnya `https://slhs-sppg-app.vercel.app`).
Anda akan melihat layar login. Masukkan `SHARED_PASSWORD` yang tadi diatur.
Setelah masuk, data yang diinput akan tersimpan di Supabase dan bisa dilihat
petugas lain yang login dengan password yang sama, dari perangkat manapun.

Untuk membagikan ke petugas: cukup bagikan **URL Vercel** dan
**SHARED_PASSWORD**-nya (lewat jalur yang aman, misal WhatsApp ke masing-
masing petugas, bukan ditempel di tempat umum).

---

## Mengganti password bersama nanti

Buka **Vercel → Project → Settings → Environment Variables**, ubah nilai
`SHARED_PASSWORD`, lalu **Redeploy**. Semua petugas perlu login ulang
dengan password baru.

## Batasan tier gratis yang perlu diketahui

- **Vercel (fungsi serverless)**: gratis untuk trafik ringan–menengah;
  wajar untuk penggunaan internal beberapa petugas.
- **Supabase (database gratis)**: ± 500MB penyimpanan (jauh lebih dari
  cukup untuk data teks/JSON seperti ini), dan project akan **di-pause
  otomatis jika tidak ada aktivitas selama ±1 minggu**. Kalau itu terjadi,
  tinggal buka dashboard Supabase dan klik "Restore/Resume project" — data
  tidak hilang, hanya perlu diaktifkan lagi.
- Tetap disarankan sesekali memakai fitur **Export Excel/PDF** yang sudah
  ada di aplikasi sebagai cadangan, terutama sebelum perubahan besar.

## Kalau nanti trafik/data bertambah besar

Tier gratis Supabase & Vercel bisa naik ke tier berbayar (mulai sekitar
$25/bulan Supabase Pro, $20/bulan Vercel Pro) tanpa perlu mengubah kode —
tinggal upgrade plan di dashboard masing-masing.
