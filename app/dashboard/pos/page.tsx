import { CreditCard, ShoppingCart } from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { createSale } from './actions'

export const dynamic = 'force-dynamic'
type Props = { searchParams: Promise<{ error?: string; success?: string }> }

export default async function PosPage({ searchParams }: Props) {
  const { supabase, profile } = await requireRole(['SUPER_ADMIN','OWNER','BRANCH_MANAGER','CASHIER','SALES'])
  const params = await searchParams
  const [{ data: serials }, { data: customers }] = await Promise.all([
    supabase.from('product_serials').select('id, serial_number, current_warehouse_id, product:products(name, selling_price), warehouse:warehouses(name, branch_id)').eq('status','AVAILABLE').order('created_at').limit(100),
    supabase.from('customers').select('id,name,phone').order('name').limit(100),
  ])
  const allowedSerials = (serials ?? []).filter((s:any)=>!profile.branch_id || s.warehouse?.branch_id===profile.branch_id)

  return <div className="page-content"><div className="page-heading"><div><h1>POS / Penjualan</h1><p>Penjualan satu unit aki per transaksi untuk MVP. Seluruh perubahan stok berjalan atomic di PostgreSQL.</p></div><span className="date-chip"><ShoppingCart size={16}/> Kasir</span></div>
    {params.error && <div className="alert error">{params.error}</div>}{params.success && <div className="alert success">{params.success}</div>}
    <section className="pos-layout"><article className="panel pos-main"><div className="panel-title"><div><h2>Transaksi Baru</h2><p>Pilih pelanggan dan serial aki yang tersedia.</p></div></div><form action={createSale} className="form-stack spacious"><label>Pelanggan<select name="customerId"><option value="">Customer Umum</option>{(customers??[]).map((c:any)=><option key={c.id} value={c.id}>{c.name}{c.phone?` · ${c.phone}`:''}</option>)}</select></label><label>Serial aki<select name="serialId" required><option value="">Pilih produk / serial</option>{allowedSerials.map((s:any)=><option key={s.id} value={s.id}>{s.product?.name} · {s.serial_number} · Rp {Number(s.product?.selling_price ?? 0).toLocaleString('id-ID')}</option>)}</select></label><div className="form-row"><label>Jasa pemasangan<input name="installationFee" type="number" min="0" defaultValue="50000"/></label><label>Potongan tukar tambah<input name="tradeInValue" type="number" min="0" defaultValue="0"/></label></div><div className="form-row"><label>Metode pembayaran<select name="paymentMethod"><option value="CASH">Tunai</option><option value="QRIS">QRIS</option><option value="BANK_TRANSFER">Transfer</option><option value="DEBIT_CARD">Kartu Debit</option><option value="CREDIT">Kredit</option></select></label><label>Jumlah dibayar<input name="paidAmount" type="number" min="0" defaultValue="0" required/></label></div><button className="button primary large" type="submit"><CreditCard size={19}/> Proses Transaksi</button></form></article><aside className="panel pos-summary"><img src="/battery.svg" alt="Aki"/><h2>Transaksi Aman</h2><p>Fungsi database akan mengunci serial, membuat invoice, pembayaran, stock movement, dan menandai serial SOLD dalam satu transaksi.</p><ul><li>Serial tidak bisa dijual dua kali</li><li>Akses dibatasi role dan cabang</li><li>Perubahan stok tercatat</li></ul></aside></section>
  </div>
}
