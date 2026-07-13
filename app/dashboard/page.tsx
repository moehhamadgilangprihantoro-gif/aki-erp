import { AdminDashboard, type AdminDashboardData } from '@/components/admin-dashboard'
import { CustomerDashboard, type CustomerDashboardData } from '@/components/customer-dashboard'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function startOfDay() { const d = new Date(); d.setHours(0,0,0,0); return d }
function startOfMonth() { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d }

export default async function DashboardPage() {
  const { supabase, profile, userId } = await requireUser()

  if (profile.role === 'CUSTOMER') {
    const { data: customer } = await supabase.from('customers').select('id').eq('user_id', userId).maybeSingle()
    if (!customer) return <CustomerDashboard name={profile.full_name} data={{ exists:false,totalPurchase:0,transactionCount:0,warrantyActive:0,installationCount:0,tradeInCount:0,invoices:[],vehicles:[] }} />

    const [{ data: invoices }, { count: warrantyActive }, { count: installationCount }, { count: tradeInCount }, { data: vehicles }] = await Promise.all([
      supabase.from('sales_invoices').select('id, invoice_number, invoice_date, total, payment_status, sales_invoice_items(product:products(name), serial:product_serials(serial_number))').eq('customer_id', customer.id).order('invoice_date', { ascending:false }).limit(8),
      supabase.from('warranty_claims').select('*', { count:'exact', head:true }).eq('customer_id', customer.id).in('status', ['SUBMITTED','INSPECTION','APPROVED','REPLACED']),
      supabase.from('installations').select('*', { count:'exact', head:true }).eq('customer_id', customer.id),
      supabase.from('used_batteries').select('*', { count:'exact', head:true }).eq('customer_id', customer.id),
      supabase.from('customer_vehicles').select('id, brand, model, plate_number').eq('customer_id', customer.id).limit(5),
    ])

    const mapped = (invoices ?? []).map((invoice: any) => {
      const firstItem = invoice.sales_invoice_items?.[0]
      return { id:invoice.id, invoice_number:invoice.invoice_number, invoice_date:invoice.invoice_date, total:Number(invoice.total), payment_status:invoice.payment_status, productName:firstItem?.product?.name ?? 'Produk Aki', serialNumber:firstItem?.serial?.serial_number ?? '' }
    })
    const data: CustomerDashboardData = { exists:true, totalPurchase:mapped.reduce((s,x)=>s+x.total,0), transactionCount:mapped.length, warrantyActive:warrantyActive ?? 0, installationCount:installationCount ?? 0, tradeInCount:tradeInCount ?? 0, invoices:mapped, vehicles:vehicles ?? [] }
    return <CustomerDashboard name={profile.full_name} data={data}/>
  }

  const [{ data: todayInvoices }, { data: monthInvoices }, { count: availableStock }, { data: recentInvoices }, { data: products }] = await Promise.all([
    supabase.from('sales_invoices').select('total').gte('invoice_date', startOfDay().toISOString()),
    supabase.from('sales_invoices').select('total').gte('invoice_date', startOfMonth().toISOString()),
    supabase.from('product_serials').select('*', { count:'exact', head:true }).eq('status','AVAILABLE'),
    supabase.from('sales_invoices').select('id, invoice_number, invoice_date, total, payment_status, customer:customers(name)').order('invoice_date', { ascending:false }).limit(8),
    supabase.from('products').select('id, name, sku, minimum_stock, product_serials(status)'),
  ])

  const lowStocks = (products ?? []).map((product:any) => ({ id:product.id, name:product.name, sku:product.sku, minimum:product.minimum_stock, stock:(product.product_serials ?? []).filter((s:any)=>s.status==='AVAILABLE').length })).filter((p:any)=>p.stock<=p.minimum).slice(0,6)
  const data: AdminDashboardData = {
    todayRevenue:(todayInvoices ?? []).reduce((sum,row:any)=>sum+Number(row.total),0),
    todayTransactions:todayInvoices?.length ?? 0,
    monthRevenue:(monthInvoices ?? []).reduce((sum,row:any)=>sum+Number(row.total),0),
    availableStock:availableStock ?? 0,
    recentInvoices:(recentInvoices ?? []).map((row:any)=>({ ...row, total:Number(row.total), customerName:row.customer?.name ?? 'Customer Umum' })),
    lowStocks,
  }
  return <AdminDashboard name={profile.full_name} data={data}/>
}
