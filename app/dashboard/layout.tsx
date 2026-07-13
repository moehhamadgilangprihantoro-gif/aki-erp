import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireUser()
  let branchName = profile.role === 'CUSTOMER' ? 'Cabang Pilihan' : 'Semua Cabang'

  if (profile.branch_id) {
    const { data } = await supabase.from('branches').select('name').eq('id', profile.branch_id).single()
    branchName = data?.name ?? 'Cabang'
  }

  return <div className="app-shell"><Sidebar profile={profile}/><main className="main-shell"><Topbar profile={profile} branchName={branchName}/>{children}</main></div>
}
