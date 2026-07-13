import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardCheck,
  FileBarChart,
  Gauge,
  PackageSearch,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserRoundCog,
  UsersRound,
  Wrench,
} from 'lucide-react'

export const adminNavigation = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Gauge },
  { href: '/admin/orders', label: 'Pesanan Online', icon: ShoppingCart },
  { href: '/admin/pos', label: 'POS / Penjualan', icon: ReceiptText },
  { href: '/admin/products', label: 'Produk', icon: Boxes },
  { href: '/admin/inventory', label: 'Inventory', icon: PackageSearch },
  { href: '/admin/customers', label: 'Pelanggan', icon: UsersRound },
  { href: '/admin/purchases', label: 'Pembelian', icon: Truck },
  { href: '/admin/installations', label: 'Pemasangan', icon: Wrench },
  { href: '/admin/warranties', label: 'Garansi & Klaim', icon: ShieldCheck },
  { href: '/admin/reports', label: 'Laporan', icon: FileBarChart },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
]

export const accountNavigation = [
  { href: '/account', label: 'Ringkasan Akun', icon: BarChart3 },
  { href: '/account/orders', label: 'Pesanan Saya', icon: ClipboardCheck },
  { href: '/account/warranties', label: 'Garansi Saya', icon: ShieldCheck },
  { href: '/account/installations', label: 'Pemasangan', icon: Wrench },
  { href: '/account/vehicles', label: 'Kendaraan Saya', icon: Building2 },
  { href: '/account/addresses', label: 'Alamat Saya', icon: UserRoundCog },
  { href: '/account/profile', label: 'Profil Saya', icon: UserRoundCog },
]
