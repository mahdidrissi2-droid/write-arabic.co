import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import { TOPICS } from '@/data/words'
import TracingCanvas from '@/components/TracingCanvas'

const KeyboardEmbed = dynamic(() => import('@/components/KeyboardEmbed'), { ssr: false })

const DailyWidget = dynamic(() => import('@/components/DailyWidget'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm animate-pulse">
      <div className="h-6 bg-gray-100 rounded w-24 mb-4" />
      <div className="h-48 bg-gray-50 rounded-2xl mb-4" />
      <div className="h-2 bg-gray-100 rounded w-full mb-3" />
      <div className="h-8 bg-gray-100 rounded w-32 ml-auto" />
    </div>
  ),
})

const testimonials = [
  {
    body: 'I tried three other apps. None of them showed me the vowels. This one does — and it changed everything.',
    name: 'Sara M.',
    detail: 'Learning Arabic for Quran reading',
  },
  {
    body: 'The topic system is brilliant. I started with Food and could read a menu in Morocco two weeks later.',
    name: 'James K.',
    detail: 'Travelled to Marrakech',
  },
  {
    body: 'Finally an app that treats tashkeel as essential, not optional. My pronunciation improved instantly.',
    name: 'Aisha R.',
    detail: 'Heritage learner, reconnecting with Arabic',
  },
]

const stats = [
  { value: '1000+', label: 'words with full vowel marks' },
  { value: '100+', label: 'topic categories' },
  { value: '100%', label: 'tashkeel on every word' },
  { value: 'Free', label: 'to try — no card needed' },
]

