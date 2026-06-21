'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { TOPICS } from '@/data/words'
import { chunkWords, quizKey, loadProgress, type AppProgress } from '@/lib/progress'
import { speakArabic } from '@/lib/audio'

export default function TopicPage() {
  const params  = useParams()
  const topicId = params.topicId as string
  const topic   = TOPICS.find((t) => t.id === topicId)

  const [progress, setProgress] = useState<AppProgress | null>(null)
  useEffect(() => { setProgress(loadProgress()) }, [])

  if (!topic) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Topic not found. <Link href="/write" className="text-green-600 underline">Back</Link></p>
    </div>
  )

  const chapters = chunkWords(topic?.words ?? [])

  // How many words in a chapter have been completed (score ≥ 45)
  function chapterCompleted(words: { id: string }[]): number {
    if (!progress) return 0
    return words.filter((w) => (progress.words[w.id]?.bestScore ?? 0) >= 45).length
  }

  function quizPassed(topicId: string, chIdx: number): boolean {
    if (!progress) return false
    const q = progress.quizzes[quizKey(topicId, chIdx)]
    if (!q) return false
    return q.bestScore >= Math.ceil(q.total * 0.6)
  }

  const challengeBest = progress?.challenges[topicId]?.bestScore ?? 0

  return (
    <div className="min-h-screen bg-white">
      {/* App top bar */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-base">
            Write<span className="font-bold">Arabic</span>
          </Link>
          <nav className="flex gap-1">
            <Link href="/write" className="text-sm px-4 py-1.5 rounded-lg bg-gray-100 font-medium">Write</Link>
            <Link href="/dashboard" className="text-sm px-4 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors font-medium">Dashboard</Link>
          </nav>
          <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Sign in</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/write" className="hover:text-gray-600 transition-colors">Topics</Link>
          <span>›</span>
          <span className="text-gray-600">{topic.title}</span>
        </nav>

        {/* Topic header */}
        <div className={`rounded-2xl p-6 mb-8 ${topic.color} border border-gray-100`}>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{topic.emoji}</span>
            <div className="flex-1">
              <div className="flex items-baseline gap-3 mb-1">
                <h1 className="text-xl font-bold">{topic.title}</h1>
                <span className="arabic text-2xl text-gray-600">{topic.titleAr}</span>
              </div>
              <p className="text-sm text-gray-500">{topic.description}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-2xl font-bold">{topic.words.length}</p>
              <p className="text-xs text-gray-400">words</p>
            </div>
          </div>
        </div>

        {/* Challenge banner */}
        <div className="flex items-center justify-between border border-yellow-200 bg-yellow-50 rounded-2xl px-5 py-4 mb-8">
          <div>
            <p className="font-semibold text-sm text-yellow-900">⚡ Speed Challenge</p>
            <p className="text-xs text-yellow-700 mt-0.5">How many words can you read in 60 seconds?{challengeBest > 0 ? ` Best: ${challengeBest}` : ''}</p>
          </div>
          <Link
            href={`/challenge/${topic.id}`}
            className="bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-600 transition-colors"
          >
            Start →
          </Link>
        </div>

        {/* Chapters */}
        <div className="space-y-8">
          {chapters.map((chWords, chIdx) => {
            const done        = chapterCompleted(chWords)
            const quizUnlocked = done >= 3
            const passed      = quizPassed(topic.id, chIdx)

            return (
              <section key={chIdx}>
                {/* Chapter header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Chapter {chIdx + 1}
                    </span>
                    {/* mini progress dots */}
                    <div className="flex gap-1 ml-1">
                      {chWords.map((w) => {
                        const s = progress?.words[w.id]?.bestScore ?? 0
                        return (
                          <span
                            key={w.id}
                            className={`w-2 h-2 rounded-full ${s >= 90 ? 'bg-green-500' : s >= 45 ? 'bg-green-300' : 'bg-gray-200'}`}
                          />
                        )
                      })}
                    </div>
                    <span className="text-xs text-gray-400">{done}/{chWords.length} done</span>
                  </div>

                  {/* Quiz button */}
                  {quizUnlocked ? (
                    <Link
                      href={`/quiz/${topic.id}/${chIdx}`}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        passed
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {passed ? '✓ Quiz passed' : 'Take quiz'}
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-300 px-3 py-1.5">
                      Quiz unlocks at 3 words
                    </span>
                  )}
                </div>

                {/* Word grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {chWords.map((word, i) => {
                    const wordScore = progress?.words[word.id]?.bestScore ?? 0
                    const completed = wordScore >= 45
                    const perfect   = wordScore >= 90

                    return (
                      <div key={word.id} className="group flex items-center gap-3 border border-gray-100 rounded-2xl px-4 py-4 hover:border-green-200 hover:shadow-sm transition-all bg-white">
                        <span className="text-xs text-gray-300 font-medium w-4 shrink-0">
                          {String(chIdx * 5 + i + 1).padStart(2, '0')}
                        </span>

                        {/* Audio button */}
                        <button
                          onClick={() => speakArabic(word.arabic)}
                          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-green-50 text-gray-300 hover:text-green-500 transition-colors text-base"
                          title="Hear pronunciation"
                        >
                          🔊
                        </button>

                        <Link href={`/write/challenge/${word.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="arabic text-2xl sm:text-3xl font-bold text-gray-800 group-hover:text-green-700 transition-colors leading-none shrink-0">
                            {word.arabic}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{word.romanized}</p>
                            <p className="text-xs text-gray-500 truncate">{word.meaning}</p>
                          </div>
                        </Link>

                        {/* Status */}
                        <div className="shrink-0 flex flex-col items-end gap-0.5">
                          <span className={`w-2 h-2 rounded-full ${
                            perfect ? 'bg-green-500' : completed ? 'bg-green-300' : (
                              word.difficulty === 'beginner' ? 'bg-gray-200' :
                              word.difficulty === 'intermediate' ? 'bg-yellow-200' : 'bg-red-200'
                            )
                          }`} />
                          {wordScore > 0 && <span className="text-[10px] text-gray-400">{wordScore}%</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}
