import { CheckoutForm } from '@/components/checkout-form'
import { StoreShell } from '@/components/store-shell'
import { requireUser } from '@/lib/auth'
import { getStoreBranches } from '@/lib/store'

export const dynamic = 'force-dynamic'
type Props = { searchParams: Promise<{ error?: string }> }

export default async function CheckoutPage({ searchParams }: Props) {
  const params = await searchParams
  const { supabase, profile, userId } = await requireUser()
  const [{ data: customer }, branches] = await Promise.all([
    supabase.from('customers').select('id,name,phone').eq('user_id', userId).single(),
    getStoreBranches(),
  ])
  const { data: vehicles } = customer
    ? await supabase.from('customer_vehicles').select('id,brand,model,plate_number').eq('customer_id', customer.id)
    : { data: [] }

  return (
    <StoreShell>
      <main className="store-page">
        <div className="simple-page-heading"><span>CHECKOUT</span><h1>Selesaikan pesanan</h1><p>Order ini akan langsung terlihat oleh admin ERP.</p></div>
        {params.error && <div className="alert error checkout-alert">{params.error}</div>}
        <CheckoutForm branches={branches} vehicles={vehicles ?? []} customerName={customer?.name ?? profile.full_name} customerPhone={customer?.phone ?? ''}/>
      </main>
    </StoreShell>
  )
}
