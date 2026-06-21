'use client'
import { useState, useRef, useCallback } from 'react'

// ── Transliteration maps ─────────────────────────────────────────────────────

const AMBIGUOUS: Record<string, string> = {
  't': 'ت', 'H': 'ح', 'd': 'د', 's': 'س', 'g': 'ع', 'a': 'ا',
}
const DOUBLES: Record<string, string> = {
  "t'": 'ث', "H'": 'خ', "d'": 'ذ', "s'": 'ش', "g'": 'غ', 'aa': 'آ',
}
const SINGLES: Record<string, string> = {
  'b': 'ب', 'j': 'ج', 'r': 'ر', 'z': 'ز', 'S': 'ص', 'D': 'ض',
  'T': 'ط', 'Z': 'ظ', 'f': 'ف', 'q': 'ق', 'k': 'ك', 'l': 'ل',
  'm': 'م', 'n': 'ن', 'h': 'ه', 'w': 'و', 'y': 'ي', '-': 'ء',
}
const EQ1: Record<string, string> = { 'a': 'َ', 'i': 'ِ', 'u': 'ُ', 'w': 'ّ', 'o': 'ْ' }
const EQ2: Record<string, string> = { 'a': 'ً', 'i': 'ٍ', 'u': 'ٌ' }

// ── Layout ───────────────────────────────────────────────────────────────────

const ROW1 = [
  { ar: 'ش', la: "s'" }, { ar: 'س', la: 's' }, { ar: 'ز', la: 'z' },
  { ar: 'ر', la: 'r' }, { ar: 'ذ', la: "d'" }, { ar: 'د', la: 'd' },
  { ar: 'خ', la: "H'" }, { ar: 'ح', la: 'Ḥ' }, { ar: 'ج', la: 'j' },
  { ar: 'ث', la: "t'" }, { ar: 'ت', la: 't' }, { ar: 'ب', la: 'b' },
  { ar: 'ا', la: 'a' },
]
const ROW2 = [
  { ar: 'ء', la: '-' }, { ar: 'ي', la: 'y' }, { ar: 'و', la: 'w' },
  { ar: 'ه', la: 'h' }, { ar: 'ن', la: 'n' }, { ar: 'م', la: 'm' },
  { ar: 'ل', la: 'l' }, { ar: 'ك', la: 'k' }, { ar: 'ق', la: 'q' },
  { ar: 'ف', la: 'f' }, { ar: 'غ', la: "g'" }, { ar: 'ع', la: 'g' },
  { ar: 'ظ', la: 'Z' }, { ar: 'ط', la: 'T' }, { ar: 'ض', la: 'D' },
  { ar: 'ص', la: 'S' },
]
const ROW3_ALIF = [
  { ar: 'ى', la: 'Y' }, { ar: 'ة', la: "h'" }, { ar: 'ئ', la: '' },
  { ar: 'ؤ', la: '' }, { ar: 'إ', la: '' }, { ar: 'أ', la: 'A' }, { ar: 'آ', la: 'aa' },
]
const DIACRITICS = [
  { label: 'فَ', value: 'َ', la: '=a', tip: 'fatha (a)' },
  { label: 'فً', value: 'ً', la: '==a', tip: 'tanwin fath (an)' },
  { label: 'فُ', value: 'ُ', la: '=u', tip: 'damma (u)' },
  { label: 'فٌ', value: 'ٌ', la: '==u', tip: 'tanwin damm (un)' },
  { label: 'فِ', value: 'ِ', la: '=i', tip: 'kasra (i)' },
  { label: 'فٍ', value: 'ٍ', la: '==i', tip: 'tanwin kasr (in)' },
  { label: 'فّ', value: 'ّ', la: '=w', tip: 'shadda' },
  { label: 'فْ', value: 'ْ', la: '=o', tip: 'sukun' },
]
const PUNCT = ['،', '؛', '؟', '»', '«', '-']
const NUMS = [
  { ar: '٩', la: '9' }, { ar: '٨', la: '8' }, { ar: '٧', la: '7' },
  { ar: '٦', la: '6' }, { ar: '٥', la: '5' }, { ar: '٤', la: '4' },
  { ar: '٣', la: '3' }, { ar: '٢', la: '2' }, { ar: '١', la: '1' },
  { ar: '٠', la: '0' },
]

