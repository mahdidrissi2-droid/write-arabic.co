'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { speakArabic } from '@/lib/audio'
import { recordLetter, loadProgress, type AppProgress } from '@/lib/progress'

const TracingCanvas = dynamic(() => import('@/components/TracingCanvas'), {
  ssr: false,
  loading: () => <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse min-h-[280px]" />,
})

const LETTERS = [
  { letter: 'ا', name: 'Alif',  nameAr: 'أَلِف', romanized: 'ā',  dual: false },
  { letter: 'ب', name: 'Ba',    nameAr: 'بَاء',  romanized: 'b',   dual: true  },
  { letter: 'ت', name: 'Ta',    nameAr: 'تَاء',  romanized: 't',   dual: true  },
  { letter: 'ث', name: 'Tha',   nameAr: 'ثَاء',  romanized: 'th',  dual: true  },
  { letter: 'ج', name: 'Jim',   nameAr: 'جِيم',  romanized: 'j',   dual: true  },
  { letter: 'ح', name: 'Ha',    nameAr: 'حَاء',  romanized: 'ḥ',   dual: true  },
  { letter: 'خ', name: 'Kha',   nameAr: 'خَاء',  romanized: 'kh',  dual: true  },
  { letter: 'د', name: 'Dal',   nameAr: 'دَال',  romanized: 'd',   dual: false },
  { letter: 'ذ', name: 'Dhal',  nameAr: 'ذَال',  romanized: 'dh',  dual: false },
  { letter: 'ر', name: 'Ra',    nameAr: 'رَاء',  romanized: 'r',   dual: false },
  { letter: 'ز', name: 'Zay',   nameAr: 'زَاي',  romanized: 'z',   dual: false },
  { letter: 'س', name: 'Sin',   nameAr: 'سِين',  romanized: 's',   dual: true  },
  { letter: 'ش', name: 'Shin',  nameAr: 'شِين',  romanized: 'sh',  dual: true  },
  { letter: 'ص', name: 'Sad',   nameAr: 'صَاد',  romanized: 'ṣ',   dual: true  },
  { letter: 'ض', name: 'Dad',   nameAr: 'ضَاد',  romanized: 'ḍ',   dual: true  },
  { letter: 'ط', name: 'Ta',    nameAr: 'طَاء',  romanized: 'ṭ',   dual: true  },
  { letter: 'ظ', name: 'Dha',   nameAr: 'ظَاء',  romanized: 'ẓ',   dual: true  },
  { letter: 'ع', name: 'Ain',   nameAr: 'عَيْن', romanized: 'ʿ',   dual: true  },
  { letter: 'غ', name: 'Ghain', nameAr: 'غَيْن', romanized: 'gh',  dual: true  },
  { letter: 'ف', name: 'Fa',    nameAr: 'فَاء',  romanized: 'f',   dual: true  },
  { letter: 'ق', name: 'Qaf',   nameAr: 'قَاف',  romanized: 'q',   dual: true  },
  { letter: 'ك', name: 'Kaf',   nameAr: 'كَاف',  romanized: 'k',   dual: true  },
  { letter: 'ل', name: 'Lam',   nameAr: 'لَام',  romanized: 'l',   dual: true  },
  { letter: 'م', name: 'Mim',   nameAr: 'مِيم',  romanized: 'm',   dual: true  },
  { letter: 'ن', name: 'Nun',   nameAr: 'نُون',  romanized: 'n',   dual: true  },
  { letter: 'ه', name: 'Ha',    nameAr: 'هَاء',  romanized: 'h',   dual: true  },
  { letter: 'و', name: 'Waw',   nameAr: 'وَاو',  romanized: 'w',   dual: false },
  { letter: 'ي', name: 'Ya',    nameAr: 'يَاء',  romanized: 'y',   dual: true  },
]

const T = 'ـ'

function getForms(letter: string, dual: boolean) {
  return {
    isolated: letter,
    initial:  dual ? letter + T : null,
    medial:   dual ? T + letter + T : null,
    terminal: T + letter,
  }
}

