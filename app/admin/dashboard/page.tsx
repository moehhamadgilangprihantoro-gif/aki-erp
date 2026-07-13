import Link from 'next/link'
import { Boxes, CircleDollarSign, PackageCheck, ShoppingCart, TrendingUp, TriangleAlert } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/page-header'
import { DataCard } from '@/components/admin/data-card'
import { requireStaff } from '@/lib/auth'
import { dateID, rupiah } from '@/lib/format'

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireStaff()
  const today = new Date(); today.setHours(0,0,0,0)
  const month = new Date(); month.setDate(1); month.setHours(0,0,0,0)
  let invoiceQuery = supabase.from('sales_invoices').select('id,total,payment_status,invoice_number,invoice_date,customer_id').gte('invoice_date', month.toISOString()).order('invoice_date', { ascending: false }).limit(8)
  let ordersQuery = supabase.from('orders').select('id,order_number,status,total,created_at,contact_name').order('created_at', { ascending: false }).limit(6)
  if (profile.branch_id) { invoiceQuery = invoiceQuery.eq('branch_id', profile.branch_id); ordersQuery = ordersQuery.eq('branch_id', profile.branch_id) }
  const [{ data: invoices }, { data: orders }, { data: serials }, { data: products }] = await Promise.all([
    invoiceQuery, ordersQuery,
    supabase.from('product_serials').select('id,status,product_id').in('status', ['AVAILABLE','RESERVED']),
    supabase.from('products').select('id,name,minimum_stock,selling_price').eq('is_active', true),
  ])
  const todayInvoices = (invoices ?? []).filter((i) => new Date(i.invoice_date) >= today)
  const monthlySales = (invoices ?? []).reduce((sum, i) => sum + Number(i.total), 0)
  const available = (serials ?? []).filter((s) => s.status === 'AVAILABLE')
  const productStock = new Map<string, number>(); available.forEach((s) => productStock.set(s.product_id, (productStock.get(s.product_id) ?? 0) + 1))
  const lowStock = (products ?? []).filter((p) => (productStock.get(p.id) ?? 0) <= p.minimum_stock)

  return <>
    <AdminPageHeader title="Dashboard" description="Ringkasan penjualan, order ecommerce, dan inventory terkini." actions={<Link className="admin-primary-button" href="/admin/pos">+ Transaksi POS</Link>}/>
    <div className="admin-stat-grid">
      <DataCard label="Penjualan Hari Ini" value={rupiah(todayInvoices.reduce((s,i)=>s+Number(i.total),0))} helper={`${todayInvoices.length} transaksi`} icon={CircleDollarSign} tone="orange"/>
      <DataCard label="Penjualan Bulan Ini" value={rupiah(monthlySales)} helper="Invoice ERP" icon={TrendingUp} tone="green"/>
      <DataCard label="Order Online" value={(orders ?? []).length} helper={`${(orders ?? []).filter(o=>o.status==='PENDING_PAYMENT').length} menunggu bayar`} icon={ShoppingCart} tone="blue"/>
      <DataCard label="Stok Tersedia" value={available.length} helper={`${(serials ?? []).filter(s=>s.status==='RESERVED').length} direservasi`} icon={Boxes} tone="purple"/>
    </div>
    <div className="admin-dashboard-grid">
      <section className="admin-panel admin-table-panel"><div className="admin-panel-heading"><div><h2>Pesanan Ecommerce Terbaru</h2><p>Order dari storefront langsung muncul di sini.</p></div><Link href="/admin/orders">Lihat semua</Link></div><div className="admin-table-scroll"><table><thead><tr><th>Order</th><th>Pelanggan</th><th>Tanggal</th><th>Total</th><th>Status</th></tr></thead><tbody>{(orders ?? []).map((o)=><tr key={o.id}><td><Link href="/admin/orders">{o.order_number}</Link></td><td>{o.contact_name}</td><td>{dateID(o.created_at,true)}</td><td>{rupiah(o.total)}</td><td><span className={`status-pill ${o.status.toLowerCase()}`}>{o.status.replaceAll('_',' ')}</span></td></tr>)}{!orders?.length&&<tr><td colSpan={5} className="empty-table">Belum ada order.</td></tr>}</tbody></table></div></section>
      <aside className="admin-side-stack"><section className="admin-panel"><div className="admin-panel-heading"><div><h2><TriangleAlert size={18}/> Stok Menipis</h2><p>Produk pada atau di bawah minimum.</p></div></div><div className="admin-low-stock">{lowStock.slice(0,6).map((p)=><div key={p.id}><span className="battery-mini"><PackageCheck/></span><div><strong>{p.name}</strong><small>Minimum {p.minimum_stock} unit</small></div><b>{productStock.get(p.id) ?? 0}</b></div>)}{!lowStock.length&&<p className="admin-empty-note">Semua stok aman.</p>}</div></section><section className="admin-panel quick-admin-links"><h2>Aksi Cepat</h2><Link href="/admin/products">Kelola Produk</Link><Link href="/admin/inventory">Cek Serial Stok</Link><Link href="/admin/purchases">Buat Pembelian</Link><Link href="/admin/reports">Buka Laporan</Link></section></aside>
    </div>
  </>
}
