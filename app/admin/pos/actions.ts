'use server'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'
export async function createSale(formData: FormData) {
  const { supabase } = await requireRole(['SUPER_ADMIN','OWNER','BRANCH_MANAGER','CASHIER','SALES'], '/admin/dashboard')
  const serialId = String(formData.get('serialId') ?? '')
  if (!serialId) redirect('/admin/pos?error=Pilih%20serial%20aki')
  const { data, error } = await supabase.rpc('create_battery_sale', {
    p_customer_id: String(formData.get('customerId') ?? '') || null,
    p_serial_id: serialId,
    p_payment_method: String(formData.get('paymentMethod') ?? 'CASH'),
    p_paid_amount: Number(formData.get('paidAmount') ?? 0),
    p_installation_fee: Number(formData.get('installationFee') ?? 0),
    p_trade_in_value: Number(formData.get('tradeInValue') ?? 0),
  })
  if (error) redirect(`/admin/pos?error=${encodeURIComponent(error.message)}`)
  redirect(`/admin/pos?success=${encodeURIComponent(`Transaksi berhasil. Invoice: ${data}`)}`)
}
