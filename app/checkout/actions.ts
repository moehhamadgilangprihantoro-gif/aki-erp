'use server'

import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function createOnlineOrder(formData: FormData) {
  const { supabase, profile } = await requireUser()
  if (profile.role !== 'CUSTOMER') redirect('/catalog?error=Gunakan%20akun%20pelanggan%20untuk%20checkout')

  let items: Array<{ product_id: string; quantity: number }>
  try {
    const raw = JSON.parse(text(formData, 'items')) as Array<{ productId: string; quantity: number }>
    items = raw.map((item) => ({ product_id: item.productId, quantity: Number(item.quantity) }))
  } catch {
    redirect('/cart?error=Keranjang%20tidak%20valid')
  }

  const branchId = text(formData, 'branchId')
  const fulfillmentType = text(formData, 'fulfillmentType')
  const paymentMethod = text(formData, 'paymentMethod')
  const contactName = text(formData, 'contactName')
  const phone = text(formData, 'phone')
  const address = text(formData, 'address')
  const vehicleId = text(formData, 'vehicleId') || null
  const scheduledAt = text(formData, 'scheduledAt') || null
  const tradeInRequested = formData.get('tradeInRequested') === 'on'
  const notes = text(formData, 'notes') || null

  const { data, error } = await supabase.rpc('create_ecommerce_order', {
    p_branch_id: branchId,
    p_items: items,
    p_fulfillment_type: fulfillmentType,
    p_payment_method: paymentMethod,
    p_contact_name: contactName,
    p_phone: phone,
    p_delivery_address: address || null,
    p_vehicle_id: vehicleId,
    p_scheduled_at: scheduledAt,
    p_trade_in_requested: tradeInRequested,
    p_notes: notes,
  })

  if (error) redirect(`/checkout?error=${encodeURIComponent(error.message)}`)
  const order = data?.[0]
  if (!order) redirect('/checkout?error=Order%20gagal%20dibuat')
  redirect(`/order/success?number=${encodeURIComponent(order.order_number)}&total=${encodeURIComponent(order.total)}`)
}
