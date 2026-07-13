'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, ChevronDown, Menu, Search, ShoppingCart, UserRound, X } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useCart } from '@/components/cart-provider'
import type { Profile } from '@/lib/types'

export function StoreHeader({ profile }: { profile: Profile | null }) {
  const { itemCount } = useCart()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const accountHref = profile?.role === 'CUSTOMER' ? '/account' : profile ? '/admin/dashboard' : '/login'
  const accountLabel = profile?.role === 'CUSTOMER' ? 'Akun Saya' : profile ? 'ERP Admin' : 'Masuk'

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    const value = query.trim()
    router.push(value ? `/catalog?q=${encodeURIComponent(value)}` : '/catalog')
  }

  return (
    <header className="market-header">
      <div className="market-utility">
        <div className="market-width"><span>Jual di AKI Store</span><span>Download App</span><span>Ikuti kami di</span><div className="utility-right"><span><Bell size={13}/> Notifikasi</span><span>Bantuan</span><span>Bahasa Indonesia <ChevronDown size={13}/></span></div></div>
      </div>
      <div className="market-main">
        <div className="market-width market-main-inner">
          <Link className="market-logo" href="/"><strong>AKI</strong><span>STORE</span></Link>
          <form className="market-search" onSubmit={submitSearch}>
            <select aria-label="Kategori"><option>Semua Kategori</option><option>Aki Mobil</option><option>Aki Motor</option><option>Aki Truk</option><option>Aki UPS</option></select>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari aki mobil, aki motor, atau tipe kendaraan" />
            <button aria-label="Cari"><Search size={21}/></button>
            <div className="popular-search"><span>Kata Pencarian Populer:</span><Link href="/catalog?q=GS Astra">GS Astra</Link><Link href="/catalog?q=NS60">NS60</Link><Link href="/catalog?q=Yuasa">Yuasa</Link><Link href="/catalog?q=N70">N70</Link><Link href="/catalog?q=Aki Motor">Aki Motor</Link></div>
          </form>
          <Link className="market-cart" href="/cart"><ShoppingCart/><span>{itemCount}</span></Link>
          <button className="market-mobile-menu" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X/> : <Menu/>}</button>
        </div>
      </div>
      <nav className={`market-nav ${open ? 'open' : ''}`}>
        <div className="market-width">
          <Link className={pathname === '/' ? 'active' : ''} href="/" onClick={() => setOpen(false)}>Beranda</Link>
          <Link href="/catalog?category=Aki Mobil" onClick={() => setOpen(false)}>Aki Mobil</Link>
          <Link href="/catalog?category=Aki Motor" onClick={() => setOpen(false)}>Aki Motor</Link>
          <Link href="/catalog?category=Aki Truk" onClick={() => setOpen(false)}>Aki Truk</Link>
          <Link href="/catalog?category=Aki UPS" onClick={() => setOpen(false)}>Aki UPS</Link>
          <Link href="/catalog?promo=1" onClick={() => setOpen(false)}>Promo</Link>
          <Link href="/catalog" onClick={() => setOpen(false)}>Tukar Tambah</Link>
          <Link href="/catalog" onClick={() => setOpen(false)}>Pemasangan</Link>
          <div className="market-account-links"><Link href={accountHref}><UserRound size={16}/>{accountLabel}</Link>{!profile && <><span>|</span><Link href="/login?mode=register">Daftar</Link></>}</div>
        </div>
      </nav>
    </header>
  )
}
