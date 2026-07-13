'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireCustomer } from '@/lib/auth'

function text(formData: FormData, key: string) { return String(formData.get(key) ?? '').trim() }

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function addVehicle(formData: FormData) {
  const { supabase, userId } = await requireCustomer()
  const { data: customer } = await supabase.from('customers').select('id').eq('user_id', userId).single()
  if (!customer) redirect('/account/vehicles?error=Profil%20pelanggan%20tidak%20ditemukan')
  const payload = {
    customer_id: customer.id,
    plate_number: text(formData, 'plateNumber') || null,
    brand: text(formData, 'brand'),
    model: text(formData, 'model'),
    production_year: Number(formData.get('productionYear') || 0) || null,
    engine: text(formData, 'engine') || null,
  }
  if (!payload.brand || !payload.model) redirect('/account/vehicles?error=Merek%20dan%20model%20wajib%20diisi')
  const { error } = await supabase.from('customer_vehicles').insert(payload)
  if (error) redirect(`/account/vehicles?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/account/vehicles')
  redirect('/account/vehicles?success=Kendaraan%20berhasil%20ditambahkan')
}

export async function addAddress(formData: FormData) {
  const { supabase, userId } = await requireCustomer()
  const { data: customer } = await supabase.from('customers').select('id').eq('user_id', userId).single()
  if (!customer) redirect('/account/addresses?error=Profil%20pelanggan%20tidak%20ditemukan')
  const payload = {
    customer_id: customer.id,
    label: text(formData, 'label') || 'Rumah',
    recipient_name: text(formData, 'recipientName'),
    phone: text(formData, 'phone'),
    address_line: text(formData, 'addressLine'),
    city: text(formData, 'city'),
    postal_code: text(formData, 'postalCode') || null,
    is_default: formData.get('isDefault') === 'on',
  }
  if (!payload.recipient_name || !payload.phone || !payload.address_line || !payload.city) {
    redirect('/account/addresses?error=Data%20alamat%20belum%20lengkap')
  }
  if (payload.is_default) await supabase.from('customer_addresses').update({ is_default: false }).eq('customer_id', customer.id)
  const { error } = await supabase.from('customer_addresses').insert(payload)
  if (error) redirect(`/account/addresses?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/account/addresses')
  redirect('/account/addresses?success=Alamat%20berhasil%20ditambahkan')
}

export async function updateProfile(formData: FormData) {
  const { supabase } = await requireCustomer()
  const fullName = text(formData, 'fullName')
  const phone = text(formData, 'phone') || null
  if (!fullName) redirect('/account/profile?error=Nama%20wajib%20diisi')
  const { error } = await supabase.rpc('update_my_customer_profile', { p_full_name: fullName, p_phone: phone })
  if (error) redirect(`/account/profile?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/account/profile')
  redirect('/account/profile?success=Profil%20berhasil%20diperbarui')
}

export async function cancelCustomerOrder(formData: FormData) {
  const { supabase } = await requireCustomer()
  const orderId = text(formData, 'orderId')
  const { error } = await supabase.rpc('cancel_my_order', { p_order_id: orderId })
  if (error) redirect(`/account/orders?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/account/orders')
  redirect('/account/orders?success=Pesanan%20dibatalkan%20dan%20stok%20dilepas')
}
