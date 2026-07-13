import { AdminPageHeader } from '@/components/admin/page-header'
import { requireStaff } from '@/lib/auth'
import { dateID, rupiah } from '@/lib/format'
import { markOrderPaid, updateOrderStatus } from './actions'

type Props = { searchParams: Promise<{ error?: string; success?: string }> }

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams
  const { supabase, profile } = await requireStaff()
  let query = supabase.from('orders').select('id,order_number,status,payment_status,payment_method,fulfillment_type,contact_name,phone,total,created_at,scheduled_at,order_items(product_name,quantity,unit_price)').order('created_at',{ascending:false}).limit(100)
  if (profile.branch_id) query = query.eq('branch_id', profile.branch_id)
  const { data: orders, error } = await query
  return <>
    <AdminPageHeader title="Pesanan Online" description="Kelola checkout customer, pembayaran, pengiriman, dan pemasangan."/>
    {params.error&&<div className="admin-alert error">{params.error}</div>}{params.success&&<div className="admin-alert success">{params.success}</div>}{error&&<div className="admin-alert error">{error.message}</div>}
    <div className="admin-order-list">
      {(orders ?? []).map((order)=><article className="admin-order-card" key={order.id}>
        <div className="admin-order-card-head"><div><strong>{order.order_number}</strong><span>{dateID(order.created_at,true)} · {order.contact_name} · {order.phone}</span></div><div><span className={`status-pill ${order.payment_status.toLowerCase()}`}>{order.payment_status}</span><span className={`status-pill ${order.status.toLowerCase()}`}>{order.status.replaceAll('_',' ')}</span></div></div>
        <div className="admin-order-card-body"><div className="order-product-list">{order.order_items?.map((item:any,index:number)=><div key={index}><span className="battery-mini">⚡</span><div><strong>{item.product_name}</strong><small>{item.quantity} × {rupiah(item.unit_price)}</small></div></div>)}</div><dl><div><dt>Layanan</dt><dd>{order.fulfillment_type.replaceAll('_',' ')}</dd></div><div><dt>Pembayaran</dt><dd>{order.payment_method.replaceAll('_',' ')}</dd></div><div><dt>Total</dt><dd><strong>{rupiah(order.total)}</strong></dd></div></dl></div>
        <div className="admin-order-card-actions">
          {order.payment_status!=='PAID'&&['SUPER_ADMIN','OWNER','BRANCH_MANAGER','CASHIER','FINANCE'].includes(profile.role)&&<form action={markOrderPaid}><input type="hidden" name="orderId" value={order.id}/><input name="reference" placeholder="Referensi pembayaran"/><button className="admin-primary-button">Konfirmasi Bayar</button></form>}
          <form action={updateOrderStatus}><input type="hidden" name="orderId" value={order.id}/><select name="status" defaultValue={order.status}><option>PROCESSING</option><option>READY_FOR_PICKUP</option><option>OUT_FOR_DELIVERY</option><option>INSTALLATION_SCHEDULED</option><option>INSTALLED</option><option>COMPLETED</option><option>CANCELLED</option></select><input name="note" placeholder="Catatan status"/><button className="admin-secondary-button">Update Status</button></form>
        </div>
      </article>)}
      {!orders?.length&&<div className="admin-empty-state"><h2>Belum ada pesanan online</h2><p>Order dari ecommerce akan langsung tampil di halaman ini.</p></div>}
    </div>
  </>
}
