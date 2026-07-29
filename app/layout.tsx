import type { Metadata } from 'next'
import { Inter, Noto_Naskh_Arabic, Noto_Sans_Arabic } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-arabic',
})

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-arabic-sans',
})

export const metadata: Metadata = {
  title: 'WriteArabic — Learn to Write Arabic by Topic',
  description:
    'Learn to write Arabic through guided tracing. 8 topics, 70+ words, every word with full tashkeel vowel marks. Free to try.',
  keywords: ['write arabic', 'arabic writing', 'learn arabic', 'arabic tracing', 'tashkeel', 'arabic vowels', 'arabic letters'],
  metadataBase: new URL('https://write-arabic.co'),
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'WriteArabic — Learn to Write Arabic',
    description: '8 topics. 70+ words. Every word fully vowelled. Trace Arabic on any device.',
    type: 'website',
    url: 'https://write-arabic.co',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${notoNaskhArabic.variable} ${notoSansArabic.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
