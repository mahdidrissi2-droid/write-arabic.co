'use client'
import Link from 'next/link'
import ArabicKeyboard from '@/components/ArabicKeyboard'

export default function KeyboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-base">Write<span className="font-bold">Arabic</span></Link>
          <nav className="flex gap-1">
            <Link href="/write" className="text-sm px-4 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 font-medium">Write</Link>
            <Link href="/keyboard" className="text-sm px-4 py-1.5 rounded-lg bg-gray-100 font-medium">Keyboard</Link>
            <Link href="/dashboard" className="text-sm px-4 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 font-medium">Dashboard</Link>
          </nav>
          <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-800">Sign in</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Arabic Keyboard</h1>
          <p className="text-sm text-gray-500">
            Click any key, or type Latin letters on your keyboard — they auto-convert to Arabic.
          </p>
        </div>
        <ArabicKeyboard />
      </main>
    </div>
  )
}
