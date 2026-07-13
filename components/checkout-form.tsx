'use client'

import Link from 'next/link'
import { useCart } from '@/components/cart-provider'
import { createOnlineOrder } from '@/app/checkout/actions'

function money(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

type Branch = { id: string; name: string; address: string | null }
type Vehicle = { id: string; brand: string; model: string; plate_number: string | null }

export function CheckoutForm({ branches, vehicles, customerName, customerPhone }: { branches: Branch[]; vehicles: Vehicle[]; customerName: string; customerPhone: string }) {
  const { items, subtotal } = useCart()

  if (!items.length) return <div className="store-empty"><h2>Keranjang kosong</h2><p>Tambahkan produk sebelum checkout.</p><Link className="hero-button primary" href="/catalog">Buka katalog</Link></div>

  return (
    <form action={createOnlineOrder} className="checkout-layout">
      <input type="hidden" name="items" value={JSON.stringify(items.map((item) => ({ productId: item.productId, quantity: item.quantity })))}/>
      <div className="checkout-form-panel">
        <section className="checkout-section"><div className="checkout-step">1</div><div className="checkout-section-body"><h2>Informasi pelanggan</h2><div className="form-row"><label>Nama penerima<input name="contactName" defaultValue={customerName} required/></label><label>Nomor telepon<input name="phone" defaultValue={customerPhone} required/></label></div></div></section>
        <section className="checkout-section"><div className="checkout-step">2</div><div className="checkout-section-body"><h2>Cabang dan layanan</h2><div className="form-row"><label>Cabang<select name="branchId" required defaultValue=""><option value="" disabled>Pilih cabang</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label><label>Jenis layanan<select name="fulfillmentType" required defaultValue="PICKUP"><option value="PICKUP">Ambil di toko</option><option value="DELIVERY">Pengiriman</option><option value="DELIVERY_INSTALLATION">Antar dan pasang</option></select></label></div><label>Alamat pengiriman<textarea name="address" placeholder="Wajib untuk pengiriman atau pemasangan"/></label><div className="form-row"><label>Kendaraan<select name="vehicleId" defaultValue=""><option value="">Tanpa kendaraan</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} · {vehicle.plate_number || '-'}</option>)}</select></label><label>Jadwal pemasangan<input name="scheduledAt" type="datetime-local"/></label></div></div></section>
        <section className="checkout-section"><div className="checkout-step">3</div><div className="checkout-section-body"><h2>Pembayaran</h2><div className="payment-options"><label><input type="radio" name="paymentMethod" value="BANK_TRANSFER" defaultChecked/><span><strong>Transfer bank</strong><small>Stok direservasi sampai batas waktu pembayaran</small></span></label><label><input type="radio" name="paymentMethod" value="QRIS"/><span><strong>QRIS</strong><small>Siap dihubungkan ke payment gateway</small></span></label><label><input type="radio" name="paymentMethod" value="COD"/><span><strong>COD</strong><small>Bayar saat barang diterima</small></span></label><label><input type="radio" name="paymentMethod" value="PAY_AT_STORE"/><span><strong>Bayar di toko</strong><small>Untuk pengambilan langsung</small></span></label></div><label className="checkbox-row"><input type="checkbox" name="tradeInRequested"/><span>Ajukan tukar tambah aki lama</span></label><label>Catatan<textarea name="notes" placeholder="Catatan untuk cabang atau teknisi"/></label></div></section>
      </div>
      <aside className="checkout-summary"><h2>Pesanan</h2>{items.map((item) => <div className="checkout-product" key={item.productId}><img src={item.imageUrl || '/battery.svg'} alt=""/><span><strong>{item.name}</strong><small>{item.quantity} × {money(item.unitPrice)}</small></span><strong>{money(item.quantity * item.unitPrice)}</strong></div>)}<div className="checkout-price-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="checkout-price-row"><span>Ongkir & pemasangan</span><span>Dihitung oleh database</span></div><hr/><button className="store-button checkout-button" type="submit">Buat pesanan</button><p className="secure-note">Checkout akan memanggil transaction PostgreSQL. Bila stok tidak cukup, seluruh proses dibatalkan.</p></aside>
    </form>
  )
}