type FormKey = 'isolated' | 'initial' | 'medial' | 'terminal'
const FORM_ORDER: FormKey[] = ['isolated', 'initial', 'medial', 'terminal']
const FORM_LABELS: Record<FormKey, string> = {
  isolated: 'Isolated', initial: 'Initial', medial: 'Medial', terminal: 'Terminal',
}
const FORM_COLORS: Record<FormKey, string> = {
  isolated: 'bg-blue-400', initial: 'bg-green-500', medial: 'bg-orange-400', terminal: 'bg-purple-400',
}

interface ModalState { letterIdx: number; formKey: FormKey }

export default function LettersPage() {
  const [modal, setModal]     = useState<ModalState | null>(null)
  const [result, setResult]   = useState<{ pct: number; xpEarned: number } | null>(null)
  const [progress, setProgress] = useState<AppProgress | null>(null)

  useEffect(() => { setProgress(loadProgress()) }, [])

  function getApplicableForms(letterIdx: number): FormKey[] {
    const { dual } = LETTERS[letterIdx]
    return FORM_ORDER.filter(f => dual || (f !== 'initial' && f !== 'medial'))
  }

  function nextStep(letterIdx: number, formKey: FormKey): ModalState | null {
    const forms = getApplicableForms(letterIdx)
    const fi = forms.indexOf(formKey)
    if (fi < forms.length - 1) return { letterIdx, formKey: forms[fi + 1] }
    if (letterIdx < LETTERS.length - 1) {
      const nextIdx = letterIdx + 1
      return { letterIdx: nextIdx, formKey: getApplicableForms(nextIdx)[0] }
    }
    return null
  }

  function handleCheck(pct: number) {
    if (!modal) return
    const { letter } = LETTERS[modal.letterIdx]
    const key = `${letter}-${modal.formKey}`
    const prevBest = progress?.letters?.[key]?.bestScore ?? 0
    const updated = recordLetter(key, pct)
    setProgress(updated)

    let xp = 0
    if (prevBest < 45 && pct >= 45) xp += 3
    if (pct >= 90) xp += 2
    setResult({ pct, xpEarned: xp })
    if (pct >= 45) speakArabic(LETTERS[modal.letterIdx].nameAr)
  }

  const currentLetter = modal ? LETTERS[modal.letterIdx] : null
  const currentForms  = modal ? getForms(currentLetter!.letter, currentLetter!.dual) : null
  const currentArabic = modal && currentForms ? currentForms[modal.formKey] : null
  const next          = modal ? nextStep(modal.letterIdx, modal.formKey) : null
  const isNextLetter  = next && next.letterIdx !== modal?.letterIdx

  const totalForms = LETTERS.reduce((acc, l) => acc + (l.dual ? 4 : 2), 0)
  const doneForms  = progress ? Object.keys(progress.letters ?? {}).filter(k => (progress.letters[k]?.bestScore ?? 0) >= 45).length : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-base">Write<span className="font-bold">Arabic</span></Link>
          <nav className="flex gap-1">
            <Link href="/write"         className="text-sm px-4 py-1.5 rounded-lg bg-gray-100 font-medium">Write</Link>
            <Link href="/write/letters" className="text-sm px-4 py-1.5 rounded-lg bg-green-600 text-white font-medium">Letters</Link>
            <Link href="/league"        className="text-sm px-4 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 font-medium">League</Link>
            <Link href="/dashboard"     className="text-sm px-4 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 font-medium">Dashboard</Link>
          </nav>
          <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-800">Sign in</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              ✏️ Letter practice
            </div>
            <h1 className="text-2xl font-bold mb-1">The 28 Arabic Letters</h1>
            <p className="text-sm text-gray-500 max-w-xl">
              Click any form to trace it — get a score, earn XP, and advance to the next shape automatically.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-3 text-center shrink-0">
            <p className="text-2xl font-bold text-green-600">{doneForms}<span className="text-base text-gray-400 font-normal">/{totalForms}</span></p>
            <p className="text-xs text-gray-400 mb-1.5">forms traced</p>
            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.round((doneForms / totalForms) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-6">
          {(Object.entries(FORM_LABELS) as [FormKey, string][]).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`w-2.5 h-2.5 rounded-full ${FORM_COLORS[key]}`} />
              {label}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-1">
            <span className="text-gray-300 font-bold">—</span> not applicable
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LETTERS.map(({ letter, name, nameAr, romanized, dual }, letterIdx) => {
            const forms = getForms(letter, dual)
            return (
              <div key={letter} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">{romanized} · <span className="arabic text-sm">{nameAr}</span></p>
                  </div>
                  <button onClick={() => speakArabic(nameAr)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
                    🔊
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3">
                  {(Object.entries(FORM_LABELS) as [FormKey, string][]).map(([formKey, formLabel]) => {
                    const formValue = forms[formKey]
                    const best = progress?.letters?.[`${letter}-${formKey}`]?.bestScore ?? 0
                    const done = best >= 45
                    const perfect = best >= 90

                    return (
                      <button key={formKey}
                        onClick={() => { if (formValue) { setResult(null); setModal({ letterIdx, formKey }) } }}
                        disabled={!formValue}
                        className={`group relative flex flex-col items-center justify-center rounded-xl border py-3 px-2 transition-all ${
                          formValue
                            ? done
                              ? 'border-green-200 bg-green-50 cursor-pointer hover:border-green-400'
                              : 'border-gray-100 hover:border-green-300 hover:bg-green-50 cursor-pointer'
                            : 'border-dashed border-gray-100 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${FORM_COLORS[formKey]} mb-1.5`} />
                        <span className={`arabic text-2xl font-bold leading-none mb-1 transition-colors ${done ? 'text-green-700' : 'text-gray-800 group-hover:text-green-700'}`}>
                          {formValue ?? '—'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">{formLabel}</span>
                        {best > 0 && (
                          <span className="absolute top-1 right-1 text-[9px] font-bold text-gray-400">
                            {perfect ? '⭐' : `${best}%`}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {dual && <p className="text-[10px] text-gray-300 text-center pb-2">tap a form to trace it</p>}
              </div>
            )
          })}
        </div>
      </main>

      {/* Modal */}
      {modal && currentArabic && currentLetter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => { setModal(null); setResult(null) }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-2 h-2 rounded-full ${FORM_COLORS[modal.formKey]}`} />
                  <h2 className="font-bold text-base">{currentLetter.name} — {FORM_LABELS[modal.formKey]}</h2>
                </div>
                <p className="text-xs text-gray-400">
                  Letter {modal.letterIdx + 1}/28 · <span className="arabic">{currentLetter.nameAr}</span>
                  {' · '}{getApplicableForms(modal.letterIdx).indexOf(modal.formKey) + 1}/{getApplicableForms(modal.letterIdx).length} forms
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => speakArabic(currentLetter.nameAr)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition-colors text-lg">
                  🔊
                </button>
                <button onClick={() => { setModal(null); setResult(null) }}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-xl transition-colors">
                  ✕
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="p-4 flex flex-col" style={{ height: 360 }}>
              <TracingCanvas arabic={currentArabic} onComplete={() => {}} onCheck={handleCheck} minHeight={300} />
            </div>

            {/* Result bar */}
            {result && (
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    {/* Score ring */}
                    <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 shrink-0 ${
                      result.pct >= 90 ? 'border-green-400 bg-green-50'
                      : result.pct >= 45 ? 'border-yellow-400 bg-yellow-50'
                      : 'border-red-300 bg-red-50'
                    }`}>
                      <span className={`text-base font-black leading-none ${
                        result.pct >= 90 ? 'text-green-600' : result.pct >= 45 ? 'text-yellow-600' : 'text-red-500'
                      }`}>{result.pct}%</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        {result.pct >= 90 ? '🌟 Perfect!' : result.pct >= 45 ? '👍 Good job!' : '✏️ Keep going'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {result.pct >= 90 ? 'Shape fully covered — excellent control.'
                          : result.pct >= 45 ? 'Passed! Retrace to improve your score.'
                          : 'Follow the guide more closely and try again.'}
                      </p>
                      {result.xpEarned > 0 && (
                        <p className="text-xs font-semibold text-green-600 mt-1">+{result.xpEarned} XP earned!</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setResult(null)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white transition-colors">
                      ↺ Retrace
                    </button>
                    {next ? (
                      <button onClick={() => { setResult(null); setModal(next) }}
                        className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
                        {isNextLetter ? 'Next letter →' : 'Next form →'}
                      </button>
                    ) : (
                      <button onClick={() => { setModal(null); setResult(null) }}
                        className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
                        🎉 All done!
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
