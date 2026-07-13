import { CalendarClock, MapPin, Wrench } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/page-header'
import { requireStaff } from '@/lib/auth'
import { dateID } from '@/lib/format'

export default async function InstallationsPage(){
  const {supabase,profile}=await requireStaff()
  const query=supabase.from('installation_jobs').select('id,status,scheduled_at,completed_at,delivery_address,notes,orders(order_number,branch_id,contact_name,phone),customers(name),customer_vehicles(brand,model,plate_number),order_item_serials(product_serials(serial_number),order_items(product_name))').order('scheduled_at',{ascending:true}).limit(100)
  const {data:jobs,error}=await query
  const visible=(jobs??[]).filter((j:any)=>!profile.branch_id||j.orders?.branch_id===profile.branch_id)
  return <><AdminPageHeader title="Pemasangan" description="Jadwal teknisi dari order antar & pasang dan transaksi toko."/>{error&&<div className="admin-alert error">{error.message}</div>}<div className="admin-install-grid">{visible.map((job:any)=><article className="installation-card" key={job.id}><div className="installation-card-head"><span className="installation-icon"><Wrench/></span><div><strong>{job.order_item_serials?.order_items?.product_name??'Pemasangan Aki'}</strong><small>{job.orders?.order_number}</small></div><span className={`status-pill ${job.status.toLowerCase()}`}>{job.status.replaceAll('_',' ')}</span></div><div className="installation-customer"><strong>{job.customers?.name??job.orders?.contact_name}</strong><span>{job.orders?.phone}</span></div><div className="installation-info"><span><CalendarClock/>{dateID(job.scheduled_at,true)}</span><span><MapPin/>{job.delivery_address||'Ambil / pasang di toko'}</span><span>🚗 {job.customer_vehicles?`${job.customer_vehicles.brand} ${job.customer_vehicles.model} · ${job.customer_vehicles.plate_number||'-'}`:'Kendaraan belum dipilih'}</span><span>🔋 Serial: {job.order_item_serials?.product_serials?.serial_number??'-'}</span></div>{job.notes&&<p>{job.notes}</p>}</article>)}{!visible.length&&<div className="admin-empty-state"><h2>Belum ada jadwal pemasangan</h2><p>Order dengan layanan Antar & Pasang akan muncul otomatis.</p></div>}</div></>
}
