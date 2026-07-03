import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Marcellus, Hanken_Grotesk, Spline_Sans_Mono } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const marcellus = Marcellus({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-marcellus',
  display: 'swap',
})

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-hanken-grotesk',
  display: 'swap',
})

const splineSansMono = Spline_Sans_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-spline-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Chosen Workflow',
  description: 'Learning and simulation platform for luxury hospitality standards.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${hankenGrotesk.variable} ${splineSansMono.variable}`}
    >
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-50 focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
