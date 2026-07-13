import { BatteryCharging, History, ShieldCheck, Wrench } from 'lucide-react'
import { StatCard } from './stat-card'

function money(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export type CustomerDashboardData = {
  exists: boolean
  totalPurchase: number
  transactionCount: number
  warrantyActive: number
  installationCount: number
  tradeInCount: number
  invoices: Array<{ id: string; invoice_number: string; invoice_date: string; total: number; payment_status: string; productName: string; serialNumber: string }>
  vehicles: Array<{ id: string; brand: string; model: string; plate_number: string | null }>
}

export function CustomerDashboard({ name, data }: { name: string; data: CustomerDashboardData }) {
  if (!data.exists) {
    return <div className="page-content"><div className="panel empty-customer"><BatteryCharging size={42} /><h1>Profil pelanggan belum terhubung</h1><p>Pastikan tabel customers memiliki user_id yang sama dengan akun Auth ini. Untuk akun pelanggan baru, trigger SQL akan membuatkannya otomatis.</p></div></div>
  }

  return (
    <div className="page-content">
      <div className="page-heading"><div><h1>Halo, {name} 👋</h1><p>Selamat datang di dashboard pelanggan AKI.</p></div><span className="date-chip">Portal pelanggan</span></div>
      <section className="stats-grid four">
        <StatCard icon={History} label="Total Pembelian" value={money(data.totalPurchase)} hint={`${data.transactionCount} transaksi`} tone="blue" />
        <StatCard icon={ShieldCheck} label="Garansi Aktif" value={`${data.warrantyActive} Aki`} hint="Berdasarkan klaim dan masa garansi" tone="green" />
        <StatCard icon={Wrench} label="Pemasangan" value={`${data.installationCount} Kali`} hint="Riwayat pemasangan aki" tone="orange" />
        <StatCard icon={BatteryCharging} label="Aki Tukar Tambah" value={`${data.tradeInCount} Unit`} hint="Aki bekas yang diserahkan" tone="purple" />
      </section>

      <section className="dashboard-columns customer-columns">
        <article className="panel table-panel">
          <div className="panel-title"><div><h2>Riwayat Pembelian Terakhir</h2><p>Produk, serial number, dan status pembayaran</p></div></div>
          <div className="purchase-list">{data.invoices.length ? data.invoices.map((item) => (
            <div className="purchase-row" key={item.id}><img src="/battery.svg" alt="Aki" /><div className="purchase-main"><strong>{item.productName}</strong><span>Serial Number: {item.serialNumber || '-'}</span><small>{item.invoice_number} · {new Date(item.invoice_date).toLocaleDateString('id-ID')}</small></div><div className="purchase-total"><strong>{money(item.total)}</strong><span className={`badge ${item.payment_status === 'PAID' ? 'paid' : 'pending'}`}>{item.payment_status}</span></div></div>
          )) : <div className="empty-state">Belum ada pembelian yang terhubung ke akun ini.</div>}</div>
        </article>

        <aside className="side-stack">
          <article className="panel"><div className="panel-title"><div><h2>Kendaraan Saya</h2><p>Kendaraan yang tersimpan</p></div></div><div className="vehicle-list">{data.vehicles.length ? data.vehicles.map(v => <div className="vehicle-row" key={v.id}><div className="stat-icon blue"><Wrench size={20}/></div><div><strong>{v.brand} {v.model}</strong><span>{v.plate_number || 'Nomor polisi belum diisi'}</span></div></div>) : <div className="empty-state">Belum ada kendaraan.</div>}</div></article>
          <article className="panel help-card"><ShieldCheck size={30}/><div><h2>Butuh bantuan?</h2><p>Ajukan klaim garansi atau hubungi cabang tempat pembelian.</p></div></article>
        </aside>
      </section>
    </div>
  )
}
