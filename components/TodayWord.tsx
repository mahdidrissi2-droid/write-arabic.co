'use client'

import { useState } from 'react'
import TracingCanvas from './TracingCanvas'

// Sample daily words - in production, rotate these daily
const DAILY_WORDS = [
  { word: 'مطر', name: 'matar', meaning: 'Rain', topic: 'Weather' },
  { word: 'قمر', name: 'qamar', meaning: 'Moon', topic: 'Sky' },
  { word: 'شمس', name: 'shams', meaning: 'Sun', topic: 'Sky' },
  { word: 'ماء', name: 'ma', meaning: 'Water', topic: 'Nature' },
  { word: 'طعام', name: 'taam', meaning: 'Food', topic: 'Food' },
]

export default function TodayWord() {
  const [checkMessage, setCheckMessage] = useState(false)
  const [checkPercentage, setCheckPercentage] = useState(0)

  // Get today's word based on day of year
  const dayOfYear = Math.floor((Date.now() / (1000 * 60 * 60 * 24)) % DAILY_WORDS.length)
  const todayWord = DAILY_WORDS[dayOfYear]

  const handleCheck = (pct: number) => {
    setCheckPercentage(pct)
    setCheckMessage(true)
    // Hide message after 3 seconds
    setTimeout(() => setCheckMessage(false), 3000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Today's Word</p>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-bold text-gray-900 arabic">{todayWord.word}</p>
          <div>
            <p className="text-lg font-semibold text-gray-900">{todayWord.name}</p>
            <p className="text-sm text-gray-600">{todayWord.meaning}</p>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden border-2 border-blue-200 mb-4">
          <TracingCanvas arabic={todayWord.word} onCheck={handleCheck} />
        </div>

        {/* Success Message */}
        {checkMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <div className="text-green-600">✓</div>
              <div>
                <p className="font-semibold text-green-900">Great job!</p>
                <p className="text-sm text-green-700">
                  {checkPercentage >= 80 ? "Perfect match! You nailed it." : checkPercentage >= 60 ? "Good effort! Keep practicing." : "Keep practicing and you'll get there!"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-4 text-center">
          <a
            href="/write"
            className="inline-block text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
          >
            Practice more words →
          </a>
        </div>
      </div>
    </div>
  )
}
