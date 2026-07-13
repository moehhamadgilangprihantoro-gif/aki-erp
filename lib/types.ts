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
