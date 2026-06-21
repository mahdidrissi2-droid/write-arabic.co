'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TOPICS, WORDS, type Word } from '@/data/words'
import { chunkWords, quizKey, recordQuiz, loadProgress } from '@/lib/progress'

// ── Quiz question types ───────────────────────────────────────────────────────

type QuestionType = 'arabic-to-meaning' | 'meaning-to-arabic'

interface Question {
  type: QuestionType
  word: Word
  choices: Word[]   // 4 items, one is correct
  correctIdx: number
}

function buildQuestions(words: Word[], allWords: Word[]): Question[] {
  // Pick distractors from words outside the chapter
  const pool = allWords.filter((w) => !words.some((cw) => cw.id === w.id))

  return words.map((word, i) => {
    const type: QuestionType = i % 2 === 0 ? 'arabic-to-meaning' : 'meaning-to-arabic'

    // 3 random distractors
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 3)
    const choices  = [...shuffled, word].sort(() => Math.random() - 0.5)
    const correctIdx = choices.indexOf(word)

    return { type, word, choices, correctIdx }
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuizPage({ params }: { params: { topicId: string; chapter: string } }) {
  const router   = useRouter()
  const chIdx    = parseInt(params.chapter, 10)
  const topic    = TOPICS.find((t) => t.id === params.topicId)

  if (!topic) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Topic not found. <Link href="/write" className="text-green-600 underline">Back</Link></p>
    </div>
  )

  const chapters  = chunkWords(topic.words)
  const chapter   = chapters[chIdx]

  if (!chapter) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Chapter not found. <Link href={`/write/topic/${topic.id}`} className="text-green-600 underline">Back</Link></p>
    </div>
  )

  const [questions]   = useState<Question[]>(() => buildQuestions(chapter, WORDS))
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers]   = useState<boolean[]>([])
  const [done, setDone]         = useState(false)
  const [xpGained, setXpGained] = useState(0)

  const q = questions[current]

  const handleSelect = useCallback((idx: number) => {
    if (selected !== null) return
    setSelected(idx)
  }, [selected])

  const handleNext = useCallback(() => {
    if (selected === null) return
    const correct = selected === q.correctIdx
    const newAnswers = [...answers, correct]
    setAnswers(newAnswers)

    if (current + 1 >= questions.length) {
      const correctCount = newAnswers.filter(Boolean).length
      const key = quizKey(topic.id, chIdx)
      const before = loadProgress().totalXP
      recordQuiz(key, correctCount, questions.length)
      const after  = loadProgress().totalXP
      setXpGained(after - before)
      setDone(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }, [selected, q, answers, current, questions.length, topic.id, chIdx])

  const correctCount = answers.filter(Boolean).length
  const pct          = Math.round((correctCount / questions.length) * 100)

  const nextChapter  = chapters[chIdx + 1] ? chIdx + 1 : null
  const topicHref    = `/write/topic/${topic.id}`

  // ── Result screen ──────────────────────────────────────────────────────────
  if (done) {
    const passed = correctCount >= Math.ceil(questions.length * 0.6)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-4">
            {pct === 100 ? '🏆' : passed ? '✅' : '📖'}
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {pct === 100 ? 'Perfect!' : passed ? 'Well done!' : 'Keep studying!'}
          </h1>
          <p className="text-gray-500 text-sm mb-2">
            {correctCount} / {questions.length} correct — {pct}%
          </p>
          {xpGained > 0 && (
            <p className="text-green-600 font-semibold text-sm mb-4">+{xpGained} XP earned!</p>
          )}

          {/* Answer recap */}
          <div className="mb-6 text-left space-y-2">
            {questions.map((qq, i) => (
              <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-xl text-sm ${answers[i] ? 'bg-green-50' : 'bg-red-50'}`}>
                <span className="shrink-0">{answers[i] ? '✓' : '✗'}</span>
                <div>
                  <span className="arabic text-base mr-2">{qq.word.arabic}</span>
                  <span className="text-gray-600">{qq.word.meaning}</span>
                  {!answers[i] && (
                    <p className="text-xs text-red-500 mt-0.5">Correct: {qq.word.romanized} — {qq.word.meaning}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {nextChapter !== null && passed && (
              <Link
                href={`/quiz/${topic.id}/${nextChapter}`}
                className="bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
              >
                Next chapter quiz →
              </Link>
            )}
            <Link
              href={topicHref}
              className="border border-gray-200 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Back to topic
            </Link>
            {!passed && (
              <button
                onClick={() => { setCurrent(0); setSelected(null); setAnswers([]); setDone(false) }}
                className="text-sm text-gray-400 hover:text-gray-700"
              >
                ↺ Retry quiz
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Question screen ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="max-w-xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href={topicHref} className="text-sm text-gray-500 hover:text-gray-800">← {topic.title}</Link>
          <span className="text-xs text-gray-400 font-medium">
            Chapter {chIdx + 1} Quiz — {current + 1} / {questions.length}
          </span>
          <span className="text-xs font-semibold text-green-600">
            {answers.filter(Boolean).length} ✓
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-1 bg-green-500 transition-all duration-300"
          style={{ width: `${((current) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-xl mx-auto w-full">

        {/* Prompt */}
        <div className="w-full text-center mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            {q.type === 'arabic-to-meaning' ? 'What does this mean?' : 'Which Arabic word means…'}
          </p>
          {q.type === 'arabic-to-meaning' ? (
            <div className="arabic text-6xl font-bold text-gray-900 leading-none mb-2">{q.word.arabic}</div>
          ) : (
            <div className="text-2xl font-bold text-gray-900 mb-2">"{q.word.meaning}"</div>
          )}
          <p className="text-sm text-gray-400">{q.type === 'arabic-to-meaning' ? q.word.romanized : ''}</p>
        </div>

        {/* Choices */}
        <div className="w-full grid grid-cols-1 gap-3 mb-8">
          {q.choices.map((choice, idx) => {
            const isSelected = selected === idx
            const isCorrect  = idx === q.correctIdx
            let cls = 'w-full text-left px-5 py-4 rounded-2xl border-2 font-medium transition-all '
            if (selected === null) {
              cls += 'border-gray-200 hover:border-green-400 hover:bg-green-50'
            } else if (isCorrect) {
              cls += 'border-green-500 bg-green-50 text-green-800'
            } else if (isSelected) {
              cls += 'border-red-400 bg-red-50 text-red-800'
            } else {
              cls += 'border-gray-100 text-gray-400'
            }
            return (
              <button key={idx} onClick={() => handleSelect(idx)} className={cls}>
                {q.type === 'arabic-to-meaning' ? (
                  <span className="text-sm">{choice.meaning}</span>
                ) : (
                  <span className="arabic text-2xl">{choice.arabic}</span>
                )}
                {selected !== null && isCorrect && (
                  <span className="float-right text-green-600">✓</span>
                )}
                {selected !== null && isSelected && !isCorrect && (
                  <span className="float-right text-red-500">✗</span>
                )}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <button
            onClick={handleNext}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
          >
            {current + 1 < questions.length ? 'Next question →' : 'See results'}
          </button>
        )}
      </main>
    </div>
  )
}
