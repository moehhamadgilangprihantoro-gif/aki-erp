'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { accountNavigation } from '@/lib/navigation'
import { logout } from '@/app/account/actions'
import type { Profile } from '@/lib/types'
import { initials } from '@/lib/format'

export function AccountShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="account-page-shell">
      <div className="account-breadcrumb"><Link href="/">Beranda</Link><span>›</span><strong>Akun Saya</strong></div>
      <div className="account-layout">
        <aside className="account-sidebar">
          <div className="account-profile-mini">
            <div className="account-avatar">{initials(profile.full_name)}</div>
            <div><strong>{profile.full_name}</strong><span>Pelanggan</span></div>
          </div>
          <nav>
            {accountNavigation.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/account' && pathname.startsWith(`${href}/`))
              return <Link key={href} href={href} className={active ? 'active' : ''}><Icon size={18} /><span>{label}</span></Link>
            })}
          </nav>
          <form action={logout}><button className="account-logout"><LogOut size={18} />Keluar</button></form>
        </aside>
        <section className="account-content">{children}</section>
      </div>
    </div>
  )
}
