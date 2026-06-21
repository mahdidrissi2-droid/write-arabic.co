'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WORDS, TOPICS } from '@/data/words'
import { loadProgress, levelFromXP, chunkWords, quizKey, type AppProgress } from '@/lib/progress'

export default function Dashboard() {
  const [progress, setProgress] = useState<AppProgress | null>(null)
  useEffect(() => { setProgress(loadProgress()) }, [])

  const totalXP      = progress?.totalXP ?? 0
  const streak       = progress?.streak ?? 0
  const { level, label, nextXP } = levelFromXP(totalXP)

  const completedWords = progress
    ? WORDS.filter((w) => (progress.words[w.id]?.bestScore ?? 0) >= 45).length
    : 0

  const perfectWords = progress
    ? WORDS.filter((w) => (progress.words[w.id]?.bestScore ?? 0) >= 90).length
    : 0

  const bestScore = progress
    ? Math.max(0, ...Object.values(progress.words).map((w) => w.bestScore))
    : 0

  // Per-topic stats
  const topicStats = TOPICS.map((topic) => {
    const wordsDone = topic.words.filter(
      (w) => (progress?.words[w.id]?.bestScore ?? 0) >= 45
    ).length
    const chapters = chunkWords(topic.words)
    const quizzesPassed = chapters.filter((_, i) => {
      const q = progress?.quizzes[quizKey(topic.id, i)]
      return q && q.bestScore >= Math.ceil(q.total * 0.6)
    }).length
    return { topic, wordsDone, quizzesPassed, chapters: chapters.length }
  }).filter((s) => s.wordsDone > 0 || s.quizzesPassed > 0)

  const thresholds = [0, 100, 250, 500, 1000, 2000, 4000, 8000]
  const levelStart = thresholds[level] ?? 0
  const xpInLevel  = totalXP - levelStart
  const xpNeeded   = nextXP - levelStart
  const levelPct   = xpNeeded > 0 ? Math.round((xpInLevel / xpNeeded) * 100) : 100

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-base">
            Write<span className="font-bold">Arabic</span>
          </Link>
          <nav className="flex gap-1">
            <Link href="/write" className="text-sm px-4 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 font-medium">Write</Link>
            <Link href="/dashboard" className="text-sm px-4 py-1.5 rounded-lg bg-gray-100 font-medium">Dashboard</Link>
          </nav>
          <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Sign in</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">

        {/* Level + XP bar */}
        <div className="border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Level {level + 1}</p>
              <p className="text-xl font-bold">{label}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{totalXP} XP</p>
              <p className="text-xs text-gray-400">
                {level < 7 ? `${nextXP - totalXP} XP to next level` : 'Max level!'}
              </p>
            </div>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2.5 bg-green-500 rounded-full transition-all" style={{ width: `${levelPct}%` }} />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid sm:grid-cols-4 gap-4 mb-10">
          <div className="border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-1">Streak</p>
            <p className="text-3xl font-bold">{streak} {streak > 0 ? '🔥' : ''}</p>
            <p className="text-xs text-gray-400 mt-1">days in a row</p>
          </div>
          <div className="border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-1">Words done</p>
            <p className="text-3xl font-bold">{completedWords}</p>
            <p className="text-xs text-gray-400 mt-1">of {WORDS.length}</p>
          </div>
          <div className="border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-1">Perfect scores</p>
            <p className="text-3xl font-bold">{perfectWords} ⭐</p>
            <p className="text-xs text-gray-400 mt-1">≥ 90% tracing</p>
          </div>
          <div className="border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-1">Best score</p>
            <p className="text-3xl font-bold">{bestScore > 0 ? `${bestScore}%` : '—'}</p>
            <p className="text-xs text-gray-400 mt-1">{bestScore > 0 ? 'tracing accuracy' : 'start tracing'}</p>
          </div>
        </div>

        {/* Topic progress */}
        {topicStats.length > 0 && (
          <>
            <h2 className="font-bold text-lg mb-4">Topics in progress</h2>
            <div className="space-y-3 mb-10">
              {topicStats.map(({ topic, wordsDone, quizzesPassed, chapters }) => {
                const pct = Math.round((wordsDone / topic.words.length) * 100)
                return (
                  <Link
                    key={topic.id}
                    href={`/write/topic/${topic.id}`}
                    className="flex items-center gap-4 border border-gray-100 rounded-2xl px-5 py-4 hover:border-green-200 transition-all group"
                  >
                    <span className="text-2xl shrink-0">{topic.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className="text-sm font-semibold group-hover:text-green-700 transition-colors">{topic.title}</p>
                        <p className="text-xs text-gray-400">{wordsDone}/{topic.words.length} words</p>
                        {quizzesPassed > 0 && (
                          <p className="text-xs text-blue-600">{quizzesPassed}/{chapters} quizzes</p>
                        )}
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{pct}%</span>
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {/* All words */}
        <h2 className="font-bold text-lg mb-4">All words</h2>
        <div className="space-y-2">
          {WORDS.map((word) => {
            const wp   = progress?.words[word.id]
            const score = wp?.bestScore ?? 0
            return (
              <Link
                key={word.id}
                href={`/write/challenge/${word.id}`}
                className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-xl hover:border-green-200 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    score >= 90 ? 'bg-green-100 text-green-700' :
                    score >= 45 ? 'bg-green-50 text-green-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {score > 0 ? `${score}` : '—'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{word.romanized}</p>
                    <p className="text-xs text-gray-500">{word.meaning}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    word.difficulty === 'beginner' ? 'bg-green-50 text-green-700' :
                    word.difficulty === 'intermediate' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {word.difficulty}
                  </span>
                  <span className="arabic text-xl text-gray-600 group-hover:text-green-600 transition-colors">
                    {word.arabic}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
