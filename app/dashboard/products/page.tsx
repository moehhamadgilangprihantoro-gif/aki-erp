import { Boxes, Plus } from 'lucide-react'
import { createProduct } from './actions'
import { requireRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'
type Props = { searchParams: Promise<{ error?: string; success?: string }> }

function money(v:number) { return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(v) }

export default async function ProductsPage({ searchParams }: Props) {
  const { supabase } = await requireRole(['SUPER_ADMIN','OWNER','BRANCH_MANAGER','PURCHASING','WAREHOUSE','CASHIER','SALES','AUDITOR'])
  const params = await searchParams
  const [{ data: products }, { data: brands }, { data: categories }] = await Promise.all([
    supabase.from('products').select('id, sku, name, voltage, capacity_ah, selling_price, minimum_stock, brand:product_brands(name), category:product_categories(name), product_serials(status)').order('name'),
    supabase.from('product_brands').select('id,name').order('name'),
    supabase.from('product_categories').select('id,name').order('name'),
  ])

  return <div className="page-content"><div className="page-heading"><div><h1>Produk & Stok</h1><p>Kelola katalog aki dan pantau stok berdasarkan serial number.</p></div><span className="date-chip"><Boxes size={16}/> {products?.length ?? 0} produk</span></div>
    {params.error && <div className="alert error">{params.error}</div>}{params.success && <div className="alert success">{params.success}</div>}
    <section className="product-layout">
      <article className="panel table-panel"><div className="panel-title"><div><h2>Daftar Produk</h2><p>Stok dihitung dari serial AVAILABLE</p></div></div><div className="table-wrap"><table><thead><tr><th>Produk</th><th>Spesifikasi</th><th>Harga</th><th>Stok</th><th>Status</th></tr></thead><tbody>{(products ?? []).map((p:any)=>{const stock=(p.product_serials??[]).filter((s:any)=>s.status==='AVAILABLE').length;return <tr key={p.id}><td><strong>{p.name}</strong><small className="table-sub">{p.sku} · {p.brand?.name}</small></td><td>{p.voltage ?? '-'}V / {p.capacity_ah ?? '-'}Ah</td><td>{money(Number(p.selling_price))}</td><td>{stock}</td><td><span className={`badge ${stock<=p.minimum_stock?'pending':'paid'}`}>{stock<=p.minimum_stock?'Menipis':'Aman'}</span></td></tr>})}</tbody></table></div></article>
      <aside className="panel form-panel"><div className="panel-title"><div><h2><Plus size={20}/> Tambah Produk</h2><p>Untuk admin, purchasing, atau warehouse</p></div></div><form action={createProduct} className="form-stack"><label>SKU<input name="sku" placeholder="GS-NS60" required/></label><label>Nama produk<input name="name" placeholder="GS Astra NS60" required/></label><div className="form-row"><label>Brand<select name="brandId" required><option value="">Pilih</option>{(brands??[]).map((x:any)=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><label>Kategori<select name="categoryId" required><option value="">Pilih</option>{(categories??[]).map((x:any)=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label></div><div className="form-row"><label>Voltage<input name="voltage" type="number" defaultValue="12"/></label><label>Capacity Ah<input name="capacityAh" type="number" defaultValue="45"/></label></div><div className="form-row"><label>Harga beli<input name="purchasePrice" type="number" defaultValue="0"/></label><label>Harga jual<input name="sellingPrice" type="number" defaultValue="0"/></label></div><div className="form-row"><label>Garansi bulan<input name="warrantyMonths" type="number" defaultValue="12"/></label><label>Minimum stok<input name="minimumStock" type="number" defaultValue="5"/></label></div><button className="button primary" type="submit">Simpan Produk</button></form></aside>
    </section>
  </div>
}
