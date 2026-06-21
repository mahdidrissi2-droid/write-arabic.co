'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadProgress, levelFromXP, type AppProgress } from '@/lib/progress'

// ── League tiers ─────────────────────────────────────────────────────────────
const TIERS = [
  { name: 'Bronze',  min: 0,    color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  icon: '🥉' },
  { name: 'Silver',  min: 300,  color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200',  icon: '🥈' },
  { name: 'Gold',    min: 800,  color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '🥇' },
  { name: 'Diamond', min: 2000, color: 'text-cyan-600',   bg: 'bg-cyan-50',   border: 'border-cyan-200',   icon: '💎' },
  { name: 'Legend',  min: 5000, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: '👑' },
]

function tierFor(xp: number) {
  return [...TIERS].reverse().find(t => xp >= t.min) ?? TIERS[0]
}

// ── Simulated competitors ─────────────────────────────────────────────────────
const BOTS = [
  { id: 'bot1',  name: 'Yasmine K.',   avatar: '🧕', xp: 4820, streak: 14, words: 87, quizzes: 18 },
  { id: 'bot2',  name: 'Omar R.',      avatar: '👨', xp: 3940, streak: 9,  words: 72, quizzes: 15 },
  { id: 'bot3',  name: 'Lina T.',      avatar: '👩', xp: 3210, streak: 22, words: 63, quizzes: 12 },
  { id: 'bot4',  name: 'Karim B.',     avatar: '🧑', xp: 2600, streak: 5,  words: 51, quizzes: 10 },
  { id: 'bot5',  name: 'Sara M.',      avatar: '👧', xp: 1950, streak: 7,  words: 44, quizzes: 8  },
  { id: 'bot6',  name: 'Hamza A.',     avatar: '👦', xp: 1420, streak: 3,  words: 38, quizzes: 7  },
  { id: 'bot7',  name: 'Nour D.',      avatar: '🧒', xp: 980,  streak: 11, words: 29, quizzes: 5  },
  { id: 'bot8',  name: 'Amine C.',     avatar: '👱', xp: 640,  streak: 2,  words: 22, quizzes: 4  },
  { id: 'bot9',  name: 'Rania F.',     avatar: '👩', xp: 340,  streak: 1,  words: 15, quizzes: 2  },
  { id: 'bot10', name: 'Bilal S.',     avatar: '🧔', xp: 120,  streak: 0,  words: 7,  quizzes: 1  },
]

interface Player {
  id: string
  name: string
  avatar: string
  xp: number
  streak: number
  words: number
  quizzes: number
  isYou?: boolean
}

function buildLeaderboard(progress: AppProgress | null, username: string): Player[] {
  const userXP     = progress?.totalXP ?? 0
  const userWords  = Object.values(progress?.words ?? {}).filter(w => w.bestScore >= 45).length
  const userQuizzes= Object.values(progress?.quizzes ?? {}).filter(q => q.bestScore >= Math.ceil(q.total * 0.6)).length
  const userStreak = progress?.streak ?? 0

  const you: Player = {
    id: 'you', name: username, avatar: '⭐', xp: userXP,
    streak: userStreak, words: userWords, quizzes: userQuizzes, isYou: true,
  }

  return [...BOTS, you].sort((a, b) => b.xp - a.xp)
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LeaguePage() {
  const [progress, setProgress]   = useState<AppProgress | null>(null)
  const [username, setUsername]   = useState('You')
  const [editing, setEditing]     = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [tab, setTab]             = useState<'leaderboard' | 'tier'>('leaderboard')

  useEffect(() => {
    setProgress(loadProgress())
    const saved = localStorage.getItem('arabivo_username')
    if (saved) setUsername(saved)
  }, [])

  function saveName() {
    const n = nameInput.trim()
    if (!n) return
    setUsername(n)
    localStorage.setItem('arabivo_username', n)
    setEditing(false)
  }

  const board    = buildLeaderboard(progress, username)
  const userRank = board.findIndex(p => p.isYou) + 1
  const userXP   = progress?.totalXP ?? 0
  const tier     = tierFor(userXP)
  const nextTier = TIERS[TIERS.indexOf(tier) + 1]
  const { label } = levelFromXP(userXP)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-base">Write<span className="font-bold">Arabic</span></Link>
          <nav className="flex gap-1">
            <Link href="/write"   className="text-sm px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 font-medium">Write</Link>
            <Link href="/league"  className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 font-medium">League</Link>
            <Link href="/dashboard" className="text-sm px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 font-medium">Dashboard</Link>
          </nav>
          <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-800">Sign in</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Hero — your position */}
        <div className={`rounded-2xl border ${tier.border} ${tier.bg} p-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{tier.icon}</div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest ${tier.color} mb-0.5`}>{tier.name} League</p>
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveName()}
                      placeholder="Your name"
                      className="text-xl font-bold bg-white border border-gray-300 rounded-lg px-3 py-1 outline-none focus:border-green-400"
                    />
                    <button onClick={saveName} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium">Save</button>
                    <button onClick={() => setEditing(false)} className="text-sm text-gray-400">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{username}</h1>
                    <button onClick={() => { setNameInput(username); setEditing(true) }} className="text-xs text-gray-400 hover:text-gray-600">✏️</button>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-0.5">{label} · {userXP} XP</p>
              </div>
            </div>

            <div className="flex gap-6 text-center">
              <div>
                <p className="text-3xl font-bold">#{userRank}</p>
                <p className="text-xs text-gray-500">Rank</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{progress?.streak ?? 0}</p>
                <p className="text-xs text-gray-500">Day streak</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{Object.values(progress?.words ?? {}).filter(w => w.bestScore >= 45).length}</p>
                <p className="text-xs text-gray-500">Words done</p>
              </div>
            </div>
          </div>

          {/* Tier progress bar */}
          {nextTier && (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>{tier.name}</span>
                <span>{nextTier.name} at {nextTier.min} XP</span>
              </div>
              <div className="h-2 bg-white/70 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-green-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((userXP - tier.min) / (nextTier.min - tier.min)) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{Math.max(0, nextTier.min - userXP)} XP to {nextTier.name}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setTab('leaderboard')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'leaderboard' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            🏆 Leaderboard
          </button>
          <button onClick={() => setTab('tier')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'tier' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            📊 Tier Guide
          </button>
        </div>

        {tab === 'leaderboard' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Top 3 podium */}
            <div className="grid grid-cols-3 gap-px bg-gray-100 border-b border-gray-100">
              {board.slice(0, 3).map((p, i) => {
                const t = tierFor(p.xp)
                return (
                  <div key={p.id} className={`bg-white flex flex-col items-center py-5 px-3 text-center ${p.isYou ? 'bg-green-50' : ''}`}>
                    <span className="text-2xl mb-1">{['🥇','🥈','🥉'][i]}</span>
                    <span className="text-2xl mb-1">{p.avatar}</span>
                    <p className={`text-sm font-bold truncate max-w-full ${p.isYou ? 'text-green-700' : ''}`}>{p.name}</p>
                    <p className={`text-xs font-semibold ${t.color}`}>{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.xp} XP</p>
                  </div>
                )
              })}
            </div>

            {/* Rest of board */}
            <div className="divide-y divide-gray-50">
              {board.map((p, i) => {
                const t = tierFor(p.xp)
                const rank = i + 1
                return (
                  <div key={p.id} className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${p.isYou ? 'bg-green-50 border-l-4 border-l-green-400' : 'hover:bg-gray-50'}`}>
                    {/* Rank */}
                    <span className={`w-7 text-center text-sm font-bold shrink-0 ${rank <= 3 ? 'text-yellow-500' : 'text-gray-300'}`}>
                      {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : `#${rank}`}
                    </span>

                    {/* Avatar */}
                    <span className="text-xl shrink-0">{p.avatar}</span>

                    {/* Name + tier */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${p.isYou ? 'text-green-700' : ''}`}>
                        {p.name} {p.isYou && <span className="text-xs text-green-500 font-normal">(you)</span>}
                      </p>
                      <p className={`text-xs ${t.color} font-medium`}>{t.icon} {t.name}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400 shrink-0">
                      <span title="Words mastered">📝 {p.words}</span>
                      <span title="Quizzes passed">✅ {p.quizzes}</span>
                      {p.streak > 0 && <span title="Day streak">🔥 {p.streak}</span>}
                    </div>

                    {/* XP */}
                    <span className="text-sm font-bold text-gray-700 shrink-0 min-w-[60px] text-right">{p.xp} XP</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'tier' && (
          <div className="space-y-3">
            {TIERS.map((t, i) => {
              const next = TIERS[i + 1]
              const active = tier.name === t.name
              return (
                <div key={t.name} className={`rounded-2xl border ${t.border} ${t.bg} p-5 ${active ? 'ring-2 ring-green-400' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{t.icon}</span>
                      <div>
                        <p className={`font-bold text-base ${t.color}`}>{t.name}</p>
                        <p className="text-xs text-gray-500">{t.min} XP {next ? `– ${next.min - 1} XP` : '+'}</p>
                      </div>
                    </div>
                    {active && <span className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">Your tier</span>}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {[
                      { label: 'Tracing', desc: 'Earn 10 XP per word completed, +5 for perfect score' },
                      { label: 'Quiz',    desc: 'Earn 25 XP per quiz passed, +15 for perfect quiz' },
                      { label: 'Challenge', desc: 'Earn 20 XP completing your first speed challenge per topic' },
                    ].map(item => (
                      <div key={item.label} className="bg-white/60 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1">{item.label}</p>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* How to earn XP summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-sm mb-3">How to earn XP</h3>
              <div className="space-y-2">
                {[
                  ['✏️ Complete a word (score ≥ 45%)', '+10 XP'],
                  ['⭐ Perfect tracing (score ≥ 90%)', '+5 XP bonus'],
                  ['📝 Pass a chapter quiz (≥ 60%)', '+25 XP'],
                  ['🎯 Perfect quiz (100%)', '+15 XP bonus'],
                  ['⚡ First speed challenge per topic', '+20 XP'],
                ].map(([action, xp]) => (
                  <div key={action} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{action}</span>
                    <span className="font-bold text-green-600">{xp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href: '/write', icon: '✏️', label: 'Practice writing', sub: 'Trace words to earn XP' },
            { href: '/write/letters', icon: '🔤', label: 'Learn letters', sub: 'Master all 28 Arabic letters' },
            { href: '/keyboard', icon: '⌨️', label: 'Arabic keyboard', sub: 'Type with transliteration' },
          ].map(c => (
            <Link key={c.href} href={c.href} className="bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all p-5 flex items-center gap-4">
              <span className="text-3xl">{c.icon}</span>
              <div>
                <p className="font-semibold text-sm">{c.label}</p>
                <p className="text-xs text-gray-400">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
