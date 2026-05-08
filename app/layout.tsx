import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SLICEDYNAMICS — Custom 3D Printing Platform',
  description: 'Design, prototype, and manufacture custom products using advanced 3D printing technology.',
  keywords: ['3D printing', 'custom manufacturing', 'prototype', 'SLS', 'FDM', 'resin printing'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
