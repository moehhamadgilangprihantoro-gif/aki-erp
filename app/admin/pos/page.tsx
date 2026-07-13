import { CreditCard, ScanBarcode, ShoppingCart } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/page-header'
import { requireRole } from '@/lib/auth'
import { rupiah } from '@/lib/format'
import { createSale } from './actions'

type Props = { searchParams: Promise<{ error?: string; success?: string }> }
export default async function AdminPosPage({ searchParams }: Props) {
  const params = await searchParams
  const { supabase, profile } = await requireRole(['SUPER_ADMIN','OWNER','BRANCH_MANAGER','CASHIER','SALES'],'/admin/dashboard')
  let serialQuery = supabase.from('product_serials').select('id,serial_number,purchase_price,current_warehouse_id,products(id,name,sku,selling_price)').eq('status','AVAILABLE').limit(100)
  if (profile.branch_id) {
    const { data: warehouses } = await supabase.from('warehouses').select('id').eq('branch_id',profile.branch_id)
    serialQuery = serialQuery.in('current_warehouse_id',(warehouses??[]).map(w=>w.id))
  }
  const [{ data: serials },{ data: customers }] = await Promise.all([serialQuery,supabase.from('customers').select('id,name,phone').order('name').limit(100)])
  return <>
    <AdminPageHeader title="POS / Penjualan" description="Transaksi toko langsung dengan serial aki dan stok real-time."/>
    {params.error&&<div className="admin-alert error">{params.error}</div>}{params.success&&<div className="admin-alert success">{params.success}</div>}
    <div className="admin-pos-layout">
      <section className="admin-panel pos-form-panel"><div className="admin-panel-heading"><div><h2><ScanBarcode/> Transaksi Baru</h2><p>Pilih unit serial yang akan dijual.</p></div></div><form action={createSale} className="admin-form-grid">
        <label className="full">Customer<select name="customerId"><option value="">Customer Umum</option>{(customers??[]).map(c=><option key={c.id} value={c.id}>{c.name} {c.phone?`· ${c.phone}`:''}</option>)}</select></label>
        <label className="full">Produk / Serial<select name="serialId" required defaultValue=""><option value="" disabled>Pilih serial tersedia</option>{(serials??[]).map((s:any)=><option key={s.id} value={s.id}>{s.products?.name} · {s.serial_number} · {rupiah(s.products?.selling_price)}</option>)}</select></label>
        <label>Metode Pembayaran<select name="paymentMethod"><option>CASH</option><option>QRIS</option><option>BANK_TRANSFER</option><option>DEBIT_CARD</option><option>CREDIT</option></select></label>
        <label>Jumlah Bayar<input name="paidAmount" type="number" min="0" required/></label>
        <label>Biaya Pemasangan<input name="installationFee" type="number" min="0" defaultValue="0"/></label>
        <label>Potongan Tukar Tambah<input name="tradeInValue" type="number" min="0" defaultValue="0"/></label>
        <button className="admin-primary-button full" type="submit"><ShoppingCart size={18}/> Simpan Transaksi</button>
      </form></section>
      <aside className="admin-panel pos-guide"><CreditCard size={46}/><h2>POS Terintegrasi</h2><p>Setelah transaksi berhasil, serial langsung berubah menjadi SOLD, invoice terbentuk, pembayaran tercatat, dan pergerakan stok dibuat otomatis.</p><ul><li>Serial tidak bisa dijual dua kali</li><li>Harga mengikuti master produk</li><li>Stok langsung berkurang</li><li>Siap untuk cetak invoice</li></ul></aside>
    </div>
  </>
}
