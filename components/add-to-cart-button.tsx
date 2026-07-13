'use client'

import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/components/cart-provider'
import type { StoreProduct } from '@/lib/types'

export function AddToCartButton({ product, compact = false }: { product: StoreProduct; compact?: boolean }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const disabled = product.stock_available < 1

  return (
    <button
      type="button"
      disabled={disabled}
      className={`store-button ${compact ? 'compact' : ''}`}
      onClick={() => {
        addItem({
          productId: product.id,
          slug: product.slug ?? product.id,
          name: product.name,
          sku: product.sku,
          imageUrl: product.image_url,
          unitPrice: product.selling_price,
          quantity: 1,
          stockAvailable: product.stock_available,
        })
        setAdded(true)
        window.setTimeout(() => setAdded(false), 1400)
      }}
    >
      <ShoppingCart size={18}/>{disabled ? 'Stok habis' : added ? 'Ditambahkan' : 'Tambah ke keranjang'}
    </button>
  )
}
