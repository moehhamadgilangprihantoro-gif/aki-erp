import Link from 'next/link'
import { ChevronDown, Filter, Grid3X3, List, SlidersHorizontal } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { StoreShell } from '@/components/store-shell'
import { getStoreProducts } from '@/lib/store'

export const dynamic = 'force-dynamic'
type Props = { searchParams: Promise<{ q?: string; category?: string; brand?: string; sort?: string }> }

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams
  const allProducts = await getStoreProducts(params.q)
  const categories = [...new Set(allProducts.map((p) => p.category_name))]
  const brands = [...new Set(allProducts.map((p) => p.brand_name))]
  let products = allProducts.filter((p) => !params.category || p.category_name === params.category)
  products = products.filter((p) => !params.brand || p.brand_name === params.brand)
  if (params.sort === 'price-low') products.sort((a, b) => a.selling_price - b.selling_price)
  if (params.sort === 'price-high') products.sort((a, b) => b.selling_price - a.selling_price)

  return (
    <StoreShell>
      <main className="market-catalog-page market-width">
        <div className="market-breadcrumb"><Link href="/">Beranda</Link><span>›</span><strong>{params.category || 'Semua Produk'}</strong></div>
        <div className="catalog-title-row"><div><h1>{params.category || 'Semua Aki'}</h1><p>Menampilkan {products.length} produk yang tersedia.</p></div><button className="mobile-filter-button"><Filter size={17}/> Filter</button></div>
        <div className="market-catalog-layout">
          <aside className="catalog-filter">
            <h3><SlidersHorizontal size={17}/> Filter Produk</h3>
            <div className="filter-group"><strong>Kategori</strong>{categories.map((category) => <Link className={params.category === category ? 'selected' : ''} key={category} href={`/catalog?category=${encodeURIComponent(category)}`}>{category}<span>({allProducts.filter((p) => p.category_name === category).length})</span></Link>)}</div>
            <div className="filter-group"><strong>Merek</strong>{brands.map((brand) => <Link className={params.brand === brand ? 'selected' : ''} key={brand} href={`/catalog?brand=${encodeURIComponent(brand)}`}>{brand}<span>({allProducts.filter((p) => p.brand_name === brand).length})</span></Link>)}</div>
            <div className="filter-group"><strong>Harga</strong><div className="price-filter"><input placeholder="Rp Min"/><span>-</span><input placeholder="Rp Maks"/></div><button>Terapkan</button></div>
            <Link className="clear-filter" href="/catalog">Hapus Semua Filter</Link>
          </aside>
          <section className="catalog-results">
            <div className="catalog-toolbar"><span><strong>{products.length}</strong> produk ditemukan</span><div><label>Urutkan</label><Link href="/catalog?sort=price-low">Harga Terendah <ChevronDown size={14}/></Link><button aria-label="Grid"><Grid3X3 size={17}/></button><button aria-label="List"><List size={18}/></button></div></div>
            <div className="market-product-grid catalog-products">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div>
            {!products.length && <div className="market-empty"><div>⚡</div><h2>Produk tidak ditemukan</h2><p>Coba kata kunci atau filter yang berbeda.</p><Link href="/catalog">Lihat semua produk</Link></div>}
          </section>
        </div>
      </main>
    </StoreShell>
  )
}
