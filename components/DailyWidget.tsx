'use client'
import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { DAILY_WORD } from '@/data/words'

const TracingCanvas = dynamic(() => import('./TracingCanvas'), {
  ssr: false,
  loading: () => <div className="h-[320px] rounded-2xl border border-gray-200 bg-gray-50 animate-pulse" />,
})

export default function DailyWidget() {
  const [done, setDone] = useState(false)

  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Today&apos;s word</p>
          <p className="text-2xl font-bold">{DAILY_WORD.romanized}</p>
          <p className="text-sm text-gray-500">{DAILY_WORD.meaning}</p>
        </div>
        <div className="arabic text-3xl sm:text-5xl font-bold text-gray-800 shrink-0">{DAILY_WORD.arabic}</div>
      </div>

      <TracingCanvas
        arabic={DAILY_WORD.arabic}
        minHeight={320}
        onComplete={() => setDone(true)}
      />

      {done && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500 mb-3">✦ Great stroke! You&apos;re a natural.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/sign-up" className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Sign up to save streaks
            </Link>
            <Link href="/onboarding" className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
              Start your first lesson →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
