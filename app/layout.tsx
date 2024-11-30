import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Image Converter - Diploma ICU',
  description: 'Convert images quickly and easily',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
