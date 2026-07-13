# Checklist Upgrade dan Deploy

## Supabase

- [ ] Backup database bila project sudah berisi transaksi
- [ ] Jalankan migration `202607130002_ecommerce_integration.sql`
- [ ] Jalankan `seed.sql`
- [ ] Pastikan tabel `orders`, `order_items`, `order_item_serials`, dan `product_warranties` muncul
- [ ] Pastikan function `create_ecommerce_order`, `staff_mark_order_paid`, dan `expire_unpaid_orders` muncul

## GitHub

- [ ] Upload seluruh isi ZIP ke root repository menggunakan Codespaces
- [ ] Pastikan folder `app`, `components`, `lib`, `netlify`, dan `supabase` ada
- [ ] Commit dan push ke branch production

## Netlify

- [ ] Base directory kosong
- [ ] Build command `npm run build`
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] Set `SUPABASE_SECRET_KEY` sebagai secret
- [ ] Set `PAYMENT_WEBHOOK_SECRET` sebagai secret
- [ ] Trigger **Clear cache and deploy site**

## Uji transaksi

- [ ] Register akun customer
- [ ] Katalog menampilkan produk dan stok
- [ ] Tambah produk ke keranjang
- [ ] Checkout dengan cabang yang memiliki stok
- [ ] Order muncul di `/dashboard/orders`
- [ ] Serial berubah dari `AVAILABLE` menjadi `RESERVED`
- [ ] Admin klik Konfirmasi Bayar
- [ ] Invoice otomatis terbentuk
- [ ] Serial berubah menjadi `SOLD`
- [ ] Stock movement `SALE_OUT` terbentuk
- [ ] Garansi otomatis terbentuk
