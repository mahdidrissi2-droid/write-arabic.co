import Link from 'next/link'
import { ARABIC_LETTERS } from '@/data/letters'

export default function LettersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="inline-block mb-4 text-green-600 hover:text-green-700 font-medium text-sm">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Arabic Letters</h1>
          <p className="text-gray-600 mt-2">Learn all 28 Arabic letters with pronunciation and examples</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ARABIC_LETTERS.map((letter) => (
            <Link
              key={letter.id}
              href={`/letters/${letter.id}`}
              className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-green-200 transition-all"
            >
              <div className="text-6xl font-bold text-green-600 mb-3">{letter.letter}</div>
              <p className="font-semibold text-gray-900 mb-1">{letter.name}</p>
              <p className="text-sm text-gray-600 mb-3">{letter.pronunciation}</p>
              <div className="text-sm">
                <p className="text-gray-500 text-xs mb-1">Example:</p>
                <p className="arabic text-lg text-gray-900">{letter.exampleWord}</p>
                <p className="text-xs text-gray-600">{letter.exampleMeaning}</p>
              </div>
              <p className="text-xs font-semibold text-green-600 mt-4">Learn →</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
