import type { LucideIcon } from 'lucide-react'

export function DataCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'orange',
}: {
  label: string
  value: string | number
  helper?: string
  icon: LucideIcon
  tone?: 'orange' | 'blue' | 'green' | 'purple'
}) {
  return (
    <div className="admin-data-card">
      <span className={`admin-data-icon ${tone}`}><Icon size={23} /></span>
      <div><span>{label}</span><strong>{value}</strong>{helper && <small>{helper}</small>}</div>
    </div>
  )
}
