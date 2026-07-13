import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile, UserRole } from '@/lib/types'
import { staffRoles } from '@/lib/types'

export async function requireUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub

  if (error || !userId) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, branch_id, full_name, role, is_active')
    .eq('id', userId)
    .single()

  if (profileError || !profile || !profile.is_active) {
    await supabase.auth.signOut()
    redirect('/login?error=Account%20is%20not%20active')
  }

  return { supabase, userId, profile: profile as Profile }
}

export async function requireRole(allowed: UserRole[], fallback = '/') {
  const context = await requireUser()
  if (!allowed.includes(context.profile.role)) redirect(fallback)
  return context
}

export async function requireStaff() {
  const context = await requireUser()
  if (!staffRoles.includes(context.profile.role)) redirect('/account')
  return context
}

export async function requireCustomer() {
  const context = await requireUser()
  if (context.profile.role !== 'CUSTOMER') redirect('/admin/dashboard')
  return context
}

export async function getOptionalUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) return { supabase, profile: null as Profile | null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, branch_id, full_name, role, is_active')
    .eq('id', userId)
    .maybeSingle()

  return { supabase, profile: profile as Profile | null }
}
