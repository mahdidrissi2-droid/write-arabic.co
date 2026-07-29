import Link from 'next/link'
import { ARABIC_LETTERS } from '@/data/letters'

export default function LetterPage({ params }: { params: { id: string } }) {
  const letter = ARABIC_LETTERS.find((l) => l.id === params.id)

  if (!letter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Letter not found</h1>
          <Link href="/letters" className="text-green-600 hover:underline">Back to letters</Link>
        </div>
      </div>
    )
  }

  const relatedLetters = ARABIC_LETTERS.filter((l) => l.id !== letter.id).slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <Link href="/letters" className="inline-block mb-2 text-green-600 hover:text-green-700 font-medium text-sm">
              ← Letters
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {letter.name} - {letter.letter}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                  <div className="text-8xl font-bold text-green-600 mb-4">{letter.letter}</div>
                  <p className="text-2xl font-bold text-gray-900">{letter.name}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-2">PRONUNCIATION</p>
                    <p className="text-lg font-semibold text-gray-900">{letter.pronunciation}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-2">EXAMPLE WORD</p>
                    <div className="flex items-center gap-4">
                      <span className="arabic text-3xl text-gray-900">{letter.exampleWord}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{letter.exampleMeaning}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Reference</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2">LETTER</p>
                  <p className="text-4xl font-bold text-green-600">{letter.letter}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2">NAME</p>
                  <p className="text-sm font-semibold text-gray-900">{letter.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2">SOUND</p>
                  <p className="text-sm text-gray-700">{letter.pronunciation}</p>
                </div>
              </div>
            </div>

            {relatedLetters.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Other Letters</h3>
                <div className="space-y-2">
                  {relatedLetters.map((l) => (
                    <Link
                      key={l.id}
                      href={`/letters/${l.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <span className="arabic text-2xl text-gray-900">{l.letter}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{l.name}</p>
                        <p className="text-xs text-gray-500">{l.pronunciation}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-12">
          <Link href="/letters" className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
            ← Back to Letters
          </Link>
          <Link href="/write" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
            Go to Words Practice →
          </Link>
        </div>
      </main>
    </div>
  )
}