export default function Home() {
  const previewTopics = TOPICS.slice(0, 4)

  return (
    <>
      <Navbar />
      <main className="pt-14">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden pattern-arabesque">
          <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 grid lg:grid-cols-2 gap-8 items-center">
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <span className="arabic text-sm">مَع التَّشْكِيل</span>
                <span>Every word fully vowelled</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
                Write Arabic<br />
                <span className="text-green-600">by topic.</span>
              </h1>

              {/* Sub-headline — the key differentiator */}
              <p className="text-lg text-gray-500 mb-4 leading-relaxed">
                Choose a topic — Food, Travel, Greetings — then trace each word with{' '}
                <strong className="text-gray-700 font-semibold">full vowel marks</strong> so you
                learn to read <em>and</em> write at the same time.
              </p>
              <p className="text-sm text-gray-400 mb-10">
                100+ topics · 1000+ words · tashkeel on every single one.
              </p>

              {/* Single primary CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/write"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-green-700 transition-colors shadow-sm"
                >
                  Choose your first topic →
                </Link>
                <Link
                  href="/daily"
                  className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-6 py-3.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Try today&apos;s free word
                </Link>
              </div>
            </div>

            {/* Tracing Canvas */}
            <div className="hidden lg:block">
              <TracingCanvas />
            </div>
            </div>
        </section>

        {/* ── STAT BAR ─────────────────────────────────────── */}
        <section className="border-y border-gray-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-green-600">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TOPIC PREVIEW ────────────────────────────────── */}
        <section className="py-16 max-w-5xl mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Pick a topic, start tracing</h2>
              <p className="text-sm text-gray-500">
                Not a random word list — a real curriculum, organised by what you actually need.
              </p>
            </div>
            <Link href="/write" className="text-sm text-green-600 font-medium hover:underline whitespace-nowrap">
              All topics →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {previewTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/write/topic/${topic.id}`}
                className={`group rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all ${topic.color}`}
              >
                <span className="text-2xl block mb-2">{topic.emoji}</span>
                <h3 className="font-semibold text-sm mb-0.5">{topic.title}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{topic.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{topic.words.length} words</span>
                  <span className="arabic text-base text-gray-400 group-hover:text-green-600 transition-colors">
                    {topic.titleAr}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── TASHKEEL EXPLAINER ───────────────────────────── */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                  Why we&apos;re different
                </div>
                <h2 className="text-2xl font-bold mb-4">
                  Other apps hide the vowels.<br />We don&apos;t.
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  Most Arabic learning tools show words <strong className="text-gray-700">without tashkeel</strong> — the small marks above and below letters that tell you how to pronounce them. That&apos;s like learning English without vowels.
                </p>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Every word here comes <strong className="text-gray-700">fully vowelled</strong>. You trace the shape <em>and</em> absorb the pronunciation simultaneously. It&apos;s the fastest path to reading real Arabic.
                </p>
                <Link href="/write" className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:underline">
                  See it in action →
                </Link>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-red-100">
                  <p className="text-xs text-red-400 font-semibold mb-3 uppercase tracking-wider">Without tashkeel</p>
                  <div className="space-y-3">
                    {['كتب', 'شكر', 'مطر', 'قلب'].map((w) => (
                      <div key={w} className="arabic text-xl sm:text-2xl font-bold text-gray-400">{w}</div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">How do you say it?</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-green-200">
                  <p className="text-xs text-green-600 font-semibold mb-3 uppercase tracking-wider">With tashkeel ✓</p>
                  <div className="space-y-3">
                    {['كَتَبَ', 'شُكْرًا', 'مَطَرٌ', 'قَلْبٌ'].map((w) => (
                      <div key={w} className="arabic text-xl sm:text-2xl font-bold text-gray-800">{w}</div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Now you know exactly.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ARABIC KEYBOARD ──────────────────────────────── */}
        <section id="keyboard" className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                  ⌨️ Arabic keyboard
                </div>
                <h2 className="text-2xl font-bold mb-4">
                  Type Arabic on any device
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  No Arabic keyboard? No problem. Click the letters to compose text, add vowel marks (tashkeel), then copy and paste wherever you need it — messages, notes, emails.
                </p>
                <ul className="space-y-2 text-sm text-gray-500 mb-6">
                  {[
                    'All 28 Arabic letters',
                    'Tashkeel: fatha, kasra, damma, shadda & more',
                    'Arabic-Indic & Western numerals',
                    'Alif variants, punctuation, tatweel',
                    'One-click copy to clipboard',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-green-500 font-bold shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/keyboard" className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:underline">
                  Open full keyboard page →
                </Link>
              </div>
              <KeyboardEmbed />
            </div>
          </div>
        </section>

        {/* ── DAILY CHALLENGE ──────────────────────────────── */}
        <section id="challenge" className="py-16 max-w-lg mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-2">Try it right now — free</h2>
          <p className="text-sm text-gray-500 text-center mb-8">No account needed. Trace today&apos;s word and feel the difference.</p>
          <DailyWidget />
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────── */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-2">What learners say</h2>
            <p className="text-sm text-gray-500 text-center mb-10">Real feedback from real Arabic learners.</p>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{t.body}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────── */}
        <section id="features" className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-2">Built around how Arabic actually works</h2>
            <p className="text-sm text-gray-500 text-center mb-10">Not a translation app. Not flashcards. A writing trainer.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: '🗂️', title: 'Topics, not random words', desc: 'Food, Travel, Greetings, Numbers — learn vocabulary in context, not chaos.' },
                { icon: '🔤', title: 'Full tashkeel every time', desc: 'Every word carries its vowel marks. You always know how to say what you trace.' },
                { icon: '✏️', title: 'Guided tracing canvas', desc: 'Trace over faint Arabic guides with a stylus, finger, or mouse on any device.' },
                { icon: '📖', title: 'Letters explained', desc: 'Each word comes with a linguistics note on the specific marks and sounds used.' },
                { icon: '📈', title: 'Progress per topic', desc: 'Track which words you\'ve completed inside each topic. See yourself improve.' },
                { icon: '📱', title: 'Works on any device', desc: 'Optimised for iPad + Apple Pencil, but great on mobile and desktop too.' },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl p-6 border border-gray-100 bg-white hover:border-green-100 transition-colors">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────── */}
        <section id="pricing" className="bg-gray-50 py-16">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-1">Simple, honest pricing</h2>
            <p className="text-sm text-gray-500 text-center mb-2">
              Free to try — no card required. Upgrade when you&apos;re ready.
            </p>
            <p className="text-center text-xs text-green-600 font-medium mb-10">
              ✓ 7-day free trial included with every plan
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Monthly */}
              <div className="bg-white border border-gray-200 rounded-2xl p-7">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Monthly</p>
                <p className="text-4xl font-extrabold mb-0.5">£7.99</p>
                <p className="text-xs text-gray-400 mb-6">per month · cancel any time</p>
                <ul className="space-y-2 text-xs text-gray-600 mb-7">
                  {['All 8 topics unlocked', '70+ fully-vowelled words', 'Daily challenges', 'Progress tracking', 'New topics as added'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-green-500 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="block text-center border border-gray-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Start free trial
                </Link>
              </div>

              {/* Lifetime */}
              <div className="bg-white border-2 border-green-600 rounded-2xl p-7 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most popular
                </span>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Lifetime</p>
                <p className="text-4xl font-extrabold mb-0.5">£54</p>
                <p className="text-xs text-gray-400 mb-1">one-time · yours forever</p>
                <p className="text-xs text-green-600 font-medium mb-6">= less than 7 months · save 43%</p>
                <ul className="space-y-2 text-xs text-gray-600 mb-7">
                  {['All 8 topics unlocked', '70+ fully-vowelled words', 'Daily challenges', 'Progress tracking', 'New topics as added'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-green-500 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="block text-center bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                  Get lifetime access
                </Link>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-5">
              Questions? <Link href="/contact" className="underline hover:text-gray-600">Get in touch</Link> — we reply within 24 hours.
            </p>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────── */}
        <section className="py-16 text-center">
          <div className="max-w-xl mx-auto px-4">
            <div className="arabic text-5xl font-bold text-gray-100 mb-4 select-none">ابْدَأْ الآن</div>
            <h2 className="text-2xl font-bold mb-3">Ready to write Arabic?</h2>
            <p className="text-sm text-gray-500 mb-7">Pick your first topic and trace your first word in under 60 seconds.</p>
            <Link
              href="/write"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-green-700 transition-colors shadow-sm"
            >
              Choose your first topic →
            </Link>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer className="border-t border-gray-100 py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p className="font-semibold text-sm text-gray-700">
              Write<span className="font-bold">Arabic</span>
            </p>
            <div className="flex gap-5">
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
            </div>
            <p>© 2026 WriteArabic</p>
          </div>
        </footer>

      </main>
    </>
  )
}
