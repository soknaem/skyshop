import type { Metadata, Viewport } from 'next'
import ThemeProvider from '@/components/ui/ThemeProvider'
import './globals.css'

const assetVersion =
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'skyshop-logo-v1'

export const metadata: Metadata = {
  title: 'SkyShop',
  description: 'Shop with SkyShop.',
  applicationName: 'SkyShop',
  icons: {
    icon: [
      {
        url: `/skyshop-icon.png?v=${assetVersion}`,
        type: 'image/png',
        sizes: '1024x1024',
      },
    ],
    apple: [
      {
        url: `/skyshop-icon.png?v=${assetVersion}`,
        type: 'image/png',
        sizes: '1024x1024',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: 'SkyShop',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}