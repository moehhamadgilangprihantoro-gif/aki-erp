import Link from 'next/link'
import {
  BatteryCharging,
  Boxes,
  Car,
  CircleDollarSign,
  ClipboardList,
  Store,
  Gauge,
  History,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Settings,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  UsersRound,
  Wrench,
} from 'lucide-react'
import type { Profile } from '@/lib/types'
import { logout } from '@/app/dashboard/actions'

const staffMenu = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/pos', label: 'POS / Penjualan', icon: ShoppingCart },
  { href: '/dashboard/orders', label: 'Pesanan Online', icon: Store },
  { href: '/dashboard/products', label: 'Produk & Stok', icon: Boxes },
  { href: '/dashboard', label: 'Pelanggan', icon: UsersRound },
  { href: '/dashboard', label: 'Pembelian', icon: PackagePlus },
  { href: '/dashboard', label: 'Pemasangan', icon: Wrench },
  { href: '/dashboard', label: 'Garansi & Klaim', icon: ShieldCheck },
  { href: '/dashboard', label: 'Laporan', icon: ClipboardList },
]

const customerMenu = [
  { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
  { href: '/catalog', label: 'Katalog & Harga', icon: Store },
  { href: '/dashboard/orders', label: 'Pesanan Saya', icon: ShoppingCart },
  { href: '/dashboard', label: 'Riwayat Pembelian', icon: History },
  { href: '/dashboard', label: 'Pemasangan', icon: Wrench },
  { href: '/dashboard', label: 'Garansi & Klaim', icon: ShieldCheck },
  { href: '/dashboard', label: 'Aki Tukar Tambah', icon: CircleDollarSign },
  { href: '/dashboard', label: 'Kendaraan Saya', icon: Car },
  { href: '/dashboard', label: 'Profil Saya', icon: UserRound },
]

export function Sidebar({ profile }: { profile: Profile }) {
  const isCustomer = profile.role === 'CUSTOMER'
  const menu = isCustomer ? customerMenu : staffMenu

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark small"><BatteryCharging size={26} /></div>
        <div><strong>AKI ERP</strong><span>Solusi Daya Terpercaya</span></div>
      </div>

      <nav className="side-nav">
        {menu.map(({ href, label, icon: Icon }, index) => (
          <Link key={`${label}-${index}`} href={href} className={index === 0 ? 'active' : ''}>
            <Icon size={19} />{label}
          </Link>
        ))}
      </nav>

      {!isCustomer && (
        <div className="sidebar-mini">
          <Gauge size={20} />
          <div><span>Mode aplikasi</span><strong>MVP Aktif</strong></div>
        </div>
      )}

      <div className="sidebar-user">
        <div className="avatar">{profile.full_name.slice(0, 2).toUpperCase()}</div>
        <div><strong>{profile.full_name}</strong><span>{profile.role.replaceAll('_', ' ')}</span></div>
      </div>
      <form action={logout}><button className="sidebar-logout"><LogOut size={18} /> Keluar</button></form>
      <Link className="settings-link" href="/dashboard"><Settings size={17} /> Pengaturan</Link>
    </aside>
  )
}
