import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BadgeCheck, CalendarClock, ChevronRight, MapPin, ShieldCheck, ShoppingCart, Star, Truck, Wrench } from 'lucide-react'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { StoreShell } from '@/components/store-shell'
import { getStoreProduct } from '@/lib/store'
import { rupiah } from '@/lib/format'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getStoreProduct(slug)
  if (!product) notFound()

  return (
    <StoreShell>
      <main className="market-product-page market-width">
        <div className="market-breadcrumb"><Link href="/">Beranda</Link><span>›</span><Link href="/catalog">{product.category_name}</Link><span>›</span><strong>{product.name}</strong></div>
        <section className="market-product-detail">
          <div className="product-gallery"><div className="main-product-photo"><img src={product.image_url || '/battery.svg'} alt={product.name}/></div><div className="product-thumbs"><button><img src={product.image_url || '/battery.svg'} alt=""/></button><button><BadgeCheck/><span>100% Original</span></button><button><ShieldCheck/><span>Garansi Resmi</span></button></div></div>
          <div className="market-product-info">
            <h1>{product.name}</h1>
            <div className="product-meta"><span><strong>4.9</strong><Star size={15} fill="currentColor"/></span><span>179 Penilaian</span><span>2rb+ Terjual</span></div>
            <div className="product-price-box"><strong>{rupiah(product.selling_price)}</strong><span>Harga sudah termasuk garansi resmi</span></div>
            <dl className="product-spec-list"><div><dt>Merek</dt><dd>{product.brand_name}</dd></div><div><dt>Tipe</dt><dd>{product.sku}</dd></div><div><dt>Kapasitas</dt><dd>{product.voltage ?? '-'}V {product.capacity_ah ?? '-'}Ah</dd></div><div><dt>CCA</dt><dd>{product.cca ?? '-'}</dd></div><div><dt>Garansi</dt><dd>{product.warranty_months} Bulan</dd></div><div><dt>Stok</dt><dd>{product.stock_available} Unit</dd></div></dl>
            <div className="product-service-select"><strong>Pengiriman</strong><div><button>Ambil di Toko</button><button>Antar ke Alamat</button><button className="selected">Antar & Pasang</button></div></div>
            <div className="product-location-line"><MapPin size={17}/><span>Stok tersedia di {product.branch_stock.length} cabang</span><ChevronRight size={16}/></div>
            <div className="product-action-row"><AddToCartButton product={product}/><Link href="/checkout" className="buy-now"><ShoppingCart size={18}/> Beli Sekarang</Link></div>
          </div>
        </section>
        <section className="product-assurance"><div><BadgeCheck/><span><strong>Produk Original</strong><small>Dijamin 100% asli</small></span></div><div><ShieldCheck/><span><strong>Garansi Resmi</strong><small>Tercatat otomatis</small></span></div><div><Truck/><span><strong>Pengiriman Aman</strong><small>Dari cabang terdekat</small></span></div><div><Wrench/><span><strong>Pemasangan Ahli</strong><small>Oleh teknisi profesional</small></span></div></section>
        <section className="market-description-panel"><h2>Deskripsi Produk</h2><p>{product.description || `${product.name} merupakan aki berkualitas untuk kebutuhan kendaraan Anda. Stok dihitung berdasarkan unit serial yang benar-benar tersedia di cabang.`}</p><h3>Stok per Cabang</h3><div className="branch-chips">{product.branch_stock.map((branch) => <span key={branch.branch_id}><MapPin size={14}/>{branch.branch_name}<strong>{branch.stock} unit</strong></span>)}</div><div className="installation-note"><CalendarClock/><div><strong>Butuh pemasangan?</strong><p>Pilih layanan Antar & Pasang saat checkout dan tentukan jadwal yang tersedia.</p></div></div></section>
      </main>
    </StoreShell>
  )
}
