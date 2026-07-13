import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BatteryCharging, CheckCircle2, Gauge, MapPin, ShieldCheck, Truck, Wrench } from 'lucide-react'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { StoreShell } from '@/components/store-shell'
import { getStoreProduct } from '@/lib/store'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }

function money(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getStoreProduct(slug)
  if (!product) notFound()

  return (
    <StoreShell>
      <main className="store-page">
        <div className="breadcrumbs"><Link href="/">Beranda</Link><span>/</span><Link href="/catalog">Katalog</Link><span>/</span><strong>{product.name}</strong></div>
        <section className="product-detail">
          <div className="product-detail-image"><img src={product.image_url || '/battery.svg'} alt={product.name}/><span>{product.stock_available > 0 ? 'Stok tersedia' : 'Stok habis'}</span></div>
          <div className="product-detail-info">
            <span className="product-brand">{product.brand_name} · {product.category_name}</span>
            <h1>{product.name}</h1>
            <p className="product-description">{product.description || 'Aki berkualitas dengan garansi resmi dan pencatatan serial otomatis.'}</p>
            <strong className="detail-price">{money(product.selling_price)}</strong>
            <div className="detail-spec-grid">
              <div><BatteryCharging/><span>Tegangan<strong>{product.voltage ?? '-'}V</strong></span></div>
              <div><Gauge/><span>Kapasitas<strong>{product.capacity_ah ?? '-'}Ah</strong></span></div>
              <div><Gauge/><span>CCA<strong>{product.cca ?? '-'}</strong></span></div>
              <div><ShieldCheck/><span>Garansi<strong>{product.warranty_months} bulan</strong></span></div>
            </div>
            <div className="detail-stock"><CheckCircle2/><div><strong>{product.stock_available} unit tersedia</strong><span>Stok berdasarkan serial AVAILABLE di seluruh cabang</span></div></div>
            <AddToCartButton product={product}/>
            <div className="detail-services"><span><Truck/> Bisa dikirim</span><span><Wrench/> Bisa antar & pasang</span><span><ShieldCheck/> Garansi otomatis</span></div>
          </div>
        </section>

        <section className="branch-stock-panel"><div><MapPin/><span><strong>Stok per cabang</strong><small>Pilih cabang yang memiliki stok saat checkout.</small></span></div><div className="branch-stock-list">{product.branch_stock.length ? product.branch_stock.map((branch) => <span key={branch.branch_id}>{branch.branch_name}<strong>{branch.stock} unit</strong></span>) : <span>Belum tersedia di cabang mana pun.</span>}</div></section>
      </main>
    </StoreShell>
  )
}
