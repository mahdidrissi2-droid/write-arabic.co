'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TOPICS } from '@/data/words'

// First 3 topics always unlocked. Each subsequent topic unlocks after completing
// UNLOCK_THRESHOLD words from the previous topic.
const UNLOCK_THRESHOLD = 3

function getCompletedWords(): Set<string> {
  try {
    const raw = localStorage.getItem('arabivo_completed')
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

export default function WriteDashboard() {
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  useEffect(() => {
    setCompleted(getCompletedWords())
  }, [])

  function isUnlocked(index: number): boolean {
    if (index < 3) return true
    // count how many words from the previous topic are completed
    const prevTopic = TOPICS[index - 1]
    const done = prevTopic.words.filter((w) => completed.has(w.id)).length
    return done >= UNLOCK_THRESHOLD
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-base">
            Write<span className="font-bold">Arabic</span>
          </Link>
          <nav className="flex gap-1">
            <Link href="/write" className="text-sm px-4 py-1.5 rounded-lg bg-gray-100 font-medium">Write</Link>
            <Link href="/write/letters" className="text-sm px-4 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors font-medium">Letters</Link>
            <Link href="/dashboard" className="text-sm px-4 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors font-medium">Dashboard</Link>
          </nav>
          <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Sign in</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Choose a topic</h1>
          <p className="text-sm text-gray-500">
            Complete {UNLOCK_THRESHOLD} words in a topic to unlock the next one. {TOPICS.length} topics total.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map((topic, index) => {
            const unlocked = isUnlocked(index)
            const doneCount = topic.words.filter((w) => completed.has(w.id)).length
            const pct = Math.round((doneCount / topic.words.length) * 100)

            if (!unlocked) {
              // Locked card
              const prevTopic = TOPICS[index - 1]
              const prevDone = prevTopic.words.filter((w) => completed.has(w.id)).length
              return (
                <div
                  key={topic.id}
                  className="relative rounded-2xl p-6 border border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed select-none"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl grayscale">{topic.emoji}</span>
                    <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      🔒 Locked
                    </span>
                  </div>
                  <h2 className="font-semibold text-base mb-1 text-gray-400">{topic.title}</h2>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{topic.description}</p>
                  <p className="text-xs text-gray-400">
                    Complete {UNLOCK_THRESHOLD - prevDone} more word{UNLOCK_THRESHOLD - prevDone !== 1 ? 's' : ''} in <span className="font-medium">{prevTopic.title}</span> to unlock
                  </p>
                </div>
              )
            }

            return (
              <Link
                key={topic.id}
                href={`/write/topic/${topic.id}`}
                className={`group relative rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all ${topic.color}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{topic.emoji}</span>
                  <div className="flex items-center gap-2">
                    {doneCount > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {doneCount}/{topic.words.length}
                      </span>
                    )}
                    <span className="arabic text-xl text-gray-500 group-hover:text-gray-700 transition-colors">
                      {topic.titleAr}
                    </span>
                  </div>
                </div>

                <h2 className="font-semibold text-base mb-1">{topic.title}</h2>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{topic.description}</p>

                {/* Progress bar */}
                {doneCount > 0 && (
                  <div className="mb-3">
                    <div className="h-1 bg-white/60 rounded-full overflow-hidden">
                      <div className="h-1 bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{topic.words.length} words</span>
                  <div className="flex gap-1">
                    {Array.from(new Set(topic.words.map((w) => w.difficulty))).map((d) => (
                      <span
                        key={d}
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          d === 'beginner' ? 'bg-green-100 text-green-700'
                          : d === 'intermediate' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="absolute bottom-5 right-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all text-lg">→</div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
