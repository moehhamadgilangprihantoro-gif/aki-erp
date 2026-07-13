import Link from 'next/link'
import {
  BadgeCheck,
  Bike,
  CarFront,
  ChevronRight,
  Headphones,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { StoreShell } from '@/components/store-shell'
import { getStoreProducts } from '@/lib/store'

export const dynamic = 'force-dynamic'

const categories = [
  { label: 'Aki Mobil', count: '120+ Produk', icon: CarFront, href: '/catalog?category=Aki Mobil' },
  { label: 'Aki Motor', count: '80+ Produk', icon: Bike, href: '/catalog?category=Aki Motor' },
  { label: 'Aki Truk', count: '60+ Produk', icon: Truck, href: '/catalog?category=Aki Truk' },
  { label: 'Aki UPS', count: '40+ Produk', icon: Zap, href: '/catalog?category=Aki UPS' },
  { label: 'Aki Kering', count: '100+ Produk', icon: ShoppingBag, href: '/catalog?q=Aki Kering' },
  { label: 'Aki Basah', count: '50+ Produk', icon: PackageCheck, href: '/catalog?q=Aki Basah' },
]

export default async function StoreHomePage() {
  const products = await getStoreProducts()
  const featured = products.filter((item) => item.is_featured)
  const displayProducts = (featured.length ? featured : products).slice(0, 10)

  return (
    <StoreShell>
      <main className="market-home">
        <section className="market-hero-section market-width">
          <div className="market-hero-main">
            <div className="market-hero-copy">
              <span>AKI ORIGINAL & BERGARANSI</span>
              <h1>PERFORMA MAKSIMAL<br/><em>UNTUK KENDARAAN ANDA</em></h1>
              <p>Pilih aki yang cocok, cek stok cabang secara langsung, lalu pilih antar atau pasang di lokasi.</p>
              <Link href="/catalog">Belanja Sekarang <ChevronRight size={18}/></Link>
              <div className="market-hero-trust"><span><ShieldCheck/> Garansi Resmi</span><span><BadgeCheck/> 100% Original</span><span><Truck/> Pengiriman Cepat</span><span><Wrench/> Pemasangan Profesional</span></div>
            </div>
            <div className="hero-battery-stage"><img src="/battery.svg" alt="Aki pilihan"/><div className="hero-price-tag"><small>Mulai dari</small><strong>Rp850 ribu</strong></div></div>
          </div>
          <div className="market-hero-side">
            <Link href="/catalog" className="mini-promo install"><div><span>GRATIS PASANG</span><strong>Untuk Area Jabodetabek</strong></div><Wrench/></Link>
            <Link href="/catalog" className="mini-promo trade"><div><span>TUKAR TAMBAH</span><strong>Lebih Hemat, Harga Spesial</strong></div><RefreshCcw/></Link>
          </div>
          <div className="market-login-card">
            <h3>Masuk ke Akun Anda</h3><p>Nikmati pengalaman belanja terbaik</p>
            <div><Link className="primary" href="/login">Masuk</Link><Link href="/login?mode=register">Daftar</Link></div>
            <hr/>
            <h4>Keuntungan Belanja di AKI Store</h4>
            <ul><li><BadgeCheck/> Produk 100% Original</li><li><ShieldCheck/> Garansi Resmi Pabrikan</li><li><Wrench/> Gratis Pemasangan*</li><li><RefreshCcw/> Tukar Tambah Lebih Hemat</li><li><Truck/> Pengiriman Cepat & Aman</li></ul>
          </div>
        </section>

        <section className="market-benefits market-width">
          <div><BadgeCheck/><span><strong>Produk Original</strong><small>100% Original & Bergaransi</small></span></div>
          <div><Truck/><span><strong>Gratis Ongkir</strong><small>Min. belanja tertentu</small></span></div>
          <div><Wrench/><span><strong>Pemasangan</strong><small>Jasa pasang profesional</small></span></div>
          <div><RefreshCcw/><span><strong>Tukar Tambah</strong><small>Harga lebih hemat</small></span></div>
          <div><ShoppingBag/><span><strong>Banyak Pilihan</strong><small>Semua jenis aki tersedia</small></span></div>
          <div><Headphones/><span><strong>Layanan Chat</strong><small>Fast response 24 jam</small></span></div>
        </section>

        <section className="market-block market-width">
          <div className="market-block-title"><h2>Kategori Pilihan</h2><Link href="/catalog">Lihat Semua <ChevronRight size={15}/></Link></div>
          <div className="market-categories">
            {categories.map(({ label, count, icon: Icon, href }) => <Link href={href} key={label}><span><Icon size={32}/></span><strong>{label}</strong><small>{count}</small></Link>)}
          </div>
        </section>

        <section className="market-block market-width flash-block">
          <div className="market-block-title"><div><h2>Rekomendasi Untuk Anda</h2><p>Harga dan stok terhubung langsung dengan ERP.</p></div><Link href="/catalog">Lihat Semua <ChevronRight size={15}/></Link></div>
          <div className="market-product-grid">{displayProducts.map((product) => <ProductCard key={product.id} product={product}/>)}</div>
        </section>

        <section className="market-wide-banner market-width">
          <div><span>AKI LEMAH?</span><h2>Pesan sekarang, teknisi datang ke lokasi.</h2><p>Pilih layanan Antar & Pasang saat checkout. Jadwal pemasangan langsung masuk ke ERP.</p><Link href="/catalog">Pilih Aki</Link></div>
          <Wrench size={120}/>
        </section>
      </main>
    </StoreShell>
  )
}
