'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const steps = [
  {
    id: 'q0',
    question: 'How much Arabic can you read right now?',
    hint: 'Be honest — there\'s a perfect starting point for everyone.',
    options: [
      { emoji: '🌱', label: "I can't read it yet" },
      { emoji: '🔤', label: 'I know some letters' },
      { emoji: '📖', label: 'I can read slowly' },
      { emoji: '🦉', label: 'I read pretty fluently' },
    ],
  },
  {
    id: 'q1',
    question: 'What\'s your main goal with Arabic writing?',
    hint: 'This helps us pick the right starting lessons.',
    options: [
      { emoji: '✍️', label: 'Learn the alphabet first' },
      { emoji: '📝', label: 'Write common words' },
      { emoji: '📖', label: 'Read and write the Quran' },
      { emoji: '💬', label: 'Communicate with family' },
    ],
  },
  {
    id: 'q2',
    question: 'How much time can you practise each day?',
    hint: 'Even 5 minutes a day builds real muscle memory.',
    options: [
      { emoji: '⚡', label: '5 minutes' },
      { emoji: '🕐', label: '10–15 minutes' },
      { emoji: '🏃', label: '20–30 minutes' },
      { emoji: '💪', label: 'As much as it takes' },
    ],
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const router = useRouter()

  const current = steps[step]
  const isLast = step === steps.length - 1

  const next = () => {
    if (selected === null) return
    if (isLast) {
      router.push('/write')
    } else {
      setStep(step + 1)
      setSelected(null)
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-2">
          <Link href="/" className="text-base font-semibold">
            Write<span className="font-bold">Arabic</span>
          </Link>
        </div>

        <div className="flex gap-1.5 mb-10 mt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? 'bg-green-600' : 'bg-gray-100'}`}
            />
          ))}
        </div>

        <h1 className="text-2xl font-bold mb-2">{current.question}</h1>
        <p className="text-sm text-gray-500 mb-8">{current.hint}</p>

        <div className="space-y-3 mb-8">
          {current.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${
                selected === i
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={next}
          disabled={selected === null}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLast ? 'Start learning →' : 'Continue'}
        </button>
      </div>
    </main>
  )
}
