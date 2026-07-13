import Link from 'next/link'
import { ArrowRight, BatteryCharging, CheckCircle2, ShieldCheck, Truck, Wrench } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { StoreShell } from '@/components/store-shell'
import { getStoreProducts } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function StoreHomePage() {
  const products = await getStoreProducts()
  const featured = products.filter((item) => item.is_featured).slice(0, 4)
  const displayProducts = featured.length ? featured : products.slice(0, 4)

  return (
    <StoreShell>
      <main>
        <section className="store-hero">
          <div className="hero-copy">
            <span className="hero-kicker"><BatteryCharging size={17}/> AKI STORE TERINTEGRASI ERP</span>
            <h1>Aki yang tepat, stok nyata, dan pemasangan tanpa ribet.</h1>
            <p>Pilih aki, checkout, bayar, lalu ERP otomatis membuat order, mereservasi stok, mencatat invoice, dan menyiapkan pemasangan.</p>
            <div className="hero-actions"><Link className="hero-button primary" href="/catalog">Belanja sekarang <ArrowRight size={19}/></Link><Link className="hero-button secondary" href="/login">Masuk pelanggan</Link></div>
            <div className="hero-trust"><span><CheckCircle2/> Stok cabang real-time</span><span><CheckCircle2/> Garansi otomatis</span><span><CheckCircle2/> Riwayat pesanan lengkap</span></div>
          </div>
          <div className="hero-visual">
            <div className="hero-battery"><img src="/battery.svg" alt="Aki"/></div>
            <div className="floating-card top"><strong>Stok langsung direservasi</strong><span>Tidak ada double selling</span></div>
            <div className="floating-card bottom"><strong>ERP ter-update otomatis</strong><span>Invoice, stok, dan garansi</span></div>
          </div>
        </section>

        <section className="service-strip">
          <div><Truck/><span><strong>Pengiriman</strong><small>Dari cabang terdekat</small></span></div>
          <div><Wrench/><span><strong>Antar & Pasang</strong><small>Pilih jadwal checkout</small></span></div>
          <div><ShieldCheck/><span><strong>Garansi Tercatat</strong><small>Terhubung serial aki</small></span></div>
          <div><BatteryCharging/><span><strong>Tukar Tambah</strong><small>Ajukan aki lama</small></span></div>
        </section>

        <section className="store-section">
          <div className="store-section-heading"><div><span>REKOMENDASI</span><h2>Aki pilihan untuk kendaraanmu</h2><p>Harga diambil langsung dari master produk ERP dan stok dihitung berdasarkan serial yang tersedia.</p></div><Link href="/catalog">Lihat semua <ArrowRight size={17}/></Link></div>
          <div className="product-grid">{displayProducts.map((product) => <ProductCard key={product.id} product={product}/>)}</div>
        </section>

        <section className="integration-banner">
          <div><span>OTOMATIS DARI CHECKOUT KE ERP</span><h2>Satu transaksi mengubah semuanya.</h2><p>Ketika pembayaran dikonfirmasi, sistem otomatis membuat invoice, mengeluarkan serial dari stok, membuat riwayat pembayaran, menyiapkan garansi, dan membuat job pemasangan bila dipilih.</p></div>
          <div className="integration-flow"><span>Checkout</span><ArrowRight/><span>Payment</span><ArrowRight/><span>ERP Updated</span></div>
        </section>
      </main>
    </StoreShell>
  )
}
