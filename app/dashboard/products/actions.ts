'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'

export async function createProduct(formData: FormData) {
  const { supabase } = await requireRole(['SUPER_ADMIN','OWNER','BRANCH_MANAGER','PURCHASING','WAREHOUSE'])
  const payload = {
    sku: String(formData.get('sku') ?? '').trim(),
    name: String(formData.get('name') ?? '').trim(),
    brand_id: String(formData.get('brandId') ?? ''),
    category_id: String(formData.get('categoryId') ?? ''),
    voltage: Number(formData.get('voltage') ?? 12),
    capacity_ah: Number(formData.get('capacityAh') ?? 0),
    warranty_months: Number(formData.get('warrantyMonths') ?? 12),
    minimum_stock: Number(formData.get('minimumStock') ?? 5),
    purchase_price: Number(formData.get('purchasePrice') ?? 0),
    selling_price: Number(formData.get('sellingPrice') ?? 0),
  }
  if (!payload.sku || !payload.name || !payload.brand_id || !payload.category_id) redirect('/dashboard/products?error=Data%20produk%20belum%20lengkap')
  const { error } = await supabase.from('products').insert(payload)
  if (error) redirect(`/dashboard/products?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/dashboard/products')
  revalidatePath('/dashboard')
  redirect('/dashboard/products?success=Produk%20berhasil%20ditambahkan')
}
