# AKI Store + ERP v2

Ecommerce aki dan ERP dalam satu aplikasi Next.js. Public store, portal pelanggan, POS, inventori serial number, pesanan online, pembayaran, invoice, pemasangan, dan garansi memakai satu database Supabase.

## Alur otomatis

```text
Customer checkout
→ PostgreSQL membuat order
→ Serial aki menjadi RESERVED
→ Order langsung muncul di ERP
→ Pembayaran dikonfirmasi oleh staff atau webhook
→ Invoice penjualan dibuat
→ Serial menjadi SOLD
→ Stock movement SALE_OUT dibuat
→ Pembayaran dicatat
→ Garansi dibuat
→ Job pemasangan dibuat bila dipilih
```

Jika order transfer/QRIS tidak dibayar sampai batas waktu, Netlify Scheduled Function memanggil database setiap 15 menit untuk mengubah order menjadi `EXPIRED` dan mengembalikan serial ke `AVAILABLE`.

## Fitur source code

- Homepage ecommerce
- Katalog dan detail produk
- Harga dan stok real-time dari Supabase
- Keranjang berbasis browser
- Checkout cabang, delivery, pemasangan, kendaraan, dan tukar tambah
- Transfer bank, QRIS, COD, dan bayar di toko
- Portal pesanan pelanggan
- Pesanan online pada ERP admin
- Tombol konfirmasi pembayaran oleh admin/finance/kasir
- Update status fulfillment
- Webhook payment generic
- POS penjualan toko
- Master produk dan stok serial
- Role dan RLS multi-cabang

## File database

```text
supabase/migrations/202607130001_initial_schema.sql
supabase/migrations/202607130002_ecommerce_integration.sql
supabase/seed.sql
```

### Project Supabase lama yang sudah memakai v1

Jalankan hanya:

1. `202607130002_ecommerce_integration.sql`
2. `seed.sql`

Jangan ulangi migration `001` bila sebelumnya sudah berhasil dijalankan.

### Project Supabase baru

Jalankan secara berurutan:

1. `202607130001_initial_schema.sql`
2. `202607130002_ecommerce_integration.sql`
3. `seed.sql`

Semua dapat dijalankan melalui Supabase Dashboard → SQL Editor tanpa install aplikasi di laptop.

## Environment variables Netlify

Wajib untuk seluruh aplikasi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
```

Wajib untuk webhook pembayaran dan pelepasan stok otomatis:

```env
SUPABASE_SECRET_KEY=sb_secret_xxxxx
PAYMENT_WEBHOOK_SECRET=buat-random-secret-panjang
CRON_SECRET=buat-random-secret-lain
```

`SUPABASE_SECRET_KEY` tidak boleh memakai prefix `NEXT_PUBLIC_` dan tidak boleh dimasukkan ke GitHub.

## Netlify

Repository root harus langsung berisi:

```text
app/
components/
lib/
netlify/
supabase/
package.json
package-lock.json
netlify.toml
```

Build settings:

```text
Base directory    : kosong
Build command     : npm run build
Publish directory : kosong / auto detected
```

Setelah environment variables disimpan, jalankan **Clear cache and deploy site**.

## Membuat admin pertama

Buat user dari Supabase Authentication, lalu jalankan:

```sql
update public.profiles
set role='SUPER_ADMIN',
    branch_id='11111111-1111-1111-1111-111111111111',
    is_active=true
where id=(select id from auth.users where email='admin@example.com');
```

Logout dan login kembali setelah role diubah.

## Konfirmasi pembayaran

Untuk transfer manual atau QRIS manual:

```text
ERP → Pesanan Online → Referensi pembayaran → Konfirmasi bayar
```

Satu RPC database akan membuat invoice dan mengeluarkan stok secara atomic.

## Webhook pembayaran

Endpoint:

```text
POST /api/payments/webhook
Header: x-webhook-secret: nilai PAYMENT_WEBHOOK_SECRET
```

Body generic:

```json
{
  "orderId": "UUID-ORDER",
  "provider": "PAYMENT_PROVIDER",
  "reference": "PAY-123456",
  "status": "PAID"
}
```

Adaptor provider tertentu dapat dibuat dengan memverifikasi signature provider terlebih dahulu, lalu memanggil RPC `finalize_ecommerce_order_service`.

## Validasi source

Project telah diuji dengan:

```text
npm ci
npm run lint
npm run build
```
