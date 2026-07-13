'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'

export async function createPurchaseOrder(formData: FormData){
  const {supabase,userId,profile}=await requireRole(['SUPER_ADMIN','OWNER','BRANCH_MANAGER','PURCHASING'],'/admin/dashboard')
  const supplierId=String(formData.get('supplierId')??'')
  const productId=String(formData.get('productId')??'')
  const quantity=Number(formData.get('quantity')??0)
  const unitPrice=Number(formData.get('unitPrice')??0)
  let branchId=profile.branch_id
  if(!branchId){branchId=String(formData.get('branchId')??'')||null}
  if(!supplierId||!productId||!branchId||quantity<1||unitPrice<0)redirect('/admin/purchases?error=Data%20purchase%20order%20belum%20lengkap')
  const poNumber=`PO-${new Date().toISOString().replace(/\D/g,'').slice(0,14)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`
  const total=quantity*unitPrice
  const {data:po,error}=await supabase.from('purchase_orders').insert({po_number:poNumber,supplier_id:supplierId,branch_id:branchId,created_by:userId,status:'DRAFT',total}).select('id').single()
  if(error)redirect(`/admin/purchases?error=${encodeURIComponent(error.message)}`)
  const {error:itemError}=await supabase.from('purchase_order_items').insert({purchase_order_id:po.id,product_id:productId,quantity,unit_price:unitPrice,subtotal:total})
  if(itemError)redirect(`/admin/purchases?error=${encodeURIComponent(itemError.message)}`)
  revalidatePath('/admin/purchases');redirect('/admin/purchases?success=Purchase%20order%20berhasil%20dibuat')
}
