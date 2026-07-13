'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { CartItem } from '@/lib/types'

const STORAGE_KEY = 'aki-erp-cart-v2'

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: CartItem) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) setItems(JSON.parse(raw))
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      } finally {
        setHydrated(true)
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const found = current.find((entry) => entry.productId === item.productId)
      if (!found) return [...current, { ...item, quantity: Math.min(item.quantity, item.stockAvailable, 5) }]
      return current.map((entry) =>
        entry.productId === item.productId
          ? { ...entry, quantity: Math.min(entry.quantity + item.quantity, entry.stockAvailable, 5) }
          : entry,
      )
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) => current.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stockAvailable, 5)) }
        : item,
    ))
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  const value = useMemo(() => ({
    items,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }), [items, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
