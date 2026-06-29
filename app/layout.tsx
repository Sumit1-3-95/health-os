import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Health OS',
  description: 'Daily health tracker — Sumit',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-title" content="Health OS"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen pb-20">{children}</body>
    </html>
  )
}
