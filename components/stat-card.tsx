import type { LucideIcon } from 'lucide-react'

export function StatCard({ icon: Icon, label, value, hint, tone = 'blue' }: {
  icon: LucideIcon
  label: string
  value: string
  hint: string
  tone?: 'blue' | 'green' | 'orange' | 'purple'
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={24} /></div>
      <div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>
    </article>
  )
}
