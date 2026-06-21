'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          Write<span className="font-bold">Arabic</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/#challenge" className="hover:text-gray-900 transition-colors">Try</Link>
          <Link href="/keyboard" className="hover:text-gray-900 transition-colors">Keyboard</Link>
          <Link href="/league" className="hover:text-gray-900 transition-colors">League</Link>
          <Link href="/#features" className="hover:text-gray-900 transition-colors">Features</Link>
          <Link href="/#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Get full access
          </Link>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-0.5 bg-gray-700 mb-1" />
          <div className="w-5 h-0.5 bg-gray-700 mb-1" />
          <div className="w-5 h-0.5 bg-gray-700" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4 text-sm">
          <Link href="/#challenge" onClick={() => setOpen(false)}>Try</Link>
          <Link href="/league" onClick={() => setOpen(false)}>League</Link>
          <Link href="/#features" onClick={() => setOpen(false)}>Features</Link>
          <Link href="/#pricing" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/sign-in" onClick={() => setOpen(false)}>Sign in</Link>
          <Link href="/sign-up" className="bg-green-600 text-white px-4 py-2 rounded-lg text-center font-medium" onClick={() => setOpen(false)}>
            Get full access
          </Link>
        </div>
      )}
    </nav>
  )
}
