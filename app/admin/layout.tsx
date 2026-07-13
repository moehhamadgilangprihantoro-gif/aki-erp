import { AdminShell } from '@/components/admin/admin-shell'
import { requireStaff } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireStaff()
  let branchName = 'Semua Cabang'
  if (profile.branch_id) {
    const { data } = await supabase.from('branches').select('name').eq('id', profile.branch_id).maybeSingle()
    branchName = data?.name ?? 'Cabang'
  }
  return <AdminShell profile={profile} branchName={branchName}>{children}</AdminShell>
}
