'use client'

import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '@/components/cart-provider'
import { rupiah } from '@/lib/format'

export function CartContent() {
  const { items, subtotal, updateQuantity, removeItem } = useCart()
  if (!items.length) {
    return <div className="market-empty cart-empty"><div><ShoppingBag/></div><h2>Keranjang masih kosong</h2><p>Temukan aki yang sesuai untuk kendaraan Anda.</p><Link href="/catalog">Mulai Belanja</Link></div>
  }

  return (
    <div className="market-cart-layout">
      <section className="market-cart-panel">
        <div className="cart-select-all"><label><input type="checkbox" defaultChecked/> Pilih Semua ({items.length})</label></div>
        {items.map((item) => (
          <article className="market-cart-item" key={item.productId}>
            <input type="checkbox" defaultChecked aria-label={`Pilih ${item.name}`}/>
            <img src={item.imageUrl || '/battery.svg'} alt={item.name}/>
            <div className="cart-product-copy"><Link href={`/product/${item.slug}`}>{item.name}</Link><span>{item.sku}</span><small>Stok tersedia: {item.stockAvailable}</small></div>
            <strong className="cart-price">{rupiah(item.unitPrice)}</strong>
            <div className="market-quantity"><button onClick={() => updateQuantity(item.productId, item.quantity - 1)}><Minus/></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.productId, item.quantity + 1)}><Plus/></button></div>
            <button className="cart-delete" onClick={() => removeItem(item.productId)} aria-label="Hapus"><Trash2/></button>
          </article>
        ))}
      </section>
      <aside className="market-cart-summary"><h2>Ringkasan Belanja</h2><div><span>Total Harga ({items.reduce((n, i) => n + i.quantity, 0)} barang)</span><strong>{rupiah(subtotal)}</strong></div><div><span>Total Diskon</span><span>Rp0</span></div><hr/><div className="cart-grand-total"><span>Total</span><strong>{rupiah(subtotal)}</strong></div><Link href="/checkout">Checkout ({items.reduce((n, i) => n + i.quantity, 0)})</Link><small>Ongkir dan biaya pemasangan dihitung saat checkout.</small></aside>
    </div>
  )
}
