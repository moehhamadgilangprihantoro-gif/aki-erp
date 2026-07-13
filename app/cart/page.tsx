import Link from 'next/link'
import { StoreShell } from '@/components/store-shell'
import { CartContent } from '@/components/store/cart-content'

export default function CartPage() {
  return <StoreShell><main className="market-cart-page market-width"><div className="market-breadcrumb"><Link href="/">Beranda</Link><span>›</span><strong>Keranjang</strong></div><h1>Keranjang Saya</h1><CartContent/></main></StoreShell>
}
