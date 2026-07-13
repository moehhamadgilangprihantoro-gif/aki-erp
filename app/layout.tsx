import type { Metadata } from 'next'
import { CartProvider } from '@/components/cart-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'AKI Store & ERP',
  description: 'Ecommerce aki yang terhubung otomatis dengan ERP, stok, invoice, pemasangan, dan garansi.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body><CartProvider>{children}</CartProvider></body>
    </html>
  )
}
