import { requireUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
export default async function LegacyDashboard(){const{profile}=await requireUser();redirect(profile.role==='CUSTOMER'?'/account':'/admin/dashboard')}
