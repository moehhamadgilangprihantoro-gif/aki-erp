import { Bell, ChevronDown, MapPin } from 'lucide-react'
import type { Profile } from '@/lib/types'

export function Topbar({ profile, branchName }: { profile: Profile; branchName: string }) {
  return (
    <header className="topbar">
      <div><p className="eyebrow blue">AKI ERP</p><strong>Dashboard Operasional</strong></div>
      <div className="topbar-actions">
        <div className="branch-pill"><MapPin size={17} /><span>{branchName}</span><ChevronDown size={15} /></div>
        <div className="notification"><Bell size={19} /><span>2</span></div>
        <div className="top-user"><div className="avatar small-avatar">{profile.full_name.slice(0,2).toUpperCase()}</div><div><strong>{profile.full_name}</strong><span>{profile.role.replaceAll('_',' ')}</span></div></div>
      </div>
    </header>
  )
}
