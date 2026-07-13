import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { ClearCartOnMount } from '@/components/clear-cart-on-mount'
import { StoreShell } from '@/components/store-shell'

export const dynamic = 'force-dynamic'
type Props = { searchParams: Promise<{ number?: string; total?: string }> }

export default async function OrderSuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const total = Number(params.total ?? 0)
  return (
    <StoreShell><main className="store-page"><ClearCartOnMount/><div className="order-success"><CheckCircle2/><span>PESANAN BERHASIL DIBUAT</span><h1>{params.number ?? 'Order baru'}</h1><p>Stok sudah direservasi dan order langsung masuk ke ERP cabang.</p><strong>{new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(total)}</strong><div><Link className="hero-button primary" href="/dashboard/orders">Lihat pesanan</Link><Link className="hero-button secondary" href="/catalog">Belanja lagi</Link></div></div></main></StoreShell>
  )
}
