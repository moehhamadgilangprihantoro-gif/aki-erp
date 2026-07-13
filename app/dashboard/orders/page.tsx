import Link from 'next/link'
import { Box, CheckCircle2, Clock3, CreditCard, PackageCheck, Truck } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { cancelCustomerOrder, markOrderPaid, updateOrderStatus } from './actions'

export const dynamic = 'force-dynamic'
type Props = { searchParams: Promise<{ error?: string; success?: string }> }

function money(value: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value))
}

const nextStatuses = ['PROCESSING','READY_FOR_PICKUP','OUT_FOR_DELIVERY','INSTALLATION_SCHEDULED','INSTALLED','COMPLETED','CANCELLED']

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams
  const { supabase, profile, userId } = await requireUser()
  const isCustomer = profile.role === 'CUSTOMER'

  let query = supabase.from('orders').select(`
    id,order_number,status,payment_status,payment_method,fulfillment_type,
    contact_name,phone,delivery_address,total,subtotal,shipping_fee,installation_fee,
    expires_at,created_at,sales_invoice_id,
    customer:customers(name,email),
    branch:branches(name),
    order_items(id,product_name,sku,quantity,unit_price,subtotal)
  `).order('created_at', { ascending: false }).limit(50)

  if (isCustomer) {
    const { data: customer } = await supabase.from('customers').select('id').eq('user_id', userId).single()
    if (customer) query = query.eq('customer_id', customer.id)
  }

  const { data: orders, error } = await query

  return (
    <div className="page-content">
      <div className="page-heading"><div><h1>{isCustomer ? 'Pesanan Saya' : 'Pesanan Online'}</h1><p>{isCustomer ? 'Lacak pembayaran, penyiapan barang, pengiriman, dan pemasangan.' : 'Order ecommerce masuk otomatis ke ERP dan mereservasi stok.'}</p></div>{isCustomer && <Link className="button primary" href="/catalog">Belanja lagi</Link>}</div>
      {params.error && <div className="alert error">{params.error}</div>}
      {params.success && <div className="alert success">{params.success}</div>}
      {error && <div className="alert error">{error.message}</div>}

      <section className="order-list">
        {(orders ?? []).map((order: any) => (
          <article className="erp-order-card" key={order.id}>
            <div className="erp-order-header"><div><span>{new Date(order.created_at).toLocaleString('id-ID')}</span><h2>{order.order_number}</h2><p>{order.customer?.name ?? order.contact_name} · {order.branch?.name ?? 'Cabang'}</p></div><div className="order-badges"><span className={`badge ${order.payment_status === 'PAID' ? 'paid' : 'pending'}`}>{order.payment_status}</span><span className="badge order-status">{order.status}</span></div></div>
            <div className="erp-order-products">{order.order_items?.map((item: any) => <div key={item.id}><img src="/battery.svg" alt=""/><span><strong>{item.product_name}</strong><small>{item.sku} · {item.quantity} unit</small></span><strong>{money(item.subtotal)}</strong></div>)}</div>
            <div className="erp-order-meta">
              <span><CreditCard/> {order.payment_method.replaceAll('_',' ')}</span>
              <span>{order.fulfillment_type === 'PICKUP' ? <PackageCheck/> : <Truck/>} {order.fulfillment_type.replaceAll('_',' ')}</span>
              <span><Box/> Total {money(order.total)}</span>
              {order.expires_at && order.payment_status !== 'PAID' && <span><Clock3/> Exp. {new Date(order.expires_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span>}
              {order.sales_invoice_id && <span><CheckCircle2/> Invoice otomatis dibuat</span>}
            </div>

            {!isCustomer && <div className="erp-order-actions">
              {order.payment_status !== 'PAID' && !['CANCELLED','EXPIRED'].includes(order.status) && <form action={markOrderPaid}><input type="hidden" name="orderId" value={order.id}/><input name="reference" placeholder="Referensi pembayaran"/><button className="button primary">Konfirmasi bayar</button></form>}
              <form action={updateOrderStatus}><input type="hidden" name="orderId" value={order.id}/><select name="status" defaultValue="PROCESSING">{nextStatuses.map((status) => <option key={status}>{status}</option>)}</select><input name="note" placeholder="Catatan status"/><button className="button secondary">Update status</button></form>
            </div>}

            {isCustomer && order.payment_status !== 'PAID' && !['CANCELLED','EXPIRED'].includes(order.status) && <form action={cancelCustomerOrder} className="customer-cancel"><input type="hidden" name="orderId" value={order.id}/><button className="text-danger">Batalkan pesanan</button></form>}
          </article>
        ))}
        {!orders?.length && <div className="panel empty-state">Belum ada pesanan ecommerce.</div>}
      </section>
    </div>
  )
}
