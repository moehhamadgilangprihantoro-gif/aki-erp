'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function login(formData: FormData) {
  const email = text(formData, 'email')
  const password = text(formData, 'password')

  if (!email || !password) redirect('/login?error=Email%20dan%20password%20wajib%20diisi')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  redirect('/dashboard')
}

export async function registerCustomer(formData: FormData) {
  const fullName = text(formData, 'fullName')
  const email = text(formData, 'email')
  const password = text(formData, 'password')

  if (!fullName || !email || password.length < 8) {
    redirect('/login?error=Nama%2C%20email%2C%20dan%20password%20minimal%208%20karakter%20wajib%20diisi')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  redirect('/login?message=Registrasi%20berhasil.%20Periksa%20email%20jika%20konfirmasi%20email%20aktif.')
}
