'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TOPICS } from '@/data/words'
import { recordChallenge, loadProgress } from '@/lib/progress'

const CHALLENGE_SECONDS = 60

export default function ChallengePage({ params }: { params: { topicId: string } }) {
  const router = useRouter()
  const topic  = TOPICS.find((t) => t.id === params.topicId)

  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro')
  const [timeLeft, setTimeLeft]     = useState(CHALLENGE_SECONDS)
  const [wordIdx, setWordIdx]       = useState(0)
  const [skipped, setSkipped]       = useState(0)
  const [wordsTraced, setWordsTraced] = useState(0)
  const [xpGained, setXpGained]     = useState(0)

  // Shuffle words once on mount
  const [words] = useState(() => {
    if (!topic) return []
    return [...topic.words].sort(() => Math.random() - 0.5)
  })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          finish(wordsTraced)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [phase])

  const finish = useCallback((traced: number) => {
    setPhase('done')
    const before = loadProgress().totalXP
    recordChallenge(params.topicId, traced)
    const after = loadProgress().totalXP
    setXpGained(after - before)
  }, [params.topicId])

  const handleGot = useCallback(() => {
    const next = wordsTraced + 1
    setWordsTraced(next)
    if (wordIdx + 1 >= words.length) {
      clearInterval(timerRef.current!)
      finish(next)
    } else {
      setWordIdx((i) => i + 1)
    }
  }, [wordsTraced, wordIdx, words.length, finish])

  const handleSkip = useCallback(() => {
    setSkipped((s) => s + 1)
    if (wordIdx + 1 >= words.length) {
      clearInterval(timerRef.current!)
      finish(wordsTraced)
    } else {
      setWordIdx((i) => i + 1)
    }
  }, [wordIdx, words.length, wordsTraced, finish])

  if (!topic) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Topic not found. <Link href="/write" className="text-green-600 underline">Back</Link></p>
    </div>
  )

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    const best = loadProgress().challenges[topic.id]?.bestScore ?? 0
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-4">⚡</div>
          <h1 className="text-2xl font-bold mb-1">{topic.emoji} {topic.title}</h1>
          <p className="text-gray-500 text-sm mb-6">
            How many words can you read in 60 seconds?
            {best > 0 && <span className="block mt-1 text-green-600 font-medium">Your best: {best} words</span>}
          </p>
          <p className="text-xs text-gray-400 mb-8">
            Read the Arabic word aloud, then tap "Got it" or "Skip". No writing needed — this is a reading speed drill.
          </p>
          <button
            onClick={() => setPhase('playing')}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition-colors"
          >
            Start challenge
          </button>
          <Link href={`/write/topic/${topic.id}`} className="block mt-4 text-sm text-gray-400 hover:text-gray-700">
            ← Back to topic
          </Link>
        </div>
      </div>
    )
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const prev = loadProgress().challenges[topic.id]?.bestScore ?? 0
    const isNewBest = wordsTraced >= prev
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-4">{wordsTraced >= 10 ? '🔥' : wordsTraced >= 5 ? '⭐' : '💪'}</div>
          <h1 className="text-2xl font-bold mb-1">
            {wordsTraced} {wordsTraced === 1 ? 'word' : 'words'}
          </h1>
          <p className="text-gray-500 text-sm mb-1">in 60 seconds</p>
          {isNewBest && wordsTraced > 0 && (
            <p className="text-green-600 font-semibold text-sm">New personal best!</p>
          )}
          {xpGained > 0 && (
            <p className="text-green-600 font-semibold text-sm mb-4">+{xpGained} XP earned!</p>
          )}
          <p className="text-xs text-gray-400 mb-8">
            Skipped: {skipped} · Total seen: {wordIdx + 1}
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { setPhase('intro'); setTimeLeft(CHALLENGE_SECONDS); setWordIdx(0); setSkipped(0); setWordsTraced(0) }}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
            >
              ↺ Try again
            </button>
            <Link
              href={`/write/topic/${topic.id}`}
              className="border border-gray-200 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Back to topic
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Playing ────────────────────────────────────────────────────────────────
  const currentWord = words[wordIdx]
  const timerPct    = (timeLeft / CHALLENGE_SECONDS) * 100
  const timerColor  = timeLeft > 20 ? 'bg-green-500' : timeLeft > 10 ? 'bg-yellow-400' : 'bg-red-500'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Timer bar */}
      <div className="h-2 bg-gray-100">
        <div
          className={`h-2 transition-all duration-1000 ${timerColor}`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 h-12 flex items-center justify-between">
          <span className="text-2xl font-bold tabular-nums text-gray-900">{timeLeft}s</span>
          <span className="text-xs text-gray-400">{topic.emoji} {topic.title}</span>
          <span className="text-xs font-semibold text-green-600">{wordsTraced} ✓</span>
        </div>
      </header>

      {/* Word display */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 max-w-xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="arabic text-8xl font-bold text-gray-900 leading-none mb-4">{currentWord?.arabic}</div>
          <div className="text-lg text-gray-400">{currentWord?.romanized}</div>
        </div>

        <div className="w-full flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 border-2 border-gray-200 text-gray-500 py-4 rounded-2xl font-semibold text-base hover:border-gray-400 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleGot}
            className="flex-2 flex-grow-[2] bg-green-600 text-white py-4 rounded-2xl font-bold text-base hover:bg-green-700 transition-colors"
          >
            Got it ✓
          </button>
        </div>

        <p className="text-xs text-gray-300 mt-6">
          {wordIdx + 1} of {words.length} words shown
        </p>
      </main>
    </div>
  )
}
