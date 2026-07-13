import { Search } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { StoreShell } from '@/components/store-shell'
import { getStoreProducts } from '@/lib/store'

export const dynamic = 'force-dynamic'
type Props = { searchParams: Promise<{ q?: string }> }

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams
  const products = await getStoreProducts(params.q)

  return (
    <StoreShell>
      <main className="store-page">
        <div className="catalog-heading"><div><span>KATALOG AKI</span><h1>Pilih aki yang sesuai kebutuhan</h1><p>Semua harga dan stok berasal langsung dari database ERP.</p></div>
          <form className="catalog-search"><Search size={19}/><input name="q" defaultValue={params.q} placeholder="Cari merek, tipe, atau SKU..."/><button>Cari</button></form>
        </div>
        <div className="catalog-result-info"><strong>{products.length} produk</strong><span>{params.q ? `Hasil pencarian “${params.q}”` : 'Semua produk aktif'}</span></div>
        <div className="product-grid catalog-grid">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div>
        {!products.length && <div className="store-empty"><BatteryIcon/><h2>Produk tidak ditemukan</h2><p>Coba gunakan kata kunci lain.</p></div>}
      </main>
    </StoreShell>
  )
}

function BatteryIcon() { return <div className="store-empty-icon">⚡</div> }
