'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'
export async function createProduct(formData: FormData) {
  const { supabase } = await requireRole(['SUPER_ADMIN','OWNER','BRANCH_MANAGER','PURCHASING','WAREHOUSE'], '/admin/dashboard')
  const sku = String(formData.get('sku') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  const payload = {
    sku, name,
    slug: `${name}-${sku}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    brand_id: String(formData.get('brandId') ?? ''), category_id: String(formData.get('categoryId') ?? ''),
    voltage: Number(formData.get('voltage') ?? 12), capacity_ah: Number(formData.get('capacityAh') ?? 0),
    cca: Number(formData.get('cca') ?? 0) || null, warranty_months: Number(formData.get('warrantyMonths') ?? 12),
    minimum_stock: Number(formData.get('minimumStock') ?? 5), purchase_price: Number(formData.get('purchasePrice') ?? 0),
    selling_price: Number(formData.get('sellingPrice') ?? 0), description: String(formData.get('description') ?? '').trim() || null,
    is_featured: formData.get('isFeatured') === 'on',
  }
  if (!sku || !name || !payload.brand_id || !payload.category_id) redirect('/admin/products?error=Data%20produk%20belum%20lengkap')
  const { error } = await supabase.from('products').insert(payload)
  if (error) redirect(`/admin/products?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/admin/products'); revalidatePath('/'); revalidatePath('/catalog')
  redirect('/admin/products?success=Produk%20berhasil%20ditambahkan')
}
