'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function markOrderPaid(formData: FormData) {
  const { supabase, profile } = await requireUser()
  if (!['SUPER_ADMIN','OWNER','BRANCH_MANAGER','CASHIER','FINANCE'].includes(profile.role)) {
    redirect('/dashboard/orders?error=Tidak%20punya%20akses%20konfirmasi%20pembayaran')
  }

  const orderId = text(formData, 'orderId')
  const reference = text(formData, 'reference') || null
  const { error } = await supabase.rpc('staff_mark_order_paid', {
    p_order_id: orderId,
    p_provider_reference: reference,
  })
  if (error) redirect(`/dashboard/orders?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/orders')
  redirect('/dashboard/orders?success=Pembayaran%20dikonfirmasi.%20ERP%20dan%20stok%20sudah%20terupdate.')
}

export async function updateOrderStatus(formData: FormData) {
  const { supabase, profile } = await requireUser()
  if (profile.role === 'CUSTOMER') redirect('/dashboard/orders?error=Tidak%20punya%20akses')

  const orderId = text(formData, 'orderId')
  const status = text(formData, 'status')
  const note = text(formData, 'note') || null
  const { error } = await supabase.rpc('staff_update_order_status', {
    p_order_id: orderId,
    p_status: status,
    p_note: note,
  })
  if (error) redirect(`/dashboard/orders?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/dashboard/orders')
  redirect('/dashboard/orders?success=Status%20pesanan%20diperbarui')
}

export async function cancelCustomerOrder(formData: FormData) {
  const { supabase, profile } = await requireUser()
  if (profile.role !== 'CUSTOMER') redirect('/dashboard/orders')
  const orderId = text(formData, 'orderId')
  const { error } = await supabase.rpc('cancel_my_order', { p_order_id: orderId })
  if (error) redirect(`/dashboard/orders?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/dashboard/orders')
  redirect('/dashboard/orders?success=Pesanan%20dibatalkan%20dan%20stok%20dilepas')
}
