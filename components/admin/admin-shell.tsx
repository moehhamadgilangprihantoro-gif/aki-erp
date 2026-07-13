'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, BatteryCharging, ChevronDown, LogOut, Menu, Search, Store, X } from 'lucide-react'
import { useState } from 'react'
import { adminNavigation } from '@/lib/navigation'
import { initials } from '@/lib/format'
import type { Profile } from '@/lib/types'
import { logout } from '@/app/admin/actions'

export function AdminShell({
  profile,
  branchName,
  children,
}: {
  profile: Profile
  branchName: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="admin-layout">
      {open && <button className="admin-overlay" aria-label="Tutup menu" onClick={() => setOpen(false)} />}
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-brand">
          <Link href="/admin/dashboard" onClick={() => setOpen(false)}>
            <span className="admin-brand-icon"><BatteryCharging size={26} /></span>
            <span><strong>AKI ERP</strong><small>Backoffice Management</small></span>
          </Link>
          <button className="admin-sidebar-close" onClick={() => setOpen(false)} aria-label="Tutup menu"><X /></button>
        </div>

        <div className="admin-side-label">OPERASIONAL</div>
        <nav className="admin-nav">
          {adminNavigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(`${href}/`))
            return (
              <Link key={href} className={active ? 'active' : ''} href={href} onClick={() => setOpen(false)}>
                <Icon size={19} /><span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="admin-store-link">
          <Store size={19} />
          <div><small>Lihat storefront</small><Link href="/">Buka AKI Store</Link></div>
        </div>

        <div className="admin-user-card">
          <div className="admin-avatar">{initials(profile.full_name)}</div>
          <div><strong>{profile.full_name}</strong><small>{profile.role.replaceAll('_', ' ')}</small></div>
          <form action={logout}><button title="Keluar"><LogOut size={18} /></button></form>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-menu-button" onClick={() => setOpen(true)} aria-label="Buka menu"><Menu /></button>
            <div className="admin-global-search"><Search size={18} /><input aria-label="Cari" placeholder="Cari order, produk, pelanggan..." /></div>
          </div>
          <div className="admin-topbar-right">
            <button className="admin-branch"><Store size={17} /><span>{branchName}</span><ChevronDown size={15} /></button>
            <button className="admin-notification" aria-label="Notifikasi"><Bell size={19} /><span>3</span></button>
            <div className="admin-top-user"><div className="admin-avatar small">{initials(profile.full_name)}</div><div><strong>{profile.full_name}</strong><small>{profile.role.replaceAll('_', ' ')}</small></div></div>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}
