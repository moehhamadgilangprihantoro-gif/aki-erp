import Link from 'next/link'
import { CheckCircle2, PackageCheck, ShieldCheck } from 'lucide-react'
import { ClearCartOnMount } from '@/components/clear-cart-on-mount'
import { StoreShell } from '@/components/store-shell'
import { rupiah } from '@/lib/format'

export const dynamic = 'force-dynamic'
type Props = { searchParams: Promise<{ number?: string; total?: string }> }

export default async function OrderSuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const total = Number(params.total ?? 0)
  return (
    <StoreShell>
      <main className="order-success-page market-width">
        <ClearCartOnMount/>
        <section className="order-success-card">
          <span className="success-icon"><CheckCircle2/></span>
          <small>PESANAN BERHASIL DIBUAT</small>
          <h1>{params.number ?? 'Order baru'}</h1>
          <p>Stok sudah direservasi dan pesanan langsung masuk ke ERP cabang.</p>
          <strong>{rupiah(total)}</strong>
          <div className="success-details"><span><PackageCheck/> Pantau status di Pesanan Saya</span><span><ShieldCheck/> Garansi dibuat otomatis setelah transaksi selesai</span></div>
          <div className="success-actions"><Link href="/account/orders">Lihat Pesanan</Link><Link href="/catalog">Belanja Lagi</Link></div>
        </section>
      </main>
    </StoreShell>
  )
}
