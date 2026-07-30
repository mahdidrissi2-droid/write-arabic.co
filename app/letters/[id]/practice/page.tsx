'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ARABIC_LETTERS } from '@/data/letters'
import TracingCanvas from '@/components/TracingCanvas'
import { useArabicAudio } from '@/hooks/useArabicAudio'

export default function LetterPracticePage({ params }: { params: { id: string } }) {
  const letter = ARABIC_LETTERS.find((l) => l.id === params.id)
  const [currentPosition, setCurrentPosition] = useState<'initial' | 'medial' | 'terminal'>('initial')
  const [checkMessage, setCheckMessage] = useState(false)
  const [checkPercentage, setCheckPercentage] = useState(0)
  const { speak } = useArabicAudio()

  const handleCheck = (pct: number) => {
    setCheckPercentage(pct)
    setCheckMessage(true)
    setTimeout(() => setCheckMessage(false), 3000)
  }

  if (!letter || !letter.forms) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Letter not found</h1>
          <Link href="/letters" className="text-green-600 hover:underline">Back to letters</Link>
        </div>
      </div>
    )
  }

  const positions = [
    { key: 'initial' as const, label: 'Initial', description: 'At the beginning of a word', form: letter.forms.initial },
    { key: 'medial' as const, label: 'Medial', description: 'In the middle of a word', form: letter.forms.medial },
    { key: 'terminal' as const, label: 'Terminal', description: 'At the end of a word', form: letter.forms.terminal },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href={`/letters/${letter.id}`} className="inline-block mb-4 text-green-600 hover:text-green-700 font-medium text-sm">
            ← Back to {letter.name}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Practice Writing {letter.name}</h1>
              <p className="text-gray-600 mt-2">Write the letter in different positions</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => speak(letter.letter, 1)}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
                title="Play at normal speed"
              >
                🔊 Normal
              </button>
              <button
                onClick={() => speak(letter.letter, 0.5)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                title="Play at slow speed"
              >
                🐢 Slow
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Position Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {positions.map((pos) => (
            <button
              key={pos.key}
              onClick={() => setCurrentPosition(pos.key)}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                currentPosition === pos.key
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>

        {/* Practice Section */}
        {positions.map((pos) => (
          currentPosition === pos.key && (
            <div key={pos.key} className="space-y-8">
              {/* Position Info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{pos.label} Position</h2>
                    <p className="text-gray-600 mb-6">{pos.description}</p>
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 text-center">
                      <div className="text-8xl font-bold text-green-600 mb-4">{pos.form}</div>
                      <p className="text-sm text-gray-600">This is how <strong>{letter.name}</strong> looks in the <strong>{pos.label}</strong> position</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Example Words</h3>
                    <div className="space-y-4">
                      {pos.key === 'initial' && (
                        <>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 font-semibold mb-2">Example</p>
                            <p className="arabic text-3xl text-gray-900 text-right">{letter.exampleWord}</p>
                            <p className="text-sm text-gray-600 mt-2">{letter.exampleMeaning}</p>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p className="font-semibold mb-2">Tips:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Start at the top right</li>
                              <li>Follow the natural flow of the letter</li>
                              <li>Connect smoothly to the next letter</li>
                            </ul>
                          </div>
                        </>
                      )}
                      {pos.key !== 'initial' && (
                        <div className="text-sm text-gray-600">
                          <p className="font-semibold mb-3">Practice Tips:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {pos.key === 'medial' && (
                              <>
                                <li>Connect from the left side</li>
                                <li>Maintain the middle shape</li>
                                <li>Connect to the right side smoothly</li>
                              </>
                            )}
                            {pos.key === 'terminal' && (
                              <>
                                <li>Connect from the left side</li>
                                <li>Complete the final shape</li>
                                <li>End with a flourish if needed</li>
                              </>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Practice Canvas */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Practice Area</h3>
                <p className="text-gray-600 mb-6">Trace or write the letter below. Try to match the example above.</p>
                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden border-2 border-blue-200">
                  <TracingCanvas arabic={pos.form || letter.letter} onCheck={handleCheck} />
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">Use your mouse or touch to write on the canvas</p>

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
              </div>

              {/* Example Variations */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">All Positions at a Glance</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {positions.map((p) => (
                    <div key={p.key} className={`p-6 rounded-lg text-center transition-all ${
                      currentPosition === p.key
                        ? 'bg-green-100 border-2 border-green-600'
                        : 'bg-gray-50 border-2 border-gray-200'
                    }`}>
                      <p className="text-xs text-gray-600 font-semibold mb-2 uppercase">{p.label}</p>
                      <div className="text-6xl font-bold text-gray-900 mb-2">{p.form}</div>
                      <p className="text-xs text-gray-600">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ))}

        {/* Navigation */}
        <div className="flex gap-4 justify-center mt-12">
          <Link href={`/letters/${letter.id}`} className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
            ← Back to Letter
          </Link>
          <Link href="/letters" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
            All Letters →
          </Link>
        </div>
      </main>
    </div>
  )
}
