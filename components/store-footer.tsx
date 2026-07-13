import Link from 'next/link'
import { BatteryCharging, ShieldCheck, Truck, Wrench } from 'lucide-react'

export function StoreFooter({ isStaff = false }: { isStaff?: boolean }) {
  return (
    <footer className="store-footer">
      <div className="market-width store-footer-grid">
        <div><div className="footer-brand"><BatteryCharging/><div><strong>AKI Store</strong><small>Solusi Daya Terpercaya</small></div></div><p>Belanja aki original, pilih layanan pemasangan, dan pantau garansi dalam satu tempat.</p></div>
        <div><h3>Layanan Pelanggan</h3><Link href="/account/orders">Pesanan Saya</Link><Link href="/account/warranties">Garansi Saya</Link><Link href="/account/installations">Jadwal Pemasangan</Link></div>
        <div><h3>Layanan Kami</h3><span><Truck size={15}/> Pengiriman cabang</span><span><Wrench size={15}/> Antar dan pasang</span><span><ShieldCheck size={15}/> Garansi resmi</span></div>
        <div><h3>Tautan</h3><Link href="/catalog">Katalog Produk</Link><Link href="/login">Masuk / Daftar</Link>{isStaff && <Link href="/admin/dashboard">ERP Admin</Link>}</div>
      </div>
      <div className="footer-bottom">© 2026 AKI Store. Produk dan harga dikelola langsung dari ERP.</div>
    </footer>
  )
}
