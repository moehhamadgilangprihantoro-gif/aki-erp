import { StoreFooter } from '@/components/store-footer'
import { StoreHeader } from '@/components/store-header'

export function StoreShell({ children }: { children: React.ReactNode }) {
  return <div className="store-shell"><StoreHeader />{children}<StoreFooter /></div>
}
