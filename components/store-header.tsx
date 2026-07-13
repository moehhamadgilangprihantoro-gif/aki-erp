'use client'

import Link from 'next/link'
import { BatteryCharging, Menu, ShoppingCart, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/components/cart-provider'

export function StoreHeader() {
  const { itemCount } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <header className="store-header">
      <div className="store-header-inner">
        <Link className="store-logo" href="/">
          <span className="store-logo-mark"><BatteryCharging size={26} /></span>
          <span><strong>AKI Store</strong><small>Terhubung langsung ke ERP</small></span>
        </Link>

        <button className="mobile-menu-button" onClick={() => setOpen(!open)} aria-label="Buka menu">
          {open ? <X /> : <Menu />}
        </button>

        <nav className={`store-nav ${open ? 'open' : ''}`}>
          <Link href="/">Beranda</Link>
          <Link href="/catalog">Katalog</Link>
          <Link href="/dashboard/orders">Pesanan Saya</Link>
          <Link href="/login"><UserRound size={18} /> Masuk</Link>
          <Link className="cart-link" href="/cart"><ShoppingCart size={19} /> Keranjang <span>{itemCount}</span></Link>
        </nav>
      </div>
    </header>
  )
}
