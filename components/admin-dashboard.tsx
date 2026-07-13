import Link from 'next/link'
import { Boxes, CircleDollarSign, CreditCard, PackageSearch, ShoppingCart, Store } from 'lucide-react'
import { StatCard } from './stat-card'

function money(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export type AdminDashboardData = {
  todayRevenue: number
  todayTransactions: number
  monthRevenue: number
  availableStock: number
  recentInvoices: Array<{ id: string; invoice_number: string; invoice_date: string; total: number; payment_status: string; customerName: string }>
  lowStocks: Array<{ id: string; name: string; sku: string; stock: number; minimum: number }>
}

export function AdminDashboard({ name, data }: { name: string; data: AdminDashboardData }) {
  return (
    <div className="page-content">
      <div className="page-heading"><div><h1>Selamat datang, {name} 👋</h1><p>Berikut ringkasan penjualan dan stok aki hari ini.</p></div><span className="date-chip">Data real-time dari Supabase</span></div>

      <section className="stats-grid four">
        <StatCard icon={CircleDollarSign} label="Penjualan Hari Ini" value={money(data.todayRevenue)} hint="Total invoice hari ini" tone="blue" />
        <StatCard icon={ShoppingCart} label="Transaksi Hari Ini" value={String(data.todayTransactions)} hint="Invoice yang tercatat" tone="green" />
        <StatCard icon={Boxes} label="Stok Aki Tersedia" value={String(data.availableStock)} hint="Serial berstatus tersedia" tone="orange" />
        <StatCard icon={CreditCard} label="Pendapatan Bulan Ini" value={money(data.monthRevenue)} hint="Akumulasi bulan berjalan" tone="purple" />
      </section>

      <section className="quick-actions panel">
        <div className="panel-title"><div><h2>Aksi Cepat</h2><p>Operasional utama cabang</p></div></div>
        <div className="action-grid">
          <Link href="/dashboard/pos" className="action primary-action"><ShoppingCart />Mulai Transaksi Baru</Link>
          <Link href="/dashboard/products" className="action"><Boxes />Kelola Produk</Link>
          <Link href="/dashboard/products" className="action"><PackageSearch />Cek Stok</Link>
          <Link href="/dashboard/orders" className="action"><Store />Pesanan Online</Link>
        </div>
      </section>

      <section className="dashboard-columns">
        <article className="panel table-panel">
          <div className="panel-title"><div><h2>Transaksi Terakhir</h2><p>Invoice terbaru yang dapat Anda akses</p></div><Link href="/dashboard/pos">Buat transaksi</Link></div>
          <div className="table-wrap">
            <table><thead><tr><th>Invoice</th><th>Tanggal</th><th>Pelanggan</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>{data.recentInvoices.length ? data.recentInvoices.map((item) => (
                <tr key={item.id}><td className="link-cell">{item.invoice_number}</td><td>{new Date(item.invoice_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td><td>{item.customerName}</td><td>{money(item.total)}</td><td><span className={`badge ${item.payment_status === 'PAID' ? 'paid' : 'pending'}`}>{item.payment_status}</span></td></tr>
              )) : <tr><td colSpan={5} className="empty-cell">Belum ada transaksi. Gunakan menu POS untuk membuat invoice pertama.</td></tr>}</tbody>
            </table>
          </div>
        </article>

        <article className="panel low-stock-panel">
          <div className="panel-title"><div><h2>Stok Menipis</h2><p>Produk di bawah batas minimum</p></div></div>
          <div className="stock-list">{data.lowStocks.length ? data.lowStocks.map((item) => (
            <div className="stock-row" key={item.id}><img src="/battery.svg" alt="Aki" /><div><strong>{item.name}</strong><span>{item.sku}</span></div><div className="stock-count"><strong>{item.stock}</strong><span>min. {item.minimum}</span></div></div>
          )) : <div className="empty-state">Semua stok berada di atas batas minimum.</div>}</div>
        </article>
      </section>
    </div>
  )
}
