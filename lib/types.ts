export type UserRole =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'BRANCH_MANAGER'
  | 'PURCHASING'
  | 'WAREHOUSE'
  | 'CASHIER'
  | 'SALES'
  | 'TECHNICIAN'
  | 'FINANCE'
  | 'AUDITOR'
  | 'CUSTOMER'

export type Profile = {
  id: string
  branch_id: string | null
  full_name: string
  role: UserRole
  is_active: boolean
}

export const staffRoles: UserRole[] = [
  'SUPER_ADMIN',
  'OWNER',
  'BRANCH_MANAGER',
  'PURCHASING',
  'WAREHOUSE',
  'CASHIER',
  'SALES',
  'TECHNICIAN',
  'FINANCE',
  'AUDITOR',
]

export type StoreProduct = {
  id: string
  slug: string | null
  sku: string
  name: string
  description: string | null
  image_url: string | null
  brand_name: string
  category_name: string
  voltage: number | null
  capacity_ah: number | null
  cca: number | null
  warranty_months: number
  selling_price: number
  is_featured: boolean
  stock_available: number
  branch_stock: Array<{ branch_id: string; branch_name: string; stock: number }>
}

export type CartItem = {
  productId: string
  slug: string
  name: string
  sku: string
  imageUrl: string | null
  unitPrice: number
  quantity: number
  stockAvailable: number
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'INSTALLATION_SCHEDULED'
  | 'INSTALLED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
