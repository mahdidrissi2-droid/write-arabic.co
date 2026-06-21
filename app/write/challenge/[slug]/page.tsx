'use client'
import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
const TracingCanvas = dynamic(() => import('@/components/TracingCanvas'), {
  ssr: false,
  loading: () => <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse" />,
})
import { WORDS, TOPICS } from '@/data/words'
import { recordWord } from '@/lib/progress'
import { speakArabic } from '@/lib/audio'

export default function ChallengePage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const word = WORDS.find((w) => w.id === slug)
  const topic = TOPICS.find((t) => t.words.some((w) => w.id === slug))
  const [complete, setComplete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [refOpen, setRefOpen] = useState(false)
  const [result, setResult] = useState<{ pct: number; msg: string } | null>(null)

  if (!word) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-500 text-sm">
          Word not found.{' '}
          <Link href="/write" className="text-green-600 underline">Back to topics</Link>
        </p>
      </div>
    )
  }

  const topicWords = topic ? topic.words : WORDS
  const currentIndex = topicWords.findIndex((w) => w.id === slug)
  const next = topicWords[currentIndex + 1] ?? null

  const handleComplete = () => {
    setComplete(true)
    setSaving(true)
    setTimeout(() => setSaving(false), 1200)
  }

  const handleCheck = (pct: number) => {
    const msg = pct >= 80 ? '🌟 Excellent! Great tracing!' : pct >= 45 ? '👍 Good effort! Keep practicing.' : '✏️ Keep tracing — follow the guide.'
    setResult({ pct, msg })
    recordWord(word.id, pct)
  }

  return (
    <>
      {/* ─── Desktop layout: h-screen, side-by-side ─────────────────── */}
      <div className="hidden lg:flex flex-col h-screen bg-white overflow-hidden">

        {/* Top bar */}
        <header className="shrink-0 border-b border-gray-100 bg-white z-10">
          <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
            <Link href="/" className="font-semibold text-sm">Write<span className="font-bold">Arabic</span></Link>
            <nav className="flex gap-1">
              <Link href="/write" className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 font-medium">Write</Link>
              <Link href="/dashboard" className="text-xs px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 font-medium">Dashboard</Link>
            </nav>
            <Link href="/sign-in" className="text-xs text-gray-400 hover:text-gray-700">Sign in</Link>
          </div>
        </header>

        {/* Main */}
        <div className="flex-1 overflow-hidden flex">

          {/* Canvas column */}
          <div className="flex-1 flex flex-col min-w-0 px-6 pt-3 pb-4">
            <nav className="shrink-0 flex items-center gap-1 text-xs text-gray-400 mb-2">
              <Link href="/write" className="hover:text-gray-600">Topics</Link>
              {topic && (<><span>›</span><Link href={`/write/topic/${topic.id}`} className="hover:text-gray-600">{topic.title}</Link></>)}
              <span>›</span>
              <span className="text-gray-600">{word.romanized}</span>
            </nav>

            <div className="shrink-0 flex items-center gap-3 mb-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Challenge · Trace</p>
                <h1 className="text-lg font-bold leading-tight">{word.romanized}</h1>
                <p className="text-xs text-gray-500">{word.meaning}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-400">{word.letterCount} letters</span>
                {complete && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Completed</span>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <TracingCanvas arabic={word.arabic} onComplete={handleComplete} onCheck={handleCheck} minHeight={0} />
            </div>
          </div>

          {/* Reference sidebar */}
          <aside className="shrink-0 w-64 xl:w-72 border-l border-gray-100 flex flex-col overflow-y-auto py-4 px-5 gap-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Reference</p>
                <button onClick={() => speakArabic(word.arabic)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors text-sm" title="Hear pronunciation">🔊</button>
              </div>
              <div className="arabic text-right text-5xl font-bold text-gray-800 leading-tight">{word.arabic}</div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5">Note</p>
              <p className="text-xs text-gray-600 leading-relaxed">{word.note}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2">Progress</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Best</span>
                  <span className="font-medium">{complete ? 'Completed' : '—'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${complete ? 'text-green-600' : 'text-gray-400'}`}>
                    {saving ? 'Saving…' : complete ? 'Completed' : 'In progress'}
                  </span>
                </div>
              </div>
            </div>
            {next && (
              <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2">Up next</p>
                <Link href={`/write/challenge/${next.id}`} className="flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-medium group-hover:text-green-600 transition-colors">{next.romanized}</p>
                    <p className="text-xs text-gray-500">{next.meaning}</p>
                  </div>
                  <span className="arabic text-2xl text-gray-400 group-hover:text-green-600 transition-colors">{next.arabic}</span>
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ─── Mobile layout: scrollable, stacked ──────────────────────── */}
      <div className="lg:hidden flex flex-col min-h-screen bg-white">

        {/* Top bar */}
        <header className="shrink-0 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="px-4 h-12 flex items-center justify-between">
            <Link href="/" className="font-semibold text-sm">Write<span className="font-bold">Arabic</span></Link>
            <nav className="flex gap-1">
              <Link href="/write" className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 font-medium">Write</Link>
              <Link href="/dashboard" className="text-xs px-2.5 py-1 rounded-lg text-gray-500 font-medium">Dashboard</Link>
            </nav>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="px-4 pt-3 flex items-center gap-1 text-xs text-gray-400">
          <Link href="/write" className="hover:text-gray-600">Topics</Link>
          {topic && (<><span>›</span><Link href={`/write/topic/${topic.id}`} className="hover:text-gray-600 truncate max-w-[60px]">{topic.title}</Link></>)}
          <span>›</span>
          <span className="text-gray-600 truncate">{word.romanized}</span>
        </div>

        {/* Word info */}
        <div className="px-4 pt-2 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold">{word.romanized}</h1>
            <p className="text-xs text-gray-500">{word.meaning}</p>
          </div>
          <div className="flex items-center gap-2">
            {complete && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Done</span>
            )}
            {/* Reference toggle */}
            <button
              onClick={() => setRefOpen(!refOpen)}
              className="text-xs border border-gray-200 px-2.5 py-1.5 rounded-lg text-gray-500 font-medium"
            >
              {refOpen ? 'Hide ref' : 'Reference'}
            </button>
          </div>
        </div>

        {/* Collapsible reference strip — mobile only */}
        {refOpen && (
          <div className="mx-4 mb-3 border border-gray-100 rounded-xl p-4 bg-gray-50 flex items-start gap-4">
            <div className="arabic text-4xl font-bold text-gray-800 leading-none shrink-0">{word.arabic}</div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-0.5">{word.romanized} — {word.meaning}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{word.note}</p>
            </div>
          </div>
        )}

        {/* Canvas — fixed height on mobile */}
        <div className="px-4 flex-1 flex flex-col">
          <TracingCanvas arabic={word.arabic} onComplete={handleComplete} onCheck={handleCheck} minHeight={320} />
        </div>

        {/* Next word strip */}
        {next && (
          <div className="mx-4 mt-4 mb-6 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Up next</p>
              <p className="text-sm font-medium">{next.romanized}</p>
              <p className="text-xs text-gray-500">{next.meaning}</p>
            </div>
            <Link
              href={`/write/challenge/${next.id}`}
              className="arabic text-3xl text-gray-400 hover:text-green-600 transition-colors"
            >
              {next.arabic}
            </Link>
          </div>
        )}
      </div>

      {/* ── Check result modal ── */}
      {result && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setResult(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <p className="text-4xl mb-3">{result.pct >= 80 ? '🌟' : result.pct >= 45 ? '👍' : '✏️'}</p>
            <p className="text-lg font-bold mb-1">{result.msg}</p>
            <p className="text-sm text-gray-400 mb-6">{result.pct}% of the shape covered</p>
            <div className="flex flex-col gap-2">
              {next && (
                <Link
                  href={`/write/challenge/${next.id}`}
                  className="bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
                  onClick={() => setResult(null)}
                >
                  Next word →
                </Link>
              )}
              <button onClick={() => setResult(null)} className="text-sm text-gray-500 hover:text-gray-800">
                ↺ Practice again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
