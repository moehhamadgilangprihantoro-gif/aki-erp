# AKI ERP — Netlify + Supabase

Starter ERP penjualan aki berbasis **Next.js 16**, **Supabase Auth/PostgreSQL**, dan **Netlify**.

## Fitur yang sudah tersedia

- Login email/password dan registrasi pelanggan.
- Dashboard berbeda untuk staff dan pelanggan.
- Role: SUPER_ADMIN, OWNER, BRANCH_MANAGER, PURCHASING, WAREHOUSE, CASHIER, SALES, TECHNICIAN, FINANCE, AUDITOR, CUSTOMER.
- Data dibatasi berdasarkan role dan cabang menggunakan Supabase Row Level Security.
- Produk dan stok berdasarkan serial number.
- POS sederhana satu aki per transaksi.
- PostgreSQL RPC atomic: invoice, item, pembayaran, trade-in, stock movement, dan status serial dibuat bersama-sama.
- Konfigurasi Netlify dan responsive UI.

## 1. Buat project Supabase

1. Buat project baru di Supabase.
2. Buka **SQL Editor**.
3. Jalankan `supabase/migrations/202607130001_initial_schema.sql`.
4. Jalankan `supabase/seed.sql`.
5. Buka **Project Settings / API** atau **Connect** lalu salin Project URL dan Publishable Key.

## 2. Environment lokal

Salin `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```

Jangan gunakan `service_role` atau secret key di browser.

## 3. Install dan jalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## 4. Buat akun admin/staff

1. Di Supabase Dashboard buka **Authentication → Users**.
2. Buat user baru.
3. Trigger database akan membuat profile role `CUSTOMER` secara aman.
4. Ubah role dan cabang melalui SQL Editor:

```sql
update public.profiles
set role = 'SUPER_ADMIN',
    branch_id = '11111111-1111-1111-1111-111111111111'
where id = 'UUID_USER_DARI_AUTH';
```

Untuk kasir:

```sql
update public.profiles
set role = 'CASHIER',
    branch_id = '11111111-1111-1111-1111-111111111111'
where id = 'UUID_USER_DARI_AUTH';
```

Logout lalu login kembali setelah role diubah.

## 5. Deploy ke Netlify dengan Git

```bash
git init
git add .
git commit -m "Initial AKI ERP"
```

Push ke GitHub, lalu di Netlify:

1. **Add new site → Import an existing project**.
2. Pilih repository.
3. Build command: `npm run build`.
4. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. Deploy.

Atau dengan Netlify CLI:

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://YOUR_PROJECT.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY "sb_publishable_xxx"
netlify deploy --prod
```

## 6. Supabase Auth URL

Di Supabase **Authentication → URL Configuration**:

- Site URL: URL production Netlify Anda, contoh `https://aki-erp.netlify.app`
- Redirect URLs: tambahkan URL production dan `http://localhost:3000/**`

## Catatan keamanan

- RLS aktif di semua tabel exposed.
- Role pendaftaran selalu `CUSTOMER`; nilai role tidak diambil dari user metadata.
- RPC penjualan berada di schema public agar dapat dipanggil Data API, tetapi hak EXECUTE dicabut dari PUBLIC/anon, diberikan hanya kepada authenticated, dan fungsi memeriksa role serta cabang.
- Jangan menambahkan secret/service role ke variabel `NEXT_PUBLIC_*`.

## Pengembangan berikutnya

Tambahkan penerimaan barang, transfer stok, stock opname, purchase order UI, instalasi teknisi, klaim garansi, invoice PDF, dan notifikasi WhatsApp.
