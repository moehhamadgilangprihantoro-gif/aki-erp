'use client'

import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { StoreShell } from '@/components/store-shell'
import { useCart } from '@/components/cart-provider'

function money(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart()

  return (
    <StoreShell>
      <main className="store-page">
        <div className="simple-page-heading"><span>KERANJANG</span><h1>Periksa pesananmu</h1><p>Stok final akan direservasi secara atomic ketika checkout berhasil.</p></div>
        {!items.length ? (
          <div className="store-empty"><div className="store-empty-icon"><ShoppingBag/></div><h2>Keranjang masih kosong</h2><p>Pilih aki dari katalog terlebih dahulu.</p><Link className="hero-button primary" href="/catalog">Buka katalog</Link></div>
        ) : (
          <section className="cart-layout">
            <div className="cart-items-panel">
              {items.map((item) => (
                <article className="cart-item" key={item.productId}>
                  <img src={item.imageUrl || '/battery.svg'} alt={item.name}/>
                  <div className="cart-item-info"><Link href={`/product/${item.slug}`}><strong>{item.name}</strong></Link><span>{item.sku}</span><small>Maksimal 5 unit per produk</small></div>
                  <div className="quantity-control"><button onClick={() => updateQuantity(item.productId, item.quantity - 1)}><Minus size={16}/></button><strong>{item.quantity}</strong><button onClick={() => updateQuantity(item.productId, item.quantity + 1)}><Plus size={16}/></button></div>
                  <div className="cart-item-price"><strong>{money(item.unitPrice * item.quantity)}</strong><span>{money(item.unitPrice)} / unit</span></div>
                  <button className="remove-button" onClick={() => removeItem(item.productId)} aria-label="Hapus"><Trash2 size={18}/></button>
                </article>
              ))}
            </div>
            <aside className="cart-summary"><h2>Ringkasan</h2><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Pengiriman</span><span>Dihitung saat checkout</span></div><div><span>Pemasangan</span><span>Opsional</span></div><hr/><div className="cart-total"><span>Estimasi total</span><strong>{money(subtotal)}</strong></div><Link className="store-button checkout-button" href="/checkout">Lanjut checkout</Link><Link className="continue-shopping" href="/catalog">Lanjut belanja</Link></aside>
          </section>
        )}
      </main>
    </StoreShell>
  )
}
