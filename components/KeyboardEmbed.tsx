'use client'
import Link from 'next/link'
import ArabicKeyboard from '@/components/ArabicKeyboard'

export default function KeyboardEmbed() {
  return (
    <div>
      <ArabicKeyboard compact />
      <div className="mt-3 text-center">
        <Link href="/keyboard" className="text-xs text-green-600 font-medium hover:underline">
          Open full keyboard page →
        </Link>
      </div>
    </div>
  )
}
