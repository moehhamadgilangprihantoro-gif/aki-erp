import { Search, UsersRound } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/page-header'
import { requireStaff } from '@/lib/auth'
import { dateID, rupiah } from '@/lib/format'

export default async function CustomersPage(){
  const { supabase, profile } = await requireStaff()
  let query = supabase.from('customers').select('id,customer_number,name,phone,email,is_corporate,created_at,customer_vehicles(id),sales_invoices(id,total)').order('created_at',{ascending:false}).limit(200)
  if(profile.branch_id) query=query.or(`branch_id.eq.${profile.branch_id},branch_id.is.null`)
  const {data:customers,error}=await query
  return <><AdminPageHeader title="Pelanggan" description="Data customer ecommerce dan transaksi toko berada dalam satu master."/><section className="admin-panel admin-table-panel"><div className="admin-table-toolbar"><div><Search/><input placeholder="Cari nama, nomor customer, atau telepon"/></div><span>{customers?.length??0} pelanggan</span></div>{error&&<div className="admin-alert error">{error.message}</div>}<div className="admin-table-scroll"><table><thead><tr><th>Pelanggan</th><th>Kontak</th><th>Kendaraan</th><th>Transaksi</th><th>Total Belanja</th><th>Terdaftar</th></tr></thead><tbody>{(customers??[]).map((c:any)=><tr key={c.id}><td><div className="customer-cell"><span><UsersRound/></span><div><strong>{c.name}</strong><small>{c.customer_number}{c.is_corporate?' · Corporate':''}</small></div></div></td><td>{c.phone||'-'}<small>{c.email||'-'}</small></td><td>{c.customer_vehicles?.length??0}</td><td>{c.sales_invoices?.length??0}</td><td>{rupiah((c.sales_invoices??[]).reduce((s:number,i:any)=>s+Number(i.total),0))}</td><td>{dateID(c.created_at)}</td></tr>)}</tbody></table></div>{!customers?.length&&<div className="admin-empty-state"><h2>Belum ada pelanggan</h2><p>Customer yang mendaftar di ecommerce akan muncul di sini.</p></div>}</section></>
}
