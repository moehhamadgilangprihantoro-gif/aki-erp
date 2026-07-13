'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/auth'

function text(formData: FormData, key: string) { return String(formData.get(key) ?? '').trim() }

export async function markOrderPaid(formData: FormData) {
  const { supabase, profile } = await requireStaff()
  if (!['SUPER_ADMIN','OWNER','BRANCH_MANAGER','CASHIER','FINANCE'].includes(profile.role)) redirect('/admin/orders?error=Tidak%20punya%20akses')
  const { error } = await supabase.rpc('staff_mark_order_paid', { p_order_id: text(formData, 'orderId'), p_provider_reference: text(formData, 'reference') || null })
  if (error) redirect(`/admin/orders?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/admin/dashboard'); revalidatePath('/admin/orders')
  redirect('/admin/orders?success=Pembayaran%20berhasil%20dikonfirmasi')
}

export async function updateOrderStatus(formData: FormData) {
  const { supabase } = await requireStaff()
  const { error } = await supabase.rpc('staff_update_order_status', { p_order_id: text(formData, 'orderId'), p_status: text(formData, 'status'), p_note: text(formData, 'note') || null })
  if (error) redirect(`/admin/orders?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/admin/orders')
  redirect('/admin/orders?success=Status%20pesanan%20diperbarui')
}
