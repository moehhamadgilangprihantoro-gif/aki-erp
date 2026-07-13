'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function text(formData: FormData, key: string) { return String(formData.get(key) ?? '').trim() }

async function destinationForUser(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
  return profile?.role === 'CUSTOMER' ? '/account' : '/admin/dashboard'
}

export async function login(formData: FormData) {
  const email = text(formData, 'email')
  const password = text(formData, 'password')
  if (!email || !password) redirect('/login?error=Email%20dan%20password%20wajib%20diisi')
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) redirect(`/login?error=${encodeURIComponent(error?.message ?? 'Login gagal')}`)
  redirect(await destinationForUser(supabase, data.user.id))
}

export async function registerCustomer(formData: FormData) {
  const fullName = text(formData, 'fullName')
  const email = text(formData, 'email')
  const password = text(formData, 'password')
  if (!fullName || !email || password.length < 8) redirect('/login?mode=register&error=Nama%2C%20email%2C%20dan%20password%20minimal%208%20karakter%20wajib%20diisi')
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
  if (error) redirect(`/login?mode=register&error=${encodeURIComponent(error.message)}`)
  if (data.session) redirect('/account')
  redirect('/login?message=Registrasi%20berhasil.%20Silakan%20masuk.')
}
