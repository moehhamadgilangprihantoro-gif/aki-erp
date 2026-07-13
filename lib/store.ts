import { createClient } from '@/lib/supabase/server'
import type { StoreProduct } from '@/lib/types'

function normalizeProduct(row: any): StoreProduct {
  return {
    ...row,
    voltage: row.voltage === null ? null : Number(row.voltage),
    capacity_ah: row.capacity_ah === null ? null : Number(row.capacity_ah),
    selling_price: Number(row.selling_price),
    stock_available: Number(row.stock_available),
    branch_stock: Array.isArray(row.branch_stock) ? row.branch_stock : [],
  }
}

export async function getStoreProducts(search?: string): Promise<StoreProduct[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('list_store_products', {
    p_search: search?.trim() || null,
    p_product_id: null,
    p_slug: null,
  })

  if (error) throw new Error(error.message)
  return (data ?? []).map(normalizeProduct)
}

export async function getStoreProduct(slug: string): Promise<StoreProduct | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('list_store_products', {
    p_search: null,
    p_product_id: null,
    p_slug: slug,
  })

  if (error) throw new Error(error.message)
  return data?.[0] ? normalizeProduct(data[0]) : null
}

export async function getStoreBranches(): Promise<Array<{ id: string; code: string; name: string; address: string | null; phone: string | null }>> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('list_store_branches')
  if (error) throw new Error(error.message)
  return data ?? []
}
