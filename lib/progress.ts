// Client-side progress store using localStorage
// All functions are safe to import in server components (they no-op on the server)

export interface WordProgress {
  bestScore: number   // 0–100 tracing score
  attempts: number
  completedAt?: number
}

export interface QuizResult {
  bestScore: number   // number of correct answers
  total: number       // total questions in this quiz
  attempts: number
  lastAt?: number
}

export interface ChallengeResult {
  bestScore: number   // words traced in time limit
  lastAt?: number
}

export interface LetterProgress {
  bestScore: number
  attempts: number
}

export interface AppProgress {
  words:      Record<string, WordProgress>
  quizzes:    Record<string, QuizResult>       // key = topicId-chapterIdx
  challenges: Record<string, ChallengeResult>  // key = topicId
  letters:    Record<string, LetterProgress>   // key = letter-formKey e.g. "ب-isolated"
  streak:     number
  lastActiveDate: string   // YYYY-MM-DD
  totalXP:    number
}

const PROGRESS_KEY  = 'arabivo_progress'
const COMPLETED_KEY = 'arabivo_completed'   // backwards-compat key for unlock system

// ── XP constants ─────────────────────────────────────────────────────────────
export const XP = {
  wordFirst:    10,   // first time completing a word (score ≥ 45)
  wordPerfect:  5,    // bonus when score ≥ 90
  quizPass:     25,   // first time passing a quiz (≥ 60%)
  quizPerfect:  15,   // bonus for 100%
  challengeNew: 20,   // first time completing a challenge
  letterFirst:  3,    // first time tracing a letter form (score ≥ 45)
  letterPerfect:2,    // bonus for score ≥ 90
} as const

// ── Helpers ───────────────────────────────────────────────────────────────────

function empty(): AppProgress {
  return { words: {}, quizzes: {}, challenges: {}, letters: {}, streak: 0, lastActiveDate: '', totalXP: 0 }
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterday(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
}

function updateStreak(p: AppProgress) {
  const t = today()
  if (p.lastActiveDate === t) return
  p.streak = p.lastActiveDate === yesterday() ? p.streak + 1 : 1
  p.lastActiveDate = t
}

// ── Public API ────────────────────────────────────────────────────────────────

export function loadProgress(): AppProgress {
  if (typeof window === 'undefined') return empty()
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return empty()
    return { ...empty(), ...JSON.parse(raw) }
  } catch {
    return empty()
  }
}

export function saveProgress(p: AppProgress): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)) } catch {}
}

/** Call when the student clicks Check on a tracing word. */
export function recordWord(wordId: string, score: number): AppProgress {
  const p = loadProgress()
  const prev = p.words[wordId]
  const wasCompleted = (prev?.bestScore ?? 0) >= 45
  const nowCompleted = score >= 45

  p.words[wordId] = {
    bestScore:   Math.max(score, prev?.bestScore ?? 0),
    attempts:    (prev?.attempts ?? 0) + 1,
    completedAt: prev?.completedAt ?? (nowCompleted ? Date.now() : undefined),
  }

  if (!wasCompleted && nowCompleted) p.totalXP += XP.wordFirst
  if (score >= 90)                   p.totalXP += XP.wordPerfect

  updateStreak(p)
  saveProgress(p)

  // Keep legacy 'arabivo_completed' in sync for the unlock system
  try {
    const raw  = localStorage.getItem(COMPLETED_KEY)
    const done: string[] = raw ? JSON.parse(raw) : []
    if (nowCompleted && !done.includes(wordId)) {
      localStorage.setItem(COMPLETED_KEY, JSON.stringify([...done, wordId]))
    }
  } catch {}

  return p
}

/** Call when the student submits a chapter quiz. */
export function recordQuiz(key: string, correct: number, total: number): AppProgress {
  const p = loadProgress()
  const prev      = p.quizzes[key]
  const threshold = Math.ceil(total * 0.6)
  const wasPassed = (prev?.bestScore ?? 0) >= threshold

  p.quizzes[key] = {
    bestScore: Math.max(correct, prev?.bestScore ?? 0),
    total,
    attempts:  (prev?.attempts ?? 0) + 1,
    lastAt:    Date.now(),
  }

  if (!wasPassed && correct >= threshold) p.totalXP += XP.quizPass
  if (correct === total)                  p.totalXP += XP.quizPerfect

  updateStreak(p)
  saveProgress(p)
  return p
}

/** Call when a timed challenge ends. */
export function recordChallenge(topicId: string, wordsTraced: number): AppProgress {
  const p    = loadProgress()
  const prev = p.challenges[topicId]

  const isFirst = !prev
  p.challenges[topicId] = {
    bestScore: Math.max(wordsTraced, prev?.bestScore ?? 0),
    lastAt:    Date.now(),
  }

  if (isFirst && wordsTraced > 0) p.totalXP += XP.challengeNew

  updateStreak(p)
  saveProgress(p)
  return p
}

// ── Computed helpers (safe on server — just return 0/false) ───────────────────

export function levelFromXP(xp: number): { level: number; label: string; nextXP: number } {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 4000, 8000]
  const labels = ['Beginner', 'Student', 'Learner', 'Practitioner', 'Advanced', 'Scholar', 'Master', 'Legend']
  let level = 0
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i
  }
  return {
    level,
    label:   labels[level] ?? 'Legend',
    nextXP:  thresholds[level + 1] ?? thresholds[thresholds.length - 1],
  }
}

/** Split an array into chunks of size n. */
export function chunkWords<T>(words: T[], size = 5): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < words.length; i += size) chunks.push(words.slice(i, i + size))
  return chunks
}

/** Call when the student checks a letter-form tracing. key = e.g. "ب-isolated" */
export function recordLetter(key: string, score: number): AppProgress {
  const p = loadProgress()
  const prev = p.letters[key]
  const wasCompleted = (prev?.bestScore ?? 0) >= 45
  const nowCompleted = score >= 45

  p.letters[key] = {
    bestScore: Math.max(score, prev?.bestScore ?? 0),
    attempts:  (prev?.attempts ?? 0) + 1,
  }

  if (!wasCompleted && nowCompleted) p.totalXP += XP.letterFirst
  if (score >= 90)                   p.totalXP += XP.letterPerfect

  updateStreak(p)
  saveProgress(p)
  return p
}

/** Quiz key for a specific topic chapter. */
export function quizKey(topicId: string, chapterIdx: number): string {
  return `${topicId}-ch${chapterIdx}`
}