type PendingMode = '' | 'eq1' | 'eq2' | string

interface Props { compact?: boolean }

export default function ArabicKeyboard({ compact = false }: Props) {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const pendingRef = useRef<PendingMode>('')

  const insert = useCallback((val: string) => {
    const ta = taRef.current
    if (!ta) { setText(t => val + t); return }
    const s = ta.selectionStart ?? 0, e = ta.selectionEnd ?? 0
    setText(prev => {
      const next = prev.slice(0, s) + val + prev.slice(e)
      requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + val.length, s + val.length) })
      return next
    })
  }, [])

  const deleteBack = useCallback(() => {
    const ta = taRef.current
    if (!ta) { setText(t => t.slice(0, -1)); return }
    const s = ta.selectionStart ?? 0, e = ta.selectionEnd ?? 0
    if (s === e && s > 0) {
      setText(prev => { const next = prev.slice(0, s - 1) + prev.slice(e); requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s - 1, s - 1) }); return next })
    } else if (s !== e) {
      setText(prev => { const next = prev.slice(0, s) + prev.slice(e); requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s, s) }); return next })
    }
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','Tab'].includes(e.key)) return
    if (e.key === 'Backspace') { e.preventDefault(); pendingRef.current = ''; deleteBack(); return }
    if (e.key === 'Enter') { e.preventDefault(); pendingRef.current = ''; insert('\n'); return }
    if (e.key.length !== 1) return

    e.preventDefault()
    const k = e.key, pending = pendingRef.current

    if (pending === 'eq1') {
      if (k === '=') { pendingRef.current = 'eq2'; return }
      if (EQ1[k]) { insert(EQ1[k]); pendingRef.current = ''; return }
      insert('='); pendingRef.current = ''
    }
    if (pending === 'eq2') {
      if (EQ2[k]) { insert(EQ2[k]); pendingRef.current = ''; return }
      insert('=='); pendingRef.current = ''
    }
    if (pending && pending !== 'eq1' && pending !== 'eq2') {
      const combo = pending + k
      if (DOUBLES[combo]) { deleteBack(); insert(DOUBLES[combo]); pendingRef.current = ''; return }
      pendingRef.current = ''
    }
    if (k === '=') { pendingRef.current = 'eq1'; return }
    if (k === ' ') { insert(' '); return }
    if (AMBIGUOUS[k]) { insert(AMBIGUOUS[k]); pendingRef.current = k; return }
    if (SINGLES[k]) { insert(SINGLES[k]); return }
    if (k >= '0' && k <= '9') { insert(['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'][parseInt(k)]); return }
    insert(k)
  }, [insert, deleteBack])

  const copy = useCallback(async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 1600)
  }, [text])

  const W = compact ? 40 : 52
  const H = compact ? 50 : 62

  // Shared key button — white card, green accent
  function K({ ar, la, onClick }: { ar: string; la?: string; onClick?: () => void }) {
    return (
      <button
        onMouseDown={e => { e.preventDefault(); (onClick ?? (() => insert(ar)))() }}
        title={la}
        className="group flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 active:scale-95 transition-all shadow-sm flex-shrink-0"
        style={{ width: W, height: H }}
      >
        {la && <span className="text-[9px] font-mono text-green-500 group-hover:text-green-600 leading-none mb-1 transition-colors">{la}</span>}
        <span className="arabic font-bold text-gray-800 group-hover:text-green-700 leading-none transition-colors" style={{ fontSize: compact ? 18 : 22 }}>{ar}</span>
      </button>
    )
  }

  function DK({ label, value, la, tip }: typeof DIACRITICS[0]) {
    return (
      <button
        onMouseDown={e => { e.preventDefault(); insert(value) }}
        title={`${tip} · type ${la}`}
        className="group flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 active:scale-95 transition-all shadow-sm flex-shrink-0"
        style={{ width: W, height: H }}
      >
        <span className="text-[9px] font-mono text-green-500 leading-none mb-1">{la}</span>
        <span className="arabic font-bold text-gray-700 leading-none" style={{ fontSize: compact ? 18 : 22 }}>{label}</span>
      </button>
    )
  }

  const row = 'flex flex-wrap gap-1 justify-center'

  return (
    <div className="flex flex-col gap-3">
      {/* Textarea */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <textarea
          ref={taRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          dir="rtl" lang="ar"
          placeholder="اكتب هنا… — or type Latin letters"
          rows={compact ? 3 : 4}
          spellCheck={false}
          className="arabic w-full leading-relaxed px-5 pt-4 pb-2 resize-none outline-none bg-transparent placeholder:font-sans placeholder:text-gray-300 placeholder:italic"
          style={{ fontSize: compact ? 22 : 26 }}
        />
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-400">{Array.from(text).filter(c => c.trim()).length} chars</span>
          <div className="flex gap-2">
            <button onMouseDown={e => { e.preventDefault(); deleteBack() }} disabled={!text}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:border-gray-300 disabled:opacity-30 transition-all">⌫</button>
            <button onMouseDown={e => { e.preventDefault(); setText(''); pendingRef.current = '' }} disabled={!text}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:border-gray-300 disabled:opacity-30 transition-all">Clear</button>
            <button onMouseDown={e => { e.preventDefault(); copy() }} disabled={!text}
              className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-30 ${copied ? 'bg-green-500 text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard panel */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3 space-y-1.5">
        {/* Row 1: main letters */}
        <div className={row}>{ROW1.map(k => <K key={k.ar} ar={k.ar} la={k.la} onClick={() => insert(k.ar)} />)}</div>
        {/* Row 2: more letters */}
        <div className={row}>{ROW2.map(k => <K key={k.ar} ar={k.ar} la={k.la} onClick={() => insert(k.ar)} />)}</div>
        {/* Row 3: alif variants */}
        <div className={row}>
          {ROW3_ALIF.map(k => <K key={k.ar} ar={k.ar} la={k.la || undefined} onClick={() => insert(k.ar)} />)}
        </div>
        {/* Row 4: diacritics */}
        <div className={row}>
          <span className="text-[10px] text-gray-400 self-center mr-1 font-medium">Diacritics</span>
          {DIACRITICS.map(d => <DK key={d.value} {...d} />)}
        </div>
        {/* Row 5: Punct + space */}
        <div className={row}>
          {PUNCT.map(p => (
            <button key={p} onMouseDown={e => { e.preventDefault(); insert(p) }}
              className="flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 active:scale-95 transition-all shadow-sm flex-shrink-0 arabic font-bold text-gray-800"
              style={{ width: W, height: H, fontSize: compact ? 18 : 22 }}>
              {p}
            </button>
          ))}
          <button onMouseDown={e => { e.preventDefault(); insert(' ') }}
            className="flex-shrink-0 rounded-lg border border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 active:scale-95 transition-all shadow-sm text-xs text-gray-400 font-medium"
            style={{ height: H, width: 90 }}>
            space
          </button>
        </div>
        {/* Row 6: Numerals */}
        <div className={row}>{NUMS.map(n => <K key={n.ar} ar={n.ar} la={n.la} onClick={() => insert(n.ar)} />)}</div>

        <p className="text-[11px] text-gray-400 pt-0.5 text-center">
          Type Latin: <span className="font-mono text-green-600">t→ت</span> · <span className="font-mono text-green-600">t'→ث</span> · <span className="font-mono text-green-600">H→ح</span> · <span className="font-mono text-green-600">H'→خ</span> · <span className="font-mono text-green-600">=a→فَ</span>
        </p>
      </div>
    </div>
  )
}
