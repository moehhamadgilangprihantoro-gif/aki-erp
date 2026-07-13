import Link from 'next/link'
import { CalendarCheck, ChevronRight, PackageCheck, RefreshCcw, ShieldCheck, ShoppingBag } from 'lucide-react'
import { requireCustomer } from '@/lib/auth'
import { dateID, rupiah } from '@/lib/format'

export default async function AccountDashboardPage(){
  const {supabase,userId,profile}=await requireCustomer()
  const {data:customer}=await supabase.from('customers').select('id,name').eq('user_id',userId).single()
  if(!customer)return <div className="account-empty"><h2>Profil pelanggan belum tersedia</h2></div>
  const[{data:orders},{data:warranties},{data:jobs}]=await Promise.all([
    supabase.from('orders').select('id,order_number,status,total,created_at,order_items(product_name,quantity)').eq('customer_id',customer.id).order('created_at',{ascending:false}).limit(5),
    supabase.from('product_warranties').select('id,end_date,status').eq('customer_id',customer.id),
    supabase.from('installation_jobs').select('id,status,scheduled_at').eq('customer_id',customer.id),
  ])
  return <><div className="account-title"><div><h1>Halo, {profile.full_name} 👋</h1><p>Kelola pesanan, garansi, kendaraan, dan jadwal pemasangan Anda.</p></div><Link href="/catalog">Belanja Lagi</Link></div><div className="account-stats"><div><ShoppingBag/><span><small>Total Belanja</small><strong>{rupiah((orders??[]).reduce((s,o)=>s+Number(o.total),0))}</strong><em>{orders?.length??0} pesanan</em></span></div><div><ShieldCheck/><span><small>Garansi Aktif</small><strong>{warranties?.filter(w=>w.status==='ACTIVE').length??0} Aki</strong><em>Tercatat otomatis</em></span></div><div><CalendarCheck/><span><small>Pemasangan</small><strong>{jobs?.length??0} Jadwal</strong><em>{jobs?.filter(j=>j.status==='SCHEDULED').length??0} akan datang</em></span></div><div><RefreshCcw/><span><small>Tukar Tambah</small><strong>Ajukan Online</strong><em>Saat checkout</em></span></div></div><section className="account-panel"><div className="account-panel-title"><h2>Pesanan Terakhir</h2><Link href="/account/orders">Lihat Semua <ChevronRight/></Link></div><div className="account-order-list">{(orders??[]).map((o:any)=><article key={o.id}><div className="account-order-icon"><PackageCheck/></div><div><strong>{o.order_number}</strong><span>{o.order_items?.map((i:any)=>`${i.product_name} × ${i.quantity}`).join(', ')}</span><small>{dateID(o.created_at,true)}</small></div><div><strong>{rupiah(o.total)}</strong><span className={`status-pill ${o.status.toLowerCase()}`}>{o.status.replaceAll('_',' ')}</span></div></article>)}{!orders?.length&&<div className="account-empty"><PackageCheck/><h3>Belum ada pesanan</h3><p>Produk yang Anda checkout akan tampil di sini.</p><Link href="/catalog">Lihat Katalog</Link></div>}</div></section></>
}
