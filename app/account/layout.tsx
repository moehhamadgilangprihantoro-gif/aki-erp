import { StoreShell } from '@/components/store-shell'
import { AccountShell } from '@/components/account/account-shell'
import { requireCustomer } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireCustomer()
  return <StoreShell><AccountShell profile={profile}>{children}</AccountShell></StoreShell>
}
