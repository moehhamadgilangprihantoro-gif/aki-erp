import Link from 'next/link'
import { BatteryCharging, Gauge, ShieldCheck } from 'lucide-react'
import { AddToCartButton } from '@/components/add-to-cart-button'
import type { StoreProduct } from '@/lib/types'

function money(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <article className="product-card">
      <Link href={`/product/${product.slug ?? product.id}`} className="product-image-wrap">
        {product.is_featured && <span className="featured-label">Terlaris</span>}
        <img src={product.image_url || '/battery.svg'} alt={product.name} />
      </Link>
      <div className="product-card-body">
        <span className="product-brand">{product.brand_name} · {product.category_name}</span>
        <Link href={`/product/${product.slug ?? product.id}`}><h3>{product.name}</h3></Link>
        <div className="product-specs">
          <span><BatteryCharging size={15}/>{product.voltage ?? '-'}V</span>
          <span><Gauge size={15}/>{product.capacity_ah ?? '-'}Ah</span>
          <span><ShieldCheck size={15}/>{product.warranty_months} bln</span>
        </div>
        <div className="product-card-bottom">
          <div><strong>{money(product.selling_price)}</strong><small>{product.stock_available > 0 ? `${product.stock_available} unit tersedia` : 'Stok habis'}</small></div>
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </article>
  )
}
