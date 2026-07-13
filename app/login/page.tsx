import { BatteryCharging, LockKeyhole, ShieldCheck } from 'lucide-react'
import { login, registerCustomer } from './actions'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ error?: string; message?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams

  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="brand-mark"><BatteryCharging size={36} /></div>
        <p className="eyebrow">AKI ERP</p>
        <h1>Kelola penjualan aki dari stok sampai garansi.</h1>
        <p className="auth-copy">Satu aplikasi untuk admin, kasir, gudang, teknisi, sales, dan pelanggan.</p>
        <div className="auth-points">
          <span><ShieldCheck size={18} /> Akses berdasarkan role dan cabang</span>
          <span><LockKeyhole size={18} /> Database diamankan Supabase RLS</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div>
            <p className="eyebrow blue">MASUK</p>
            <h2>Selamat datang kembali</h2>
            <p className="muted">Gunakan akun yang sudah dibuat di Supabase Auth.</p>
          </div>
          {params.error && <div className="alert error">{params.error}</div>}
          {params.message && <div className="alert success">{params.message}</div>}
          <form action={login} className="form-stack">
            <label>Email<input name="email" type="email" placeholder="nama@email.com" required /></label>
            <label>Password<input name="password" type="password" placeholder="Minimal 8 karakter" required /></label>
            <button className="button primary" type="submit">Masuk ke dashboard</button>
          </form>

          <details className="register-box">
            <summary>Daftar sebagai pelanggan</summary>
            <form action={registerCustomer} className="form-stack compact">
              <label>Nama lengkap<input name="fullName" required /></label>
              <label>Email<input name="email" type="email" required /></label>
              <label>Password<input name="password" type="password" minLength={8} required /></label>
              <button className="button secondary" type="submit">Buat akun pelanggan</button>
            </form>
          </details>
        </div>
      </section>
    </main>
  )
}
