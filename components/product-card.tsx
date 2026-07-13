import Link from 'next/link'
import { Star } from 'lucide-react'
import { AddToCartButton } from '@/components/add-to-cart-button'
import type { StoreProduct } from '@/lib/types'
import { rupiah } from '@/lib/format'

export function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <article className="market-product-card">
      <Link href={`/product/${product.slug ?? product.id}`} className="market-product-image">
        {product.is_featured && <span className="market-product-label">Terlaris</span>}
        <img src={product.image_url || '/battery.svg'} alt={product.name} />
      </Link>
      <div className="market-product-body">
        <Link href={`/product/${product.slug ?? product.id}`}><h3>{product.name}</h3></Link>
        <p>{product.voltage ?? '-'}V · {product.capacity_ah ?? '-'}Ah {product.cca ? `· ${product.cca}CCA` : ''}</p>
        <strong>{rupiah(product.selling_price)}</strong>
        <div className="market-rating"><span><Star size={13} fill="currentColor"/> 4.9</span><span>Terjual {Math.max(12, Number(product.stock_available) * 17)}</span></div>
        <div className="market-product-location"><span>Garansi {product.warranty_months} bulan</span><span>{product.stock_available > 0 ? `${product.stock_available} tersedia` : 'Stok habis'}</span></div>
        <AddToCartButton product={product} compact />
      </div>
    </article>
  )
}
