import { StoreFooter } from '@/components/store-footer'
import { StoreHeader } from '@/components/store-header'
import { getOptionalUser } from '@/lib/auth'

export async function StoreShell({ children }: { children: React.ReactNode }) {
  const { profile } = await getOptionalUser()
  return <div className="store-shell"><StoreHeader profile={profile}/>{children}<StoreFooter isStaff={Boolean(profile && profile.role !== 'CUSTOMER')} /></div>
}
