import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RustRocket',
  description: 'A blazing-fast task manager — Rust/Axum + Next.js CI/CD benchmark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}
