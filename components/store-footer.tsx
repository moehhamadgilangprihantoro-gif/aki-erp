import Link from 'next/link'
import { BatteryCharging, ShieldCheck, Truck, Wrench } from 'lucide-react'

export function StoreFooter() {
  return (
    <footer className="store-footer">
      <div className="store-footer-grid">
        <div><div className="store-logo footer-logo"><span className="store-logo-mark"><BatteryCharging size={24}/></span><span><strong>AKI Store</strong><small>ERP & Ecommerce</small></span></div><p>Penjualan aki, pemasangan, garansi, dan stok cabang dalam satu sistem.</p></div>
        <div><h3>Layanan</h3><span><Truck size={16}/> Pengiriman cabang</span><span><Wrench size={16}/> Antar dan pasang</span><span><ShieldCheck size={16}/> Garansi tercatat otomatis</span></div>
        <div><h3>Akses</h3><Link href="/catalog">Katalog</Link><Link href="/login">Login pelanggan</Link><Link href="/dashboard">ERP Admin</Link></div>
      </div>
    </footer>
  )
}
